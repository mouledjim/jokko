import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sun, Moon, KeyRound } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useTheme } from '@/providers/ThemeProvider'
import { useToast } from '@/providers/ToastProvider'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import { ROLE_LABEL } from '@/lib/roles'
import { initials } from '@/lib/format'

const pwSchema = z
  .object({
    password: z.string().min(8, 'Au moins 8 caractères.'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirm'],
  })
type PwValues = z.infer<typeof pwSchema>

export default function ProfilePage() {
  const { profile, facility } = useAuth()
  const { theme, setTheme } = useTheme()
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PwValues>({ resolver: zodResolver(pwSchema) })

  if (!profile) return null

  const onChangePassword = async (values: PwValues) => {
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: values.password })
    setSaving(false)
    if (error) {
      toast.error('Modification impossible', error.message)
      return
    }
    toast.success('Mot de passe modifié', 'Utilisez-le à votre prochaine connexion.')
    reset()
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Mon profil" subtitle="Vos informations et préférences" />

      <div className="space-y-6">
        {/* Identité */}
        <Card>
          <CardBody className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bloc text-xl font-bold text-white">
              {initials(profile.first_name, profile.last_name)}
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                {profile.first_name} {profile.last_name}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge tone="bloc">{ROLE_LABEL[profile.role]}</Badge>
                {facility && <span className="text-[13px] text-slate-500 dark:text-slate-400">{facility.name}</span>}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Coordonnées (lecture seule — gérées par l'administrateur) */}
        <Card>
          <CardHeader title="Coordonnées" subtitle="Modifiables par votre administrateur" />
          <CardBody className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
            <Field label="Prénom" value={profile.first_name} />
            <Field label="Nom" value={profile.last_name} />
            <Field label="Téléphone" value={profile.phone || '—'} />
            <Field label="Rôle" value={ROLE_LABEL[profile.role]} />
          </CardBody>
        </Card>

        {/* Thème */}
        <Card>
          <CardHeader title="Apparence" subtitle="Le mode Garde est pensé pour les gardes de nuit" />
          <CardBody className="flex gap-3 pt-2">
            <ThemeOption active={theme === 'clair'} onClick={() => setTheme('clair')} icon={<Sun className="h-5 w-5" />} label="Clair" />
            <ThemeOption active={theme === 'garde'} onClick={() => setTheme('garde')} icon={<Moon className="h-5 w-5" />} label="Mode Garde" />
          </CardBody>
        </Card>

        {/* Mot de passe */}
        <Card>
          <CardHeader title="Sécurité" subtitle="Changer votre mot de passe" />
          <CardBody className="pt-2">
            <form onSubmit={handleSubmit(onChangePassword)} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
              <Input label="Nouveau mot de passe" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
              <Input label="Confirmer" type="password" autoComplete="new-password" error={errors.confirm?.message} {...register('confirm')} />
              <div className="sm:col-span-2">
                <Button type="submit" loading={saving}>
                  <KeyRound className="h-4 w-4" aria-hidden />
                  Mettre à jour le mot de passe
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  )
}

function ThemeOption({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ' +
        (active
          ? 'border-bloc bg-bloc/5 text-bloc dark:border-bloc-clair dark:bg-bloc-clair/10 dark:text-bloc-clair'
          : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-garde-bord dark:text-slate-300 dark:hover:bg-white/5')
      }
      aria-pressed={active}
    >
      <span className={active ? 'text-bloc dark:text-bloc-clair' : 'text-slate-400'}>{icon}</span>
      {label}
    </button>
  )
}
