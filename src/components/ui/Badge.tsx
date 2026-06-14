import type { ReactNode } from 'react'
import { Badge as ShadcnBadge } from '@/components/shadcn/badge'
import { cn } from '@/lib/utils'
import type { TransferSeverity, TransferStatus, BedStatus, EquipmentStatus } from '@/types/db'
import { SEVERITY_LABEL, STATUS_LABEL, BED_STATUS_LABEL, EQUIPMENT_STATUS_LABEL } from '@/lib/roles'

type Tone = 'neutral' | 'bloc' | 'success' | 'warning' | 'danger' | 'info'

const TONES: Record<Tone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  bloc: 'bg-primary/10 text-primary',
  success: 'bg-constante/10 text-constante',
  warning: 'bg-triage/10 text-triage',
  danger: 'bg-destructive/10 text-destructive',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
}

const PILL = 'rounded-full border-transparent px-2.5 py-0.5 text-xs font-semibold'

/** Adaptateur : Badge shadcn + teintes médicales. */
export function Badge({ tone = 'neutral', className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <ShadcnBadge variant="secondary" className={cn(PILL, TONES[tone], className)}>
      {children}
    </ShadcnBadge>
  )
}

const SEVERITY_TONE: Record<TransferSeverity, Tone> = { stable: 'success', urgent: 'warning', critique: 'danger' }

/** Gravité — « critique » avec halo pulsant. */
export function SeverityBadge({ severity, className }: { severity: TransferSeverity; className?: string }) {
  return (
    <ShadcnBadge
      variant="secondary"
      className={cn(PILL, 'gap-1.5', TONES[SEVERITY_TONE[severity]], severity === 'critique' && 'animate-pulse-vital', className)}
    >
      {severity === 'critique' && <span className="h-1.5 w-1.5 rounded-full bg-destructive" aria-hidden />}
      {SEVERITY_LABEL[severity]}
    </ShadcnBadge>
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
  return <Badge tone={STATUS_TONE[status]} className={className}>{STATUS_LABEL[status]}</Badge>
}

const BED_TONE: Record<BedStatus, Tone> = { libre: 'success', occupe: 'danger', nettoyage: 'warning', hors_service: 'neutral' }
export function BedStatusBadge({ status, className }: { status: BedStatus; className?: string }) {
  return <Badge tone={BED_TONE[status]} className={className}>{BED_STATUS_LABEL[status]}</Badge>
}

const EQUIPMENT_TONE: Record<EquipmentStatus, Tone> = { fonctionnel: 'success', en_panne: 'danger', maintenance: 'warning' }
export function EquipmentStatusBadge({ status, className }: { status: EquipmentStatus; className?: string }) {
  return <Badge tone={EQUIPMENT_TONE[status]} className={className}>{EQUIPMENT_STATUS_LABEL[status]}</Badge>
}
