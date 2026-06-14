import { useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { Activity, ArrowRightLeft, Timer, XCircle } from 'lucide-react'
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/data/StatCard'
import { StatCardSkeleton, Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useTransfers } from '@/features/transfers/api'
import { useOccupancyHistory } from '@/features/stats/api'
import { formatDelay } from '@/lib/format'
import { STATUS_LABEL } from '@/lib/roles'
import type { TransferStatus } from '@/types/db'

const STATUS_COLORS: Record<TransferStatus, string> = {
  en_attente: '#D97706',
  accepte: '#16A34A',
  refuse: '#DC2626',
  en_route: '#0EA5E9',
  arrive: '#0B5E59',
  annule: '#94A3B8',
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] shadow-md dark:border-garde-bord dark:bg-garde-surface">
      {label && <p className="mb-1 font-semibold text-slate-700 dark:text-slate-200">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-slate-600 dark:text-slate-300">
          <span style={{ color: p.color }}>{p.name}</span> : <span className="font-semibold tabular-nums">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export function StatsView({
  title,
  subtitle,
  occupancyFacilityIds,
}: {
  title: string
  subtitle: string
  /** Établissements pour l'occupation historique ; undefined = national. */
  occupancyFacilityIds?: string[]
}) {
  const transfers = useTransfers({ limit: 1000 })
  const occupancy = useOccupancyHistory(occupancyFacilityIds)
  const data = transfers.data ?? []

  const stats = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() })
    const byDay = days.map((d) => ({
      jour: format(d, 'd MMM', { locale: fr }),
      transferts: data.filter((t) => isSameDay(new Date(t.requested_at), d)).length,
    }))

    const specialtyMap = new Map<string, number>()
    for (const t of data) {
      const name = t.specialty?.name ?? 'Autre'
      specialtyMap.set(name, (specialtyMap.get(name) ?? 0) + 1)
    }
    const bySpecialty = [...specialtyMap.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

    const statusMap = new Map<TransferStatus, number>()
    for (const t of data) statusMap.set(t.status, (statusMap.get(t.status) ?? 0) + 1)
    const byStatus = [...statusMap.entries()].map(([status, value]) => ({ status, name: STATUS_LABEL[status], value }))

    const motifMap = new Map<string, number>()
    for (const t of data) motifMap.set(t.motif, (motifMap.get(t.motif) ?? 0) + 1)
    const topMotifs = [...motifMap.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6)

    const refusalMap = new Map<string, number>()
    for (const t of data) {
      if (t.status === 'refuse' && t.refusal_reason) {
        const key = t.refusal_reason.split(' — ')[0]
        refusalMap.set(key, (refusalMap.get(key) ?? 0) + 1)
      }
    }
    const refusals = [...refusalMap.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

    const responded = data.filter((t) => t.responded_at)
    const accepted = data.filter((t) => ['accepte', 'en_route', 'arrive'].includes(t.status))
    const refused = data.filter((t) => t.status === 'refuse')
    const delays = data.map((t) => t.response_delay_seconds).filter((d): d is number => d != null).sort((a, b) => a - b)
    const median = delays.length ? delays[Math.floor(delays.length / 2)] : null
    const acceptanceRate = responded.length ? Math.round((accepted.length / (accepted.length + refused.length || 1)) * 100) : 0
    const refusalRate = responded.length ? Math.round((refused.length / (accepted.length + refused.length || 1)) * 100) : 0

    return { byDay, bySpecialty, byStatus, topMotifs, refusals, median, acceptanceRate, refusalRate, total: data.length }
  }, [data])

  if (transfers.isError) {
    return (
      <div>
        <PageHeader title={title} subtitle={subtitle} />
        <Card className="p-2"><ErrorState onRetry={() => transfers.refetch()} /></Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {transfers.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Transferts (30 j)" value={stats.total} icon={ArrowRightLeft} tone="bloc" />
            <StatCard label="Taux d'acceptation" value={stats.acceptanceRate} suffix="%" icon={Activity} tone="success" />
            <StatCard label="Taux de refus" value={stats.refusalRate} suffix="%" icon={XCircle} tone={stats.refusalRate > 25 ? 'danger' : 'neutral'} />
            <StatCard label="Délai médian" value={formatDelay(stats.median)} icon={Timer} tone="warning" animate={false} />
          </>
        )}
      </div>

      {transfers.isLoading ? (
        <Skeleton className="mt-6 h-72 w-full" />
      ) : stats.total === 0 ? (
        <Card className="mt-6 p-2"><EmptyState title="Aucune donnée" description="Aucun transfert sur la période pour générer des statistiques." /></Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader title="Occupation des lits — historique" subtitle="Taux d'occupation moyen, 30 derniers jours" />
            <CardBody>
              {occupancy.isLoading ? (
                <Skeleton className="h-[240px] w-full" />
              ) : (occupancy.data ?? []).length === 0 ? (
                <p className="py-16 text-center text-sm text-slate-400">Aucun historique d'occupation disponible.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={occupancy.data} margin={{ left: -20, right: 8, top: 8 }}>
                    <defs>
                      <linearGradient id="occgrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D97706" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#D97706" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} interval={4} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={32} unit="%" />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="occupancy" name="Occupation (%)" stroke="#D97706" strokeWidth={2} fill="url(#occgrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader title="Évolution des transferts" subtitle="30 derniers jours" />
            <CardBody>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={stats.byDay} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="jour" tick={{ fontSize: 11, fill: '#94a3b8' }} interval={4} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="transferts" stroke="#0B5E59" strokeWidth={2} fill="url(#grad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Répartition par spécialité" />
            <CardBody>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats.bySpecialty} layout="vertical" margin={{ left: 30, right: 8 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={90} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="value" fill="#0B5E59" radius={[0, 6, 6, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Répartition par statut" />
            <CardBody>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={stats.byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {stats.byStatus.map((e) => (
                      <Cell key={e.status} fill={STATUS_COLORS[e.status]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                {stats.byStatus.map((e) => (
                  <span key={e.status} className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[e.status] }} />
                    {e.name} ({e.value})
                  </span>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Principaux motifs de transfert" />
            <CardBody>
              {stats.topMotifs.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">Aucun motif</p>
              ) : (
                <ul className="space-y-2.5">
                  {stats.topMotifs.map((m) => {
                    const max = stats.topMotifs[0].value
                    return (
                      <li key={m.name}>
                        <div className="mb-1 flex justify-between text-[13px]">
                          <span className="truncate pr-2 text-slate-600 dark:text-slate-300">{m.name}</span>
                          <span className="font-semibold tabular-nums text-slate-500">{m.value}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                          <div className="h-full rounded-full bg-bloc-clair" style={{ width: `${(m.value / max) * 100}%` }} />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Motifs de refus" subtitle="Pour améliorer la coordination" />
            <CardBody>
              {stats.refusals.length === 0 ? (
                <EmptyState title="Aucun refus" description="Aucun transfert refusé sur la période." />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.refusals} layout="vertical" margin={{ left: 30, right: 8 }}>
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={130} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="value" fill="#DC2626" radius={[0, 6, 6, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
