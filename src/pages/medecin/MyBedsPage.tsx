import { useMemo, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { CardGridSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { BedServiceSection } from '@/components/beds/BedServiceSection'
import { BedLegend } from '@/components/beds/BedLegend'
import { cn } from '@/lib/cn'
import { useFacilityBeds, useUpdateBedStatus, nextBedStatus, type BedWithService } from '@/features/beds/api'
import { usePendingBedIds } from '@/features/beds/usePendingBeds'
import type { BedStatus } from '@/types/db'

interface ServiceGroup {
  serviceId: string
  name: string
  iconKey: string
  colorKey: string
  beds: BedWithService[]
}

export default function MyBedsPage() {
  const { profile, facility } = useAuth()
  const beds = useFacilityBeds(facility?.id)
  const update = useUpdateBedStatus(facility?.id ?? '')
  const pendingIds = usePendingBedIds()
  const [activeSpecialty, setActiveSpecialty] = useState<string | null>(profile?.specialty_id ?? null)

  const groups = useMemo<ServiceGroup[]>(() => {
    const map = new Map<string, ServiceGroup>()
    for (const bed of beds.data ?? []) {
      if (!bed.service) continue
      const key = bed.facility_service_id
      const g = map.get(key) ?? {
        serviceId: bed.service.id,
        name: bed.service.name,
        iconKey: bed.service.icon_key,
        colorKey: bed.service.color_key,
        beds: [],
      }
      g.beds.push(bed)
      map.set(key, g)
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [beds.data])

  // Filtre par défaut sur la spécialité du médecin (si elle existe parmi les services).
  const hasActive = groups.some((g) => g.serviceId === activeSpecialty)
  const visibleGroups = hasActive ? groups.filter((g) => g.serviceId === activeSpecialty) : groups

  const cycle = (bed: BedWithService) => update.mutate({ bed, status: nextBedStatus(bed.status) })
  const setStatus = (bed: BedWithService, status: BedStatus) => update.mutate({ bed, status })

  return (
    <div>
      <PageHeader
        title="Lits de mon service"
        subtitle="Cliquez sur un lit pour faire évoluer son statut. Mise à jour instantanée."
      />

      {beds.isLoading ? (
        <CardGridSkeleton count={2} />
      ) : beds.isError ? (
        <Card className="p-2">
          <ErrorState onRetry={() => beds.refetch()} />
        </Card>
      ) : groups.length === 0 ? (
        <Card className="p-2">
          <EmptyState
            title="Aucun lit configuré"
            description="Votre établissement n'a pas encore de lit enregistré. Contactez votre administrateur."
          />
        </Card>
      ) : (
        <>
          {/* Filtres par spécialité */}
          <div className="mb-4 flex flex-wrap gap-2">
            <FilterChip active={!hasActive} onClick={() => setActiveSpecialty(null)}>
              Tous les services
            </FilterChip>
            {groups.map((g) => (
              <FilterChip
                key={g.serviceId}
                active={hasActive && activeSpecialty === g.serviceId}
                onClick={() => setActiveSpecialty(g.serviceId)}
              >
                {g.name}
              </FilterChip>
            ))}
          </div>

          <BedLegend className="mb-4" />

          <div className="space-y-5">
            {visibleGroups.map((g) => (
              <BedServiceSection
                key={g.serviceId}
                serviceName={g.name}
                iconKey={g.iconKey}
                colorKey={g.colorKey}
                beds={g.beds}
                pendingIds={pendingIds}
                onCycle={cycle}
                onSetStatus={setStatus}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition',
        active
          ? 'border-bloc bg-bloc text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-garde-bord dark:bg-garde-surface dark:text-slate-300 dark:hover:bg-white/5',
      )}
    >
      {children}
    </button>
  )
}
