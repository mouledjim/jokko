import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { roleHome, ROLE_LABEL } from '@/lib/roles'

export default function AccessDeniedPage() {
  const { profile } = useAuth()
  const home = profile ? roleHome(profile.role) : '/login'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gaze px-6 text-center dark:bg-garde">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-triage/10 text-triage">
        <ShieldAlert className="h-8 w-8" aria-hidden />
      </div>
      <h1 className="mt-6 font-display text-2xl font-semibold text-slate-900 dark:text-white">
        Accès réservé
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        Cette page n'est pas accessible avec votre profil
        {profile && <> «&nbsp;{ROLE_LABEL[profile.role]}&nbsp;»</>}. Chaque espace est réservé à un
        rôle précis pour garantir la confidentialité et la traçabilité des données.
      </p>
      <Link
        to={home}
        className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-bloc px-5 text-sm font-semibold text-white transition hover:bg-bloc-fonce focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bloc-clair"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Revenir à mon espace
      </Link>
    </div>
  )
}
