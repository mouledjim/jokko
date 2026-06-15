import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ArrowRight, Info, ShieldCheck } from 'lucide-react'
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
  { email: 'superadmin@jokkosante.sn', label: 'Super admin · MSAS' },
  { email: 'admin.principal@jokkosante.sn', label: 'Admin · Hôpital Principal' },
  { email: 'medecin.pikine@jokkosante.sn', label: 'Médecin · Pikine (écran A)' },
  { email: 'medecin.principal@jokkosante.sn', label: 'Médecin · H. Principal (écran B)' },
  { email: 'region.dakar@jokkosante.sn', label: 'Admin régional · Dakar' },
]
const DEMO_PASSWORD = 'Jokko2026!'

export default function LoginPage() {
  const { session, profile, signIn } = useAuth()
  const location = useLocation()
  const reason = (location.state as { reason?: string } | null)?.reason
  const [formError, setFormError] = useState<string | null>(null)
  const [showDemo, setShowDemo] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

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

  return (
    <div className="flex min-h-screen bg-white text-slate-800">
      {/* Colonne formulaire */}
      <div className="flex w-full flex-col px-6 py-8 sm:px-10 lg:w-[46%] lg:px-16">
        <Link to="/" className="inline-flex">
          <Logo textClassName="text-slate-900" />
        </Link>

        <div className="flex flex-1 flex-col justify-center py-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mx-auto w-full max-w-sm">
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">Connexion</h1>
            <p className="mt-2 text-sm text-slate-500">Accédez à votre espace de coordination des transferts.</p>

            {reason && (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-amber-50 px-3.5 py-3 text-[13px] text-amber-700">
                <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{reason}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
              <Input label="Email professionnel" type="email" autoComplete="email" placeholder="prenom.nom@jokkosante.sn" error={errors.email?.message} {...register('email')} />
              <Input label="Mot de passe" type="password" autoComplete="current-password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />

              {formError && (
                <div role="alert" className="rounded-xl bg-rose-50 px-3.5 py-3 text-[13px] font-medium text-rose-700">{formError}</div>
              )}

              <Button type="submit" block size="lg" loading={isSubmitting} className="bg-rose-600 hover:bg-rose-700">
                Se connecter
                {!isSubmitting && <ArrowRight className="h-4 w-4" aria-hidden />}
              </Button>
            </form>

            <p className="mt-5 text-center text-[13px] text-slate-400">Les comptes sont créés par les administrateurs. Pas d'inscription publique.</p>

            {/* Comptes de démonstration */}
            <div className="mt-6 rounded-xl border border-rose-100">
              <button type="button" onClick={() => setShowDemo((s) => !s)} className="flex w-full items-center justify-between px-4 py-3 text-[13px] font-semibold text-slate-600" aria-expanded={showDemo}>
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-rose-500" aria-hidden /> Comptes de démonstration</span>
                <span className="text-slate-400">{showDemo ? '–' : '+'}</span>
              </button>
              {showDemo && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden border-t border-rose-100">
                  <ul className="divide-y divide-rose-50">
                    {DEMO_ACCOUNTS.map((a) => (
                      <li key={a.email} className="flex items-center justify-between gap-3 px-4 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-slate-700">{a.label}</p>
                          <p className="truncate text-[11px] text-slate-400">{a.email}</p>
                        </div>
                        <Button type="button" variant="secondary" size="sm" onClick={() => fillDemo(a.email)} className="border-rose-200 text-rose-600 hover:bg-rose-50">Remplir</Button>
                      </li>
                    ))}
                  </ul>
                  <p className="px-4 py-2.5 text-[11px] text-slate-400">Mot de passe commun : <span className="font-semibold text-slate-600">{DEMO_PASSWORD}</span></p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        <p className="text-center text-[11px] text-slate-400 lg:text-left">Données patient minimales et anonymisées — conforme aux exigences de la CDP.</p>
      </div>

      <LoginAside />
    </div>
  )
}
