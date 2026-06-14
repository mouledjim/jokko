import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Building2, Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import { Table, type Column } from '@/components/ui/Table'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LocationPicker } from '@/components/map/LocationPicker'
import { useFacilityAvailability } from '@/features/availability/api'
import { useRegions } from '@/features/reference/api'
import { useCreateFacility, useUpdateFacility } from '@/features/facilities/api'
import { FACILITY_TYPE_LABEL } from '@/lib/roles'
import type { FacilityAvailability, FacilityType, FacilityLevel } from '@/types/db'

interface FormValues {
  name: string
  type: FacilityType
  level: FacilityLevel
  region_id: string
  address: string
  phone: string
}

export default function NationalFacilitiesPage() {
  const availability = useFacilityAvailability()
  const regions = useRegions()
  const createFacility = useCreateFacility()
  const updateFacility = useUpdateFacility()
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [pos, setPos] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 })
  const [search, setSearch] = useState('')
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>()

  const rows = useMemo(() => {
    let list = availability.data ?? []
    if (search.trim()) list = list.filter((f) => f.name.toLowerCase().includes(search.trim().toLowerCase()))
    return list
  }, [availability.data, search])

  const openCreate = () => {
    setEditId(null)
    reset({ name: '', type: 'hopital_regional', level: 'niveau_2', region_id: regions.data?.[0]?.id ?? '', address: '', phone: '' })
    setPos({ lat: 0, lng: 0 })
    setOpen(true)
  }
  const openEdit = (f: FacilityAvailability) => {
    setEditId(f.facility_id)
    reset({ name: f.name, type: f.type, level: f.level, region_id: f.region_id, address: '', phone: f.phone })
    setPos({ lat: f.latitude, lng: f.longitude })
    setOpen(true)
  }

  const submit = handleSubmit(async (v) => {
    const payload = { ...v, latitude: pos.lat, longitude: pos.lng }
    if (editId) await updateFacility.mutateAsync({ id: editId, patch: payload })
    else await createFacility.mutateAsync(payload)
    setOpen(false)
  })

  const columns: Column<FacilityAvailability>[] = [
    { key: 'name', header: 'Établissement', cell: (f) => <span className="text-[13px] font-medium text-slate-800 dark:text-slate-100">{f.name}</span> },
    { key: 'type', header: 'Type', hideOnMobile: true, cell: (f) => <span className="text-[13px] text-slate-500">{FACILITY_TYPE_LABEL[f.type]}</span> },
    { key: 'region', header: 'Région', hideOnMobile: true, cell: (f) => <span className="text-[13px] text-slate-500">{f.region_name}</span> },
    { key: 'beds', header: 'Lits', align: 'right', cell: (f) => <span className="text-[13px] tabular-nums text-slate-600 dark:text-slate-300">{f.beds_free}/{f.beds_total}</span> },
    { key: 'state', header: 'Statut', cell: (f) => <Badge tone={f.is_active ? 'success' : 'neutral'}>{f.is_active ? 'Actif' : 'Inactif'}</Badge> },
    { key: 'actions', header: '', align: 'right', cell: (f) => <Button variant="ghost" size="sm" onClick={() => openEdit(f)}>Modifier</Button> },
  ]

  return (
    <div>
      <PageHeader title="Établissements" subtitle="Création et gestion des structures de santé" actions={<Button onClick={openCreate}><Plus className="h-4 w-4" aria-hidden />Nouvel établissement</Button>} />

      <Card className="mb-4 p-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <Input placeholder="Rechercher un établissement" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </Card>

      <Card className="p-2">
        {availability.isLoading ? (
          <div className="p-3"><TableSkeleton rows={8} cols={5} /></div>
        ) : availability.isError ? (
          <ErrorState onRetry={() => availability.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState title="Aucun établissement" description="Créez le premier établissement." icon={<Building2 className="h-7 w-7 text-bloc-clair/60" />} action={<Button onClick={openCreate}><Plus className="h-4 w-4" aria-hidden />Nouvel établissement</Button>} />
        ) : (
          <Table columns={columns} data={rows} rowKey={(f) => f.facility_id} />
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? 'Modifier l\'établissement' : 'Nouvel établissement'}
        size="lg"
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Annuler</Button><Button onClick={submit} loading={createFacility.isPending || updateFacility.isPending}>{editId ? 'Enregistrer' : 'Créer'}</Button></>}
      >
        <form onSubmit={submit} className="space-y-3">
          <Input label="Nom" required {...register('name', { required: true })} error={errors.name && 'Requis'} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" {...register('type')}>
              <option value="hopital_national">Hôpital national</option>
              <option value="hopital_regional">Hôpital régional</option>
              <option value="centre_sante">Centre de santé</option>
              <option value="clinique_privee">Clinique privée</option>
            </Select>
            <Select label="Niveau" {...register('level')}>
              <option value="niveau_1">Niveau 1</option>
              <option value="niveau_2">Niveau 2</option>
              <option value="niveau_3">Niveau 3</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Région" {...register('region_id')}>
              {regions.data?.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
            <Input label="Téléphone" {...register('phone')} />
          </div>
          <Input label="Adresse" {...register('address')} />
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300">Position (cliquez ou glissez le marqueur)</label>
            <LocationPicker lat={pos.lat} lng={pos.lng} onChange={(lat, lng) => setPos({ lat, lng })} />
            <p className="mt-1.5 text-[12px] text-slate-400 tabular-nums">{pos.lat ? `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}` : 'Aucune position définie'}</p>
          </div>
        </form>
      </Modal>
    </div>
  )
}
