import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { EcgLoader } from '@/components/brand/EcgLine'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

/** Protège l'accès : redirige vers /login si non authentifié. */
export function RequireAuth() {
  const { session, profile, loading, profileError } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gaze dark:bg-garde">
        <EcgLoader label="Connexion à Jokko Santé…" />
      </div>
    )
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, reason: 'Votre session a expiré. Veuillez vous reconnecter.' }}
      />
    )
  }

  // Compte authentifié mais sans profil métier (ou désactivé).
  if (profileError || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-gaze p-6 text-center dark:bg-garde">
        <div>
          <h1 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-100">
            Compte non rattaché
          </h1>
          <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Votre compte n'est associé à aucun profil actif. Contactez votre administrateur pour
            l'activation.
          </p>
        </div>
        <Button variant="secondary" onClick={() => supabase.auth.signOut()}>
          Revenir à la connexion
        </Button>
      </div>
    )
  }

  return <Outlet />
}
