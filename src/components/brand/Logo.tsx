import { cn } from '@/lib/cn'

/**
 * Logo Jokko Santé. La signature visuelle : le « J » se prolonge en tracé ECG.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Jokko Santé">
      <rect width="48" height="48" rx="12" className="fill-bloc" />
      {/* Hampe du J */}
      <path
        d="M30 11v15.5c0 4.6-3.1 7.2-7.2 7.2-3 0-5.4-1.3-6.6-3.9"
        fill="none"
        stroke="white"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      {/* Prolongement ECG */}
      <path
        d="M7 35h6l2.2-5 3.4 9 2.6-6.4 1.6 3.4H41"
        fill="none"
        stroke="#14B8A6"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Logo({
  className,
  textClassName,
  showText = true,
}: {
  className?: string
  textClassName?: string
  showText?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className="h-9 w-9 shrink-0" />
      {showText && (
        <span className={cn('font-display text-lg leading-none font-semibold tracking-tight', textClassName)}>
          Jokko<span className="text-bloc-clair"> Santé</span>
        </span>
      )}
    </span>
  )
}
