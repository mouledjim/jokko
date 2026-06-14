import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * État vide = invitation, jamais une zone blanche.
 * Illustration ECG légère + message + action optionnelle.
 */
export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      <div className="relative mb-5 flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-bloc/5 dark:bg-bloc-clair/10" />
        {icon ?? (
          <svg viewBox="0 0 120 48" className="relative h-12 w-24" aria-hidden>
            <path
              d="M2 24h28l6-16 10 32 7-22 5 12 6-6h47"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-bloc-clair/70"
            />
          </svg>
        )}
      </div>
      <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
