import { useNavigate } from 'react-router-dom'
import { ArrowRight, Clock, Inbox } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { CardGridSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { SeverityBadge } from '@/components/ui/Badge'
import { RespondActions } from '@/components/transfers/RespondActions'
import { useTransfers } from '@/features/transfers/api'
import { useTick } from '@/hooks/useTick'
import { cn } from '@/lib/cn'
import { elapsed } from '@/lib/format'

export default function IncomingTransfersPage() {
  const { facility } = useAuth()
  const navigate = useNavigate()
  const incoming = useTransfers({ status: ['en_attente'], toFacilityId: facility?.id })
  useTick(1000)

  const list = incoming.data ?? []

  return (
    <div>
      <PageHeader
        title="Transferts entrants"
        subtitle="Demandes adressées à votre établissement, en attente de réponse"
      />

      {incoming.isLoading ? (
        <CardGridSkeleton count={3} />
      ) : incoming.isError ? (
        <Card className="p-2"><ErrorState onRetry={() => incoming.refetch()} /></Card>
      ) : list.length === 0 ? (
        <Card className="p-2">
          <EmptyState
            title="Aucune demande en attente"
            description="Les nouvelles demandes de transfert apparaîtront ici en temps réel, avec une alerte."
            icon={<Inbox className="h-7 w-7 text-bloc-clair/60" />}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {list.map((t) => {
            const urgent = t.severity === 'critique' || t.severity === 'urgent'
            const vitals = [
              t.vitals.ta && `TA ${t.vitals.ta}`,
              t.vitals.fc != null && `FC ${t.vitals.fc}`,
              t.vitals.spo2 != null && `SpO₂ ${t.vitals.spo2}%`,
              t.vitals.glasgow != null && `Glasgow ${t.vitals.glasgow}`,
            ].filter(Boolean) as string[]
            return (
              <Card
                key={t.id}
                className={cn(
                  'relative',
                  t.severity === 'critique' && 'ring-1 ring-vital/40',
                )}
              >
                {t.severity === 'critique' && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3" aria-hidden>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vital opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-vital" />
                  </span>
                )}
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-[12px] font-semibold text-slate-400">{t.reference}</span>
                      <div className="mt-1 flex items-center gap-2">
                        <SeverityBadge severity={t.severity} />
                        <span className="text-[13px] text-slate-500">{t.specialty?.name}</span>
                      </div>
                    </div>
                    <span className={cn('flex items-center gap-1 text-[13px] font-semibold tabular-nums', urgent ? 'text-triage' : 'text-slate-500')}>
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {elapsed(t.requested_at)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100">{t.motif}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[13px] text-slate-500">
                    De {t.from_facility?.name}
                  </p>
                  <p className="mt-1 text-[13px] text-slate-500">
                    {t.patient_initials} · {t.patient_age} ans · {t.patient_sex === 'M' ? 'M' : 'F'}
                  </p>

                  {vitals.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {vitals.map((v) => (
                        <span key={v} className="rounded-md bg-slate-50 px-2 py-0.5 text-[12px] font-medium text-slate-600 tabular-nums dark:bg-white/5 dark:text-slate-300">{v}</span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4">
                    <RespondActions transferId={t.id} serviceName={t.specialty?.name ?? 'le service'} onDone={() => undefined} />
                  </div>
                  <button onClick={() => navigate(`/app/transferts/${t.id}`)} className="mt-2 flex w-full items-center justify-center gap-1 text-[12px] font-medium text-slate-400 transition hover:text-bloc">
                    Voir le détail
                    <ArrowRight className="h-3 w-3" aria-hidden />
                  </button>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
