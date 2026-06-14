import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { Table, type Column } from '@/components/ui/Table'
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useTransfers, type TransferWithRefs } from '@/features/transfers/api'
import { useTick } from '@/hooks/useTick'
import { elapsed, dateShort, formatDelay } from '@/lib/format'
import { STATUS_LABEL, SEVERITY_LABEL } from '@/lib/roles'
import type { TransferStatus, TransferSeverity } from '@/types/db'

export default function MyTransfersPage() {
  const { facility } = useAuth()
  const navigate = useNavigate()
  const all = useTransfers({ limit: 200 })
  useTick(1000) // chronos en direct

  const [status, setStatus] = useState<string>('')
  const [severity, setSeverity] = useState<string>('')
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    let list = all.data ?? []
    if (status) list = list.filter((t) => t.status === status)
    if (severity) list = list.filter((t) => t.severity === severity)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((t) => t.reference.toLowerCase().includes(q) || t.motif.toLowerCase().includes(q))
    }
    return list
  }, [all.data, status, severity, search])

  const columns: Column<TransferWithRefs>[] = [
    {
      key: 'ref',
      header: 'Référence',
      cell: (t) => (
        <div>
          <span className="font-mono text-[12px] font-semibold text-slate-500">{t.reference}</span>
          <p className="mt-0.5 max-w-[220px] truncate text-[13px] font-medium text-slate-800 dark:text-slate-100">{t.motif}</p>
        </div>
      ),
    },
    {
      key: 'sens',
      header: 'Trajet',
      hideOnMobile: true,
      cell: (t) => {
        const outgoing = t.from_facility_id === facility?.id
        return (
          <span className="flex items-center gap-1.5 text-[13px] text-slate-600 dark:text-slate-300">
            {outgoing ? 'Vers' : 'De'} {(outgoing ? t.to_facility : t.from_facility)?.name}
            {!outgoing && <span className="rounded bg-bloc/10 px-1.5 py-0.5 text-[10px] font-semibold text-bloc">entrant</span>}
          </span>
        )
      },
    },
    { key: 'sev', header: 'Gravité', cell: (t) => <SeverityBadge severity={t.severity} /> },
    { key: 'status', header: 'Statut', cell: (t) => <StatusBadge status={t.status} /> },
    {
      key: 'chrono',
      header: 'Délai',
      align: 'right',
      cell: (t) =>
        t.status === 'en_attente' ? (
          <span className="text-[13px] font-medium text-triage tabular-nums">{elapsed(t.requested_at)}</span>
        ) : t.response_delay_seconds != null ? (
          <span className="text-[13px] text-slate-500 tabular-nums">{formatDelay(t.response_delay_seconds)}</span>
        ) : (
          <span className="text-[13px] text-slate-400 tabular-nums">{dateShort(t.requested_at)}</span>
        ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Mes transferts"
        subtitle="Demandes émises et reçues par votre établissement"
        actions={
          <Button onClick={() => navigate('/app/transferts/nouveau')}>
            <Plus className="h-4 w-4" aria-hidden />
            Nouvelle demande
          </Button>
        }
      />

      <Card className="mb-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input placeholder="Rechercher (référence, motif)" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrer par statut">
            <option value="">Tous les statuts</option>
            {(Object.keys(STATUS_LABEL) as TransferStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </Select>
          <Select value={severity} onChange={(e) => setSeverity(e.target.value)} aria-label="Filtrer par gravité">
            <option value="">Toutes gravités</option>
            {(Object.keys(SEVERITY_LABEL) as TransferSeverity[]).map((s) => (
              <option key={s} value={s}>{SEVERITY_LABEL[s]}</option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="p-2">
        {all.isLoading ? (
          <div className="p-3"><TableSkeleton rows={6} /></div>
        ) : all.isError ? (
          <ErrorState onRetry={() => all.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            title={all.data?.length ? 'Aucun résultat' : 'Aucun transfert'}
            description={all.data?.length ? 'Aucun transfert ne correspond à vos filtres.' : 'Vos demandes de transfert apparaîtront ici.'}
            action={!all.data?.length ? <Button onClick={() => navigate('/app/transferts/nouveau')}><Plus className="h-4 w-4" aria-hidden />Nouvelle demande</Button> : undefined}
          />
        ) : (
          <Table
            columns={columns}
            data={rows}
            rowKey={(t) => t.id}
            onRowClick={(t) => navigate(`/app/transferts/${t.id}`)}
          />
        )}
      </Card>
    </div>
  )
}
