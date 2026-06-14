import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge'
import { elapsed, timeAgo, formatDelay } from '@/lib/format'
import type { TransferWithRefs } from '@/features/transfers/api'

/**
 * Ligne de transfert compacte pour les listes de tableau de bord.
 * Cliquable si `to` est fourni (la page de détail existe), sinon informative.
 */
export function TransferListItem({ transfer, to }: { transfer: TransferWithRefs; to?: string }) {
  const t = transfer
  const waiting = t.status === 'en_attente'

  const content = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] font-semibold text-slate-400">{t.reference}</span>
          <SeverityBadge severity={t.severity} />
        </div>
        <p className="mt-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100">{t.motif}</p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-slate-400">
          {t.from_facility?.name}
          <ArrowRight className="h-3 w-3 shrink-0" aria-hidden />
          {t.to_facility?.name}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <StatusBadge status={t.status} />
        <p className="mt-1.5 flex items-center justify-end gap-1 text-[11px] text-slate-400 tabular-nums">
          <Clock className="h-3 w-3" aria-hidden />
          {waiting
            ? elapsed(t.requested_at)
            : t.response_delay_seconds != null
              ? formatDelay(t.response_delay_seconds)
              : timeAgo(t.requested_at)}
        </p>
      </div>
    </>
  )

  if (to) {
    return (
      <Link to={to} className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50 dark:hover:bg-white/[0.03]">
        {content}
      </Link>
    )
  }
  return <div className="flex items-center gap-3 rounded-xl px-3 py-3">{content}</div>
}
