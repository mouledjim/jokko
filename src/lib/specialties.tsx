import {
  Activity,
  Siren,
  HeartPulse,
  Baby,
  HeartHandshake,
  Blocks,
  Heart,
  Cross,
  Bone,
  Stethoscope,
  Droplets,
  Scan,
  Radiation,
  Slice,
  Wind,
  Truck,
  FlaskConical,
  type LucideIcon,
} from 'lucide-react'
import type { EquipmentType } from '@/types/db'

const ICONS: Record<string, LucideIcon> = {
  siren: Siren,
  'heart-pulse': HeartPulse,
  baby: Baby,
  'heart-handshake': HeartHandshake,
  blocks: Blocks,
  heart: Heart,
  cross: Cross,
  bone: Bone,
  stethoscope: Stethoscope,
  droplets: Droplets,
}

export function specialtyIcon(iconKey: string): LucideIcon {
  return ICONS[iconKey] ?? Activity
}

const EQUIPMENT_ICONS: Record<EquipmentType, LucideIcon> = {
  scanner: Scan,
  irm: Radiation,
  bloc_operatoire: Slice,
  generateur_oxygene: Wind,
  ambulance: Truck,
  laboratoire: FlaskConical,
}

export function equipmentIcon(type: EquipmentType): LucideIcon {
  return EQUIPMENT_ICONS[type] ?? Activity
}

interface ColorSet {
  /** Pastille / point coloré. */
  dot: string
  /** Fond doux + texte pour les puces de spécialité. */
  chip: string
  /** Couleur de texte d'accent. */
  text: string
}

const COLORS: Record<string, ColorSet> = {
  rose: { dot: 'bg-rose-500', chip: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300', text: 'text-rose-600 dark:text-rose-400' },
  red: { dot: 'bg-red-500', chip: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300', text: 'text-red-600 dark:text-red-400' },
  pink: { dot: 'bg-pink-500', chip: 'bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-300', text: 'text-pink-600 dark:text-pink-400' },
  fuchsia: { dot: 'bg-fuchsia-500', chip: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300', text: 'text-fuchsia-600 dark:text-fuchsia-400' },
  amber: { dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300', text: 'text-amber-600 dark:text-amber-400' },
  orange: { dot: 'bg-orange-500', chip: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300', text: 'text-orange-600 dark:text-orange-400' },
  sky: { dot: 'bg-sky-500', chip: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300', text: 'text-sky-600 dark:text-sky-400' },
  indigo: { dot: 'bg-indigo-500', chip: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300', text: 'text-indigo-600 dark:text-indigo-400' },
  teal: { dot: 'bg-teal-500', chip: 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300', text: 'text-teal-600 dark:text-teal-400' },
  cyan: { dot: 'bg-cyan-500', chip: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300', text: 'text-cyan-600 dark:text-cyan-400' },
}

export function specialtyColors(colorKey: string): ColorSet {
  return COLORS[colorKey] ?? COLORS.teal
}
