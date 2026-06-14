import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/providers/ToastProvider'
import type { FacilityType, FacilityLevel } from '@/types/db'

export interface FacilityInput {
  name: string
  type: FacilityType
  level: FacilityLevel
  region_id: string
  latitude: number
  longitude: number
  address: string
  phone: string
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: ['facilities'] })
  void qc.invalidateQueries({ queryKey: ['facility-availability'] })
}

export function useCreateFacility() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async (input: FacilityInput) => {
      const { error } = await supabase.from('facilities').insert({ ...input, is_active: true })
      if (error) throw error
    },
    onSuccess: () => { invalidate(qc); toast.success('Établissement créé') },
    onError: (e) => toast.error('Création impossible', e.message),
  })
}

export function useUpdateFacility() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async (vars: { id: string; patch: Partial<FacilityInput & { is_active: boolean }> }) => {
      const { error } = await supabase.from('facilities').update(vars.patch).eq('id', vars.id)
      if (error) throw error
    },
    onSuccess: () => { invalidate(qc); toast.success('Établissement mis à jour') },
    onError: (e) => toast.error('Mise à jour impossible', e.message),
  })
}
