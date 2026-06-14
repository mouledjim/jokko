-- ============================================================
-- Jokko Santé — 0001 : schéma initial
-- Tables, enums, contraintes, index.
-- ============================================================

-- ——— Enums ———
create type public.facility_type as enum (
  'hopital_national', 'hopital_regional', 'centre_sante', 'clinique_privee'
);

create type public.facility_level as enum ('niveau_1', 'niveau_2', 'niveau_3');

create type public.bed_status as enum ('libre', 'occupe', 'nettoyage', 'hors_service');

create type public.equipment_type as enum (
  'scanner', 'irm', 'bloc_operatoire', 'generateur_oxygene', 'ambulance', 'laboratoire'
);

create type public.equipment_status as enum ('fonctionnel', 'en_panne', 'maintenance');

create type public.user_role as enum ('super_admin', 'admin_regional', 'admin_hopital', 'medecin');

create type public.patient_sex as enum ('M', 'F');

create type public.transfer_severity as enum ('stable', 'urgent', 'critique');

create type public.transfer_status as enum (
  'en_attente', 'accepte', 'refuse', 'en_route', 'arrive', 'annule'
);

-- ——— Régions médicales ———
create table public.regions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  created_at timestamptz not null default now()
);

-- ——— Établissements de santé ———
create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.facility_type not null,
  level public.facility_level not null,
  region_id uuid not null references public.regions(id) on delete restrict,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  address text not null default '',
  phone text not null default '',
  is_active boolean not null default true,
  logo_url text,
  created_at timestamptz not null default now()
);

create index facilities_region_idx on public.facilities (region_id);

-- ——— Référentiel des spécialités ———
create table public.specialties (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon_key text not null,
  color_key text not null,
  created_at timestamptz not null default now()
);

-- ——— Services ouverts par établissement ———
create table public.facility_services (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  specialty_id uuid not null references public.specialties(id) on delete restrict,
  is_active boolean not null default true,
  phone_extension text not null default '',
  created_at timestamptz not null default now(),
  unique (facility_id, specialty_id)
);

create index facility_services_specialty_idx on public.facility_services (specialty_id);

-- ——— Profils (extension de auth.users) ———
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null unique references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  role public.user_role not null,
  facility_id uuid references public.facilities(id) on delete set null,
  region_id uuid references public.regions(id) on delete set null,
  specialty_id uuid references public.specialties(id) on delete set null,
  phone text not null default '',
  avatar_seed text not null default substr(md5(random()::text), 1, 12),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  -- médecin et admin_hopital sont forcément rattachés à un établissement
  constraint profiles_facility_required
    check (role in ('super_admin', 'admin_regional') or facility_id is not null),
  -- admin_regional est forcément rattaché à une région
  constraint profiles_region_required
    check (role <> 'admin_regional' or region_id is not null)
);

create index profiles_facility_idx on public.profiles (facility_id);

-- ——— Lits individuels (cœur du système) ———
create table public.beds (
  id uuid primary key default gen_random_uuid(),
  facility_service_id uuid not null references public.facility_services(id) on delete cascade,
  label text not null,
  status public.bed_status not null default 'libre',
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (facility_service_id, label)
);

create index beds_service_idx on public.beds (facility_service_id);

-- ——— Équipements critiques ———
create table public.equipment (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  type public.equipment_type not null,
  status public.equipment_status not null default 'fonctionnel',
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index equipment_facility_idx on public.equipment (facility_id);

-- ——— Demandes de transfert ———
create sequence public.transfer_reference_seq;

create table public.transfer_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique
    default 'TRF-' || to_char(now(), 'YYYY') || '-'
      || lpad(nextval('public.transfer_reference_seq')::text, 4, '0'),
  -- Anonymisation CDP : initiales uniquement (2-3 lettres), âge, sexe
  patient_initials text not null check (char_length(patient_initials) between 2 and 3),
  patient_age integer not null check (patient_age between 0 and 130),
  patient_sex public.patient_sex not null,
  severity public.transfer_severity not null,
  specialty_id uuid not null references public.specialties(id) on delete restrict,
  motif text not null check (length(trim(motif)) > 0),
  clinical_notes text not null default '',
  vitals jsonb not null default '{}'::jsonb check (jsonb_typeof(vitals) = 'object'),
  from_facility_id uuid not null references public.facilities(id) on delete restrict,
  to_facility_id uuid not null references public.facilities(id) on delete restrict,
  requested_by uuid not null references public.profiles(id) on delete restrict,
  handled_by uuid references public.profiles(id) on delete set null,
  status public.transfer_status not null default 'en_attente',
  refusal_reason text,
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  departed_at timestamptz,
  arrived_at timestamptz,
  response_delay_seconds integer,
  created_at timestamptz not null default now(),
  constraint transfer_facilities_differ check (from_facility_id <> to_facility_id),
  constraint transfer_refusal_reason_required
    check (status <> 'refuse' or refusal_reason is not null)
);

create index transfer_requests_from_idx on public.transfer_requests (from_facility_id, status);
create index transfer_requests_to_idx on public.transfer_requests (to_facility_id, status);
create index transfer_requests_requested_at_idx on public.transfer_requests (requested_at desc);

-- ——— Timeline immuable des transferts (INSERT only) ———
create table public.transfer_events (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid not null references public.transfer_requests(id) on delete cascade,
  event_type text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index transfer_events_transfer_idx on public.transfer_events (transfer_id, created_at);

-- ——— Notifications in-app ———
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null default '',
  link_path text not null default '',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_recipient_idx on public.notifications (recipient_id, is_read, created_at desc);

-- ——— Journal d'audit global (INSERT only) ———
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_created_idx on public.audit_logs (created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
