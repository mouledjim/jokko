import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'

export interface OccupancyPoint {
  day: string
  occupancy: number
  freeBeds: number
}

interface SnapshotRow {
  captured_at: string
  occupancy_rate: number | null
  beds_total: number
  beds_free: number
}

/**
 * Historique d'occupation agrégé par jour, à partir des instantanés réels
 * (table bed_snapshots). `facilityIds` undefined = national ; [] = aucun.
 */
export function useOccupancyHistory(facilityIds?: string[]) {
  const key = facilityIds ? [...facilityIds].sort().join(',') : 'all'
  return useQuery({
    queryKey: ['occupancy-history', key],
    enabled: facilityIds === undefined || facilityIds.length > 0,
    queryFn: async (): Promise<OccupancyPoint[]> => {
      let q = supabase
        .from('bed_snapshots')
        .select('captured_at, occupancy_rate, beds_total, beds_free')
        .order('captured_at', { ascending: true })
        .limit(2000)
      if (facilityIds) q = q.in('facility_id', facilityIds)
      const { data, error } = await q
      if (error) throw error

      // Agrégation par jour : occupation moyenne pondérée par le parc + lits libres cumulés.
      const byDay = new Map<string, { wSum: number; tSum: number; free: number }>()
      for (const r of (data ?? []) as SnapshotRow[]) {
        const d = r.captured_at.slice(0, 10)
        const cur = byDay.get(d) ?? { wSum: 0, tSum: 0, free: 0 }
        cur.wSum += (r.occupancy_rate ?? 0) * r.beds_total
        cur.tSum += r.beds_total
        cur.free += r.beds_free
        byDay.set(d, cur)
      }
      return [...byDay.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([d, v]) => ({
          day: format(new Date(d), 'd MMM', { locale: fr }),
          occupancy: v.tSum ? Math.round(v.wSum / v.tSum) : 0,
          freeBeds: v.free,
        }))
    },
  })
}
