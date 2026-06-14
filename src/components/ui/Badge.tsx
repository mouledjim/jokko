import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { TransferSeverity, TransferStatus, BedStatus, EquipmentStatus } from '@/types/db'
import { SEVERITY_LABEL, STATUS_LABEL, BED_STATUS_LABEL, EQUIPMENT_STATUS_LABEL } from '@/lib/roles'

type Tone = 'neutral' | 'bloc' | 'success' | 'warning' | 'danger' | 'info'

const TONES: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300',
  bloc: 'bg-bloc/10 text-bloc dark:bg-bloc-clair/15 dark:text-bloc-clair',
  success: 'bg-constante/10 text-constante dark:bg-constante/15',
  warning: 'bg-triage/10 text-triage dark:bg-triage/15',
  danger: 'bg-vital/10 text-vital dark:bg-vital/15',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
}

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

const SEVERITY_TONE: Record<TransferSeverity, Tone> = {
  stable: 'success',
  urgent: 'warning',
  critique: 'danger',
}

/** Badge de gravité — « critique » porte un halo pulsant (rareté = force). */
export function SeverityBadge({ severity, className }: { severity: TransferSeverity; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        TONES[SEVERITY_TONE[severity]],
        severity === 'critique' && 'animate-pulse-vital',
        className,
      )}
    >
      {severity === 'critique' && <span className="h-1.5 w-1.5 rounded-full bg-vital" aria-hidden />}
      {SEVERITY_LABEL[severity]}
    </span>
  )
}

const STATUS_TONE: Record<TransferStatus, Tone> = {
  en_attente: 'warning',
  accepte: 'success',
  refuse: 'danger',
  en_route: 'info',
  arrive: 'bloc',
  annule: 'neutral',
}

export function StatusBadge({ status, className }: { status: TransferStatus; className?: string }) {
  return (
    <Badge tone={STATUS_TONE[status]} className={className}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}

const BED_TONE: Record<BedStatus, Tone> = {
  libre: 'success',
  occupe: 'danger',
  nettoyage: 'warning',
  hors_service: 'neutral',
}

export function BedStatusBadge({ status, className }: { status: BedStatus; className?: string }) {
  return (
    <Badge tone={BED_TONE[status]} className={className}>
      {BED_STATUS_LABEL[status]}
    </Badge>
  )
}

const EQUIPMENT_TONE: Record<EquipmentStatus, Tone> = {
  fonctionnel: 'success',
  en_panne: 'danger',
  maintenance: 'warning',
}

export function EquipmentStatusBadge({ status, className }: { status: EquipmentStatus; className?: string }) {
  return (
    <Badge tone={EQUIPMENT_TONE[status]} className={className}>
      {EQUIPMENT_STATUS_LABEL[status]}
    </Badge>
  )
}
