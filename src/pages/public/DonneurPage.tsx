import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Droplet,
  MapPin,
  Users,
  ShieldCheck,
  AlertCircle,
  Info,
  CheckCircle,
  Building2,
  ChevronRight,
} from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { useBloodStore } from '@/features/blood/bloodStore'
import { BLOOD_COMPATIBILITY, type BloodGroup, type BloodAlert, type DonorCommitment } from '@/types/blood'
import { DonorPassModal } from '@/components/blood/DonorPassModal'
import { BloodCompatibilityModal } from '@/components/blood/BloodCompatibilityModal'

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']

const SEN_REGIONS = [
  'Dakar (Plateau, Fann, Pikine)',
  'Thiès (Centre, Mbour)',
  'Saint-Louis',
  'Kaolack',
  'Ziguinchor',
  'Diourbel (Touba)',
]

export default function DonneurPage() {
  const { alerts, profile, updateProfile, respondToAlert } = useBloodStore()

  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>(profile.blood_group || 'O-')
  const [selectedRegion, setSelectedRegion] = useState(SEN_REGIONS[0])
  const [activeCommitment, setActiveCommitment] = useState<DonorCommitment | null>(null)
  const [showCompatibility, setShowCompatibility] = useState(false)
  const [donorName] = useState('Citoyen Volontaire')

  // Filter alerts by compatibility with selected donor group
  const compatibleAlerts = useMemo(() => {
    const canGiveTo = BLOOD_COMPATIBILITY[selectedGroup].canGiveTo
    return alerts
      .filter((a) => a.status === 'active')
      .map((alert) => ({
        ...alert,
        isDirectMatch: alert.blood_group === selectedGroup,
        isCompatible: canGiveTo.includes(alert.blood_group),
      }))
      .sort((a, b) => (b.isDirectMatch ? 1 : 0) - (a.isDirectMatch ? 1 : 0))
  }, [alerts, selectedGroup])

  const handleCommit = (alert: BloodAlert) => {
    const commitment = respondToAlert(alert.id, donorName, selectedGroup, 15)
    setActiveCommitment(commitment)
  }

  const handleGroupChange = (group: BloodGroup) => {
    setSelectedGroup(group)
    updateProfile({ blood_group: group })
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100 antialiased font-sans">
      {/* Top Institutional Bar */}
      <div className="border-b border-slate-200 bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <span className="font-medium tracking-wide">
            République du Sénégal · Ministère de la Santé et de l'Action Sociale · CNTS
          </span>
          <span className="hidden sm:inline font-mono text-slate-400">
            Plateforme Nationale de Régulation des Produits Sanguins
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo textClassName="text-slate-900 dark:text-white" />
            <span className="hidden sm:inline-block h-5 w-px bg-slate-200 dark:bg-slate-700" />
            <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Portail Citoyen Don de Sang
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCompatibility(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Info className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              Règles de compatibilité
            </button>
            <Link
              to="/donneur"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Accueil Donneur
            </Link>
          </div>
        </div>
      </header>

      {/* Content Container */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        {/* Donor Profile & Filter Console */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 pb-4 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Disponibilité & Alertes Hospitalières de Sang
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Consultez en direct les besoins urgents des hôpitaux et des banques de sang du Sénégal.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span>Région :</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 outline-none"
              >
                {SEN_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Blood group selector toolbar */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                1. Sélectionnez votre groupe sanguin :
              </label>
              <span className="text-[11px] text-slate-500">
                {selectedGroup === 'O-' ? 'Donneur universel (O-)' : `Groupe sélectionné : ${selectedGroup}`}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {BLOOD_GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => handleGroupChange(g)}
                  className={`h-11 rounded-lg text-sm font-bold transition-all flex flex-col items-center justify-center ${
                    selectedGroup === g
                      ? 'bg-slate-900 text-white ring-2 ring-slate-900 shadow-xs dark:bg-white dark:text-slate-900 dark:ring-white'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <span>{g}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick status summary bar */}
          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Statut : Éligible au don de sang volontaire
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px]">
              <span>Délai min. entre 2 dons : 3 mois</span>
              <span>•</span>
              <span>CNTS Hotline : <strong>33 821 28 38</strong></span>
            </div>
          </div>
        </section>

        {/* Section Alertes Réelles */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white dark:bg-white dark:text-slate-900">
                {compatibleAlerts.length}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Besoins Transfusionnels Urgents dans votre Zone
              </h2>
            </div>
            <span className="text-xs text-slate-500">Mise à jour en temps réel</span>
          </div>

          {compatibleAlerts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
              <CheckCircle className="mx-auto h-8 w-8 text-slate-400" />
              <h3 className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                Aucune rupture critique signalée
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Les réserves actuelles couvrent les besoins immédiats des établissements de santé.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {compatibleAlerts.map((alert) => {
                const isVital = alert.urgency === 'vital'

                return (
                  <div
                    key={alert.id}
                    className={`rounded-xl border bg-white p-5 shadow-xs transition-all dark:bg-slate-900 ${
                      isVital
                        ? 'border-l-4 border-l-red-600 border-slate-200 dark:border-slate-800'
                        : 'border-l-4 border-l-amber-500 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Info */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">
                            Groupe {alert.blood_group}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                              isVital
                                ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900'
                            }`}
                          >
                            <AlertCircle className="h-3 w-3" />
                            {isVital ? 'Urgence Vitale · Bloc opératoire' : 'Besoin Hospitalier Urgent'}
                          </span>

                          {alert.isDirectMatch && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              Votre groupe exact
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {alert.facility_name}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                            Motif : {alert.clinical_reason}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {alert.facility_city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Droplet className="h-3.5 w-3.5 text-red-600" />
                            Besoin : <strong>{alert.bags_needed - alert.bags_collected} poche(s)</strong>
                          </span>
                          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-medium">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            {alert.donors_en_route} donneur(s) volontaire(s) en route
                          </span>
                        </div>
                      </div>

                      {/* Right: Action Button */}
                      <div className="md:shrink-0 flex flex-col md:items-end gap-2">
                        <button
                          onClick={() => handleCommit(alert)}
                          className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-98 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                        >
                          <span>Confirmer mon déplacement</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-[11px] text-slate-400 text-center md:text-right">
                          Délivre un Pass de Don Prioritaire
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Official Donation Prerequisites Checklist */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 dark:border-slate-800">
            <ShieldCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Conditions Générales de Don (Recommandations CNTS)
            </h3>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <p className="font-bold text-slate-900 dark:text-white">1. Profil du Donneur</p>
              <p className="mt-1 text-slate-500 leading-relaxed">
                Être âgé de 18 à 60 ans et peser au moins 50 kg. Se munir d'une pièce d'identité officielle.
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <p className="font-bold text-slate-900 dark:text-white">2. Préparation Clinique</p>
              <p className="mt-1 text-slate-500 leading-relaxed">
                Ne pas venir à jeun (avoir pris un repas léger) et boire au moins 500 ml d'eau avant le prélèvement.
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <p className="font-bold text-slate-900 dark:text-white">3. Sécurité & Confidentialité</p>
              <p className="mt-1 text-slate-500 leading-relaxed">
                Entretien médical préalable obligatoire et anonymat total garanti par la législation sanitaire sénégalaise.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Modals */}
      <DonorPassModal commitment={activeCommitment} onClose={() => setActiveCommitment(null)} />
      <BloodCompatibilityModal
        isOpen={showCompatibility}
        onClose={() => setShowCompatibility(false)}
        selectedGroup={selectedGroup}
      />
    </div>
  )
}
