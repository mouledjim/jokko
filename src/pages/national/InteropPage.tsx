import { useState } from 'react'
import { Copy, Check, RefreshCw, Webhook, ShieldCheck } from 'lucide-react'
import { useToast } from '@/providers/ToastProvider'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useFhirBundle, FHIR_ENDPOINT } from '@/features/fhir/api'

export default function InteropPage() {
  const toast = useToast()
  const { data, isLoading, isError, refetch, isFetching } = useFhirBundle()
  const [copied, setCopied] = useState(false)

  const bundle = data as { entry?: unknown[] } | undefined
  const json = data ? JSON.stringify(data, null, 2) : ''

  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text)
    setCopied(true)
    toast.success(label)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Interopérabilité — HL7 FHIR"
        subtitle="Exposez les disponibilités au DPU et à DHIS2 via une API standard"
        actions={
          <Button variant="secondary" size="sm" onClick={() => refetch()} loading={isFetching}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Rafraîchir
          </Button>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardHeader title="Point d'accès" subtitle="Bundle FHIR R4 de ressources Location avec disponibilité des lits" />
          <CardBody className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Badge tone="bloc">POST</Badge>
              <code className="min-w-0 flex-1 truncate rounded-lg bg-slate-50 px-3 py-2 font-mono text-[13px] text-slate-700 dark:bg-white/5 dark:text-slate-200">
                {FHIR_ENDPOINT}
              </code>
              <Button variant="ghost" size="sm" onClick={() => copy(FHIR_ENDPOINT, 'Adresse copiée')} aria-label="Copier l'adresse">
                {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              </Button>
            </div>
            <p className="flex items-start gap-2 text-[13px] text-slate-500 dark:text-slate-400">
              <Webhook className="mt-0.5 h-4 w-4 shrink-0 text-bloc-clair" aria-hidden />
              Réponse normalisée FHIR R4 — chaque établissement est une ressource <code className="font-mono">Location</code> avec
              sa position, son taux d'occupation et la disponibilité par service. Mise à jour en temps réel.
            </p>
            <p className="flex items-start gap-2 text-[13px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-bloc-clair" aria-hidden />
              Données d'agrégat non nominatives — aucune donnée patient n'est exposée (conformité CDP).
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Réponse en direct"
            subtitle={bundle?.entry ? `Bundle · ${bundle.entry.length} établissements` : 'Bundle FHIR'}
            action={
              json ? (
                <Button variant="ghost" size="sm" onClick={() => copy(json, 'Bundle copié')}>
                  <Copy className="h-4 w-4" aria-hidden />
                  Copier le JSON
                </Button>
              ) : undefined
            }
          />
          <CardBody className="pt-2">
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : isError ? (
              <ErrorState onRetry={() => refetch()} />
            ) : (
              <pre className="max-h-[480px] overflow-auto rounded-xl bg-garde p-4 font-mono text-[12px] leading-relaxed text-teal-100">
                {json}
              </pre>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
