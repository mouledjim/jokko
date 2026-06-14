import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import { Table, type Column } from '@/components/ui/Table'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Search } from 'lucide-react'
import { useProfiles, useToggleProfileActive, type ProfileRow } from '@/features/profiles/api'
import { ROLE_LABEL } from '@/lib/roles'
import { initials } from '@/lib/format'
import type { UserRole } from '@/types/db'

export default function NationalUsersPage() {
  const profiles = useProfiles()
  const toggle = useToggleProfileActive()
  const [role, setRole] = useState('')
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    let list = profiles.data ?? []
    if (role) list = list.filter((p) => p.role === role)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((p) => `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) || (p.facility?.name ?? '').toLowerCase().includes(q))
    }
    return list
  }, [profiles.data, role, search])

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
    { key: 'actions', header: '', align: 'right', cell: (p) => <Button variant="ghost" size="sm" onClick={() => toggle.mutate({ id: p.id, is_active: !p.is_active })}>{p.is_active ? 'Désactiver' : 'Activer'}</Button> },
  ]

  return (
    <div>
      <PageHeader title="Utilisateurs" subtitle="Tous les comptes de la plateforme" />
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
    </div>
  )
}
