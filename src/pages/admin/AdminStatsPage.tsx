import { useAuth } from '@/providers/AuthProvider'
import { StatsView } from '@/components/stats/StatsView'

export default function AdminStatsPage() {
  const { facility } = useAuth()
  return (
    <StatsView
      title="Statistiques"
      subtitle="Activité de transfert de votre établissement"
      occupancyFacilityIds={facility ? [facility.id] : []}
    />
  )
}
