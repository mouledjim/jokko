import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import { useSettings, useUpdateSettings } from '@/features/settings/api'

export default function NationalSettingsPage() {
  const settings = useSettings()
  const update = useUpdateSettings()
  const [threshold, setThreshold] = useState(85)
  const [banner, setBanner] = useState('')

  useEffect(() => {
    if (settings.data) {
      setThreshold(settings.data.tension_threshold)
      setBanner(settings.data.national_banner)
    }
  }, [settings.data])

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Paramètres de la plateforme" subtitle="Seuils d'alerte et communication nationale" />

      {settings.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Seuil de tension" subtitle="Taux d'occupation au-delà duquel un établissement est signalé « en tension »" />
            <CardBody className="pt-2">
              <div className="flex items-center gap-4">
                <input type="range" min={50} max={100} step={1} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="flex-1 accent-bloc" aria-label="Seuil de tension" />
                <span className="w-16 text-right font-display text-xl font-semibold tabular-nums text-bloc">{threshold}%</span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Bandeau d'information national" subtitle="Affiché en haut de l'écran de tous les utilisateurs si non vide" />
            <CardBody className="pt-2">
              <Textarea value={banner} onChange={(e) => setBanner(e.target.value)} placeholder="Ex. Plan ORSEC activé — priorité aux urgences vitales jusqu'à nouvel ordre." maxLength={200} />
              <p className="mt-1.5 text-[12px] text-slate-400">{banner.length}/200 caractères · laisser vide pour masquer le bandeau</p>
            </CardBody>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => update.mutate({ tension_threshold: threshold, national_banner: banner })} loading={update.isPending}>
              Enregistrer les paramètres
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
