import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/providers/ToastProvider'
import type { UserRole } from '@/types/db'

export interface ProfileRow {
  id: string
  first_name: string
  last_name: string
  role: UserRole
  facility_id: string | null
  region_id: string | null
  specialty_id: string | null
  phone: string
  is_active: boolean
  created_at: string
  facility: { name: string } | null
  region: { name: string } | null
  specialty: { name: string } | null
}

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async (): Promise<ProfileRow[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role, facility_id, region_id, specialty_id, phone, is_active, created_at, facility:facilities(name), region:regions(name), specialty:specialties(name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as ProfileRow[]
    },
  })
}

export function useToggleProfileActive() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async (vars: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('profiles').update({ is_active: vars.is_active }).eq('id', vars.id)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ['profiles'] })
      toast.success(vars.is_active ? 'Compte activé' : 'Compte désactivé')
    },
    onError: (e) => toast.error('Action impossible', e.message),
  })
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let p = ''
  for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)]
  return p + '!2'
}

export interface CreateStaffInput {
  email: string
  first_name: string
  last_name: string
  role: 'medecin' | 'admin_hopital'
  facility_id: string
  specialty_id: string | null
  phone: string
}

/**
 * Crée un compte (médecin ou admin hôpital). Utilise un client Supabase JETABLE
 * pour le signUp afin de ne pas remplacer la session de l'administrateur courant,
 * puis insère le profil via le client principal (autorisé par la RLS).
 * Le mot de passe initial généré est renvoyé pour affichage unique.
 */
export function useCreateStaff() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async (input: CreateStaffInput): Promise<{ password: string }> => {
      const password = generatePassword()
      const tmp = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
        auth: { storageKey: 'jokko-temp-signup', persistSession: false, autoRefreshToken: false },
      })
      const { data, error } = await tmp.auth.signUp({
        email: input.email.trim(),
        password,
        options: { data: { first_name: input.first_name, last_name: input.last_name } },
      })
      if (error) throw error
      if (!data.user) throw new Error('Compte non créé.')

      const { error: pErr } = await supabase.from('profiles').insert({
        auth_id: data.user.id,
        first_name: input.first_name,
        last_name: input.last_name,
        role: input.role,
        facility_id: input.facility_id,
        specialty_id: input.specialty_id,
        phone: input.phone,
        is_active: true,
      })
      if (pErr) throw pErr
      return { password }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['profiles'] })
    },
    onError: (e) => toast.error('Création impossible', e.message),
  })
}
