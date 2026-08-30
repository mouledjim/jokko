import { useState } from 'react'
import {
  Droplet,
  Radio,
  Users,
  CheckCircle,
  RefreshCw,
  Sparkles,
  Clock,
  Check,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useBloodStore } from '@/features/blood/bloodStore'
import { BloodStockGrid } from '@/components/blood/BloodStockGrid'
import { CreateBloodAlertModal } from '@/components/blood/CreateBloodAlertModal'
import type { BloodGroup } from '@/types/blood'

export default function BloodUrgencyPage() {
  const { facility } = useAuth()
  const {
    stocks,
    alerts,
    commitments,
    updateStock,
    createAlert,
    fulfillAlert,
    completeDonation,
    simulateDonorEnRoute,
    resetDemoData,
  } = useBloodStore()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedGroupForAlert, setSelectedGroupForAlert] = useState<BloodGroup>('O-')

  const facilityName = facility?.name || 'Hôpital Principal de Dakar'

  const facilityAlerts = alerts.filter((a) => a.status === 'active')
  const facilityCommitments = commitments.filter((c) => c.status === 'en_route')

  const handleOpenAlertForGroup = (group: BloodGroup) => {
    setSelectedGroupForAlert(group)
    setIsCreateOpen(true)
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
              <Droplet className="h-5 w-5" />
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Banque de Sang & Urgences Transfusionnelles
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Gestion des stocks en temps réel et mobilisation citoyenne instantanée pour {facilityName}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedGroupForAlert('O-')
              setIsCreateOpen(true)
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700"
          >
            <Radio className="h-4 w-4 animate-pulse" />
            Lancer un Appel d'Urgence
          </button>
        </div>
      </div>

      {/* Bar d'outils de démo pour le Jury */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50/70 p-4 dark:border-red-900/40 dark:bg-red-950/20">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-red-900 dark:text-red-200">
              Scénario Démo Jury (Temps Réel)
            </p>
            <p className="text-[11px] text-red-700/80 dark:text-red-300/80">
              Ouvrez <a href="/donneur" target="_blank" className="font-bold underline">/donneur</a> dans un autre onglet pour voir la notification citoyenne en direct.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {facilityAlerts.length > 0 && (
            <button
              onClick={() => simulateDonorEnRoute(facilityAlerts[0].id)}
              className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm border border-red-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            >
              Simuler 1 donneur qui arrive
            </button>
          )}
          <button
            onClick={resetDemoData}
            className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm border border-red-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
            title="Réinitialiser les données de démo"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Section 1 : Réserves de sang de l'hôpital */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Réserves en Stock par Groupe Sanguin
            </h2>
            <p className="text-xs text-slate-500">
              Cliquez sur (+) ou (-) pour ajuster les poches lors d'une utilisation ou d'une réception.
            </p>
          </div>
        </div>

        <BloodStockGrid
          stocks={stocks}
          onUpdateStock={updateStock}
          onTriggerAlert={handleOpenAlertForGroup}
        />
      </section>

      {/* Section 2 : Alertes en cours & Citoyens en route */}
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        {/* Colonne Alertes Actives */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Appels d'Urgence Actifs ({facilityAlerts.length})
            </h2>
          </div>

          {facilityAlerts.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
              <CheckCircle className="mx-auto h-10 w-10 text-emerald-500" />
              <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Aucune alerte d'urgence en cours
              </p>
              <p className="text-xs text-slate-400">Toutes les demandes ont été honorées.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {facilityAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-3xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-900/50 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-xl bg-red-600 px-3 py-1 text-sm font-black text-white">
                        {alert.blood_group}
                      </span>
                      <div>
                        <p className="inline-flex items-center gap-1 text-xs font-bold text-red-600 uppercase tracking-wider">
                          {alert.urgency === 'vital' ? (
                            <>
                              <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                              Urgence Vitale
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                              Besoin Urgent
                            </>
                          )}
                        </p>
                        <h4 className="font-bold text-slate-900 dark:text-white">{alert.clinical_reason}</h4>
                      </div>
                    </div>

                    <button
                      onClick={() => fulfillAlert(alert.id)}
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                    >
                      Marquer Résolu
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                      <span>
                        Poches requises : <strong>{alert.bags_needed}</strong>
                      </span>
                      <span>
                        Collectées : <strong className="text-emerald-600">{alert.bags_collected}</strong>
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <Users className="h-3.5 w-3.5" />
                      {alert.donors_en_route} donneur(s) citoyen(s) en route
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colonne Citoyens Donneurs en Route */}
        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Donneurs Citoyens en Approche
          </h2>

          {facilityCommitments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50 text-xs text-slate-400">
              Aucun donneur en route pour le moment.
            </div>
          ) : (
            <div className="space-y-2.5">
              {facilityCommitments.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                        {c.donor_blood_group}
                      </span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {c.donor_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="font-mono font-bold text-red-600">{c.pass_code}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-emerald-600" />
                        Arrivée : ~{c.eta_minutes} min
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => completeDonation(c.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    <Check className="h-4 w-4" />
                    Valider le Don
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal Création Alerte */}
      <CreateBloodAlertModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(data) => {
          createAlert({
            facility_id: facility?.id || 'fac-principal',
            facility_name: data.facility_name,
            facility_city: data.facility_city,
            facility_lat: 14.6644,
            facility_lng: -17.4332,
            blood_group: data.blood_group,
            urgency: data.urgency,
            bags_needed: data.bags_needed,
            clinical_reason: data.clinical_reason,
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * data.expires_in_hours).toISOString(),
          })
        }}
        defaultBloodGroup={selectedGroupForAlert}
        facilityName={facilityName}
      />
    </div>
  )
}
