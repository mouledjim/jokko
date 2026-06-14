import { distanceKm } from '@/lib/geo'
import { isStale } from '@/lib/format'
import type { FacilityAvailability, ServiceAvailability, Equipment, EquipmentType } from '@/types/db'

export interface Suggestion {
  facilityId: string
  name: string
  type: string
  freeBeds: number
  totalBeds: number
  distanceKm: number | null
  reasons: string[]
  /** Score de tri (plus haut = mieux). */
  score: number
}

const EQUIPMENT_SHORT: Record<string, string> = {
  scanner: 'scanner OK',
  irm: 'IRM OK',
  bloc_operatoire: 'bloc OK',
  generateur_oxygene: 'O₂ OK',
  ambulance: 'ambulance OK',
  laboratoire: 'labo OK',
}

/**
 * Classe les établissements destinataires possibles pour un transfert :
 * compatibilité du service + lits libres + équipement requis + distance.
 */
export function buildSuggestions(params: {
  fromFacilityId: string
  fromPosition: { lat: number; lng: number } | null
  specialtyId: string
  requiredEquipment: EquipmentType[]
  facilities: FacilityAvailability[]
  services: ServiceAvailability[]
  equipment: Equipment[]
}): Suggestion[] {
  const { fromFacilityId, fromPosition, specialtyId, requiredEquipment, facilities, services, equipment } = params

  const servicesByFacility = new Map<string, ServiceAvailability[]>()
  for (const s of services) {
    const list = servicesByFacility.get(s.facility_id) ?? []
    list.push(s)
    servicesByFacility.set(s.facility_id, list)
  }
  const equipmentByFacility = new Map<string, Equipment[]>()
  for (const e of equipment) {
    const list = equipmentByFacility.get(e.facility_id) ?? []
    list.push(e)
    equipmentByFacility.set(e.facility_id, list)
  }

  const out: Suggestion[] = []
  for (const f of facilities) {
    if (f.facility_id === fromFacilityId || !f.is_active) continue

    const svc = servicesByFacility.get(f.facility_id)?.find((s) => s.specialty_id === specialtyId && s.is_active)
    if (!svc) continue // service non offert : incompatible

    const facEquipment = equipmentByFacility.get(f.facility_id) ?? []
    const equipOk = requiredEquipment.every((t) =>
      facEquipment.some((e) => e.type === t && e.status === 'fonctionnel'),
    )
    if (requiredEquipment.length > 0 && !equipOk) continue

    const dist = fromPosition ? distanceKm(fromPosition, { lat: f.latitude, lng: f.longitude }) : null
    const stale = isStale(svc.last_bed_update)

    const reasons: string[] = []
    reasons.push(
      svc.beds_free > 0
        ? `${svc.beds_free} lit${svc.beds_free > 1 ? 's' : ''} ${svc.specialty_name.toLowerCase()} libre${svc.beds_free > 1 ? 's' : ''}`
        : 'aucun lit libre',
    )
    for (const t of requiredEquipment) reasons.push(EQUIPMENT_SHORT[t] ?? t)
    if (dist != null) reasons.push(`${dist < 10 ? dist.toFixed(0) : Math.round(dist)} km`)
    if (stale) reasons.push('données à actualiser')

    // Score : priorité aux lits libres, bonus proximité, malus données périmées.
    const score =
      svc.beds_free * 100 - (dist ?? 200) - (stale ? 50 : 0) + (equipOk ? 10 : 0)

    out.push({
      facilityId: f.facility_id,
      name: f.name,
      type: f.type,
      freeBeds: svc.beds_free,
      totalBeds: svc.beds_total,
      distanceKm: dist,
      reasons,
      score,
    })
  }

  return out.sort((a, b) => b.score - a.score)
}
