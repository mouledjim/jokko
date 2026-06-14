import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/providers/ToastProvider'

/** Active/désactive un service d'un établissement (admin). */
export function useToggleService(facilityId: string) {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async (vars: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('facility_services')
        .update({ is_active: vars.is_active })
        .eq('id', vars.id)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ['service-availability'] })
      void qc.invalidateQueries({ queryKey: ['facility-availability'] })
      void qc.invalidateQueries({ queryKey: ['beds', 'facility', facilityId] })
      toast.success(vars.is_active ? 'Service activé' : 'Service désactivé')
    },
    onError: (e) => toast.error('Modification impossible', e.message),
  })
}
