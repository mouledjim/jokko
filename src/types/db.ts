// Types métier alignés sur le schéma SQL (supabase/migrations).

export type UserRole = 'super_admin' | 'admin_regional' | 'admin_hopital' | 'medecin'
export type FacilityType =
  | 'hopital_national'
  | 'hopital_regional'
  | 'centre_sante'
  | 'clinique_privee'
export type FacilityLevel = 'niveau_1' | 'niveau_2' | 'niveau_3'
export type BedStatus = 'libre' | 'occupe' | 'nettoyage' | 'hors_service'
export type EquipmentType =
  | 'scanner'
  | 'irm'
  | 'bloc_operatoire'
  | 'generateur_oxygene'
  | 'ambulance'
  | 'laboratoire'
export type EquipmentStatus = 'fonctionnel' | 'en_panne' | 'maintenance'
export type PatientSex = 'M' | 'F'
export type TransferSeverity = 'stable' | 'urgent' | 'critique'
export type TransferStatus =
  | 'en_attente'
  | 'accepte'
  | 'refuse'
  | 'en_route'
  | 'arrive'
  | 'annule'

export interface Region {
  id: string
  name: string
  code: string
  created_at: string
}

export interface Specialty {
  id: string
  name: string
  icon_key: string
  color_key: string
  created_at: string
}

export interface Facility {
  id: string
  name: string
  type: FacilityType
  level: FacilityLevel
  region_id: string
  latitude: number
  longitude: number
  address: string
  phone: string
  is_active: boolean
  logo_url: string | null
  created_at: string
}

export interface FacilityService {
  id: string
  facility_id: string
  specialty_id: string
  is_active: boolean
  phone_extension: string
  created_at: string
}

export interface Bed {
  id: string
  facility_service_id: string
  label: string
  status: BedStatus
  updated_at: string
  updated_by: string | null
  created_at: string
}

export interface Equipment {
  id: string
  facility_id: string
  type: EquipmentType
  status: EquipmentStatus
  updated_at: string
  updated_by: string | null
  created_at: string
}

export interface Profile {
  id: string
  auth_id: string
  first_name: string
  last_name: string
  role: UserRole
  facility_id: string | null
  region_id: string | null
  specialty_id: string | null
  phone: string
  avatar_seed: string
  is_active: boolean
  created_at: string
}

export interface Vitals {
  ta?: string
  fc?: number
  spo2?: number
  temp?: number
  glasgow?: number
}

export interface TransferRequest {
  id: string
  reference: string
  patient_initials: string
  patient_age: number
  patient_sex: PatientSex
  severity: TransferSeverity
  specialty_id: string
  motif: string
  clinical_notes: string
  vitals: Vitals
  from_facility_id: string
  to_facility_id: string
  requested_by: string
  handled_by: string | null
  status: TransferStatus
  refusal_reason: string | null
  requested_at: string
  responded_at: string | null
  departed_at: string | null
  arrived_at: string | null
  response_delay_seconds: number | null
  created_at: string
}

export interface TransferEvent {
  id: string
  transfer_id: string
  event_type: string
  actor_id: string | null
  payload: Record<string, unknown>
  created_at: string
}

export interface NotificationRow {
  id: string
  recipient_id: string
  type: string
  title: string
  body: string
  link_path: string
  is_read: boolean
  created_at: string
}

export interface AuditLog {
  id: string
  actor_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

// ——— Vues d'agrégation ———
export interface ServiceAvailability {
  facility_service_id: string
  facility_id: string
  specialty_id: string
  specialty_name: string
  icon_key: string
  color_key: string
  is_active: boolean
  phone_extension: string
  beds_free: number
  beds_occupied: number
  beds_cleaning: number
  beds_out: number
  beds_total: number
  last_bed_update: string | null
}

export interface FacilityAvailability {
  facility_id: string
  name: string
  type: FacilityType
  level: FacilityLevel
  region_id: string
  region_name: string
  latitude: number
  longitude: number
  phone: string
  is_active: boolean
  beds_free: number
  beds_occupied: number
  beds_cleaning: number
  beds_out: number
  beds_total: number
  occupancy_rate: number | null
  last_bed_update: string | null
}
