import { useMemo } from 'react'
import { Activity, BedDouble, Wrench, ArrowRightLeft } from 'lucide-react'
import { isToday } from 'date-fns'
import { useAuth } from '@/providers/AuthProvider'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/data/StatCard'
import { StatCardSkeleton, Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { ServiceAvailabilityList } from '@/components/data/ServiceAvailabilityList'
import { TransferListItem } from '@/components/data/TransferListItem'
import { EquipmentStatusBadge } from '@/components/ui/Badge'
import { useServiceAvailability, useFacilityAvailability } from '@/features/availability/api'
import { useEquipment } from '@/features/equipment/api'
import { useTransfers } from '@/features/transfers/api'
import { equipmentIcon } from '@/lib/specialties'
import { EQUIPMENT_LABEL } from '@/lib/roles'

export default function AdminDashboard() {
  const { facility } = useAuth()
  const services = useServiceAvailability(facility?.id)
  const facilityAvail = useFacilityAvailability()
  const equipment = useEquipment(facility?.id)
  const incoming = useTransfers({ toFacilityId: facility?.id, limit: 50 })

  const myFacility = useMemo(
    () => facilityAvail.data?.find((f) => f.facility_id === facility?.id),
    [facilityAvail.data, facility],
  )
  const brokenEquipment = (equipment.data ?? []).filter((e) => e.status !== 'fonctionnel')
  const transfersToday = (incoming.data ?? []).filter((t) => isToday(new Date(t.requested_at)))
  const pendingIncoming = (incoming.data ?? []).filter((t) => t.status === 'en_attente')

  return (
    <div>
      <PageHeader title="Tableau de bord" subtitle={facility?.name ?? 'Établissement'} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {facilityAvail.isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Taux d'occupation" value={myFacility?.occupancy_rate ?? 0} suffix="%" icon={Activity} tone={(myFacility?.occupancy_rate ?? 0) >= 85 ? 'warning' : 'bloc'} />
            <StatCard label="Lits libres" value={myFacility?.beds_free ?? 0} icon={BedDouble} tone="success" hint={`sur ${myFacility?.beds_total ?? 0} lits`} />
            <StatCard label="Équipements en panne" value={brokenEquipment.length} icon={Wrench} tone={brokenEquipment.length ? 'danger' : 'neutral'} />
            <StatCard label="Transferts du jour" value={transfersToday.length} icon={ArrowRightLeft} tone="bloc" />
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Disponibilités par service" />
          <CardBody className="pt-2">
            {services.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : services.isError ? (
              <ErrorState onRetry={() => services.refetch()} />
            ) : (services.data ?? []).length === 0 ? (
              <EmptyState title="Aucun service" description="Aucun service ouvert dans cet établissement." />
            ) : (
              <ServiceAvailabilityList services={services.data ?? []} />
            )}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Équipements en panne" subtitle="À signaler ou réparer en priorité" />
            <CardBody className="pt-2">
              {equipment.isLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : brokenEquipment.length === 0 ? (
                <EmptyState title="Tous les équipements fonctionnent" description="Aucune panne ni maintenance en cours." />
              ) : (
                <ul className="space-y-2">
                  {brokenEquipment.map((e) => {
                    const Icon = equipmentIcon(e.type)
                    return (
                      <li key={e.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-white/[0.03]">
                        <Icon className="h-5 w-5 text-slate-400" aria-hidden />
                        <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{EQUIPMENT_LABEL[e.type]}</span>
                        <EquipmentStatusBadge status={e.status} />
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Demandes entrantes en attente" />
            <CardBody className="pt-2">
              {incoming.isLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : pendingIncoming.length === 0 ? (
                <EmptyState title="Aucune demande en attente" description="Les nouvelles demandes apparaîtront ici." />
              ) : (
                <div className="-mx-2">
                  {pendingIncoming.slice(0, 5).map((t) => (
                    <TransferListItem key={t.id} transfer={t} to={`/app/transferts/${t.id}`} />
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
