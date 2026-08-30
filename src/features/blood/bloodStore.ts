import { useState, useEffect } from 'react'
import type { BloodGroup, BloodStockItem, BloodAlert, DonorCommitment, DonorUserProfile } from '@/types/blood'

const STORAGE_KEY_ALERTS = 'jokko_blood_alerts'
const STORAGE_KEY_STOCKS = 'jokko_blood_stocks'
const STORAGE_KEY_DONORS = 'jokko_blood_donors'
const STORAGE_KEY_PROFILE = 'jokko_donor_profile'

const CHANNEL_NAME = 'jokko_blood_realtime'

export const INITIAL_STOCKS: BloodStockItem[] = [
  { blood_group: 'O-', quantity_bags: 1, minimum_threshold: 6, last_updated: new Date().toISOString() },
  { blood_group: 'O+', quantity_bags: 14, minimum_threshold: 12, last_updated: new Date().toISOString() },
  { blood_group: 'A-', quantity_bags: 2, minimum_threshold: 4, last_updated: new Date().toISOString() },
  { blood_group: 'A+', quantity_bags: 18, minimum_threshold: 10, last_updated: new Date().toISOString() },
  { blood_group: 'B-', quantity_bags: 1, minimum_threshold: 4, last_updated: new Date().toISOString() },
  { blood_group: 'B+', quantity_bags: 9, minimum_threshold: 8, last_updated: new Date().toISOString() },
  { blood_group: 'AB-', quantity_bags: 0, minimum_threshold: 3, last_updated: new Date().toISOString() },
  { blood_group: 'AB+', quantity_bags: 5, minimum_threshold: 4, last_updated: new Date().toISOString() },
]

export const INITIAL_ALERTS: BloodAlert[] = [
  {
    id: 'alert-o-neg-principal',
    facility_id: 'fac-principal',
    facility_name: 'Hôpital Principal de Dakar',
    facility_city: 'Dakar (Plateau)',
    facility_lat: 14.6644,
    facility_lng: -17.4332,
    blood_group: 'O-',
    urgency: 'vital',
    bags_needed: 4,
    bags_collected: 1,
    clinical_reason: 'Urgence Vitale · Bloc opératoire maternité (Hémorragie sévère de la délivrance)',
    status: 'active',
    donors_en_route: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    expires_at: new Date(Date.now() + 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'alert-b-neg-fann',
    facility_id: 'fac-fann',
    facility_name: 'CHU de Fann (Dakar)',
    facility_city: 'Dakar (Fann)',
    facility_lat: 14.6931,
    facility_lng: -17.4667,
    blood_group: 'B-',
    urgency: 'urgent',
    bags_needed: 3,
    bags_collected: 0,
    clinical_reason: 'Polytraumatisme de la route · Réanimation chirurgicale',
    status: 'active',
    donors_en_route: 2,
    created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    expires_at: new Date(Date.now() + 1000 * 60 * 240).toISOString(),
  },
  {
    id: 'alert-ab-neg-dalal',
    facility_id: 'fac-dalal',
    facility_name: 'Hôpital Dalal Jamm de Guédiawaye',
    facility_city: 'Guédiawaye (Dakar)',
    facility_lat: 14.7731,
    facility_lng: -17.3912,
    blood_group: 'AB-',
    urgency: 'urgent',
    bags_needed: 2,
    bags_collected: 0,
    clinical_reason: 'Prise en charge hématologie pédiatrique',
    status: 'active',
    donors_en_route: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    expires_at: new Date(Date.now() + 1000 * 60 * 300).toISOString(),
  },
]

// Broadcast channel instance for cross-tab communication
let broadcastChannel: BroadcastChannel | null = null
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME)
  }
} catch {
  // Ignore fallback
}

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

class BloodStoreManager {
  private alerts: BloodAlert[]
  private stocks: BloodStockItem[]
  private commitments: DonorCommitment[]
  private profile: DonorUserProfile
  private listeners: Set<() => void> = new Set()

  constructor() {
    this.alerts = getStored(STORAGE_KEY_ALERTS, INITIAL_ALERTS)
    this.stocks = getStored(STORAGE_KEY_STOCKS, INITIAL_STOCKS)
    this.commitments = getStored(STORAGE_KEY_DONORS, [])
    this.profile = getStored(STORAGE_KEY_PROFILE, {
      city: 'Dakar',
      blood_group: 'O-',
      donations_count: 2,
      last_donation_date: '2026-05-12',
      badge: 'argent',
    })

    if (broadcastChannel) {
      broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'SYNC') {
          this.alerts = getStored(STORAGE_KEY_ALERTS, this.alerts)
          this.stocks = getStored(STORAGE_KEY_STOCKS, this.stocks)
          this.commitments = getStored(STORAGE_KEY_DONORS, this.commitments)
          this.profile = getStored(STORAGE_KEY_PROFILE, this.profile)
          this.notify()
        }
      }
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener())
  }

  private broadcast() {
    setStored(STORAGE_KEY_ALERTS, this.alerts)
    setStored(STORAGE_KEY_STOCKS, this.stocks)
    setStored(STORAGE_KEY_DONORS, this.commitments)
    setStored(STORAGE_KEY_PROFILE, this.profile)
    this.notify()
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'SYNC', timestamp: Date.now() })
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public getAlerts(): BloodAlert[] {
    return this.alerts
  }

  public getStocks(): BloodStockItem[] {
    return this.stocks
  }

  public getCommitments(): DonorCommitment[] {
    return this.commitments
  }

  public getProfile(): DonorUserProfile {
    return this.profile
  }

  public updateProfile(updates: Partial<DonorUserProfile>) {
    this.profile = { ...this.profile, ...updates }
    this.broadcast()
  }

  public createAlert(params: Omit<BloodAlert, 'id' | 'created_at' | 'status' | 'bags_collected' | 'donors_en_route'>): BloodAlert {
    const newAlert: BloodAlert = {
      ...params,
      id: `alert-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'active',
      bags_collected: 0,
      donors_en_route: 0,
    }
    this.alerts = [newAlert, ...this.alerts]
    this.broadcast()
    return newAlert
  }

  public respondToAlert(alertId: string, donorName: string, bloodGroup: BloodGroup, etaMinutes = 20): DonorCommitment {
    const alert = this.alerts.find((a) => a.id === alertId)
    const passCode = `JKK-${Math.floor(1000 + Math.random() * 9000)}`

    const commitment: DonorCommitment = {
      id: `don-${Date.now()}`,
      alert_id: alertId,
      donor_name: donorName || 'Citoyen Donneur',
      donor_blood_group: bloodGroup,
      facility_name: alert?.facility_name || 'Établissement de Santé',
      status: 'en_route',
      eta_minutes: etaMinutes,
      created_at: new Date().toISOString(),
      pass_code: passCode,
    }

    this.commitments = [commitment, ...this.commitments]

    if (alert) {
      alert.donors_en_route += 1
      this.alerts = [...this.alerts]
    }

    this.broadcast()
    return commitment
  }

  public completeDonation(commitmentId: string) {
    const commitment = this.commitments.find((c) => c.id === commitmentId)
    if (!commitment) return

    commitment.status = 'donated'

    const alert = this.alerts.find((a) => a.id === commitment.alert_id)
    if (alert) {
      alert.bags_collected += 1
      alert.donors_en_route = Math.max(0, alert.donors_en_route - 1)
      if (alert.bags_collected >= alert.bags_needed) {
        alert.status = 'fulfilled'
      }
    }

    // Update stock
    const stock = this.stocks.find((s) => s.blood_group === commitment.donor_blood_group)
    if (stock) {
      stock.quantity_bags += 1
      stock.last_updated = new Date().toISOString()
    }

    // Update user profile impact
    this.profile.donations_count += 1
    this.profile.last_donation_date = new Date().toISOString().split('T')[0]
    if (this.profile.donations_count >= 10) this.profile.badge = 'platine'
    else if (this.profile.donations_count >= 5) this.profile.badge = 'or'
    else if (this.profile.donations_count >= 3) this.profile.badge = 'argent'
    else if (this.profile.donations_count >= 1) this.profile.badge = 'bronze'

    this.broadcast()
  }

  public fulfillAlert(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.status = 'fulfilled'
      this.broadcast()
    }
  }

  public updateStock(bloodGroup: BloodGroup, quantityDelta: number) {
    const stock = this.stocks.find((s) => s.blood_group === bloodGroup)
    if (stock) {
      stock.quantity_bags = Math.max(0, stock.quantity_bags + quantityDelta)
      stock.last_updated = new Date().toISOString()
      this.broadcast()
    }
  }

  public resetDemoData() {
    this.alerts = INITIAL_ALERTS
    this.stocks = INITIAL_STOCKS
    this.commitments = []
    this.broadcast()
  }

  public simulateDonorEnRoute(alertId: string) {
    const names = ['Moussa Diallo', 'Fatou Ndiaye', 'Ibrahima Sow', 'Aissatou Ba', 'Cheikh Fall']
    const randomName = names[Math.floor(Math.random() * names.length)]
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert) {
      this.respondToAlert(alertId, randomName, alert.blood_group, Math.floor(10 + Math.random() * 20))
    }
  }
}

export const bloodStore = new BloodStoreManager()

export function useBloodStore() {
  const [, setTick] = useState(0)

  useEffect(() => {
    return bloodStore.subscribe(() => setTick((t) => t + 1))
  }, [])

  return {
    alerts: bloodStore.getAlerts(),
    stocks: bloodStore.getStocks(),
    commitments: bloodStore.getCommitments(),
    profile: bloodStore.getProfile(),
    updateProfile: (updates: Partial<DonorUserProfile>) => bloodStore.updateProfile(updates),
    createAlert: (params: Parameters<typeof bloodStore.createAlert>[0]) => bloodStore.createAlert(params),
    respondToAlert: (alertId: string, donorName: string, bloodGroup: BloodGroup, eta?: number) =>
      bloodStore.respondToAlert(alertId, donorName, bloodGroup, eta),
    completeDonation: (commitmentId: string) => bloodStore.completeDonation(commitmentId),
    fulfillAlert: (alertId: string) => bloodStore.fulfillAlert(alertId),
    updateStock: (bloodGroup: BloodGroup, delta: number) => bloodStore.updateStock(bloodGroup, delta),
    resetDemoData: () => bloodStore.resetDemoData(),
    simulateDonorEnRoute: (alertId: string) => bloodStore.simulateDonorEnRoute(alertId),
  }
}
