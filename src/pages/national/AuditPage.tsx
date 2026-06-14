import { useState } from 'react'
import { ChevronLeft, ChevronRight, FileClock } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import { Table, type Column } from '@/components/ui/Table'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useAuditLogs, type AuditLogWithActor } from '@/features/audit/api'
import { dateTime } from '@/lib/format'

const ENTITY_LABEL: Record<string, string> = {
  beds: 'Lit',
  equipment: 'Équipement',
  transfer_requests: 'Transfert',
  profiles: 'Personnel',
  facilities: 'Établissement',
}
const ACTION_LABEL: Record<string, string> = { insert: 'Création', update: 'Modification', delete: 'Suppression' }
const PAGE_SIZE = 20

export default function AuditPage() {
  const [entityType, setEntityType] = useState('')
  const [page, setPage] = useState(0)
  const { data, isLoading, isError, refetch, isPlaceholderData } = useAuditLogs({ entityType: entityType || undefined, page, pageSize: PAGE_SIZE })

  const total = data?.total ?? 0
  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1)

  const columns: Column<AuditLogWithActor>[] = [
    { key: 'date', header: 'Date', cell: (l) => <span className="text-[13px] text-slate-500 tabular-nums">{dateTime(l.created_at)}</span> },
    { key: 'actor', header: 'Auteur', hideOnMobile: true, cell: (l) => <span className="text-[13px] text-slate-700 dark:text-slate-200">{l.actor ? `${l.actor.first_name} ${l.actor.last_name}` : 'Système'}</span> },
    { key: 'action', header: 'Action', cell: (l) => <Badge tone={l.action === 'delete' ? 'danger' : l.action === 'insert' ? 'success' : 'neutral'}>{ACTION_LABEL[l.action] ?? l.action}</Badge> },
    { key: 'entity', header: 'Objet', cell: (l) => <span className="text-[13px] text-slate-600 dark:text-slate-300">{ENTITY_LABEL[l.entity_type] ?? l.entity_type}</span> },
    {
      key: 'detail',
      header: 'Détail',
      hideOnMobile: true,
      cell: (l) => {
        const m = l.metadata as Record<string, unknown>
        const libelle = typeof m.libelle === 'string' ? m.libelle : ''
        const transition = m.statut_avant && m.statut_apres ? `${m.statut_avant} → ${m.statut_apres}` : ''
        return <span className="text-[13px] text-slate-500">{[libelle, transition].filter(Boolean).join(' · ') || '—'}</span>
      },
    },
  ]

  return (
    <div>
      <PageHeader title="Journal d'audit" subtitle="Traçabilité de toutes les actions (conformité CDP)" />

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(0) }} aria-label="Filtrer par type d'objet" className="max-w-xs">
            <option value="">Tous les objets</option>
            {Object.entries(ENTITY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <span className="text-[13px] text-slate-400">{total} entrée{total > 1 ? 's' : ''}</span>
        </div>
      </Card>

      <Card className="p-2">
        {isLoading ? (
          <div className="p-3"><TableSkeleton rows={10} cols={5} /></div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (data?.rows.length ?? 0) === 0 ? (
          <EmptyState title="Aucune entrée" description="Aucune action enregistrée pour ce filtre." icon={<FileClock className="h-7 w-7 text-bloc-clair/60" />} />
        ) : (
          <>
            <Table columns={columns} data={data?.rows ?? []} rowKey={(l) => l.id} />
            <div className="flex items-center justify-between border-t border-slate-100 px-3 py-3 dark:border-garde-bord">
              <span className="text-[13px] text-slate-400">Page {page + 1} / {maxPage + 1}</span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                  <ChevronLeft className="h-4 w-4" aria-hidden /> Précédent
                </Button>
                <Button variant="secondary" size="sm" disabled={page >= maxPage || isPlaceholderData} onClick={() => setPage((p) => Math.min(maxPage, p + 1))}>
                  Suivant <ChevronRight className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
