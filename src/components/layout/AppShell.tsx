import { Suspense, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { useAuth } from '@/providers/AuthProvider'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { EcgLoader } from '@/components/brand/EcgLine'
import { useNotificationsRealtime } from '@/features/notifications/api'
import { useBedSyncRunner, useBedsRealtime } from '@/features/beds/api'
import { useTransfersRealtime } from '@/features/transfers/api'
import { OfflineBanner } from './OfflineBanner'
import { NationalBanner } from './NationalBanner'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileTabBar } from './MobileTabBar'
import { NAV_BY_ROLE, MOBILE_TABS } from './navConfig'

export function AppShell() {
  const { profile } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Effets temps réel et hors-ligne, montés une seule fois pour toute la session.
  useNotificationsRealtime()
  useBedsRealtime()
  useBedSyncRunner()
  useTransfersRealtime()

  if (!profile) return null
  const sections = NAV_BY_ROLE[profile.role]
  const tabs = MOBILE_TABS[profile.role]

  return (
    <div className="min-h-screen bg-gaze dark:bg-garde">
      {/* Sidebar fixe (desktop) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200 transition-[width] duration-200 lg:block dark:border-garde-bord',
          collapsed ? 'w-[76px]' : 'w-64',
        )}
      >
        <Sidebar sections={sections} collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
      </aside>

      {/* Tiroir mobile */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-garde/50 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              aria-hidden
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-72 border-r border-slate-200 shadow-xl dark:border-garde-bord"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
            >
              <Sidebar
                sections={sections}
                collapsed={false}
                onToggleCollapse={() => undefined}
                onNavigate={() => setDrawerOpen(false)}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Colonne principale */}
      <div className={cn('flex min-h-screen flex-col transition-[padding] duration-200', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
        <NationalBanner />
        <OfflineBanner />
        <Header onOpenMenu={() => setDrawerOpen(true)} />
        <main className="flex-1 px-4 py-6 pb-24 lg:px-8 lg:pb-8">
          <ErrorBoundary scope="Cette page">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="mx-auto w-full max-w-[1400px]"
              >
                <Suspense fallback={<EcgLoader />}>
                  <Outlet />
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        </main>
      </div>

      <MobileTabBar tabs={tabs} />
    </div>
  )
}
