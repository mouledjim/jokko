-- ============================================================
-- Jokko Santé — 0009 : API d'interopérabilité HL7 FHIR
-- Expose les disponibilités de lits sous forme de Bundle FHIR R4
-- (ressources Location), consommable par le DPU / DHIS2.
-- Appel : POST /rest/v1/rpc/fhir_availability  (ou supabase.rpc).
-- ============================================================

create or replace function public.fhir_availability()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'resourceType', 'Bundle',
    'type', 'collection',
    'timestamp', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'total', (select count(*) from public.v_facility_availability),
    'entry', coalesce((
      select jsonb_agg(jsonb_build_object(
        'fullUrl', 'Location/' || f.facility_id,
        'resource', jsonb_build_object(
          'resourceType', 'Location',
          'id', f.facility_id::text,
          'status', case when f.is_active then 'active' else 'suspended' end,
          'name', f.name,
          'mode', 'instance',
          'physicalType', jsonb_build_object('coding', jsonb_build_array(jsonb_build_object(
            'system', 'http://terminology.hl7.org/CodeSystem/location-physical-type',
            'code', 'si', 'display', 'Site'
          ))),
          'position', jsonb_build_object('longitude', f.longitude, 'latitude', f.latitude),
          'extension', jsonb_build_array(
            jsonb_build_object('url', 'https://jokkosante.sn/fhir/beds-total', 'valueInteger', f.beds_total),
            jsonb_build_object('url', 'https://jokkosante.sn/fhir/beds-available', 'valueInteger', f.beds_free),
            jsonb_build_object('url', 'https://jokkosante.sn/fhir/occupancy-rate', 'valueInteger', coalesce(f.occupancy_rate, 0))
          ),
          'contained', coalesce((
            select jsonb_agg(jsonb_build_object(
              'resourceType', 'Location',
              'id', s.facility_service_id::text,
              'name', s.specialty_name,
              'operationalStatus', jsonb_build_object(
                'system', 'http://terminology.hl7.org/CodeSystem/v2-0116',
                'code', case when s.beds_free > 0 then 'U' else 'O' end,
                'display', case when s.beds_free > 0 then 'Unoccupied' else 'Occupied' end
              ),
              'extension', jsonb_build_array(
                jsonb_build_object('url', 'https://jokkosante.sn/fhir/beds-available', 'valueInteger', s.beds_free),
                jsonb_build_object('url', 'https://jokkosante.sn/fhir/beds-total', 'valueInteger', s.beds_total)
              )
            ))
            from public.v_service_availability s
            where s.facility_id = f.facility_id and s.is_active
          ), '[]'::jsonb)
        )
      ))
      from public.v_facility_availability f
    ), '[]'::jsonb)
  );
$$;

grant execute on function public.fhir_availability() to anon, authenticated;
