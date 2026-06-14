import { Skeleton as ShadcnSkeleton } from '@/components/shadcn/skeleton'
import { cn } from '@/lib/utils'
import { Card } from './Card'

/** Adaptateur : Skeleton shadcn. */
export function Skeleton({ className }: { className?: string }) {
  return <ShadcnSkeleton className={className} />
}

export function StatCardSkeleton() {
  return (
    <Card className="p-5">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="mt-3 h-8 w-20" />
      <Skeleton className="mt-3 h-3 w-32" />
    </Card>
  )
}

export function TableSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn('h-10 flex-1', c === 0 && 'max-w-[36%]')} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="mt-4 h-9 w-full" />
        </Card>
      ))}
    </div>
  )
}
