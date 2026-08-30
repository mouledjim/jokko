export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'

export type AlertUrgencyLevel = 'vital' | 'urgent' | 'preventive'

export interface BloodStockItem {
  blood_group: BloodGroup
  quantity_bags: number
  minimum_threshold: number
  last_updated: string
}

export interface BloodAlert {
  id: string
  facility_id: string
  facility_name: string
  facility_city: string
  facility_lat: number
  facility_lng: number
  blood_group: BloodGroup
  urgency: AlertUrgencyLevel
  bags_needed: number
  bags_collected: number
  clinical_reason: string
  status: 'active' | 'fulfilled' | 'cancelled'
  donors_en_route: number
  created_at: string
  expires_at: string
}

export interface DonorCommitment {
  id: string
  alert_id: string
  donor_name: string
  donor_phone?: string
  donor_blood_group: BloodGroup
  facility_name: string
  status: 'en_route' | 'arrived' | 'donated' | 'cancelled'
  eta_minutes: number
  created_at: string
  pass_code: string
}

export interface DonorUserProfile {
  blood_group?: BloodGroup
  city: string
  donations_count: number
  last_donation_date?: string
  badge: 'novice' | 'bronze' | 'argent' | 'or' | 'platine'
}

/** Matrice de compatibilité pour les globules rouges */
export const BLOOD_COMPATIBILITY: Record<BloodGroup, { canGiveTo: BloodGroup[]; canReceiveFrom: BloodGroup[] }> = {
  'O-': {
    canGiveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Donneur universel
    canReceiveFrom: ['O-'],
  },
  'O+': {
    canGiveTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+'],
  },
  'A-': {
    canGiveTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-'],
  },
  'A+': {
    canGiveTo: ['A+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+'],
  },
  'B-': {
    canGiveTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'B-'],
  },
  'B+': {
    canGiveTo: ['B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'B-', 'B+'],
  },
  'AB-': {
    canGiveTo: ['AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'],
  },
  'AB+': {
    canGiveTo: ['AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Receveur universel
  },
}
