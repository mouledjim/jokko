-- ============================================================
-- Jokko Santé — 0003 : vues d'agrégation
-- Les compteurs de lits sont TOUJOURS dérivés de la table beds.
-- security_invoker : la RLS des tables sous-jacentes s'applique
-- à l'utilisateur qui interroge la vue.
-- ============================================================

create or replace view public.v_service_availability
with (security_invoker = on) as
select
  fs.id as facility_service_id,
  fs.facility_id,
  fs.specialty_id,
  s.name as specialty_name,
  s.icon_key,
  s.color_key,
  fs.is_active,
  fs.phone_extension,
  (count(b.id) filter (where b.status = 'libre'))::integer as beds_free,
  (count(b.id) filter (where b.status = 'occupe'))::integer as beds_occupied,
  (count(b.id) filter (where b.status = 'nettoyage'))::integer as beds_cleaning,
  (count(b.id) filter (where b.status = 'hors_service'))::integer as beds_out,
  count(b.id)::integer as beds_total,
  max(b.updated_at) as last_bed_update
from public.facility_services fs
join public.specialties s on s.id = fs.specialty_id
left join public.beds b on b.facility_service_id = fs.id
group by fs.id, s.id;

create or replace view public.v_facility_availability
with (security_invoker = on) as
select
  f.id as facility_id,
  f.name,
  f.type,
  f.level,
  f.region_id,
  r.name as region_name,
  f.latitude,
  f.longitude,
  f.phone,
  f.is_active,
  (count(b.id) filter (where b.status = 'libre'))::integer as beds_free,
  (count(b.id) filter (where b.status = 'occupe'))::integer as beds_occupied,
  (count(b.id) filter (where b.status = 'nettoyage'))::integer as beds_cleaning,
  (count(b.id) filter (where b.status = 'hors_service'))::integer as beds_out,
  count(b.id)::integer as beds_total,
  -- Taux d'occupation des lits opérationnels (tout ce qui n'est pas libre,
  -- rapporté au parc hors « hors_service »)
  case
    when count(b.id) filter (where b.status <> 'hors_service') > 0 then
      round(
        100.0 * (count(b.id) filter (where b.status in ('occupe', 'nettoyage')))
        / (count(b.id) filter (where b.status <> 'hors_service'))
      )::integer
    else null
  end as occupancy_rate,
  max(b.updated_at) as last_bed_update
from public.facilities f
join public.regions r on r.id = f.region_id
left join public.facility_services fs on fs.facility_id = f.id and fs.is_active
left join public.beds b on b.facility_service_id = fs.id
group by f.id, r.id;
