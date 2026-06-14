import { cn } from '@/lib/cn'
import { timeAgo, isStale } from '@/lib/format'
import { FACILITY_TYPE_LABEL } from '@/lib/roles'
import type { FacilityAvailability } from '@/types/db'

/** Ligne d'établissement avec barre d'occupation et fraîcheur des données. */
export function FacilityAvailabilityRow({ facility }: { facility: FacilityAvailability }) {
  const f = facility
  const stale = isStale(f.last_bed_update)
  const occ = f.occupancy_rate ?? 0
  const occColor = occ >= 90 ? 'bg-vital' : occ >= 85 ? 'bg-triage' : 'bg-constante'

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{f.name}</p>
        <p className="text-[12px] text-slate-400">
          {FACILITY_TYPE_LABEL[f.type]} ·{' '}
          {stale ? (
            <span className="text-triage">données à actualiser</span>
          ) : f.last_bed_update ? (
            `maj ${timeAgo(f.last_bed_update)}`
          ) : (
            'aucune donnée'
          )}
        </p>
      </div>

      <div className="hidden w-32 sm:block">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
          <div className={cn('h-full rounded-full', occColor)} style={{ width: `${occ}%` }} />
        </div>
        <p className="mt-1 text-right text-[11px] text-slate-400 tabular-nums">{occ}% occupé</p>
      </div>

      <div className="w-16 text-right">
        <p className={cn('font-display text-lg font-semibold tabular-nums', stale ? 'text-slate-400' : f.beds_free === 0 ? 'text-vital' : 'text-constante')}>
          {f.beds_free}
        </p>
        <p className="text-[11px] text-slate-400">/ {f.beds_total} libres</p>
      </div>
    </div>
  )
}
