import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { RequireAuth } from './RequireAuth'
import { RequireRole } from './RequireRole'
import { AppShell } from '@/components/layout/AppShell'
import { EcgLoader } from '@/components/brand/EcgLine'

// Pages publiques et pages d'espace, chargées à la demande (code splitting).
const LandingPage = lazy(() => import('@/pages/public/LandingPage'))
const LoginPage = lazy(() => import('@/pages/public/LoginPage'))
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'))
const AccessDeniedPage = lazy(() => import('@/pages/public/AccessDeniedPage'))

const MedecinDashboard = lazy(() => import('@/pages/medecin/MedecinDashboard'))
const MapPage = lazy(() => import('@/pages/medecin/MapPage'))
const MyBedsPage = lazy(() => import('@/pages/medecin/MyBedsPage'))
const NewTransferPage = lazy(() => import('@/pages/medecin/NewTransferPage'))
const MyTransfersPage = lazy(() => import('@/pages/medecin/MyTransfersPage'))
const TransferDetailPage = lazy(() => import('@/pages/medecin/TransferDetailPage'))
const IncomingTransfersPage = lazy(() => import('@/pages/medecin/IncomingTransfersPage'))
const NotificationsPage = lazy(() => import('@/pages/medecin/NotificationsPage'))
const ProfilePage = lazy(() => import('@/pages/shared/ProfilePage'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminBedsPage = lazy(() => import('@/pages/admin/AdminBedsPage'))
const AdminServicesPage = lazy(() => import('@/pages/admin/AdminServicesPage'))
const AdminStatsPage = lazy(() => import('@/pages/admin/AdminStatsPage'))
const AdminTransfersPage = lazy(() => import('@/pages/admin/AdminTransfersPage'))
const AdminPersonnelPage = lazy(() => import('@/pages/admin/AdminPersonnelPage'))
const AdminParametresPage = lazy(() => import('@/pages/admin/AdminParametresPage'))
const RegionDashboard = lazy(() => import('@/pages/region/RegionDashboard'))
const RegionFacilitiesPage = lazy(() => import('@/pages/region/RegionFacilitiesPage'))
const RegionTransfersPage = lazy(() => import('@/pages/region/RegionTransfersPage'))
const RegionStatsPage = lazy(() => import('@/pages/region/RegionStatsPage'))
const NationalDashboard = lazy(() => import('@/pages/national/NationalDashboard'))
const NationalMapPage = lazy(() => import('@/pages/national/NationalMapPage'))
const NationalStatsPage = lazy(() => import('@/pages/national/NationalStatsPage'))
const NationalTransfersPage = lazy(() => import('@/pages/national/NationalTransfersPage'))
const NationalFacilitiesPage = lazy(() => import('@/pages/national/NationalFacilitiesPage'))
const NationalUsersPage = lazy(() => import('@/pages/national/NationalUsersPage'))
const NationalRegionsPage = lazy(() => import('@/pages/national/NationalRegionsPage'))
const AuditPage = lazy(() => import('@/pages/national/AuditPage'))
const InteropPage = lazy(() => import('@/pages/national/InteropPage'))
const NationalSettingsPage = lazy(() => import('@/pages/national/NationalSettingsPage'))

function PublicSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gaze dark:bg-garde">
          <EcgLoader />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<PublicSuspense><LandingPage /></PublicSuspense>} />
      <Route path="/login" element={<PublicSuspense><LoginPage /></PublicSuspense>} />
      <Route path="/acces-refuse" element={<PublicSuspense><AccessDeniedPage /></PublicSuspense>} />

      <Route element={<RequireAuth />}>
        {/* Espace médecin (et admin hôpital pour les pages opérationnelles partagées) */}
        <Route element={<RequireRole allow={['medecin', 'admin_hopital']} />}>
          <Route path="/app" element={<AppShell />}>
            <Route index element={<MedecinDashboard />} />
            <Route path="carte" element={<MapPage />} />
            <Route path="entrants" element={<IncomingTransfersPage />} />
            <Route path="transferts" element={<MyTransfersPage />} />
            <Route path="transferts/nouveau" element={<NewTransferPage />} />
            <Route path="transferts/:id" element={<TransferDetailPage />} />
            <Route path="lits" element={<MyBedsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profil" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Espace admin hôpital */}
        <Route element={<RequireRole allow={['admin_hopital']} />}>
          <Route path="/admin" element={<AppShell />}>
            <Route index element={<AdminDashboard />} />
            <Route path="lits" element={<AdminBedsPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="transferts" element={<AdminTransfersPage />} />
            <Route path="personnel" element={<AdminPersonnelPage />} />
            <Route path="stats" element={<AdminStatsPage />} />
            <Route path="parametres" element={<AdminParametresPage />} />
            <Route path="profil" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Espace admin régional */}
        <Route element={<RequireRole allow={['admin_regional']} />}>
          <Route path="/region" element={<AppShell />}>
            <Route index element={<RegionDashboard />} />
            <Route path="etablissements" element={<RegionFacilitiesPage />} />
            <Route path="transferts" element={<RegionTransfersPage />} />
            <Route path="transferts/:id" element={<TransferDetailPage />} />
            <Route path="stats" element={<RegionStatsPage />} />
            <Route path="profil" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Espace national (MSAS) */}
        <Route element={<RequireRole allow={['super_admin']} />}>
          <Route path="/national" element={<AppShell />}>
            <Route index element={<NationalDashboard />} />
            <Route path="carte" element={<NationalMapPage />} />
            <Route path="transferts" element={<NationalTransfersPage />} />
            <Route path="transferts/:id" element={<TransferDetailPage />} />
            <Route path="stats" element={<NationalStatsPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="etablissements" element={<NationalFacilitiesPage />} />
            <Route path="utilisateurs" element={<NationalUsersPage />} />
            <Route path="regions" element={<NationalRegionsPage />} />
            <Route path="interop" element={<InteropPage />} />
            <Route path="parametres" element={<NationalSettingsPage />} />
            <Route path="profil" element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<PublicSuspense><NotFoundPage /></PublicSuspense>} />
    </Routes>
  )
}
