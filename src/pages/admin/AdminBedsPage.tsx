import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/providers/AuthProvider'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { CardGridSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { BedServiceSection } from '@/components/beds/BedServiceSection'
import { BedLegend } from '@/components/beds/BedLegend'
import {
  useFacilityBeds,
  useUpdateBedStatus,
  useAddBed,
  useRenameBed,
  useDeleteBed,
  nextBedStatus,
  type BedWithService,
} from '@/features/beds/api'
import { usePendingBedIds } from '@/features/beds/usePendingBeds'
import type { BedStatus } from '@/types/db'

interface ServiceGroup {
  serviceId: string
  name: string
  iconKey: string
  colorKey: string
  beds: BedWithService[]
}

/** Suggère le prochain libellé de lit (préfixe + numéro incrémenté). */
function suggestLabel(beds: BedWithService[]): string {
  const prefixes = beds.map((b) => b.label.split('-')[0]).filter(Boolean)
  const prefix = prefixes[0] ?? 'LIT'
  const nums = beds
    .map((b) => parseInt(b.label.split('-')[1] ?? '', 10))
    .filter((n) => !Number.isNaN(n))
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `${prefix}-${String(next).padStart(2, '0')}`
}

export default function AdminBedsPage() {
  const { facility } = useAuth()
  const facilityId = facility?.id ?? ''
  const beds = useFacilityBeds(facilityId)
  const update = useUpdateBedStatus(facilityId)
  const addBed = useAddBed(facilityId)
  const renameBed = useRenameBed(facilityId)
  const deleteBed = useDeleteBed(facilityId)
  const pendingIds = usePendingBedIds()

  const [addCtx, setAddCtx] = useState<{ serviceId: string; name: string; suggested: string } | null>(null)
  const [renameCtx, setRenameCtx] = useState<BedWithService | null>(null)
  const [deleteCtx, setDeleteCtx] = useState<BedWithService | null>(null)
  const addForm = useForm<{ label: string }>()
  const renameForm = useForm<{ label: string }>()

  const groups = useMemo<ServiceGroup[]>(() => {
    const map = new Map<string, ServiceGroup>()
    for (const bed of beds.data ?? []) {
      if (!bed.service) continue
      const g = map.get(bed.facility_service_id) ?? {
        serviceId: bed.service.id,
        name: bed.service.name,
        iconKey: bed.service.icon_key,
        colorKey: bed.service.color_key,
        beds: [],
      }
      g.beds.push(bed)
      map.set(bed.facility_service_id, g)
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [beds.data])

  const openAdd = (g: ServiceGroup) => {
    const suggested = suggestLabel(g.beds)
    setAddCtx({ serviceId: g.serviceId, name: g.name, suggested })
    addForm.reset({ label: suggested })
  }

  const submitAdd = addForm.handleSubmit(async ({ label }) => {
    if (!addCtx) return
    await addBed.mutateAsync({ facilityServiceId: addCtx.serviceId, label: label.trim() })
    setAddCtx(null)
  })

  const submitRename = renameForm.handleSubmit(async ({ label }) => {
    if (!renameCtx) return
    await renameBed.mutateAsync({ bedId: renameCtx.id, label: label.trim() })
    setRenameCtx(null)
  })

  return (
    <div>
      <PageHeader
        title="Gestion des lits"
        subtitle="Ajoutez, renommez ou retirez des lits, et mettez à jour leur statut."
      />

      {beds.isLoading ? (
        <CardGridSkeleton count={3} />
      ) : beds.isError ? (
        <Card className="p-2">
          <ErrorState onRetry={() => beds.refetch()} />
        </Card>
      ) : groups.length === 0 ? (
        <Card className="p-2">
          <EmptyState title="Aucun lit" description="Aucun service n'a encore de lit. Ouvrez un service pour commencer." />
        </Card>
      ) : (
        <>
          <BedLegend className="mb-4" />
          <div className="space-y-5">
            {groups.map((g) => (
              <BedServiceSection
                key={g.serviceId}
                serviceName={g.name}
                iconKey={g.iconKey}
                colorKey={g.colorKey}
                beds={g.beds}
                pendingIds={pendingIds}
                onCycle={(bed) => update.mutate({ bed, status: nextBedStatus(bed.status) })}
                onSetStatus={(bed, status: BedStatus) => update.mutate({ bed, status })}
                onAddBed={() => openAdd(g)}
                onRenameBed={(bed) => {
                  setRenameCtx(bed)
                  renameForm.reset({ label: bed.label })
                }}
                onDeleteBed={(bed) => setDeleteCtx(bed)}
              />
            ))}
          </div>
        </>
      )}

      {/* Ajout */}
      <Modal
        open={!!addCtx}
        onClose={() => setAddCtx(null)}
        title="Ajouter un lit"
        description={addCtx ? `Service : ${addCtx.name}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddCtx(null)}>Annuler</Button>
            <Button onClick={submitAdd} loading={addBed.isPending}>Ajouter</Button>
          </>
        }
      >
        <form onSubmit={submitAdd}>
          <Input
            label="Libellé du lit"
            hint="Exemple : REA-05"
            {...addForm.register('label', { required: true })}
            autoFocus
          />
        </form>
      </Modal>

      {/* Renommage */}
      <Modal
        open={!!renameCtx}
        onClose={() => setRenameCtx(null)}
        title="Renommer le lit"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRenameCtx(null)}>Annuler</Button>
            <Button onClick={submitRename} loading={renameBed.isPending}>Enregistrer</Button>
          </>
        }
      >
        <form onSubmit={submitRename}>
          <Input label="Nouveau libellé" {...renameForm.register('label', { required: true })} autoFocus />
        </form>
      </Modal>

      {/* Suppression */}
      <Modal
        open={!!deleteCtx}
        onClose={() => setDeleteCtx(null)}
        title="Retirer ce lit ?"
        description={deleteCtx ? `Le lit ${deleteCtx.label} sera définitivement retiré du service.` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteCtx(null)}>Annuler</Button>
            <Button
              variant="danger"
              loading={deleteBed.isPending}
              onClick={async () => {
                if (deleteCtx) await deleteBed.mutateAsync(deleteCtx.id)
                setDeleteCtx(null)
              }}
            >
              Retirer le lit
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Cette action est irréversible. Les compteurs de disponibilité seront recalculés
          automatiquement.
        </p>
      </Modal>
    </div>
  )
}
