import { useEffect } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'
import type { NotificationRow } from '@/types/db'

const KEY = (profileId: string) => ['notifications', profileId] as const

/**
 * Liste des notifications de l'utilisateur courant (requête seule, sans effet
 * Realtime). Appelable depuis plusieurs composants : ils partagent le cache.
 */
export function useNotifications() {
  const { profile } = useAuth()
  const profileId = profile?.id

  return useQuery({
    queryKey: KEY(profileId ?? 'none'),
    enabled: !!profileId,
    queryFn: async (): Promise<NotificationRow[]> => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return (data ?? []) as NotificationRow[]
    },
  })
}

/**
 * Abonnement Realtime aux notifications — à monter UNE SEULE FOIS (dans la
 * coquille applicative). Invalide la requête de façon ciblée à chaque
 * changement, sans re-render en cascade.
 */
export function useNotificationsRealtime() {
  const { profile } = useAuth()
  const profileId = profile?.id
  const qc = useQueryClient()

  useEffect(() => {
    if (!profileId) return
    const channel = supabase
      .channel(`notifications:${profileId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${profileId}` },
        () => {
          void qc.invalidateQueries({ queryKey: KEY(profileId) })
        },
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [profileId, qc])
}

export function useUnreadCount(): number {
  const { data } = useNotifications()
  return (data ?? []).filter((n) => !n.is_read).length
}

export function useMarkRead() {
  const { profile } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      if (profile) void qc.invalidateQueries({ queryKey: KEY(profile.id) })
    },
  })
}

export function useMarkAllRead() {
  const { profile } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      if (!profile) return
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', profile.id)
        .eq('is_read', false)
      if (error) throw error
    },
    onSuccess: () => {
      if (profile) void qc.invalidateQueries({ queryKey: KEY(profile.id) })
    },
  })
}
