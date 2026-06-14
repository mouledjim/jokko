import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Region, Specialty, Facility } from '@/types/db'

export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<Region[]> => {
      const { data, error } = await supabase.from('regions').select('*').order('name')
      if (error) throw error
      return (data ?? []) as Region[]
    },
  })
}

export function useSpecialties() {
  return useQuery({
    queryKey: ['specialties'],
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<Specialty[]> => {
      const { data, error } = await supabase.from('specialties').select('*').order('name')
      if (error) throw error
      return (data ?? []) as Specialty[]
    },
  })
}

export function useFacilities() {
  return useQuery({
    queryKey: ['facilities'],
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Facility[]> => {
      const { data, error } = await supabase.from('facilities').select('*').order('name')
      if (error) throw error
      return (data ?? []) as Facility[]
    },
  })
}
