import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/** Récupère le Bundle FHIR des disponibilités (RPC fhir_availability). */
export function useFhirBundle() {
  return useQuery({
    queryKey: ['fhir-availability'],
    queryFn: async (): Promise<unknown> => {
      const { data, error } = await supabase.rpc('fhir_availability')
      if (error) throw error
      return data
    },
  })
}

export const FHIR_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/fhir_availability`
