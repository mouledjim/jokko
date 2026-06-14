import { useEffect, useState } from 'react'

/** Re-rend le composant à intervalle régulier (pour les chronos en direct). */
export function useTick(intervalMs = 1000): number {
  const [, setN] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setN((n) => n + 1), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return Date.now()
}
