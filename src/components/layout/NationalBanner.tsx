import { Megaphone } from 'lucide-react'
import { useSettings } from '@/features/settings/api'

/** Bandeau d'information national, affiché à tous les utilisateurs si non vide. */
export function NationalBanner() {
  const { data } = useSettings()
  const text = data?.national_banner?.trim()
  if (!text) return null
  return (
    <div className="flex items-center justify-center gap-2 bg-bloc px-4 py-2 text-center text-[13px] font-medium text-white">
      <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
      <span>{text}</span>
    </div>
  )
}
