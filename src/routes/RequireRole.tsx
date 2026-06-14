import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import type { UserRole } from '@/types/db'

/** Garde de route par rôle : renvoie vers « Accès réservé » si rôle non autorisé. */
export function RequireRole({ allow }: { allow: UserRole[] }) {
  const { profile } = useAuth()
  if (!profile) return null
  if (!allow.includes(profile.role)) {
    return <Navigate to="/acces-refuse" replace />
  }
  return <Outlet />
}
