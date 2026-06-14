import { Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { specialtyIcon, specialtyColors } from '@/lib/specialties'
import type { BedStatus } from '@/types/db'
import type { BedWithService } from '@/features/beds/api'
import { BedTile } from './BedTile'

interface Props {
  serviceName: string
  iconKey: string
  colorKey: string
  beds: BedWithService[]
  pendingIds: Set<string>
  onCycle: (bed: BedWithService) => void
  onSetStatus: (bed: BedWithService, status: BedStatus) => void
  onAddBed?: () => void
  onRenameBed?: (bed: BedWithService) => void
  onDeleteBed?: (bed: BedWithService) => void
}

export function BedServiceSection({
  serviceName,
  iconKey,
  colorKey,
  beds,
  pendingIds,
  onCycle,
  onSetStatus,
  onAddBed,
  onRenameBed,
  onDeleteBed,
}: Props) {
  const Icon = specialtyIcon(iconKey)
  const colors = specialtyColors(colorKey)
  const free = beds.filter((b) => b.status === 'libre').length

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', colors.chip)}>
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h3 className="font-display text-[15px] font-semibold text-slate-900 dark:text-slate-100">
              {serviceName}
            </h3>
            <p className="text-[12px] text-slate-400">
              <span className={free > 0 ? 'font-semibold text-constante' : 'font-semibold text-vital'}>
                {free} libre{free > 1 ? 's' : ''}
              </span>{' '}
              · {beds.length} lit{beds.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {onAddBed && (
          <Button variant="secondary" size="sm" onClick={onAddBed}>
            <Plus className="h-4 w-4" aria-hidden />
            Ajouter
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {beds.map((bed) => (
          <BedTile
            key={bed.id}
            bed={bed}
            pending={pendingIds.has(bed.id)}
            onCycle={() => onCycle(bed)}
            onSetStatus={(s) => onSetStatus(bed, s)}
            onRename={onRenameBed ? () => onRenameBed(bed) : undefined}
            onDelete={onDeleteBed ? () => onDeleteBed(bed) : undefined}
          />
        ))}
      </div>
    </Card>
  )
}
