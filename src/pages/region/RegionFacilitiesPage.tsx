import { useMemo } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { FacilityAvailabilityRow } from '@/components/data/FacilityAvailabilityRow'
import { useFacilityAvailability } from '@/features/availability/api'
import { useRegions } from '@/features/reference/api'

export default function RegionFacilitiesPage() {
  const { profile } = useAuth()
  const availability = useFacilityAvailability()
  const regions = useRegions()
  const regionName = regions.data?.find((r) => r.id === profile?.region_id)?.name

  const facilities = useMemo(
    () => (availability.data ?? []).filter((f) => f.region_id === profile?.region_id),
    [availability.data, profile?.region_id],
  )

  return (
    <div>
      <PageHeader title="Établissements de la région" subtitle={regionName ? `Région de ${regionName} — fraîcheur des données` : 'Vue régionale'} />
      <Card>
        <CardBody>
          {availability.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : availability.isError ? (
            <ErrorState onRetry={() => availability.refetch()} />
          ) : facilities.length === 0 ? (
            <EmptyState title="Aucun établissement" description="Aucun établissement actif dans cette région." />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-garde-bord">
              {facilities.map((f) => <FacilityAvailabilityRow key={f.facility_id} facility={f} />)}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
