import type { TransferSeverity, PatientSex, EquipmentType } from '@/types/db'

/**
 * Brouillon de demande de transfert conservé EN MÉMOIRE (pas de persistance) :
 * si l'utilisateur navigue ailleurs puis revient, le formulaire est restauré.
 * Réinitialisé après envoi réussi.
 */
export interface TransferDraft {
  step: number
  patient_initials: string
  patient_age: string
  patient_sex: PatientSex
  severity: TransferSeverity
  specialty_id: string
  motif: string
  clinical_notes: string
  ta: string
  fc: string
  spo2: string
  temp: string
  glasgow: string
  requiredEquipment: EquipmentType[]
  to_facility_id: string
}

export const emptyDraft: TransferDraft = {
  step: 0,
  patient_initials: '',
  patient_age: '',
  patient_sex: 'M',
  severity: 'urgent',
  specialty_id: '',
  motif: '',
  clinical_notes: '',
  ta: '',
  fc: '',
  spo2: '',
  temp: '',
  glasgow: '',
  requiredEquipment: [],
  to_facility_id: '',
}

let draft: TransferDraft = { ...emptyDraft }

export const transferDraft = {
  get(): TransferDraft {
    return draft
  },
  set(next: Partial<TransferDraft>) {
    draft = { ...draft, ...next }
  },
  reset() {
    draft = { ...emptyDraft }
  },
}
