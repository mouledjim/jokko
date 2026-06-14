-- ============================================================
-- Jokko Santé — 0004 : Row Level Security
-- Politique « deny by default » : RLS activée partout, puis
-- policies explicites par rôle métier.
-- ============================================================

alter table public.regions enable row level security;
alter table public.facilities enable row level security;
alter table public.specialties enable row level security;
alter table public.facility_services enable row level security;
alter table public.profiles enable row level security;
alter table public.beds enable row level security;
alter table public.equipment enable row level security;
alter table public.transfer_requests enable row level security;
alter table public.transfer_events enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- ——— Référentiels : lecture pour tout utilisateur connecté, écriture super_admin ———

create policy "regions_select" on public.regions
  for select to authenticated using (true);
create policy "regions_write" on public.regions
  for all to authenticated
  using (public.current_user_role() = 'super_admin')
  with check (public.current_user_role() = 'super_admin');

create policy "specialties_select" on public.specialties
  for select to authenticated using (true);
create policy "specialties_write" on public.specialties
  for all to authenticated
  using (public.current_user_role() = 'super_admin')
  with check (public.current_user_role() = 'super_admin');

-- ——— Établissements ———

create policy "facilities_select" on public.facilities
  for select to authenticated using (true);

create policy "facilities_insert" on public.facilities
  for insert to authenticated
  with check (public.current_user_role() = 'super_admin');

create policy "facilities_update" on public.facilities
  for update to authenticated
  using (
    public.current_user_role() = 'super_admin'
    or (public.current_user_role() = 'admin_hopital' and id = public.current_user_facility_id())
  )
  with check (
    public.current_user_role() = 'super_admin'
    or (public.current_user_role() = 'admin_hopital' and id = public.current_user_facility_id())
  );

create policy "facilities_delete" on public.facilities
  for delete to authenticated
  using (public.current_user_role() = 'super_admin');

-- ——— Services par établissement ———

create policy "facility_services_select" on public.facility_services
  for select to authenticated using (true);

create policy "facility_services_write" on public.facility_services
  for all to authenticated
  using (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() = 'admin_hopital'
      and facility_id = public.current_user_facility_id()
    )
  )
  with check (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() = 'admin_hopital'
      and facility_id = public.current_user_facility_id()
    )
  );

-- ——— Profils ———
-- Lecture : annuaire interne (noms, rôles, affectations) accessible à tout
-- utilisateur connecté — nécessaire pour les timelines et la coordination.
-- Les emails restent dans auth.users, jamais exposés ici.

create policy "profiles_select" on public.profiles
  for select to authenticated using (true);

create policy "profiles_insert" on public.profiles
  for insert to authenticated
  with check (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() = 'admin_hopital'
      and facility_id = public.current_user_facility_id()
      and role in ('medecin', 'admin_hopital')
    )
  );

create policy "profiles_update" on public.profiles
  for update to authenticated
  using (
    public.current_user_role() = 'super_admin'
    or id = public.current_profile_id()
    or (
      public.current_user_role() = 'admin_hopital'
      and facility_id = public.current_user_facility_id()
    )
  )
  with check (
    public.current_user_role() = 'super_admin'
    or id = public.current_profile_id()
    or (
      public.current_user_role() = 'admin_hopital'
      and facility_id = public.current_user_facility_id()
    )
  );

create policy "profiles_delete" on public.profiles
  for delete to authenticated
  using (public.current_user_role() = 'super_admin');

-- ——— Lits ———
-- Lecture nationale (c'est le principe du produit) ; écriture limitée à
-- l'établissement de l'utilisateur.

create policy "beds_select" on public.beds
  for select to authenticated using (true);

create policy "beds_insert" on public.beds
  for insert to authenticated
  with check (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() = 'admin_hopital'
      and exists (
        select 1 from public.facility_services fs
        where fs.id = facility_service_id
          and fs.facility_id = public.current_user_facility_id()
      )
    )
  );

create policy "beds_update" on public.beds
  for update to authenticated
  using (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() in ('medecin', 'admin_hopital')
      and exists (
        select 1 from public.facility_services fs
        where fs.id = facility_service_id
          and fs.facility_id = public.current_user_facility_id()
      )
    )
  )
  with check (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() in ('medecin', 'admin_hopital')
      and exists (
        select 1 from public.facility_services fs
        where fs.id = facility_service_id
          and fs.facility_id = public.current_user_facility_id()
      )
    )
  );

create policy "beds_delete" on public.beds
  for delete to authenticated
  using (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() = 'admin_hopital'
      and exists (
        select 1 from public.facility_services fs
        where fs.id = facility_service_id
          and fs.facility_id = public.current_user_facility_id()
      )
    )
  );

-- ——— Équipements ———

create policy "equipment_select" on public.equipment
  for select to authenticated using (true);

create policy "equipment_write" on public.equipment
  for all to authenticated
  using (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() = 'admin_hopital'
      and facility_id = public.current_user_facility_id()
    )
  )
  with check (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() = 'admin_hopital'
      and facility_id = public.current_user_facility_id()
    )
  );

-- ——— Demandes de transfert ———

create policy "transfers_select" on public.transfer_requests
  for select to authenticated
  using (
    public.current_user_role() = 'super_admin'
    or public.current_user_facility_id() in (from_facility_id, to_facility_id)
    or (
      public.current_user_role() = 'admin_regional'
      and exists (
        select 1 from public.facilities f
        where f.region_id = public.current_user_region_id()
          and f.id in (transfer_requests.from_facility_id, transfer_requests.to_facility_id)
      )
    )
  );

create policy "transfers_insert" on public.transfer_requests
  for insert to authenticated
  with check (
    public.current_user_role() in ('medecin', 'admin_hopital')
    and from_facility_id = public.current_user_facility_id()
    and requested_by = public.current_profile_id()
    and status = 'en_attente'
    and handled_by is null
    and responded_at is null
    and departed_at is null
    and arrived_at is null
    and response_delay_seconds is null
    and refusal_reason is null
    and requested_at between now() - interval '10 minutes' and now() + interval '2 minutes'
  );

-- Les transitions fines (qui peut accepter, refuser, annuler…) sont
-- validées par le trigger transfer_requests_state_machine.
create policy "transfers_update" on public.transfer_requests
  for update to authenticated
  using (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() in ('medecin', 'admin_hopital')
      and public.current_user_facility_id() in (from_facility_id, to_facility_id)
    )
  )
  with check (
    public.current_user_role() = 'super_admin'
    or (
      public.current_user_role() in ('medecin', 'admin_hopital')
      and public.current_user_facility_id() in (from_facility_id, to_facility_id)
    )
  );

-- Pas de policy DELETE : une demande s'annule, elle ne se supprime pas.

-- ——— Timeline des transferts : visibilité héritée, immuable ———

create policy "transfer_events_select" on public.transfer_events
  for select to authenticated
  using (
    exists (
      select 1 from public.transfer_requests tr
      where tr.id = transfer_events.transfer_id
    )
  );

-- Écriture uniquement via les triggers (security definer).
revoke insert, update, delete on public.transfer_events from anon, authenticated;

-- ——— Notifications : chacun les siennes ———

create policy "notifications_select" on public.notifications
  for select to authenticated
  using (recipient_id = public.current_profile_id());

create policy "notifications_update" on public.notifications
  for update to authenticated
  using (recipient_id = public.current_profile_id())
  with check (recipient_id = public.current_profile_id());

revoke insert, delete on public.notifications from anon, authenticated;

-- ——— Journal d'audit : lecture super_admin, écriture triggers uniquement ———

create policy "audit_logs_select" on public.audit_logs
  for select to authenticated
  using (public.current_user_role() = 'super_admin');

revoke insert, update, delete on public.audit_logs from anon, authenticated;

-- ——— Divers ———

-- La génération de référence TRF-… utilise la séquence au moment de l'INSERT.
grant usage, select on sequence public.transfer_reference_seq to authenticated;
