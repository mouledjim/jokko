import type { BedStatus } from '@/types/db'

/**
 * File d'attente locale des changements de statut de lit effectués hors ligne.
 * Stockée en localStorage (seule donnée métier autorisée en local, cf. §8) et
 * rejouée automatiquement au retour du réseau.
 */
export interface BedQueueItem {
  bedId: string
  label: string
  status: BedStatus
  ts: number
}

const STORAGE_KEY = 'jokko-bed-queue'

let items: BedQueueItem[] = load()
const listeners = new Set<() => void>()

function load(): BedQueueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as BedQueueItem[]) : []
  } catch {
    return []
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Quota dépassé / mode privé : on ignore silencieusement.
  }
}

function emit() {
  persist()
  for (const l of listeners) l()
}

export const bedQueue = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot(): BedQueueItem[] {
    return items
  },
  /** Ajoute ou remplace l'entrée d'un lit (on ne garde que le dernier statut voulu). */
  enqueue(item: BedQueueItem) {
    items = [...items.filter((i) => i.bedId !== item.bedId), item]
    emit()
  },
  remove(bedId: string) {
    const next = items.filter((i) => i.bedId !== bedId)
    if (next.length !== items.length) {
      items = next
      emit()
    }
  },
  clear() {
    if (items.length) {
      items = []
      emit()
    }
  },
}
