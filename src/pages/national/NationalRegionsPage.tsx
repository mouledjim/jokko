import { useMemo } from 'react'
import { MapPin } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { CardGridSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useRegions } from '@/features/reference/api'
import { useFacilityAvailability } from '@/features/availability/api'
import { cn } from '@/lib/cn'

export default function NationalRegionsPage() {
  const regions = useRegions()
  const availability = useFacilityAvailability()

  const stats = useMemo(() => {
    const byRegion = new Map<string, { facilities: number; free: number; total: number; occSum: number }>()
    for (const f of availability.data ?? []) {
      const cur = byRegion.get(f.region_id) ?? { facilities: 0, free: 0, total: 0, occSum: 0 }
      cur.facilities += 1
      cur.free += f.beds_free
      cur.total += f.beds_total
      cur.occSum += f.occupancy_rate ?? 0
      byRegion.set(f.region_id, cur)
    }
    return byRegion
  }, [availability.data])

  return (
    <div>
      <PageHeader title="Régions médicales" subtitle="Les 14 régions du Sénégal et leur capacité" />
      {regions.isLoading || availability.isLoading ? (
        <CardGridSkeleton count={6} />
      ) : regions.isError ? (
        <Card className="p-2"><ErrorState onRetry={() => regions.refetch()} /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(regions.data ?? []).map((r) => {
            const s = stats.get(r.id)
            const occ = s && s.facilities ? Math.round(s.occSum / s.facilities) : 0
            return (
              <Card key={r.id} className="p-5" hoverable>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-bloc/10 text-bloc"><MapPin className="h-[18px] w-[18px]" aria-hidden /></span>
                  <div>
                    <h3 className="font-display text-[15px] font-semibold text-slate-900 dark:text-slate-100">{r.name}</h3>
                    <p className="text-[12px] text-slate-400">{s?.facilities ?? 0} établissement{(s?.facilities ?? 0) > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="font-display text-2xl font-semibold tabular-nums text-constante">{s?.free ?? 0}</p>
                    <p className="text-[11px] text-slate-400">lits libres / {s?.total ?? 0}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn('font-display text-lg font-semibold tabular-nums', occ >= 85 ? 'text-triage' : 'text-slate-600 dark:text-slate-300')}>{occ}%</p>
                    <p className="text-[11px] text-slate-400">occupation</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
