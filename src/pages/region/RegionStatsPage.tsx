import { useMemo } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useFacilityAvailability } from '@/features/availability/api'
import { StatsView } from '@/components/stats/StatsView'

export default function RegionStatsPage() {
  const { profile } = useAuth()
  const availability = useFacilityAvailability()
  const ids = useMemo(
    () => (availability.data ?? []).filter((f) => f.region_id === profile?.region_id).map((f) => f.facility_id),
    [availability.data, profile?.region_id],
  )
  return (
    <StatsView
      title="Statistiques régionales"
      subtitle="Activité de transfert de votre région"
      occupancyFacilityIds={ids}
    />
  )
}
