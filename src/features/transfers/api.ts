import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/providers/ToastProvider'
import type { TransferRequest, TransferEvent, TransferSeverity, PatientSex, Vitals } from '@/types/db'

/** Transfert enrichi des noms d'établissements et de spécialité (jointures). */
export interface TransferWithRefs extends TransferRequest {
  from_facility: { name: string } | null
  to_facility: { name: string } | null
  specialty: { name: string; icon_key: string; color_key: string } | null
}

const SELECT =
  '*, from_facility:facilities!from_facility_id(name), to_facility:facilities!to_facility_id(name), specialty:specialties(name, icon_key, color_key)'

export const IN_PROGRESS_STATUSES = ['en_attente', 'accepte', 'en_route'] as const

/**
 * Liste des transferts visibles par l'utilisateur (filtrée par la RLS).
 * Les filtres optionnels affinent la requête côté serveur.
 */
export function useTransfers(options?: {
  status?: string[]
  toFacilityId?: string
  fromFacilityId?: string
  limit?: number
}) {
  const { status, toFacilityId, fromFacilityId, limit } = options ?? {}
  return useQuery({
    queryKey: ['transfers', { status, toFacilityId, fromFacilityId, limit }],
    queryFn: async (): Promise<TransferWithRefs[]> => {
      let q = supabase.from('transfer_requests').select(SELECT).order('requested_at', { ascending: false })
      if (status?.length) q = q.in('status', status)
      if (toFacilityId) q = q.eq('to_facility_id', toFacilityId)
      if (fromFacilityId) q = q.eq('from_facility_id', fromFacilityId)
      if (limit) q = q.limit(limit)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as unknown as TransferWithRefs[]
    },
  })
}

/** Un transfert par identifiant (détail). */
export function useTransfer(id: string | undefined) {
  return useQuery({
    queryKey: ['transfer', id],
    enabled: !!id,
    queryFn: async (): Promise<TransferWithRefs | null> => {
      const { data, error } = await supabase.from('transfer_requests').select(SELECT).eq('id', id).maybeSingle()
      if (error) throw error
      return (data as unknown as TransferWithRefs) ?? null
    },
  })
}

/** Timeline d'un transfert avec l'auteur de chaque événement. */
export interface TransferEventWithActor extends TransferEvent {
  actor: { first_name: string; last_name: string } | null
}
export function useTransferEvents(transferId: string | undefined) {
  return useQuery({
    queryKey: ['transfer-events', transferId],
    enabled: !!transferId,
    queryFn: async (): Promise<TransferEventWithActor[]> => {
      const { data, error } = await supabase
        .from('transfer_events')
        .select('*, actor:profiles(first_name, last_name)')
        .eq('transfer_id', transferId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as unknown as TransferEventWithActor[]
    },
  })
}

export interface CreateTransferInput {
  patient_initials: string
  patient_age: number
  patient_sex: PatientSex
  severity: TransferSeverity
  specialty_id: string
  motif: string
  clinical_notes: string
  vitals: Vitals
  to_facility_id: string
}

/** Crée une demande de transfert depuis l'établissement de l'utilisateur. */
export function useCreateTransfer() {
  const { profile } = useAuth()
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async (input: CreateTransferInput): Promise<string> => {
      if (!navigator.onLine) throw new Error('Action indisponible hors ligne.')
      if (!profile?.facility_id) throw new Error('Profil sans établissement.')
      const { data, error } = await supabase
        .from('transfer_requests')
        .insert({
          patient_initials: input.patient_initials,
          patient_age: input.patient_age,
          patient_sex: input.patient_sex,
          severity: input.severity,
          specialty_id: input.specialty_id,
          motif: input.motif,
          clinical_notes: input.clinical_notes,
          vitals: input.vitals,
          from_facility_id: profile.facility_id,
          to_facility_id: input.to_facility_id,
          requested_by: profile.id,
          status: 'en_attente',
          // requested_at : laissé au défaut DB (now() serveur) — robuste au
          // décalage d'horloge client, et conforme à la fenêtre RLS.
        })
        .select('id')
        .single()
      if (error) throw error
      return (data as { id: string }).id
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['transfers'] })
      toast.success('Demande envoyée', 'L\'établissement destinataire est notifié en temps réel.')
    },
    onError: (e) => toast.error('Envoi impossible', e.message),
  })
}

export type TransferAction = 'accepte' | 'refuse' | 'en_route' | 'arrive' | 'annule'

const ACTION_TOAST: Record<TransferAction, string> = {
  accepte: 'Transfert accepté',
  refuse: 'Transfert refusé',
  en_route: 'Patient marqué en route',
  arrive: 'Patient marqué arrivé',
  annule: 'Demande annulée',
}

/** Fait évoluer le statut d'un transfert (la règle de transition est validée par la base). */
export function useTransferAction() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async (vars: { id: string; action: TransferAction; refusalReason?: string }) => {
      if (!navigator.onLine) throw new Error('Action indisponible hors ligne.')
      const patch: Record<string, unknown> = { status: vars.action }
      if (vars.action === 'refuse') patch.refusal_reason = vars.refusalReason ?? ''
      const { error } = await supabase.from('transfer_requests').update(patch).eq('id', vars.id)
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ['transfers'] })
      void qc.invalidateQueries({ queryKey: ['transfer', vars.id] })
      void qc.invalidateQueries({ queryKey: ['transfer-events', vars.id] })
      toast.success(ACTION_TOAST[vars.action])
    },
    onError: (e) => toast.error('Action impossible', e.message),
  })
}

/** Abonnement Realtime aux transferts. À monter une fois (coquille). */
export function useTransfersRealtime() {
  const qc = useQueryClient()
  useEffect(() => {
    const channel = supabase
      .channel('transfers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transfer_requests' }, () => {
        void qc.invalidateQueries({ queryKey: ['transfers'] })
        void qc.invalidateQueries({ queryKey: ['transfer'] })
        void qc.invalidateQueries({ queryKey: ['transfer-events'] })
      })
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [qc])
}
