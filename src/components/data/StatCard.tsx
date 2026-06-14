import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui/Card'
import { NumberTicker } from '@/components/shadcn/number-ticker'

type Tone = 'bloc' | 'success' | 'warning' | 'danger' | 'neutral'

const TONES: Record<Tone, string> = {
  bloc: 'bg-bloc/10 text-bloc dark:bg-bloc-clair/15 dark:text-bloc-clair',
  success: 'bg-constante/10 text-constante',
  warning: 'bg-triage/10 text-triage',
  danger: 'bg-vital/10 text-vital',
  neutral: 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300',
}

export function StatCard({
  label,
  value,
  suffix,
  hint,
  icon: Icon,
  tone = 'bloc',
  animate = true,
}: {
  label: string
  value: number | string
  suffix?: string
  hint?: string
  icon?: LucideIcon
  tone?: Tone
  animate?: boolean
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
        {Icon && (
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', TONES[tone])}>
            <Icon className="h-[18px] w-[18px]" aria-hidden />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-[28px] leading-none font-semibold tracking-tight text-slate-900 tabular-nums dark:text-white">
        {typeof value === 'number' && animate ? <NumberTicker value={value} className="text-inherit" /> : value}
        {suffix && <span className="ml-1 text-lg text-slate-400">{suffix}</span>}
      </p>
      {hint && <p className="mt-2 text-[12px] text-slate-400">{hint}</p>}
    </Card>
  )
}
