export type AvailabilityState = 'available' | 'tension' | 'full' | 'stale'

export const STATE_COLOR: Record<AvailabilityState, string> = {
  available: '#16A34A', // constante
  tension: '#D97706', // triage
  full: '#DC2626', // vital (ici : alerte « complet »)
  stale: '#94A3B8', // slate
}

export const STATE_LABEL: Record<AvailabilityState, string> = {
  available: 'Places disponibles',
  tension: 'En tension',
  full: 'Complet',
  stale: 'Données à actualiser',
}

/** État d'un établissement au niveau global (occupation). */
export function facilityState(opts: {
  bedsFree: number
  occupancyRate: number | null
  stale: boolean
}): AvailabilityState {
  if (opts.stale) return 'stale'
  if (opts.bedsFree === 0) return 'full'
  if ((opts.occupancyRate ?? 0) >= 85) return 'tension'
  return 'available'
}

/** État pour un service précis (quand un filtre spécialité est actif). */
export function serviceState(opts: { bedsFree: number; stale: boolean }): AvailabilityState {
  if (opts.stale) return 'stale'
  if (opts.bedsFree === 0) return 'full'
  if (opts.bedsFree <= 2) return 'tension'
  return 'available'
}
