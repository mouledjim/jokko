import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ArrowRight, Info, ShieldCheck, Sparkles } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { roleHome } from '@/lib/roles'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { LoginAside } from './LoginAside'

const schema = z.object({
  email: z.string().min(1, 'Veuillez saisir votre email.').email('Adresse email invalide.'),
  password: z.string().min(1, 'Veuillez saisir votre mot de passe.'),
})
type FormValues = z.infer<typeof schema>

const DEMO_ACCOUNTS = [
  { roleKey: 'super_admin', email: 'superadmin@jokkosante.sn', label: 'Super admin · Ministère (MSAS)', color: 'bg-purple-100 text-purple-800' },
  { roleKey: 'admin_hopital', email: 'admin.principal@jokkosante.sn', label: 'Admin · Hôpital Principal', color: 'bg-blue-100 text-blue-800' },
  { roleKey: 'medecin', email: 'medecin.pikine@jokkosante.sn', label: 'Médecin · Hôpital de Pikine', color: 'bg-rose-100 text-rose-800' },
  { roleKey: 'medecin_second', email: 'medecin.principal@jokkosante.sn', label: 'Médecin · H. Principal (Réa)', color: 'bg-rose-100 text-rose-800' },
  { roleKey: 'admin_regional', email: 'region.dakar@jokkosante.sn', label: 'Admin régional · Dakar', color: 'bg-emerald-100 text-emerald-800' },
]
const DEMO_PASSWORD = 'Jokko2026!'

const ROLE_TITLES: Record<string, { title: string; desc: string }> = {
  medecin: {
    title: 'Espace Médecin & Soignant',
    desc: 'Accédez à la gestion des lits de votre service et aux transferts en temps réel.',
  },
  admin_hopital: {
    title: 'Espace Direction d’Hôpital',
    desc: 'Supervisez les services, les équipements et le personnel de votre établissement.',
  },
  admin_regional: {
    title: 'Espace Administrateur Régional',
    desc: 'Visualisez la disponibilité et les tensions dans tous les hôpitaux de votre région.',
  },
  super_admin: {
    title: 'Espace National · Ministère MSAS',
    desc: 'Supervision nationale, interopérabilité FHIR et journal d’audit centralisé.',
  },
}

export default function LoginPage() {
  const { session, profile, signIn } = useAuth()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  
  const pathRole =
    location.pathname === '/medecin'
      ? 'medecin'
      : location.pathname === '/admin-hopital'
        ? 'admin_hopital'
        : location.pathname === '/admin-regional'
          ? 'admin_regional'
          : location.pathname === '/msas'
            ? 'super_admin'
            : null

  const effectiveRole = searchParams.get('role') || pathRole

  const reason = (location.state as { reason?: string } | null)?.reason
  const [formError, setFormError] = useState<string | null>(null)
  const [showDemo, setShowDemo] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (effectiveRole) {
      const match = DEMO_ACCOUNTS.find((a) => a.roleKey === effectiveRole)
      if (match) {
        setValue('email', match.email, { shouldValidate: true })
        setValue('password', DEMO_PASSWORD, { shouldValidate: true })
      }
    }
  }, [effectiveRole, setValue])

  if (session && profile) {
    return <Navigate to={roleHome(profile.role)} replace />
  }

  const onSubmit = async (values: FormValues) => {
    setFormError(null)
    const { error } = await signIn(values.email, values.password)
    if (error) setFormError(error)
  }

  const fillDemo = (email: string) => {
    setValue('email', email, { shouldValidate: true })
    setValue('password', DEMO_PASSWORD, { shouldValidate: true })
    setFormError(null)
  }

  const roleInfo = effectiveRole && ROLE_TITLES[effectiveRole] ? ROLE_TITLES[effectiveRole] : null

  return (
    <div className="flex min-h-screen bg-white text-slate-800">
      {/* Colonne formulaire */}
      <div className="flex w-full flex-col px-6 py-8 sm:px-10 lg:w-[46%] lg:px-16">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex">
            <Logo textClassName="text-slate-900" />
          </Link>
          <Link
            to="/portail"
            className="text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            Tous les portails →
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-sm"
          >
            {roleInfo && (
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700">
                <Sparkles className="h-3 w-3 text-rose-600" />
                {roleInfo.title}
              </div>
            )}

            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
              Connexion
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {roleInfo ? roleInfo.desc : 'Accédez à votre espace de coordination hospitalière.'}
            </p>

            {reason && (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-amber-50 px-3.5 py-3 text-[13px] text-amber-700">
                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{reason}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
              <Input
                label="Email professionnel"
                type="email"
                autoComplete="email"
                placeholder="prenom.nom@jokkosante.sn"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Mot de passe"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />

              {formError && (
                <div
                  role="alert"
                  className="rounded-xl bg-rose-50 px-3.5 py-3 text-[13px] font-medium text-rose-700"
                >
                  {formError}
                </div>
              )}

              <Button
                type="submit"
                block
                size="lg"
                loading={isSubmitting}
                className="bg-rose-600 hover:bg-rose-700"
              >
                Se connecter
                {!isSubmitting && <ArrowRight className="h-4 w-4" aria-hidden />}
              </Button>
            </form>

            <p className="mt-4 text-center text-[12px] text-slate-400">
              Les comptes soignants sont gérés par les administrateurs d'hôpitaux.
            </p>

            {/* Comptes de démonstration avec pré-remplissage 1-clic */}
            <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50/20 p-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <ShieldCheck className="h-4 w-4 text-rose-600" />
                  Sélection rapide de profil (Démo)
                </span>
                <button
                  type="button"
                  onClick={() => setShowDemo((s) => !s)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  {showDemo ? 'Réduire' : 'Afficher'}
                </button>
              </div>

              {showDemo && (
                <div className="mt-3 space-y-2">
                  {DEMO_ACCOUNTS.map((a) => (
                    <div
                      key={a.email}
                      className="flex items-center justify-between gap-2 rounded-xl border border-rose-100 bg-white p-2.5 shadow-2xs hover:border-rose-300 transition"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-800">{a.label}</p>
                        <p className="truncate text-[10.5px] text-slate-400 font-mono">{a.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fillDemo(a.email)}
                        className="rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition shrink-0"
                      >
                        Remplir
                      </button>
                    </div>
                  ))}
                  <p className="pt-1 text-center text-[10.5px] text-slate-400">
                    Mot de passe universel démo : <span className="font-bold text-slate-700">{DEMO_PASSWORD}</span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <p className="text-center text-[11px] text-slate-400 lg:text-left">
          Plateforme nationale sécurisée · Données anonymisées (Conformité CDP).
        </p>
      </div>

      <LoginAside />
    </div>
  )
}
