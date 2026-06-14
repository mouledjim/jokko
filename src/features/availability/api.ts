import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { FacilityAvailability, ServiceAvailability } from '@/types/db'

/** Disponibilité agrégée de tous les établissements (vue v_facility_availability). */
export function useFacilityAvailability() {
  return useQuery({
    queryKey: ['facility-availability'],
    queryFn: async (): Promise<FacilityAvailability[]> => {
      const { data, error } = await supabase
        .from('v_facility_availability')
        .select('*')
        .order('name')
      if (error) throw error
      return (data ?? []) as FacilityAvailability[]
    },
  })
}

/** Disponibilité par service de TOUS les établissements (pour la carte). */
export function useAllServiceAvailability() {
  return useQuery({
    queryKey: ['service-availability', 'all'],
    queryFn: async (): Promise<ServiceAvailability[]> => {
      const { data, error } = await supabase
        .from('v_service_availability')
        .select('*')
        .order('specialty_name')
      if (error) throw error
      return (data ?? []) as ServiceAvailability[]
    },
  })
}

/** Disponibilité par service pour un établissement donné. */
export function useServiceAvailability(facilityId: string | null | undefined) {
  return useQuery({
    queryKey: ['service-availability', facilityId],
    enabled: !!facilityId,
    queryFn: async (): Promise<ServiceAvailability[]> => {
      const { data, error } = await supabase
        .from('v_service_availability')
        .select('*')
        .eq('facility_id', facilityId)
        .order('specialty_name')
      if (error) throw error
      return (data ?? []) as ServiceAvailability[]
    },
  })
}
