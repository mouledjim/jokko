import { useEffect, useRef, useState } from 'react'
import { WifiOff } from 'lucide-react'
import { useOnline } from '@/hooks/useOnline'
import { usePendingBedIds } from '@/features/beds/usePendingBeds'
import { hour } from '@/lib/format'

/**
 * Bandeau global affiché hors ligne : rappelle que les données peuvent dater
 * et indique le nombre de mises à jour de lits en attente de synchro.
 */
export function OfflineBanner() {
  const online = useOnline()
  const pending = usePendingBedIds()
  const [since, setSince] = useState<Date | null>(null)
  const wasOnline = useRef(online)

  useEffect(() => {
    if (wasOnline.current && !online) setSince(new Date())
    if (online) setSince(null)
    wasOnline.current = online
  }, [online])

  if (online) return null

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-triage px-4 py-2 text-center text-[13px] font-medium text-white"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
      <span>
        Hors ligne{since ? ` — dernières données à ${hour(since)}` : ''}.
        {pending.size > 0 && ` ${pending.size} mise${pending.size > 1 ? 's' : ''} à jour en attente de synchronisation.`}
      </span>
    </div>
  )
}
