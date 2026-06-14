import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { bedQueue } from '@/lib/bedQueue'
import { useToast } from '@/providers/ToastProvider'
import type { Bed, BedStatus } from '@/types/db'

export interface BedService {
  id: string
  name: string
  icon_key: string
  color_key: string
}
export interface BedWithService extends Bed {
  service: BedService | null
}

const BEDS_KEY = (facilityId: string) => ['beds', 'facility', facilityId] as const

/** Tous les lits d'un établissement, enrichis du service/spécialité. */
export function useFacilityBeds(facilityId: string | null | undefined) {
  return useQuery({
    queryKey: BEDS_KEY(facilityId ?? 'none'),
    enabled: !!facilityId,
    queryFn: async (): Promise<BedWithService[]> => {
      const { data: services, error: se } = await supabase
        .from('facility_services')
        .select('id, specialty:specialties(id, name, icon_key, color_key)')
        .eq('facility_id', facilityId)
      if (se) throw se

      const svcMap = new Map<string, BedService>()
      for (const s of services ?? []) {
        const row = s as { id: string; specialty: BedService | BedService[] | null }
        const sp = Array.isArray(row.specialty) ? (row.specialty[0] ?? null) : row.specialty
        if (sp) svcMap.set(row.id, sp)
      }
      const ids = (services ?? []).map((s) => (s as { id: string }).id)
      if (ids.length === 0) return []

      const { data: beds, error: be } = await supabase
        .from('beds')
        .select('*')
        .in('facility_service_id', ids)
        .order('label')
      if (be) throw be

      return (beds ?? []).map((b) => ({
        ...(b as Bed),
        service: svcMap.get((b as Bed).facility_service_id) ?? null,
      }))
    },
  })
}

const STATUS_CYCLE: BedStatus[] = ['libre', 'occupe', 'nettoyage', 'hors_service']
export function nextBedStatus(status: BedStatus): BedStatus {
  return STATUS_CYCLE[(STATUS_CYCLE.indexOf(status) + 1) % STATUS_CYCLE.length]
}

/**
 * Met à jour le statut d'un lit : optimiste (UI instantanée), avec repli hors
 * ligne (mise en file + rejeu automatique) si le réseau est absent.
 */
export function useUpdateBedStatus(facilityId: string) {
  const qc = useQueryClient()
  const toast = useToast()

  return useMutation({
    // 'always' : exécute mutationFn même hors ligne pour déclencher notre file
    // d'attente personnalisée (sinon TanStack Query met la mutation en pause).
    networkMode: 'always',
    mutationFn: async (vars: { bed: BedWithService; status: BedStatus }) => {
      if (!navigator.onLine) {
        const err = new Error('offline')
        err.name = 'OfflineError'
        throw err
      }
      const { error } = await supabase
        .from('beds')
        .update({ status: vars.status })
        .eq('id', vars.bed.id)
      if (error) throw error
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: BEDS_KEY(facilityId) })
      const previous = qc.getQueryData<BedWithService[]>(BEDS_KEY(facilityId))
      qc.setQueryData<BedWithService[]>(BEDS_KEY(facilityId), (old) =>
        (old ?? []).map((b) => (b.id === vars.bed.id ? { ...b, status: vars.status } : b)),
      )
      return { previous }
    },
    onError: (error, vars, ctx) => {
      const offline = error.name === 'OfflineError' || !navigator.onLine
      if (offline) {
        // On conserve l'état optimiste et on met en file pour rejouer plus tard.
        bedQueue.enqueue({ bedId: vars.bed.id, label: vars.bed.label, status: vars.status, ts: Date.now() })
      } else {
        // Vraie erreur réseau/serveur : on annule l'optimisme.
        if (ctx?.previous) qc.setQueryData(BEDS_KEY(facilityId), ctx.previous)
        toast.error('Mise à jour impossible', 'Le lit n\'a pas pu être modifié. Réessayez.')
      }
    },
    onSettled: () => {
      if (navigator.onLine) {
        void qc.invalidateQueries({ queryKey: BEDS_KEY(facilityId) })
        void qc.invalidateQueries({ queryKey: ['facility-availability'] })
        void qc.invalidateQueries({ queryKey: ['service-availability'] })
      }
    },
  })
}

/** Rejoue la file d'attente hors-ligne au retour du réseau. À monter une fois. */
export function useBedSyncRunner() {
  const qc = useQueryClient()
  const toast = useToast()
  const running = useRef(false)

  useEffect(() => {
    async function flush() {
      if (running.current || !navigator.onLine) return
      const pending = bedQueue.getSnapshot()
      if (pending.length === 0) return
      running.current = true
      let ok = 0
      for (const item of pending) {
        const { error } = await supabase.from('beds').update({ status: item.status }).eq('id', item.bedId)
        if (!error) {
          bedQueue.remove(item.bedId)
          ok += 1
        }
      }
      running.current = false
      if (ok > 0) {
        void qc.invalidateQueries({ queryKey: ['beds'] })
        void qc.invalidateQueries({ queryKey: ['facility-availability'] })
        void qc.invalidateQueries({ queryKey: ['service-availability'] })
        toast.success(
          `${ok} mise${ok > 1 ? 's' : ''} à jour synchronisée${ok > 1 ? 's' : ''}`,
          'Vos changements de lits ont été enregistrés.',
        )
      }
    }
    window.addEventListener('online', flush)
    void flush()
    return () => window.removeEventListener('online', flush)
  }, [qc, toast])
}

/** Abonnement Realtime aux lits : invalide les vues de disponibilité. À monter une fois. */
export function useBedsRealtime() {
  const qc = useQueryClient()
  useEffect(() => {
    const channel = supabase
      .channel('beds-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beds' }, () => {
        void qc.invalidateQueries({ queryKey: ['beds'] })
        void qc.invalidateQueries({ queryKey: ['facility-availability'] })
        void qc.invalidateQueries({ queryKey: ['service-availability'] })
      })
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [qc])
}

// ——— Administration des lits (admin hôpital) ———

export function useAddBed(facilityId: string) {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async (vars: { facilityServiceId: string; label: string }) => {
      const { error } = await supabase
        .from('beds')
        .insert({ facility_service_id: vars.facilityServiceId, label: vars.label, status: 'libre' })
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: BEDS_KEY(facilityId) })
      void qc.invalidateQueries({ queryKey: ['facility-availability'] })
      void qc.invalidateQueries({ queryKey: ['service-availability'] })
      toast.success('Lit ajouté')
    },
    onError: (e) => toast.error('Ajout impossible', e.message),
  })
}

export function useRenameBed(facilityId: string) {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async (vars: { bedId: string; label: string }) => {
      const { error } = await supabase.from('beds').update({ label: vars.label }).eq('id', vars.bedId)
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: BEDS_KEY(facilityId) })
      toast.success('Lit renommé')
    },
    onError: (e) => toast.error('Renommage impossible', e.message),
  })
}

export function useDeleteBed(facilityId: string) {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async (bedId: string) => {
      const { error } = await supabase.from('beds').delete().eq('id', bedId)
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: BEDS_KEY(facilityId) })
      void qc.invalidateQueries({ queryKey: ['facility-availability'] })
      void qc.invalidateQueries({ queryKey: ['service-availability'] })
      toast.success('Lit retiré')
    },
    onError: (e) => toast.error('Suppression impossible', e.message),
  })
}
