import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Bell, Sun, Moon, LogOut, User, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/providers/AuthProvider'
import { useTheme } from '@/providers/ThemeProvider'
import { useToast } from '@/providers/ToastProvider'
import { ROLE_BADGE, ROLE_BASE } from '@/lib/roles'
import { initials } from '@/lib/format'
import { useUnreadCount } from '@/features/notifications/api'
import { ROLES_WITH_NOTIFICATIONS } from './navConfig'

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { profile, facility, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const toast = useToast()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  if (!profile) return null
  const base = ROLE_BASE[profile.role]
  const hasNotifications = ROLES_WITH_NOTIFICATIONS.includes(profile.role)

  const handleSignOut = async () => {
    await signOut()
    toast.success('Déconnexion réussie', 'À bientôt.')
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md lg:px-6 dark:border-garde-bord dark:bg-garde-surface/80">
      <button
        type="button"
        onClick={onOpenMenu}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden dark:hover:bg-white/5"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      <div className="min-w-0 flex-1">
        {facility && (
          <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">{facility.name}</p>
        )}
      </div>

      {/* Indicateur temps réel */}
      <span className="hidden items-center gap-1.5 rounded-full bg-constante/10 px-2.5 py-1 text-[11px] font-semibold text-constante sm:inline-flex">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-constante opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-constante" />
        </span>
        Temps réel
      </span>

      <button
        type="button"
        onClick={toggle}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-white/5"
        aria-label={theme === 'garde' ? 'Activer le mode clair' : 'Activer le mode Garde (sombre)'}
      >
        {theme === 'garde' ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
      </button>

      {hasNotifications && <NotificationBell to="/app/notifications" />}

      {/* Menu profil */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-xl py-1 pr-2 pl-1 transition hover:bg-slate-100 dark:hover:bg-white/5"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bloc text-xs font-bold text-white">
            {initials(profile.first_name, profile.last_name)}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-[13px] leading-tight font-semibold text-slate-800 dark:text-slate-100">
              {profile.first_name} {profile.last_name}
            </span>
            <span className="block text-[11px] leading-tight text-slate-400">{ROLE_BADGE[profile.role]}</span>
          </span>
          <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" aria-hidden />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-[var(--shadow-card-hover)] dark:border-garde-bord dark:bg-garde-surface"
          >
            <div className="border-b border-slate-100 px-4 py-2.5 dark:border-garde-bord">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {profile.first_name} {profile.last_name}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{ROLE_BADGE[profile.role]}</p>
            </div>
            <Link
              to={`${base}/profil`}
              onClick={() => setMenuOpen(false)}
              role="menuitem"
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
            >
              <User className="h-4 w-4" aria-hidden />
              Mon profil
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-vital transition hover:bg-vital/5"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

function NotificationBell({ to }: { to: string }) {
  const count = useUnreadCount()
  return (
    <Link
      to={to}
      className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-white/5"
      aria-label={count > 0 ? `Notifications, ${count} non lues` : 'Notifications'}
    >
      <Bell className="h-5 w-5" aria-hidden />
      {count > 0 && (
        <span
          className={cn(
            'absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-vital px-1 text-[10px] font-bold text-white',
          )}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
