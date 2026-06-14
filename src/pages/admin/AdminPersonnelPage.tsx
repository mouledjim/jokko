import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { UserPlus, Copy, Check } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/providers/ToastProvider'
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
import { useProfiles, useToggleProfileActive, useCreateStaff, type ProfileRow } from '@/features/profiles/api'
import { useSpecialties } from '@/features/reference/api'
import { ROLE_LABEL } from '@/lib/roles'
import { initials } from '@/lib/format'

interface FormValues {
  first_name: string
  last_name: string
  email: string
  role: 'medecin' | 'admin_hopital'
  specialty_id: string
  phone: string
}

export default function AdminPersonnelPage() {
  const { facility } = useAuth()
  const toast = useToast()
  const profiles = useProfiles()
  const specialties = useSpecialties()
  const toggle = useToggleProfileActive()
  const createStaff = useCreateStaff()
  const [open, setOpen] = useState(false)
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({ defaultValues: { role: 'medecin' } })
  const role = watch('role')

  const staff = useMemo(
    () => (profiles.data ?? []).filter((p) => p.facility_id === facility?.id),
    [profiles.data, facility?.id],
  )

  const submit = handleSubmit(async (v) => {
    const res = await createStaff.mutateAsync({
      email: v.email,
      first_name: v.first_name,
      last_name: v.last_name,
      role: v.role,
      facility_id: facility!.id,
      specialty_id: v.role === 'medecin' ? v.specialty_id || null : null,
      phone: v.phone,
    })
    setOpen(false)
    reset({ role: 'medecin' })
    setCreated({ email: v.email, password: res.password })
  })

  const columns: Column<ProfileRow>[] = [
    {
      key: 'name',
      header: 'Nom',
      cell: (p) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bloc/10 text-[12px] font-bold text-bloc">{initials(p.first_name, p.last_name)}</span>
          <span className="text-[13px] font-medium text-slate-800 dark:text-slate-100">{p.first_name} {p.last_name}</span>
        </div>
      ),
    },
    { key: 'role', header: 'Rôle', cell: (p) => <Badge tone="bloc">{ROLE_LABEL[p.role]}</Badge> },
    { key: 'spec', header: 'Spécialité', hideOnMobile: true, cell: (p) => <span className="text-[13px] text-slate-500">{p.specialty?.name ?? '—'}</span> },
    { key: 'phone', header: 'Téléphone', hideOnMobile: true, cell: (p) => <span className="text-[13px] text-slate-500 tabular-nums">{p.phone || '—'}</span> },
    { key: 'state', header: 'Statut', cell: (p) => <Badge tone={p.is_active ? 'success' : 'neutral'}>{p.is_active ? 'Actif' : 'Inactif'}</Badge> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (p) => (
        <Button variant="ghost" size="sm" onClick={() => toggle.mutate({ id: p.id, is_active: !p.is_active })}>
          {p.is_active ? 'Désactiver' : 'Activer'}
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Personnel"
        subtitle={facility?.name}
        actions={<Button onClick={() => setOpen(true)}><UserPlus className="h-4 w-4" aria-hidden />Créer un compte</Button>}
      />

      <Card className="p-2">
        {profiles.isLoading ? (
          <div className="p-3"><TableSkeleton rows={5} cols={5} /></div>
        ) : profiles.isError ? (
          <ErrorState onRetry={() => profiles.refetch()} />
        ) : staff.length === 0 ? (
          <EmptyState title="Aucun membre" description="Créez le premier compte de votre établissement." action={<Button onClick={() => setOpen(true)}><UserPlus className="h-4 w-4" aria-hidden />Créer un compte</Button>} />
        ) : (
          <Table columns={columns} data={staff} rowKey={(p) => p.id} />
        )}
      </Card>

      {/* Création */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Créer un compte"
        description="Le mot de passe initial sera affiché une seule fois."
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Annuler</Button><Button onClick={submit} loading={createStaff.isPending}>Créer le compte</Button></>}
      >
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prénom" required {...register('first_name', { required: true })} error={errors.first_name && 'Requis'} />
            <Input label="Nom" required {...register('last_name', { required: true })} error={errors.last_name && 'Requis'} />
          </div>
          <Input label="Email" type="email" required {...register('email', { required: true })} error={errors.email && 'Email requis'} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Rôle" {...register('role')}>
              <option value="medecin">Médecin</option>
              <option value="admin_hopital">Administrateur hôpital</option>
            </Select>
            {role === 'medecin' && (
              <Select label="Spécialité" {...register('specialty_id')}>
                <option value="">—</option>
                {specialties.data?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            )}
          </div>
          <Input label="Téléphone" placeholder="+221 …" {...register('phone')} />
        </form>
      </Modal>

      {/* Mot de passe généré */}
      <Modal
        open={!!created}
        onClose={() => { setCreated(null); setCopied(false) }}
        title="Compte créé"
        footer={<Button onClick={() => { setCreated(null); setCopied(false) }}>J'ai noté</Button>}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">Communiquez ces identifiants à la personne concernée. Le mot de passe ne sera plus affiché.</p>
        <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
          <p className="text-[13px]"><span className="text-slate-400">Email :</span> <span className="font-medium">{created?.email}</span></p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px]"><span className="text-slate-400">Mot de passe :</span> <span className="font-mono font-semibold">{created?.password}</span></p>
            <Button variant="ghost" size="sm" onClick={() => { if (created) { navigator.clipboard?.writeText(created.password); setCopied(true); toast.success('Mot de passe copié') } }}>
              {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
