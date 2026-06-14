import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { roleHome } from '@/lib/roles'
import { Logo } from '@/components/brand/Logo'

export default function NotFoundPage() {
  const { profile } = useAuth()
  const home = profile ? roleHome(profile.role) : '/login'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gaze px-6 text-center dark:bg-garde">
      <Logo className="mb-10" textClassName="text-slate-900 dark:text-white" />

      <svg viewBox="0 0 320 120" className="w-full max-w-sm" role="img" aria-label="Tracé plat">
        <text
          x="160"
          y="78"
          textAnchor="middle"
          className="fill-slate-200 font-display text-[88px] font-bold dark:fill-white/10"
        >
          404
        </text>
        <path
          d="M0 70h120l8-26 12 52 9-40 6 18 7-10h141"
          fill="none"
          stroke="#14B8A6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={320}
          strokeDasharray={320}
          className="animate-ecg-draw"
        />
      </svg>

      <h1 className="mt-8 font-display text-2xl font-semibold text-slate-900 dark:text-white">
        Page introuvable
      </h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        La page que vous cherchez n'existe pas ou a été déplacée. Vérifiez l'adresse ou revenez à
        votre espace.
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
