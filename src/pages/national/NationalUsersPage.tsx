import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Search, UserPlus, Copy, Check } from 'lucide-react'
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
import { useProfiles, useToggleProfileActive, useCreateStaff, useResetPassword, type ProfileRow } from '@/features/profiles/api'
import { useFacilities, useSpecialties } from '@/features/reference/api'
import { ROLE_LABEL } from '@/lib/roles'
import { initials } from '@/lib/format'
import type { UserRole } from '@/types/db'

interface FormValues {
  first_name: string
  last_name: string
  email: string
  role: 'medecin' | 'admin_hopital'
  facility_id: string
  specialty_id: string
  phone: string
}

export default function NationalUsersPage() {
  const toast = useToast()
  const profiles = useProfiles()
  const facilities = useFacilities()
  const specialties = useSpecialties()
  const toggle = useToggleProfileActive()
  const createStaff = useCreateStaff()
  const resetPw = useResetPassword()
  const [role, setRole] = useState('')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [created, setCreated] = useState<{ who: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({ defaultValues: { role: 'medecin' } })
  const formRole = watch('role')

  const rows = useMemo(() => {
    let list = profiles.data ?? []
    if (role) list = list.filter((p) => p.role === role)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((p) => `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) || (p.facility?.name ?? '').toLowerCase().includes(q))
    }
    return list
  }, [profiles.data, role, search])

  const submit = handleSubmit(async (v) => {
    const res = await createStaff.mutateAsync({
      email: v.email,
      first_name: v.first_name,
      last_name: v.last_name,
      role: v.role,
      facility_id: v.facility_id,
      specialty_id: v.role === 'medecin' ? v.specialty_id || null : null,
      phone: v.phone,
    })
    setOpen(false)
    reset({ role: 'medecin' })
    setCreated({ who: v.email, password: res.password })
  })

  const doReset = async (p: ProfileRow) => {
    const res = await resetPw.mutateAsync(p.id)
    setCreated({ who: `${p.first_name} ${p.last_name}`, password: res.password })
  }

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
    { key: 'fac', header: 'Établissement', hideOnMobile: true, cell: (p) => <span className="text-[13px] text-slate-500">{p.facility?.name ?? p.region?.name ?? '—'}</span> },
    { key: 'state', header: 'Statut', cell: (p) => <Badge tone={p.is_active ? 'success' : 'neutral'}>{p.is_active ? 'Actif' : 'Inactif'}</Badge> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (p) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => doReset(p)} loading={resetPw.isPending}>Réinit. mdp</Button>
          <Button variant="ghost" size="sm" onClick={() => toggle.mutate({ id: p.id, is_active: !p.is_active })}>{p.is_active ? 'Désactiver' : 'Activer'}</Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        subtitle="Tous les comptes de la plateforme"
        actions={<Button onClick={() => setOpen(true)}><UserPlus className="h-4 w-4" aria-hidden />Créer un compte</Button>}
      />
      <Card className="mb-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input placeholder="Rechercher (nom, établissement)" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filtrer par rôle">
            <option value="">Tous les rôles</option>
            {(Object.keys(ROLE_LABEL) as UserRole[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </Select>
        </div>
      </Card>
      <Card className="p-2">
        {profiles.isLoading ? (
          <div className="p-3"><TableSkeleton rows={8} cols={4} /></div>
        ) : profiles.isError ? (
          <ErrorState onRetry={() => profiles.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState title="Aucun utilisateur" description="Aucun compte ne correspond aux filtres." />
        ) : (
          <Table columns={columns} data={rows} rowKey={(p) => p.id} />
        )}
      </Card>

      {/* Création */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Créer un compte"
        description="Pour n'importe quel établissement du territoire. Le mot de passe sera affiché une seule fois."
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Annuler</Button><Button onClick={submit} loading={createStaff.isPending}>Créer le compte</Button></>}
      >
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prénom" required {...register('first_name', { required: true })} error={errors.first_name && 'Requis'} />
            <Input label="Nom" required {...register('last_name', { required: true })} error={errors.last_name && 'Requis'} />
          </div>
          <Input label="Email" type="email" required {...register('email', { required: true })} error={errors.email && 'Email requis'} />
          <Select label="Établissement" required {...register('facility_id', { required: true })} error={errors.facility_id && 'Requis'}>
            <option value="">Sélectionner un établissement</option>
            {facilities.data?.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Rôle" {...register('role')}>
              <option value="medecin">Médecin</option>
              <option value="admin_hopital">Administrateur hôpital</option>
            </Select>
            {formRole === 'medecin' && (
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
        title="Identifiants du compte"
        footer={<Button onClick={() => { setCreated(null); setCopied(false) }}>J'ai noté</Button>}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">Communiquez ces identifiants à la personne concernée. Le mot de passe ne sera plus affiché.</p>
        <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
          <p className="text-[13px]"><span className="text-slate-400">Compte :</span> <span className="font-medium">{created?.who}</span></p>
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
