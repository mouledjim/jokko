import { cn } from '@/lib/cn'
import { BED_STATUS_LABEL } from '@/lib/roles'
import type { BedStatus } from '@/types/db'

const DOTS: Record<BedStatus, string> = {
  libre: 'bg-constante',
  occupe: 'bg-slate-400',
  nettoyage: 'bg-triage',
  hors_service: 'bg-slate-300 dark:bg-slate-600',
}

export function BedLegend({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1.5', className)}>
      {(Object.keys(DOTS) as BedStatus[]).map((s) => (
        <span key={s} className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
          <span className={cn('h-2.5 w-2.5 rounded-full', DOTS[s])} aria-hidden />
          {BED_STATUS_LABEL[s]}
        </span>
      ))}
    </div>
  )
}
