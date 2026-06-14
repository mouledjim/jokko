import { useMemo } from 'react'
import { BedDouble, Inbox, ArrowRightLeft, Bell } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/data/StatCard'
import { StatCardSkeleton, Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { ServiceAvailabilityList } from '@/components/data/ServiceAvailabilityList'
import { TransferListItem } from '@/components/data/TransferListItem'
import { useServiceAvailability, useFacilityAvailability } from '@/features/availability/api'
import { useTransfers, IN_PROGRESS_STATUSES } from '@/features/transfers/api'
import { useNotifications } from '@/features/notifications/api'
import { timeAgo } from '@/lib/format'

export default function MedecinDashboard() {
  const { profile, facility } = useAuth()
  const services = useServiceAvailability(facility?.id)
  const regionAvailability = useFacilityAvailability()
  const inProgress = useTransfers({ status: [...IN_PROGRESS_STATUSES] })
  const notifications = useNotifications()

  const regionFreeBeds = useMemo(() => {
    if (!facility || !regionAvailability.data) return 0
    return regionAvailability.data
      .filter((f) => f.region_id === facility.region_id)
      .reduce((sum, f) => sum + f.beds_free, 0)
  }, [regionAvailability.data, facility])

  const incoming = useMemo(
    () => (inProgress.data ?? []).filter((t) => t.status === 'en_attente' && t.to_facility_id === facility?.id),
    [inProgress.data, facility],
  )
  const mine = useMemo(
    () => (inProgress.data ?? []).filter((t) => t.from_facility_id === facility?.id),
    [inProgress.data, facility],
  )
  const recentNotifs = (notifications.data ?? []).slice(0, 5)

  return (
    <div>
      <PageHeader
        title={`Bonjour, ${profile?.first_name} 👋`}
        subtitle={facility ? facility.name : 'Espace médecin'}
      />

      {/* Indicateurs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {regionAvailability.isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Lits libres dans ma région" value={regionFreeBeds} icon={BedDouble} tone="success" />
            <StatCard label="Demandes entrantes" value={incoming.length} icon={Inbox} tone={incoming.length ? 'warning' : 'neutral'} hint="En attente de réponse" />
            <StatCard label="Mes transferts en cours" value={mine.length} icon={ArrowRightLeft} tone="bloc" />
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Disponibilités de mon établissement */}
        <Card>
          <CardHeader title="Disponibilités de mon service" subtitle="Lits libres par spécialité" />
          <CardBody className="pt-2">
            {services.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-xl" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </div>
            ) : services.isError ? (
              <ErrorState onRetry={() => services.refetch()} />
            ) : (services.data ?? []).length === 0 ? (
              <EmptyState title="Aucun service configuré" description="Votre établissement n'a pas encore de service ouvert." />
            ) : (
              <ServiceAvailabilityList services={services.data ?? []} />
            )}
          </CardBody>
        </Card>

        {/* Transferts entrants */}
        <Card>
          <CardHeader title="Transferts entrants" subtitle="Demandes adressées à votre établissement" />
          <CardBody className="pt-2">
            {inProgress.isLoading ? (
              <ListSkeleton />
            ) : inProgress.isError ? (
              <ErrorState onRetry={() => inProgress.refetch()} />
            ) : incoming.length === 0 ? (
              <EmptyState title="Aucune demande en attente" description="Les nouvelles demandes apparaîtront ici en temps réel." />
            ) : (
              <div className="-mx-2">
                {incoming.map((t) => (
                  <TransferListItem key={t.id} transfer={t} to={`/app/transferts/${t.id}`} />
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Mes transferts en cours */}
        <Card>
          <CardHeader title="Mes transferts en cours" subtitle="Demandes émises par votre établissement" />
          <CardBody className="pt-2">
            {inProgress.isLoading ? (
              <ListSkeleton />
            ) : inProgress.isError ? (
              <ErrorState onRetry={() => inProgress.refetch()} />
            ) : mine.length === 0 ? (
              <EmptyState title="Aucun transfert en cours" description="Vos demandes de transfert apparaîtront ici." />
            ) : (
              <div className="-mx-2">
                {mine.map((t) => (
                  <TransferListItem key={t.id} transfer={t} to={`/app/transferts/${t.id}`} />
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Notifications récentes */}
        <Card>
          <CardHeader title="Dernières notifications" />
          <CardBody className="pt-2">
            {notifications.isLoading ? (
              <ListSkeleton />
            ) : recentNotifs.length === 0 ? (
              <EmptyState title="Aucune notification" description="Vous serez alerté ici des nouveaux transferts." icon={<Bell className="h-7 w-7 text-bloc-clair/60" />} />
            ) : (
              <ul className="space-y-1">
                {recentNotifs.map((n) => (
                  <li key={n.id} className="flex items-start gap-3 rounded-lg px-2 py-2">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.is_read ? 'bg-slate-300' : 'bg-bloc-clair'}`} aria-hidden />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{n.title}</p>
                      <p className="truncate text-[12px] text-slate-400">{n.body}</p>
                      <p className="text-[11px] text-slate-400">{timeAgo(n.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  )
}
