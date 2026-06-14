import { NavLink } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Logo, LogoMark } from '@/components/brand/Logo'
import type { NavSection } from './navConfig'

interface SidebarProps {
  sections: NavSection[]
  collapsed: boolean
  onToggleCollapse: () => void
  /** Ferme le tiroir mobile au clic sur un lien. */
  onNavigate?: () => void
}

export function Sidebar({ sections, collapsed, onToggleCollapse, onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full flex-col bg-white dark:bg-garde-surface">
      <div className={cn('flex h-16 items-center border-b border-slate-100 dark:border-garde-bord', collapsed ? 'justify-center px-2' : 'justify-between px-4')}>
        {collapsed ? <LogoMark className="h-9 w-9" /> : <Logo />}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            'hidden rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 lg:inline-flex dark:hover:bg-white/5',
            collapsed && 'absolute',
          )}
          aria-label={collapsed ? 'Déplier le menu' : 'Replier le menu'}
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} aria-hidden />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {sections.map((section, i) => (
          <div key={i}>
            {section.title && !collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {section.title}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        cn(
                          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                          collapsed && 'justify-center',
                          isActive
                            ? 'bg-bloc/8 text-bloc dark:bg-bloc-clair/12 dark:text-bloc-clair'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-bloc dark:bg-bloc-clair" aria-hidden />
                          )}
                          <Icon className="h-5 w-5 shrink-0" aria-hidden />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="border-t border-slate-100 px-4 py-3 dark:border-garde-bord">
          <p className="text-[11px] leading-relaxed text-slate-400">
            Coordination inter-hospitalière
            <br />
            Prototype de démonstration
          </p>
        </div>
      )}
    </div>
  )
}
