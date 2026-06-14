import { memo, useEffect, useRef, useState } from 'react'
import { Check, CloudOff, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { BED_STATUS_LABEL } from '@/lib/roles'
import type { BedStatus } from '@/types/db'
import type { BedWithService } from '@/features/beds/api'

const STATUS_STYLE: Record<BedStatus, { tile: string; dot: string }> = {
  // « libre » mis en valeur (vert) ; « occupé » neutre ; le rouge vital reste
  // réservé aux alertes critiques (design system).
  libre: {
    tile: 'border-constante/40 bg-constante/10 text-constante hover:bg-constante/15',
    dot: 'bg-constante',
  },
  occupe: {
    tile: 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-garde-bord dark:bg-white/5 dark:text-slate-400',
    dot: 'bg-slate-400',
  },
  nettoyage: {
    tile: 'border-triage/40 bg-triage/10 text-triage hover:bg-triage/15',
    dot: 'bg-triage',
  },
  hors_service: {
    tile: 'border-slate-300 bg-slate-100 text-slate-400 hover:bg-slate-200 dark:border-garde-bord dark:bg-white/[0.03] dark:text-slate-500',
    dot: 'bg-slate-300 dark:bg-slate-600',
  },
}

const ALL_STATUSES: BedStatus[] = ['libre', 'occupe', 'nettoyage', 'hors_service']

interface BedTileProps {
  bed: BedWithService
  pending?: boolean
  onCycle: () => void
  onSetStatus: (status: BedStatus) => void
  /** Actions d'administration (renommer / retirer). */
  onRename?: () => void
  onDelete?: () => void
}

function BedTileBase({ bed, pending, onCycle, onSetStatus, onRename, onDelete }: BedTileProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const style = STATUS_STYLE[bed.status]

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onCycle}
        data-testid="bed-tile"
        data-status={bed.status}
        data-label={bed.label}
        data-pending={pending ? 'true' : 'false'}
        className={cn(
          'flex h-[68px] w-full flex-col items-start justify-between rounded-xl border p-2.5 text-left transition',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bloc-clair',
          style.tile,
        )}
        title={`${bed.label} — ${BED_STATUS_LABEL[bed.status]} · cliquer pour changer`}
      >
        <span className="flex w-full items-center justify-between">
          <span className="font-mono text-[13px] font-semibold">{bed.label}</span>
          <span className={cn('h-2 w-2 rounded-full', style.dot)} aria-hidden />
        </span>
        <span className="flex w-full items-center gap-1 text-[11px] font-medium">
          {pending ? (
            <>
              <CloudOff className="h-3 w-3" aria-hidden />
              En attente
            </>
          ) : (
            BED_STATUS_LABEL[bed.status]
          )}
        </span>
      </button>

      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className="absolute top-1 right-1 rounded-md p-0.5 opacity-50 transition hover:bg-black/5 hover:opacity-100 focus-visible:opacity-100"
        aria-label={`Changer le statut de ${bed.label}`}
      >
        <MoreVertical className="h-3.5 w-3.5" aria-hidden />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute top-8 right-1 z-20 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-[var(--shadow-card-hover)] dark:border-garde-bord dark:bg-garde-surface"
        >
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              role="menuitemradio"
              aria-checked={s === bed.status}
              onClick={() => {
                onSetStatus(s)
                setMenuOpen(false)
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
            >
              <span className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', STATUS_STYLE[s].dot)} aria-hidden />
                {BED_STATUS_LABEL[s]}
              </span>
              {s === bed.status && <Check className="h-3.5 w-3.5 text-bloc" aria-hidden />}
            </button>
          ))}

          {(onRename || onDelete) && (
            <div className="my-1 border-t border-slate-100 dark:border-garde-bord" />
          )}
          {onRename && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onRename()
                setMenuOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              Renommer
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onDelete()
                setMenuOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-vital transition hover:bg-vital/5"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Retirer
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export const BedTile = memo(BedTileBase)
