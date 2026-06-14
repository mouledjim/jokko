import { formatDistanceToNow, format, differenceInSeconds } from 'date-fns'
import { fr } from 'date-fns/locale'

/** « il y a 4 minutes » */
export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: fr })
}

/** Date absolue lisible : « 13 juin 2026 à 14:32 » */
export function dateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, "d MMMM yyyy 'à' HH:mm", { locale: fr })
}

/** Date courte : « 13/06/2026 » */
export function dateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy', { locale: fr })
}

/** Heure : « 14:32 » */
export function hour(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'HH:mm', { locale: fr })
}

/**
 * Durée écoulée lisible depuis une date, pour les chronos qui tournent.
 * Ex : « 7 min », « 2 h 14 », « 32 s ».
 */
export function elapsed(from: string | Date, to: Date = new Date()): string {
  const start = typeof from === 'string' ? new Date(from) : from
  const total = Math.max(0, differenceInSeconds(to, start))
  if (total < 60) return `${total} s`
  const minutes = Math.floor(total / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rem = minutes % 60
  return rem === 0 ? `${hours} h` : `${hours} h ${String(rem).padStart(2, '0')}`
}

/** Durée à partir d'un nombre de secondes : « 2 min 42 s », « 1 h 12 ». */
export function formatDelay(seconds: number | null | undefined): string {
  if (seconds == null) return '—'
  if (seconds < 60) return `${seconds} s`
  const minutes = Math.floor(seconds / 60)
  const s = seconds % 60
  if (minutes < 60) return s === 0 ? `${minutes} min` : `${minutes} min ${s} s`
  const hours = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${hours} h` : `${hours} h ${String(m).padStart(2, '0')}`
}

/** Fraîcheur des données : true si la dernière mise à jour remonte à plus de 6 h. */
export function isStale(date: string | Date | null | undefined, hours = 6): boolean {
  if (!date) return true
  const d = typeof date === 'string' ? new Date(date) : date
  return Date.now() - d.getTime() > hours * 3600_000
}

export function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
}
