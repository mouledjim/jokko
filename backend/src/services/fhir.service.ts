import { supabaseAdmin } from './supabase.service.js'

export interface FhirLocationResource {
  resourceType: 'Location'
  id: string
  status: 'active' | 'suspended' | 'inactive'
  name: string
  description?: string
  mode: 'instance'
  type?: Array<{
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }>
  telecom?: Array<{
    system: 'phone' | 'email'
    value: string
    use: 'work'
  }>
  address?: {
    text: string
    city?: string
    country: 'SN'
  }
  position?: {
    longitude: number
    latitude: number
  }
  extension?: Array<{
    url: string
    valueInteger?: number
    valueDecimal?: number
    valueString?: string
  }>
}

export interface FhirBundle {
  resourceType: 'Bundle'
  type: 'searchset'
  timestamp: string
  total: number
  entry: Array<{
    fullUrl: string
    resource: FhirLocationResource
  }>
}

export async function generateFhirAvailabilityBundle(regionId?: string): Promise<FhirBundle> {
  let query = supabaseAdmin.from('v_facility_availability').select('*')
  if (regionId) {
    query = query.eq('region_id', regionId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Erreur lors de la récupération des données FHIR : ${error.message}`)
  }

  const facilities = data || []

  const entries = facilities.map((fac) => {
    const resource: FhirLocationResource = {
      resourceType: 'Location',
      id: fac.facility_id,
      status: fac.is_active ? 'active' : 'inactive',
      name: fac.name,
      mode: 'instance',
      type: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
              code: fac.type === 'hopital_national' ? 'HOSP' : 'PROV',
              display: fac.type.replace('_', ' ').toUpperCase(),
            },
          ],
        },
      ],
      telecom: fac.phone
        ? [
            {
              system: 'phone',
              value: fac.phone,
              use: 'work',
            },
          ]
        : undefined,
      address: {
        text: `${fac.name}, Région de ${fac.region_name}, Sénégal`,
        city: fac.region_name,
        country: 'SN',
      },
      position: {
        latitude: fac.latitude,
        longitude: fac.longitude,
      },
      extension: [
        {
          url: 'https://jokkosante.sn/fhir/StructureDefinition/beds-available',
          valueInteger: fac.beds_free ?? 0,
        },
        {
          url: 'https://jokkosante.sn/fhir/StructureDefinition/beds-total',
          valueInteger: fac.beds_total ?? 0,
        },
        {
          url: 'https://jokkosante.sn/fhir/StructureDefinition/occupancy-rate',
          valueDecimal: fac.occupancy_rate ?? 0,
        },
      ],
    }

    return {
      fullUrl: `https://api.jokkosante.sn/api/fhir/Location/${fac.facility_id}`,
      resource,
    }
  })

  return {
    resourceType: 'Bundle',
    type: 'searchset',
    timestamp: new Date().toISOString(),
    total: entries.length,
    entry: entries,
  }
}
