import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import type { NavItem } from './navConfig'

/** Barre d'onglets inférieure (mobile) pour les pages clés du médecin. */
export function MobileTabBar({ tabs }: { tabs: NavItem[] }) {
  if (tabs.length <= 1) return null
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden dark:border-garde-bord dark:bg-garde-surface/95">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition',
                isActive ? 'text-bloc dark:text-bloc-clair' : 'text-slate-400',
              )
            }
          >
            <Icon className="h-5 w-5" aria-hidden />
            {tab.label}
          </NavLink>
        )
      })}
    </nav>
  )
}
