-- ============================================================
-- Jokko Santé — 0002 : fonctions et triggers
-- Helpers d'identité, machine à états des transferts,
-- timeline immuable, notifications, audit, protections.
-- ============================================================

-- ——— Helpers d'identité (security definer : lisent profiles sans récursion RLS) ———

create or replace function public.current_profile_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select id from public.profiles where auth_id = auth.uid() and is_active limit 1;
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql stable security definer
set search_path = public
as $$
  select role from public.profiles where auth_id = auth.uid() and is_active limit 1;
$$;

create or replace function public.current_user_facility_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select facility_id from public.profiles where auth_id = auth.uid() and is_active limit 1;
$$;

create or replace function public.current_user_region_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select region_id from public.profiles where auth_id = auth.uid() and is_active limit 1;
$$;

-- ——— Horodatage automatique des lits et équipements ———
-- Les écritures service_role (seed) sont laissées telles quelles afin de
-- pouvoir générer des fraîcheurs de données variées en démonstration.

create or replace function public.touch_row()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  new.updated_at := now();
  new.updated_by := coalesce(public.current_profile_id(), new.updated_by);
  return new;
end;
$$;

create trigger beds_touch
  before insert or update on public.beds
  for each row execute function public.touch_row();

create trigger equipment_touch
  before insert or update on public.equipment
  for each row execute function public.touch_row();

-- ——— Anti-élévation de privilèges sur profiles ———
-- role / facility_id / region_id / auth_id ne sont modifiables que par un
-- super_admin. is_active n'est modifiable que par l'admin de l'établissement
-- (jamais sur lui-même) ou un super_admin.

create or replace function public.protect_profile_columns()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.current_user_role() = 'super_admin' then
    return new;
  end if;

  if new.role is distinct from old.role
     or new.facility_id is distinct from old.facility_id
     or new.region_id is distinct from old.region_id
     or new.auth_id is distinct from old.auth_id then
    raise exception 'Modification du rôle ou de l''affectation non autorisée.';
  end if;

  if new.is_active is distinct from old.is_active then
    if not (
      public.current_user_role() = 'admin_hopital'
      and old.facility_id = public.current_user_facility_id()
      and old.id <> public.current_profile_id()
    ) then
      raise exception 'Activation ou désactivation de ce compte non autorisée.';
    end if;
  end if;

  return new;
end;
$$;

create trigger profiles_protect_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- ——— Machine à états des transferts ———
-- Valide les transitions, le côté autorisé (demandeur / receveur),
-- fige les données patient après création, horodate chaque étape et
-- calcule le délai de réponse.

create or replace function public.handle_transfer_update()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_actor uuid := public.current_profile_id();
  v_role public.user_role := public.current_user_role();
  v_facility uuid := public.current_user_facility_id();
  v_super boolean;
  v_from_side boolean;
  v_to_side boolean;
begin
  -- Écritures service_role (seed) : on fait confiance, on complète juste le délai.
  if auth.uid() is null then
    if new.responded_at is not null and new.response_delay_seconds is null then
      new.response_delay_seconds :=
        greatest(0, extract(epoch from new.responded_at - new.requested_at))::integer;
    end if;
    return new;
  end if;

  v_super := (v_role = 'super_admin');
  v_from_side := (not v_super) and v_role in ('medecin', 'admin_hopital')
    and v_facility = old.from_facility_id;
  v_to_side := (not v_super) and v_role in ('medecin', 'admin_hopital')
    and v_facility = old.to_facility_id;

  -- Données patient et identité de la demande figées après création (traçabilité).
  if new.reference is distinct from old.reference
     or new.patient_initials is distinct from old.patient_initials
     or new.patient_age is distinct from old.patient_age
     or new.patient_sex is distinct from old.patient_sex
     or new.severity is distinct from old.severity
     or new.specialty_id is distinct from old.specialty_id
     or new.motif is distinct from old.motif
     or new.clinical_notes is distinct from old.clinical_notes
     or new.vitals is distinct from old.vitals
     or new.from_facility_id is distinct from old.from_facility_id
     or new.to_facility_id is distinct from old.to_facility_id
     or new.requested_by is distinct from old.requested_by
     or new.requested_at is distinct from old.requested_at then
    raise exception 'Les informations du transfert ne sont pas modifiables après création.';
  end if;

  if new.status = old.status then
    if new.handled_by is distinct from old.handled_by
       or new.responded_at is distinct from old.responded_at
       or new.departed_at is distinct from old.departed_at
       or new.arrived_at is distinct from old.arrived_at
       or new.response_delay_seconds is distinct from old.response_delay_seconds
       or new.refusal_reason is distinct from old.refusal_reason then
      raise exception 'Modification non autorisée des champs de suivi du transfert.';
    end if;
    return new;
  end if;

  -- Transitions autorisées.
  if old.status = 'en_attente' and new.status = 'accepte' then
    if not (v_to_side or v_super) then
      raise exception 'Seul l''établissement receveur peut accepter cette demande.';
    end if;
    new.handled_by := v_actor;
    new.responded_at := now();
    new.response_delay_seconds :=
      greatest(0, extract(epoch from now() - old.requested_at))::integer;

  elsif old.status = 'en_attente' and new.status = 'refuse' then
    if not (v_to_side or v_super) then
      raise exception 'Seul l''établissement receveur peut refuser cette demande.';
    end if;
    if coalesce(trim(new.refusal_reason), '') = '' then
      raise exception 'Un motif de refus est obligatoire.';
    end if;
    new.handled_by := v_actor;
    new.responded_at := now();
    new.response_delay_seconds :=
      greatest(0, extract(epoch from now() - old.requested_at))::integer;

  elsif old.status in ('en_attente', 'accepte') and new.status = 'annule' then
    if not (v_from_side or v_super) then
      raise exception 'Seul l''établissement demandeur peut annuler cette demande.';
    end if;

  elsif old.status = 'accepte' and new.status = 'en_route' then
    if not (v_from_side or v_super) then
      raise exception 'Seul l''établissement demandeur peut déclarer le départ du patient.';
    end if;
    new.departed_at := now();

  elsif old.status = 'en_route' and new.status = 'arrive' then
    if not (v_from_side or v_to_side or v_super) then
      raise exception 'Action réservée aux deux établissements concernés.';
    end if;
    new.arrived_at := now();

  else
    raise exception 'Transition % → % non autorisée.', old.status, new.status;
  end if;

  return new;
end;
$$;

create trigger transfer_requests_state_machine
  before update on public.transfer_requests
  for each row execute function public.handle_transfer_update();

-- ——— Timeline + notifications à la création d'un transfert ———

create or replace function public.log_transfer_insert()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_from_name text;
  v_severity_label text;
begin
  select name into v_from_name from public.facilities where id = new.from_facility_id;

  insert into public.transfer_events (transfer_id, event_type, actor_id, payload, created_at)
  values (
    new.id,
    'creation',
    coalesce(public.current_profile_id(), new.requested_by),
    jsonb_build_object('statut', new.status, 'gravite', new.severity),
    new.requested_at
  );

  -- Notification aux soignants de l'établissement sollicité (demandes actives uniquement).
  if new.status = 'en_attente' then
    v_severity_label := case new.severity
      when 'critique' then 'CRITIQUE'
      when 'urgent' then 'urgente'
      else 'stable'
    end;

    insert into public.notifications (recipient_id, type, title, body, link_path, created_at)
    select
      p.id,
      'transfert_entrant',
      'Nouvelle demande de transfert (' || v_severity_label || ')',
      new.reference || ' · ' || new.motif || ' — demande de ' || coalesce(v_from_name, 'un établissement'),
      '/app/transferts/' || new.id,
      new.requested_at
    from public.profiles p
    where p.facility_id = new.to_facility_id
      and p.is_active
      and p.role in ('medecin', 'admin_hopital');
  end if;

  return new;
end;
$$;

create trigger transfer_requests_log_insert
  after insert on public.transfer_requests
  for each row execute function public.log_transfer_insert();

-- ——— Timeline + notifications à chaque changement de statut ———

create or replace function public.log_transfer_status_change()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_ts timestamptz;
  v_event text;
  v_actor uuid;
  v_to_name text;
  v_from_name text;
begin
  if new.status = old.status then
    return new;
  end if;

  v_event := case new.status
    when 'accepte' then 'acceptation'
    when 'refuse' then 'refus'
    when 'en_route' then 'mise_en_route'
    when 'arrive' then 'arrivee'
    when 'annule' then 'annulation'
    else new.status::text
  end;

  v_ts := coalesce(
    case new.status
      when 'accepte' then new.responded_at
      when 'refuse' then new.responded_at
      when 'en_route' then new.departed_at
      when 'arrive' then new.arrived_at
      else null
    end,
    now()
  );

  v_actor := coalesce(public.current_profile_id(), new.handled_by, new.requested_by);

  select name into v_from_name from public.facilities where id = new.from_facility_id;
  select name into v_to_name from public.facilities where id = new.to_facility_id;

  insert into public.transfer_events (transfer_id, event_type, actor_id, payload, created_at)
  values (
    new.id,
    v_event,
    v_actor,
    jsonb_strip_nulls(jsonb_build_object(
      'statut_avant', old.status,
      'statut_apres', new.status,
      'motif_refus', new.refusal_reason,
      'delai_reponse_secondes', new.response_delay_seconds
    )),
    v_ts
  );

  if new.status = 'accepte' then
    insert into public.notifications (recipient_id, type, title, body, link_path, created_at)
    values (
      new.requested_by, 'transfert_accepte', 'Transfert accepté',
      'La demande ' || new.reference || ' a été acceptée par ' || coalesce(v_to_name, 'l''établissement receveur') || '.',
      '/app/transferts/' || new.id, v_ts
    );

  elsif new.status = 'refuse' then
    insert into public.notifications (recipient_id, type, title, body, link_path, created_at)
    values (
      new.requested_by, 'transfert_refuse', 'Transfert refusé',
      'La demande ' || new.reference || ' a été refusée : ' || coalesce(new.refusal_reason, 'motif non précisé') || '.',
      '/app/transferts/' || new.id, v_ts
    );

  elsif new.status = 'en_route' then
    insert into public.notifications (recipient_id, type, title, body, link_path, created_at)
    select
      p.id, 'transfert_en_route', 'Patient en route',
      new.reference || ' · ' || coalesce(v_from_name, 'Établissement demandeur') || ' → ' || coalesce(v_to_name, 'votre établissement') || '.',
      '/app/transferts/' || new.id, v_ts
    from public.profiles p
    where p.facility_id = new.to_facility_id
      and p.is_active
      and p.role in ('medecin', 'admin_hopital');

  elsif new.status = 'arrive' then
    insert into public.notifications (recipient_id, type, title, body, link_path, created_at)
    select distinct r.recipient, 'transfert_arrive', 'Patient arrivé',
      'Le transfert ' || new.reference || ' est terminé.',
      '/app/transferts/' || new.id, v_ts
    from (values (new.requested_by), (new.handled_by)) as r(recipient)
    where r.recipient is not null;

  elsif new.status = 'annule' then
    insert into public.notifications (recipient_id, type, title, body, link_path, created_at)
    select
      p.id, 'transfert_annule', 'Demande annulée',
      'La demande ' || new.reference || ' a été annulée par l''établissement demandeur.',
      '/app/transferts/' || new.id, v_ts
    from public.profiles p
    where p.facility_id = new.to_facility_id
      and p.is_active
      and p.role in ('medecin', 'admin_hopital');
  end if;

  return new;
end;
$$;

create trigger transfer_requests_log_status
  after update on public.transfer_requests
  for each row execute function public.log_transfer_status_change();

-- ——— Audit global ———
-- Trace les actions humaines (les opérations service_role du seed sont
-- exclues : l'historique d'audit de démonstration est généré par le seed).

create or replace function public.write_audit()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_new jsonb := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  v_old jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
begin
  if auth.uid() is null then
    return coalesce(new, old);
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    public.current_profile_id(),
    lower(tg_op),
    tg_table_name,
    coalesce((v_new ->> 'id')::uuid, (v_old ->> 'id')::uuid),
    jsonb_strip_nulls(jsonb_build_object(
      'libelle', coalesce(
        v_new ->> 'label', v_old ->> 'label',
        v_new ->> 'name', v_old ->> 'name',
        v_new ->> 'reference', v_old ->> 'reference',
        nullif(trim(coalesce(v_new ->> 'first_name', v_old ->> 'first_name', '') || ' '
          || coalesce(v_new ->> 'last_name', v_old ->> 'last_name', '')), '')
      ),
      'type', coalesce(v_new ->> 'type', v_old ->> 'type'),
      'statut_avant', v_old ->> 'status',
      'statut_apres', v_new ->> 'status'
    ))
  );

  return coalesce(new, old);
end;
$$;

create trigger beds_audit
  after insert or update or delete on public.beds
  for each row execute function public.write_audit();

create trigger equipment_audit
  after insert or update or delete on public.equipment
  for each row execute function public.write_audit();

create trigger transfer_requests_audit
  after insert or update or delete on public.transfer_requests
  for each row execute function public.write_audit();

create trigger profiles_audit
  after insert or update or delete on public.profiles
  for each row execute function public.write_audit();

create trigger facilities_audit
  after insert or update or delete on public.facilities
  for each row execute function public.write_audit();
