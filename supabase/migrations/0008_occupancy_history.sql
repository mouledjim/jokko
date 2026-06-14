-- ============================================================
-- Jokko Santé — 0008 : historique d'occupation
-- Instantanés périodiques de l'occupation des lits par établissement,
-- pour des courbes d'occupation réellement historiques.
-- ============================================================

create table public.bed_snapshots (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  captured_at timestamptz not null default now(),
  beds_total integer not null,
  beds_free integer not null,
  beds_occupied integer not null,
  occupancy_rate integer,
  created_at timestamptz not null default now()
);

create index bed_snapshots_facility_idx on public.bed_snapshots (facility_id, captured_at desc);
create index bed_snapshots_captured_idx on public.bed_snapshots (captured_at desc);

-- Capture l'occupation courante de chaque établissement (un instantané).
create or replace function public.capture_bed_snapshots()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.bed_snapshots (facility_id, beds_total, beds_free, beds_occupied, occupancy_rate)
  select
    v.facility_id,
    v.beds_total,
    v.beds_free,
    v.beds_occupied + v.beds_cleaning,
    v.occupancy_rate
  from public.v_facility_availability v
  where v.beds_total > 0;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- RLS : lecture pour tout utilisateur connecté (agrégats non sensibles) ;
-- aucune écriture cliente (la capture passe par la fonction security definer).
alter table public.bed_snapshots enable row level security;

create policy "bed_snapshots_select" on public.bed_snapshots
  for select to authenticated using (true);

revoke insert, update, delete on public.bed_snapshots from anon, authenticated;

-- Planification automatique quotidienne si l'extension pg_cron est disponible.
-- (Sans pg_cron, appeler capture_bed_snapshots() manuellement ou via une tâche planifiée.)
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('jokko-bed-snapshot', '0 */6 * * *', 'select public.capture_bed_snapshots();');
  end if;
exception when others then
  -- pg_cron indisponible : on ignore, la capture reste manuelle.
  null;
end;
$$;
