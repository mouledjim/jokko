import { cn } from '@/lib/cn'

/**
 * Tracé ECG animé — utilisé comme séparateur de section et comme loader.
 * Le tracé se dessine en boucle (animation CSS ecg-draw).
 */
export function EcgLine({
  className,
  animated = true,
  strokeClassName = 'text-bloc-clair',
}: {
  className?: string
  animated?: boolean
  strokeClassName?: string
}) {
  return (
    <svg viewBox="0 0 240 40" preserveAspectRatio="none" className={cn('w-full', className)} aria-hidden>
      <path
        d="M0 20h60l6-12 8 24 7-18 5 10 4-4h145"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={240}
        strokeDasharray={240}
        className={cn(strokeClassName, animated && 'animate-ecg-draw')}
      />
    </svg>
  )
}

/** Loader pleine zone : tracé ECG qui se dessine. Pas de spinner plein écran. */
export function EcgLoader({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16" role="status" aria-live="polite">
      <EcgLine className="h-10 w-40 text-bloc-clair" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}
