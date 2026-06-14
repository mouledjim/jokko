import { useMemo } from 'react'
import { BedDouble, Activity, ArrowRightLeft, Timer, CircleCheck } from 'lucide-react'
import { isToday } from 'date-fns'
import { useFacilityAvailability } from '@/features/availability/api'
import { useTransfers } from '@/features/transfers/api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/data/StatCard'
import { StatCardSkeleton, Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { TransferListItem } from '@/components/data/TransferListItem'
import { formatDelay, isStale } from '@/lib/format'

export default function NationalDashboard() {
  const availability = useFacilityAvailability()
  const transfers = useTransfers({ limit: 200 })

  const stats = useMemo(() => {
    const facs = availability.data ?? []
    const totalBeds = facs.reduce((s, f) => s + f.beds_total, 0)
    const freeBeds = facs.reduce((s, f) => s + f.beds_free, 0)
    const upToDate = facs.filter((f) => !isStale(f.last_bed_update)).length
    const pctUpToDate = facs.length ? Math.round((upToDate / facs.length) * 100) : 0
    return { totalBeds, freeBeds, pctUpToDate, facilityCount: facs.length }
  }, [availability.data])

  const transferStats = useMemo(() => {
    const list = transfers.data ?? []
    const today = list.filter((t) => isToday(new Date(t.requested_at))).length
    const delays = list
      .map((t) => t.response_delay_seconds)
      .filter((d): d is number => d != null)
      .sort((a, b) => a - b)
    const median = delays.length ? delays[Math.floor(delays.length / 2)] : null
    return { today, median }
  }, [transfers.data])

  const byRegion = useMemo(() => {
    const map = new Map<string, { name: string; free: number; total: number }>()
    for (const f of availability.data ?? []) {
      const cur = map.get(f.region_id) ?? { name: f.region_name, free: 0, total: 0 }
      cur.free += f.beds_free
      cur.total += f.beds_total
      map.set(f.region_id, cur)
    }
    return [...map.values()].sort((a, b) => b.free - a.free)
  }, [availability.data])

  return (
    <div>
      <PageHeader title="Tableau de bord national" subtitle="Ministère de la Santé et de l'Action sociale (MSAS)" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {availability.isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Lits recensés" value={stats.totalBeds} icon={BedDouble} tone="bloc" />
            <StatCard label="Lits libres" value={stats.freeBeds} icon={Activity} tone="success" />
            <StatCard label="Transferts du jour" value={transferStats.today} icon={ArrowRightLeft} tone="bloc" />
            <StatCard label="Délai médian d'acceptation" value={formatDelay(transferStats.median)} icon={Timer} tone="warning" animate={false} />
            <StatCard label="Établissements à jour" value={stats.pctUpToDate} suffix="%" icon={CircleCheck} tone={stats.pctUpToDate >= 80 ? 'success' : 'warning'} />
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Disponibilité par région" subtitle="Lits libres agrégés" />
          <CardBody className="pt-2">
            {availability.isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : availability.isError ? (
              <ErrorState onRetry={() => availability.refetch()} />
            ) : byRegion.length === 0 ? (
              <EmptyState title="Aucune donnée" description="Aucun établissement recensé." />
            ) : (
              <ul className="space-y-3">
                {byRegion.map((r) => {
                  const pct = r.total ? Math.round((r.free / r.total) * 100) : 0
                  return (
                    <li key={r.name} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 truncate text-sm font-medium text-slate-700 dark:text-slate-200">{r.name}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                        <div className="h-full rounded-full bg-bloc-clair" style={{ width: `${Math.max(2, pct)}%` }} />
                      </div>
                      <span className="w-20 shrink-0 text-right text-[12px] text-slate-400 tabular-nums">{r.free} / {r.total}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Activité en direct" subtitle="Derniers transferts" />
          <CardBody className="pt-2">
            {transfers.isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : transfers.isError ? (
              <ErrorState onRetry={() => transfers.refetch()} />
            ) : (transfers.data ?? []).length === 0 ? (
              <EmptyState title="Aucun transfert" description="L'activité nationale apparaîtra ici." />
            ) : (
              <div className="-mx-2">
                {(transfers.data ?? []).slice(0, 7).map((t) => (
                  <TransferListItem key={t.id} transfer={t} />
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
