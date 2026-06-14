import { AlertTriangle, RotateCw, WifiOff } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'

/** État d'erreur d'une vue de données : message précis + bouton réessayer. */
export function ErrorState({
  title = 'Chargement impossible',
  description = 'Les données n\'ont pas pu être récupérées.',
  onRetry,
  offline = false,
  className,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  offline?: boolean
  className?: string
}) {
  const Icon = offline ? WifiOff : AlertTriangle
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-2xl',
          offline ? 'bg-triage/10 text-triage' : 'bg-vital/10 text-vital',
        )}
      >
        <Icon className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="mt-4 font-display text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          <RotateCw className="h-4 w-4" aria-hidden />
          Réessayer
        </Button>
      )}
    </div>
  )
}
