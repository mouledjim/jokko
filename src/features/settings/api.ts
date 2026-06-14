import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/providers/ToastProvider'

export interface AppSettings {
  id: boolean
  tension_threshold: number
  national_banner: string
  updated_at: string
}

export function useSettings() {
  return useQuery({
    queryKey: ['app-settings'],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<AppSettings | null> => {
      const { data, error } = await supabase.from('app_settings').select('*').maybeSingle()
      if (error) throw error
      return (data as AppSettings) ?? null
    },
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async (patch: { tension_threshold?: number; national_banner?: string }) => {
      const { error } = await supabase.from('app_settings').update(patch).eq('id', true)
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['app-settings'] })
      toast.success('Paramètres enregistrés')
    },
    onError: (e) => toast.error('Enregistrement impossible', e.message),
  })
}
