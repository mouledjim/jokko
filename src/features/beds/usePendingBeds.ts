import { useSyncExternalStore } from 'react'
import { bedQueue } from '@/lib/bedQueue'

/** Ensemble des identifiants de lits en attente de synchronisation. */
export function usePendingBedIds(): Set<string> {
  const items = useSyncExternalStore(bedQueue.subscribe, bedQueue.getSnapshot, bedQueue.getSnapshot)
  return new Set(items.map((i) => i.bedId))
}
