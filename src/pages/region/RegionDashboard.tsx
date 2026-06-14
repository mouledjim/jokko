import { useMemo } from 'react'
import { Building2, BedDouble, Activity } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useRegions } from '@/features/reference/api'
import { useFacilityAvailability } from '@/features/availability/api'
import { useTransfers } from '@/features/transfers/api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/data/StatCard'
import { StatCardSkeleton, Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { FacilityAvailabilityRow } from '@/components/data/FacilityAvailabilityRow'
import { TransferListItem } from '@/components/data/TransferListItem'

export default function RegionDashboard() {
  const { profile } = useAuth()
  const regions = useRegions()
  const availability = useFacilityAvailability()
  const transfers = useTransfers({ limit: 10 })

  const regionName = regions.data?.find((r) => r.id === profile?.region_id)?.name
  const facilities = useMemo(
    () => (availability.data ?? []).filter((f) => f.region_id === profile?.region_id),
    [availability.data, profile],
  )

  const totalFree = facilities.reduce((s, f) => s + f.beds_free, 0)
  const totalBeds = facilities.reduce((s, f) => s + f.beds_total, 0)
  const avgOcc = facilities.length
    ? Math.round(facilities.reduce((s, f) => s + (f.occupancy_rate ?? 0), 0) / facilities.length)
    : 0

  return (
    <div>
      <PageHeader title="Tableau de bord régional" subtitle={regionName ? `Région médicale de ${regionName}` : 'Vue régionale'} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {availability.isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Établissements" value={facilities.length} icon={Building2} tone="bloc" />
            <StatCard label="Lits libres" value={totalFree} icon={BedDouble} tone="success" hint={`sur ${totalBeds} lits`} />
            <StatCard label="Occupation moyenne" value={avgOcc} suffix="%" icon={Activity} tone={avgOcc >= 85 ? 'warning' : 'bloc'} />
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Établissements de la région" subtitle="Occupation et fraîcheur des données" />
          <CardBody className="pt-1">
            {availability.isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : availability.isError ? (
              <ErrorState onRetry={() => availability.refetch()} />
            ) : facilities.length === 0 ? (
              <EmptyState title="Aucun établissement" description="Aucun établissement actif dans cette région." />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-garde-bord">
                {facilities.map((f) => (
                  <FacilityAvailabilityRow key={f.facility_id} facility={f} />
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Transferts récents" subtitle="Intra et inter-région" />
          <CardBody className="pt-2">
            {transfers.isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : transfers.isError ? (
              <ErrorState onRetry={() => transfers.refetch()} />
            ) : (transfers.data ?? []).length === 0 ? (
              <EmptyState title="Aucun transfert" description="Aucun transfert récent dans votre région." />
            ) : (
              <div className="-mx-2">
                {(transfers.data ?? []).slice(0, 6).map((t) => (
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
