import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { EquipmentStatusBadge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { specialtyIcon, specialtyColors, equipmentIcon } from '@/lib/specialties'
import { EQUIPMENT_LABEL, EQUIPMENT_STATUS_LABEL } from '@/lib/roles'
import { useServiceAvailability } from '@/features/availability/api'
import { useEquipment, useUpdateEquipment } from '@/features/equipment/api'
import { useToggleService } from '@/features/services/api'
import type { EquipmentStatus, EquipmentType } from '@/types/db'

const STATUSES: EquipmentStatus[] = ['fonctionnel', 'en_panne', 'maintenance']

export default function AdminServicesPage() {
  const { facility } = useAuth()
  const facilityId = facility?.id ?? ''
  const services = useServiceAvailability(facilityId)
  const equipment = useEquipment(facilityId)
  const toggle = useToggleService(facilityId)
  const updateEquip = useUpdateEquipment(facilityId)
  const [confirm, setConfirm] = useState<{ id: string; type: EquipmentType; status: EquipmentStatus } | null>(null)

  const requestStatus = (id: string, type: EquipmentType, status: EquipmentStatus) => {
    if (status === 'en_panne') setConfirm({ id, type, status })
    else updateEquip.mutate({ id, status })
  }

  return (
    <div>
      <PageHeader title="Services et équipements" subtitle="Activez les services et déclarez l'état des équipements" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Services */}
        <Card>
          <CardHeader title="Services" subtitle="Un service désactivé n'apparaît plus dans les recherches" />
          <CardBody className="pt-2">
            {services.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : services.isError ? (
              <ErrorState onRetry={() => services.refetch()} />
            ) : (services.data ?? []).length === 0 ? (
              <EmptyState title="Aucun service" description="Aucun service ouvert dans cet établissement." />
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-garde-bord">
                {(services.data ?? []).map((s) => {
                  const Icon = specialtyIcon(s.icon_key)
                  const colors = specialtyColors(s.color_key)
                  return (
                    <li key={s.facility_service_id} className="flex items-center gap-3 py-3">
                      <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', colors.chip)}>
                        <Icon className="h-[18px] w-[18px]" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{s.specialty_name}</p>
                        <p className="text-[12px] text-slate-400">{s.beds_total} lits · {s.beds_free} libres</p>
                      </div>
                      <Toggle
                        checked={s.is_active}
                        onChange={(v) => toggle.mutate({ id: s.facility_service_id, is_active: v })}
                        label={`Activer ${s.specialty_name}`}
                      />
                    </li>
                  )
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Équipements */}
        <Card>
          <CardHeader title="Équipements" subtitle="Déclarez les pannes pour exclure l'établissement des recherches concernées" />
          <CardBody className="pt-2">
            {equipment.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : equipment.isError ? (
              <ErrorState onRetry={() => equipment.refetch()} />
            ) : (equipment.data ?? []).length === 0 ? (
              <EmptyState title="Aucun équipement" description="Aucun équipement enregistré." />
            ) : (
              <ul className="space-y-3">
                {(equipment.data ?? []).map((e) => {
                  const Icon = equipmentIcon(e.type)
                  return (
                    <li key={e.id} className="rounded-xl border border-slate-100 p-3 dark:border-garde-bord">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-slate-400" aria-hidden />
                        <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">{EQUIPMENT_LABEL[e.type]}</span>
                        <EquipmentStatusBadge status={e.status} />
                      </div>
                      <div className="mt-2.5 flex gap-1.5">
                        {STATUSES.map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => requestStatus(e.id, e.type, st)}
                            className={cn(
                              'flex-1 rounded-lg border px-2 py-1.5 text-[12px] font-medium transition',
                              e.status === st
                                ? 'border-bloc bg-bloc/10 text-bloc'
                                : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-garde-bord dark:text-slate-400',
                            )}
                          >
                            {EQUIPMENT_STATUS_LABEL[st]}
                          </button>
                        ))}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Déclarer une panne ?"
        description={confirm ? `${EQUIPMENT_LABEL[confirm.type]} sera marqué en panne.` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>Annuler</Button>
            <Button
              variant="danger"
              loading={updateEquip.isPending}
              onClick={async () => {
                if (confirm) await updateEquip.mutateAsync({ id: confirm.id, status: 'en_panne' })
                setConfirm(null)
              }}
            >
              Déclarer en panne
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Cet établissement n'apparaîtra plus dans les recherches de transfert nécessitant cet
          équipement, jusqu'à sa remise en service.
        </p>
      </Modal>
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn('relative h-6 w-11 shrink-0 rounded-full transition', checked ? 'bg-bloc' : 'bg-slate-300 dark:bg-white/15')}
    >
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
    </button>
  )
}
