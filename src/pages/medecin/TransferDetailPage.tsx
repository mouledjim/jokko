import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, X, Truck, MapPin, Plus, Clock, Ban } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { RespondActions } from '@/components/transfers/RespondActions'
import { AmbulanceMap } from '@/components/transfers/AmbulanceMap'
import { useTransfer, useTransferEvents, useTransferAction } from '@/features/transfers/api'
import { useFacilityAvailability } from '@/features/availability/api'
import { transferDraft } from '@/features/transfers/draft'
import { cn } from '@/lib/cn'
import { dateTime, timeAgo, formatDelay } from '@/lib/format'
import { SEVERITY_LABEL } from '@/lib/roles'

const EVENT_META: Record<string, { label: string; icon: LucideIcon; cls: string }> = {
  creation: { label: 'Demande créée', icon: Plus, cls: 'bg-bloc/10 text-bloc' },
  acceptation: { label: 'Transfert accepté', icon: Check, cls: 'bg-constante/10 text-constante' },
  refus: { label: 'Transfert refusé', icon: X, cls: 'bg-vital/10 text-vital' },
  mise_en_route: { label: 'Patient en route', icon: Truck, cls: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300' },
  arrivee: { label: 'Patient arrivé', icon: MapPin, cls: 'bg-bloc/10 text-bloc' },
  annulation: { label: 'Demande annulée', icon: Ban, cls: 'bg-slate-100 text-slate-500 dark:bg-white/10' },
}

export default function TransferDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { facility } = useAuth()
  const transfer = useTransfer(id)
  const events = useTransferEvents(id)
  const facilities = useFacilityAvailability()
  const action = useTransferAction()

  const t = transfer.data
  const coords = useMemo(() => {
    if (!t) return null
    const from = facilities.data?.find((f) => f.facility_id === t.from_facility_id)
    const to = facilities.data?.find((f) => f.facility_id === t.to_facility_id)
    if (!from || !to) return null
    return {
      from: { lat: from.latitude, lng: from.longitude, name: from.name },
      to: { lat: to.latitude, lng: to.longitude, name: to.name },
    }
  }, [t, facilities.data])

  if (transfer.isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }
  if (transfer.isError) return <ErrorState onRetry={() => transfer.refetch()} />
  if (!t) {
    return (
      <EmptyState title="Transfert introuvable" description="Cette demande n'existe pas ou ne vous est pas accessible." action={<Button onClick={() => navigate('/app/transferts')}>Retour aux transferts</Button>} />
    )
  }

  const isFrom = facility?.id === t.from_facility_id
  const isTo = facility?.id === t.to_facility_id

  const resend = () => {
    transferDraft.reset()
    transferDraft.set({
      patient_initials: t.patient_initials,
      patient_age: String(t.patient_age),
      patient_sex: t.patient_sex,
      severity: t.severity,
      specialty_id: t.specialty_id,
      motif: t.motif,
      clinical_notes: t.clinical_notes,
      ta: t.vitals.ta ?? '',
      fc: t.vitals.fc != null ? String(t.vitals.fc) : '',
      spo2: t.vitals.spo2 != null ? String(t.vitals.spo2) : '',
      temp: t.vitals.temp != null ? String(t.vitals.temp) : '',
      glasgow: t.vitals.glasgow != null ? String(t.vitals.glasgow) : '',
      step: 1,
    })
    navigate('/app/transferts/nouveau')
  }

  const vitals = [
    t.vitals.ta && `TA ${t.vitals.ta}`,
    t.vitals.fc != null && `FC ${t.vitals.fc}`,
    t.vitals.spo2 != null && `SpO₂ ${t.vitals.spo2}%`,
    t.vitals.temp != null && `T° ${t.vitals.temp}°C`,
    t.vitals.glasgow != null && `Glasgow ${t.vitals.glasgow}`,
  ].filter(Boolean) as string[]

  return (
    <div className="mx-auto max-w-4xl">
      <button onClick={() => navigate(-1)} className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition hover:text-slate-800 dark:hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Retour
      </button>

      <PageHeader
        title={<span className="flex items-center gap-3"><span className="font-mono text-xl">{t.reference}</span><SeverityBadge severity={t.severity} /></span>}
        subtitle={`${t.from_facility?.name} → ${t.to_facility?.name}`}
        actions={<StatusBadge status={t.status} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Colonne principale */}
        <div className="space-y-6 lg:col-span-3">
          <Card>
            <CardHeader title="Patient" subtitle="Données minimales anonymisées (CDP)" />
            <CardBody className="pt-2">
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                <Info label="Initiales" value={t.patient_initials} />
                <Info label="Âge" value={`${t.patient_age} ans`} />
                <Info label="Sexe" value={t.patient_sex === 'M' ? 'Masculin' : 'Féminin'} />
                <Info label="Gravité" value={SEVERITY_LABEL[t.severity]} />
                <Info label="Service requis" value={t.specialty?.name ?? '—'} />
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4 dark:border-garde-bord">
                <p className="text-[12px] font-medium text-slate-400">Motif clinique</p>
                <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">{t.motif}</p>
              </div>
              {vitals.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {vitals.map((v) => (
                    <span key={v} className="rounded-lg bg-slate-50 px-2.5 py-1 text-[13px] font-medium text-slate-600 tabular-nums dark:bg-white/5 dark:text-slate-300">{v}</span>
                  ))}
                </div>
              )}
              {t.clinical_notes && (
                <div className="mt-4 border-t border-slate-100 pt-4 dark:border-garde-bord">
                  <p className="text-[12px] font-medium text-slate-400">Notes</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{t.clinical_notes}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {t.status === 'en_route' && coords && (
            <Card>
              <CardHeader title="Suivi du transport" subtitle="Trajet de l'ambulance" />
              <CardBody className="pt-2">
                <AmbulanceMap from={coords.from} to={coords.to} />
              </CardBody>
            </Card>
          )}
        </div>

        {/* Colonne latérale : actions + timeline */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Actions" />
            <CardBody className="space-y-2 pt-2">
              {t.status === 'en_attente' && isTo && <RespondActions transferId={t.id} serviceName={t.specialty?.name ?? 'le service'} severity={t.severity} />}
              {t.status === 'en_attente' && isFrom && (
                <Button variant="secondary" block onClick={() => action.mutate({ id: t.id, action: 'annule' })} loading={action.isPending}>Annuler la demande</Button>
              )}
              {t.status === 'accepte' && isFrom && (
                <>
                  <Button block onClick={() => action.mutate({ id: t.id, action: 'en_route' })} loading={action.isPending}>
                    <Truck className="h-4 w-4" aria-hidden />
                    Marquer en route
                  </Button>
                  <Button variant="secondary" block onClick={() => action.mutate({ id: t.id, action: 'annule' })}>Annuler la demande</Button>
                </>
              )}
              {t.status === 'en_route' && (isFrom || isTo) && (
                <Button block onClick={() => action.mutate({ id: t.id, action: 'arrive' })} loading={action.isPending}>
                  <MapPin className="h-4 w-4" aria-hidden />
                  Marquer arrivé
                </Button>
              )}
              {t.status === 'refuse' && isFrom && (
                <>
                  {t.refusal_reason && (
                    <p className="rounded-xl bg-vital/5 px-3 py-2.5 text-[13px] text-vital">Motif du refus : {t.refusal_reason}</p>
                  )}
                  <Button block onClick={resend}>
                    <ArrowRight className="h-4 w-4" aria-hidden />
                    Renvoyer vers un autre hôpital
                  </Button>
                </>
              )}
              {(t.status === 'arrive' || t.status === 'annule') && (
                <p className="py-2 text-center text-[13px] text-slate-400">Aucune action disponible — transfert clôturé.</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Chronologie" />
            <CardBody className="pt-2">
              {events.isLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <ol className="relative space-y-5 pl-2">
                  {(events.data ?? []).map((e, i, arr) => {
                    const meta = EVENT_META[e.event_type] ?? EVENT_META.creation
                    const Icon = meta.icon
                    return (
                      <motion.li
                        key={e.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative flex gap-3"
                      >
                        {i < arr.length - 1 && <span className="absolute top-8 left-[15px] h-full w-px bg-slate-200 dark:bg-garde-bord" aria-hidden />}
                        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', meta.cls)}>
                          <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        <div className="min-w-0 pb-1">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{meta.label}</p>
                          {e.actor && (
                            <p className="text-[12px] text-slate-500 dark:text-slate-400">par {e.actor.first_name} {e.actor.last_name}</p>
                          )}
                          {typeof e.payload?.motif_refus === 'string' && (
                            <p className="mt-0.5 text-[12px] text-vital">{e.payload.motif_refus}</p>
                          )}
                          {typeof e.payload?.delai_reponse_secondes === 'number' && (
                            <p className="mt-0.5 text-[12px] text-slate-400">Délai de réponse : {formatDelay(e.payload.delai_reponse_secondes)}</p>
                          )}
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock className="h-3 w-3" aria-hidden />
                            {dateTime(e.created_at)} · {timeAgo(e.created_at)}
                          </p>
                        </div>
                      </motion.li>
                    )
                  })}
                </ol>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] font-medium text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  )
}
