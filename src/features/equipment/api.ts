import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/providers/ToastProvider'
import type { Equipment, EquipmentStatus } from '@/types/db'

export interface EquipmentWithFacility extends Equipment {
  facility?: { name: string } | null
}

/** Équipements d'un établissement (ou tous si facilityId omis). */
export function useEquipment(facilityId?: string | null) {
  return useQuery({
    queryKey: ['equipment', facilityId ?? 'all'],
    queryFn: async (): Promise<EquipmentWithFacility[]> => {
      let q = supabase
        .from('equipment')
        .select('*, facility:facilities(name)')
        .order('type')
      if (facilityId) q = q.eq('facility_id', facilityId)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as unknown as EquipmentWithFacility[]
    },
  })
}

/** Met à jour le statut d'un équipement (admin de l'établissement). */
export function useUpdateEquipment(facilityId: string) {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async (vars: { id: string; status: EquipmentStatus }) => {
      const { error } = await supabase.from('equipment').update({ status: vars.status }).eq('id', vars.id)
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['equipment', facilityId] })
      void qc.invalidateQueries({ queryKey: ['equipment', 'all'] })
      toast.success('Équipement mis à jour')
    },
    onError: (e) => toast.error('Mise à jour impossible', e.message),
  })
}

