import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useNotifications, useMarkAllRead, useMarkRead } from '@/features/notifications/api'
import { timeAgo } from '@/lib/format'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useNotifications()
  const markAll = useMarkAllRead()
  const markOne = useMarkRead()
  const unread = (data ?? []).filter((n) => !n.is_read).length

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} non lue${unread > 1 ? 's' : ''}` : 'Tout est à jour'}
        actions={
          unread > 0 ? (
            <Button variant="secondary" size="sm" loading={markAll.isPending} onClick={() => markAll.mutate()}>
              <CheckCheck className="h-4 w-4" aria-hidden />
              Tout marquer comme lu
            </Button>
          ) : undefined
        }
      />

      <Card>
        {isLoading ? (
          <div className="space-y-4 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-2 w-2 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (data ?? []).length === 0 ? (
          <EmptyState
            title="Aucune notification"
            description="Vous serez alerté ici des transferts entrants, acceptations et arrivées."
            icon={<Bell className="h-7 w-7 text-bloc-clair/60" />}
          />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-garde-bord">
            {(data ?? []).map((n) => {
              const content = (
                <>
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.is_read ? 'bg-slate-300 dark:bg-slate-600' : 'bg-bloc-clair')} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm', n.is_read ? 'font-medium text-slate-600 dark:text-slate-300' : 'font-semibold text-slate-900 dark:text-white')}>
                      {n.title}
                    </p>
                    {n.body && <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">{n.body}</p>}
                    <p className="mt-1 text-[11px] text-slate-400">{timeAgo(n.created_at)}</p>
                  </div>
                </>
              )
              const cls = 'flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-white/[0.03]'
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    className={cls}
                    onClick={() => {
                      if (!n.is_read) markOne.mutate(n.id)
                      if (n.link_path) navigate(n.link_path)
                    }}
                    aria-label={n.is_read ? n.title : `${n.title} — marquer comme lu`}
                  >
                    {content}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
