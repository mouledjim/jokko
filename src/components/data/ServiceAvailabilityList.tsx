import { cn } from '@/lib/cn'
import { specialtyIcon, specialtyColors } from '@/lib/specialties'
import { timeAgo, isStale } from '@/lib/format'
import type { ServiceAvailability } from '@/types/db'

/** Pastille de disponibilité colorée selon les lits libres / fraîcheur. */
function availabilityTone(free: number, stale: boolean) {
  if (stale) return 'text-slate-400'
  if (free === 0) return 'text-vital'
  if (free <= 2) return 'text-triage'
  return 'text-constante'
}

export function ServiceAvailabilityList({ services }: { services: ServiceAvailability[] }) {
  return (
    <ul className="divide-y divide-slate-100 dark:divide-garde-bord">
      {services.map((s) => {
        const Icon = specialtyIcon(s.icon_key)
        const colors = specialtyColors(s.color_key)
        const stale = isStale(s.last_bed_update)
        const tone = availabilityTone(s.beds_free, stale)
        return (
          <li key={s.facility_service_id} className="flex items-center gap-3 py-2.5">
            <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', colors.chip)}>
              <Icon className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                {s.specialty_name}
              </p>
              <p className="text-[12px] text-slate-400">
                {stale ? 'Données à actualiser' : s.last_bed_update ? `Maj ${timeAgo(s.last_bed_update)}` : 'Aucune donnée'}
              </p>
            </div>
            <div className="text-right">
              <p className={cn('font-display text-lg font-semibold tabular-nums', tone)}>
                {s.beds_free}
                <span className="text-sm font-normal text-slate-400">/{s.beds_total}</span>
              </p>
              <p className="text-[11px] text-slate-400">lits libres</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
