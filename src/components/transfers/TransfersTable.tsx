import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Search } from 'lucide-react'
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
import { downloadCsv } from '@/lib/csv'
import { dateShort, formatDelay } from '@/lib/format'
import { STATUS_LABEL, SEVERITY_LABEL } from '@/lib/roles'
import type { TransferStatus, TransferSeverity } from '@/types/db'

/** Table de supervision des transferts (admin établissement / national / région). */
export function TransfersTable({ title, subtitle, basePath }: { title: string; subtitle: string; basePath: string }) {
  const navigate = useNavigate()
  const all = useTransfers({ limit: 1000 })
  const [status, setStatus] = useState('')
  const [severity, setSeverity] = useState('')
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    let list = all.data ?? []
    if (status) list = list.filter((t) => t.status === status)
    if (severity) list = list.filter((t) => t.severity === severity)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((t) => t.reference.toLowerCase().includes(q) || t.motif.toLowerCase().includes(q) || (t.from_facility?.name ?? '').toLowerCase().includes(q) || (t.to_facility?.name ?? '').toLowerCase().includes(q))
    }
    return list
  }, [all.data, status, severity, search])

  const exportCsv = () => {
    const header = ['Référence', 'Date', 'Origine', 'Destination', 'Spécialité', 'Gravité', 'Statut', 'Délai de réponse']
    const body = rows.map((t) => [
      t.reference,
      dateShort(t.requested_at),
      t.from_facility?.name ?? '',
      t.to_facility?.name ?? '',
      t.specialty?.name ?? '',
      SEVERITY_LABEL[t.severity],
      STATUS_LABEL[t.status],
      t.response_delay_seconds != null ? formatDelay(t.response_delay_seconds) : '',
    ])
    downloadCsv(`transferts-${new Date().toISOString().slice(0, 10)}.csv`, [header, ...body])
  }

  const columns: Column<TransferWithRefs>[] = [
    {
      key: 'ref',
      header: 'Référence',
      cell: (t) => (
        <div>
          <span className="font-mono text-[12px] font-semibold text-slate-500">{t.reference}</span>
          <p className="mt-0.5 max-w-[200px] truncate text-[13px] text-slate-700 dark:text-slate-200">{t.motif}</p>
        </div>
      ),
    },
    { key: 'from', header: 'Origine', hideOnMobile: true, cell: (t) => <span className="text-[13px] text-slate-600 dark:text-slate-300">{t.from_facility?.name}</span> },
    { key: 'to', header: 'Destination', hideOnMobile: true, cell: (t) => <span className="text-[13px] text-slate-600 dark:text-slate-300">{t.to_facility?.name}</span> },
    { key: 'sev', header: 'Gravité', cell: (t) => <SeverityBadge severity={t.severity} /> },
    { key: 'status', header: 'Statut', cell: (t) => <StatusBadge status={t.status} /> },
    { key: 'date', header: 'Date', align: 'right', hideOnMobile: true, cell: (t) => <span className="text-[13px] text-slate-400 tabular-nums">{dateShort(t.requested_at)}</span> },
  ]

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <Button variant="secondary" size="sm" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="h-4 w-4" aria-hidden />
            Exporter CSV
          </Button>
        }
      />

      <Card className="mb-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input placeholder="Rechercher (réf., motif, établissement)" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Statut">
            <option value="">Tous les statuts</option>
            {(Object.keys(STATUS_LABEL) as TransferStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </Select>
          <Select value={severity} onChange={(e) => setSeverity(e.target.value)} aria-label="Gravité">
            <option value="">Toutes gravités</option>
            {(Object.keys(SEVERITY_LABEL) as TransferSeverity[]).map((s) => <option key={s} value={s}>{SEVERITY_LABEL[s]}</option>)}
          </Select>
        </div>
      </Card>

      <Card className="p-2">
        {all.isLoading ? (
          <div className="p-3"><TableSkeleton rows={8} cols={5} /></div>
        ) : all.isError ? (
          <ErrorState onRetry={() => all.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState title={all.data?.length ? 'Aucun résultat' : 'Aucun transfert'} description={all.data?.length ? 'Aucun transfert ne correspond aux filtres.' : 'Aucun transfert enregistré.'} />
        ) : (
          <Table columns={columns} data={rows} rowKey={(t) => t.id} onRowClick={(t) => navigate(`${basePath}/${t.id}`)} />
        )}
      </Card>
    </div>
  )
}
