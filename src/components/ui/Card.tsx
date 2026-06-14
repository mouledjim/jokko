import type { HTMLAttributes, ReactNode } from 'react'
import { Card as ShadcnCard } from '@/components/shadcn/card'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

/** Adaptateur : conteneur = Card shadcn (tokens), espacement géré par CardHeader/CardBody. */
export function Card({ className, hoverable, ...props }: CardProps) {
  return (
    <ShadcnCard
      className={cn(
        'gap-0 rounded-[var(--radius-card)] py-0 shadow-[var(--shadow-card)]',
        hoverable && 'transition-shadow hover:shadow-[var(--shadow-card-hover)]',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3 px-5 pt-5', className)}>
      <div className="min-w-0">
        <h3 className="font-display text-[15px] font-semibold text-card-foreground">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[13px] text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />
}
