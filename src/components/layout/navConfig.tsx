import {
  LayoutDashboard,
  Bell,
  BedDouble,
  Map,
  ArrowRightLeft,
  Inbox,
  Wrench,
  ChartColumn,
  Building2,
  Users,
  FileClock,
  Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { UserRole } from '@/types/db'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

/** Navigation par rôle — chaque entrée pointe vers une page réelle et complète. */
export const NAV_BY_ROLE: Record<UserRole, NavSection[]> = {
  medecin: [
    {
      items: [
        { label: 'Tableau de bord', to: '/app', icon: LayoutDashboard, end: true },
        { label: 'Carte des lits', to: '/app/carte', icon: Map },
        { label: 'Transferts entrants', to: '/app/entrants', icon: Inbox },
        { label: 'Mes transferts', to: '/app/transferts', icon: ArrowRightLeft },
        { label: 'Lits de mon service', to: '/app/lits', icon: BedDouble },
        { label: 'Notifications', to: '/app/notifications', icon: Bell },
      ],
    },
  ],
  admin_hopital: [
    {
      title: 'Opérations',
      items: [
        { label: 'Tableau de bord', to: '/admin', icon: LayoutDashboard, end: true },
        { label: 'Carte des lits', to: '/app/carte', icon: Map },
        { label: 'Transferts entrants', to: '/app/entrants', icon: Inbox },
        { label: 'Transferts', to: '/admin/transferts', icon: ArrowRightLeft },
        { label: 'Notifications', to: '/app/notifications', icon: Bell },
      ],
    },
    {
      title: 'Gestion',
      items: [
        { label: 'Gestion des lits', to: '/admin/lits', icon: BedDouble },
        { label: 'Services & équipements', to: '/admin/services', icon: Wrench },
        { label: 'Personnel', to: '/admin/personnel', icon: Users },
        { label: 'Statistiques', to: '/admin/stats', icon: ChartColumn },
        { label: 'Paramètres', to: '/admin/parametres', icon: Settings },
      ],
    },
  ],
  admin_regional: [
    {
      items: [
        { label: 'Tableau de bord', to: '/region', icon: LayoutDashboard, end: true },
        { label: 'Établissements', to: '/region/etablissements', icon: Building2 },
        { label: 'Transferts', to: '/region/transferts', icon: ArrowRightLeft },
        { label: 'Statistiques', to: '/region/stats', icon: ChartColumn },
      ],
    },
  ],
  super_admin: [
    {
      title: 'Supervision',
      items: [
        { label: 'Tableau de bord', to: '/national', icon: LayoutDashboard, end: true },
        { label: 'Carte nationale', to: '/national/carte', icon: Map },
        { label: 'Tous les transferts', to: '/national/transferts', icon: ArrowRightLeft },
        { label: 'Statistiques', to: '/national/stats', icon: ChartColumn },
        { label: "Journal d'audit", to: '/national/audit', icon: FileClock },
      ],
    },
    {
      title: 'Administration',
      items: [
        { label: 'Établissements', to: '/national/etablissements', icon: Building2 },
        { label: 'Utilisateurs', to: '/national/utilisateurs', icon: Users },
        { label: 'Régions', to: '/national/regions', icon: Map },
        { label: 'Paramètres', to: '/national/parametres', icon: Settings },
      ],
    },
  ],
}

export const MOBILE_TABS: Record<UserRole, NavItem[]> = {
  medecin: [
    { label: 'Accueil', to: '/app', icon: LayoutDashboard, end: true },
    { label: 'Carte', to: '/app/carte', icon: Map },
    { label: 'Transferts', to: '/app/transferts', icon: ArrowRightLeft },
    { label: 'Lits', to: '/app/lits', icon: BedDouble },
  ],
  admin_hopital: [
    { label: 'Accueil', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Carte', to: '/app/carte', icon: Map },
    { label: 'Transferts', to: '/admin/transferts', icon: ArrowRightLeft },
    { label: 'Lits', to: '/admin/lits', icon: BedDouble },
  ],
  admin_regional: [
    { label: 'Accueil', to: '/region', icon: LayoutDashboard, end: true },
    { label: 'Transferts', to: '/region/transferts', icon: ArrowRightLeft },
    { label: 'Stats', to: '/region/stats', icon: ChartColumn },
  ],
  super_admin: [
    { label: 'Accueil', to: '/national', icon: LayoutDashboard, end: true },
    { label: 'Carte', to: '/national/carte', icon: Map },
    { label: 'Transferts', to: '/national/transferts', icon: ArrowRightLeft },
  ],
}

export const ROLES_WITH_NOTIFICATIONS: UserRole[] = ['medecin', 'admin_hopital']
