import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

/**
 * Persiste le cache TanStack Query dans localStorage : les dernières données
 * connues restent affichées hors ligne (cf. §8). Le cache est vidé à la
 * déconnexion pour éviter toute fuite entre comptes sur un poste partagé.
 */
export const PERSIST_KEY = 'jokko-query-cache'

export const queryPersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: PERSIST_KEY,
  throttleTime: 1000,
})
