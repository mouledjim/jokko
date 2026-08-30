import { useState } from 'react'
import {
  Droplet,
  Radio,
  MapPin,
  Calendar,
  Truck,
} from 'lucide-react'
import { useBloodStore } from '@/features/blood/bloodStore'
import { BloodStockGrid } from '@/components/blood/BloodStockGrid'
import { CreateBloodAlertModal } from '@/components/blood/CreateBloodAlertModal'

const REGIONAL_RESERVES = [
  { region: 'Dakar', rate: 42, status: 'critique', stock_total: 184, need_urgent: 'O-, B-' },
  { region: 'Thiès', rate: 68, status: 'modere', stock_total: 92, need_urgent: 'O-' },
  { region: 'Saint-Louis', rate: 75, status: 'bon', stock_total: 78, need_urgent: 'Aucun' },
  { region: 'Kaolack', rate: 51, status: 'modere', stock_total: 64, need_urgent: 'A-, O-' },
  { region: 'Ziguinchor', rate: 38, status: 'critique', stock_total: 41, need_urgent: 'O-, AB-' },
  { region: 'Diourbel (Touba)', rate: 62, status: 'modere', stock_total: 88, need_urgent: 'B-' },
  { region: 'Tambacounda', rate: 45, status: 'critique', stock_total: 35, need_urgent: 'O-, A-' },
]

const MOBILE_CAMPAIGNS = [
  {
    id: 'camp-1',
    title: 'Collecte Mobile Universitaire · UCAD Dakar',
    location: 'Esplanade UCAD · Dakar',
    date: 'Aujourd’hui · 09h00 - 17h00',
    target_bags: 150,
    collected_bags: 89,
    status: 'en_cours',
  },
  {
    id: 'camp-2',
    title: 'Don de Sang Communautaire · Place de France Thiès',
    location: 'Place de France · Thiès',
    date: 'Demain · 08h30 - 16h00',
    target_bags: 100,
    collected_bags: 0,
    status: 'planifie',
  },
  {
    id: 'camp-3',
    title: 'Campagne Entreprises · Zone Industrielle Diamniadio',
    location: 'Parc Industriel · Diamniadio',
    date: '2 Septembre 2026',
    target_bags: 80,
    collected_bags: 0,
    status: 'planifie',
  },
]

export default function CntsNationalPage() {
  const { stocks, alerts, createAlert } = useBloodStore()
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-red-600 text-white shadow-md shadow-red-500/20">
              <Droplet className="h-5 w-5" />
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              CNTS · Supervision Nationale Transfusionnelle
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Centre National de Transfusion Sanguine du Sénégal · Réserves régionales et campagnes mobiles.
          </p>
        </div>

        <button
          onClick={() => setIsAlertOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700"
        >
          <Radio className="h-4 w-4" />
          Alerte Nationale Spéciale
        </button>
      </div>

      {/* KPI Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Poches en Réserve (National)', val: '1 240', sub: 'Autonomie : 4.2 jours', color: 'text-slate-900' },
          { label: 'Donneurs Mobilisés (Mois)', val: '3 840', sub: '+18% vs mois précédent', color: 'text-emerald-600' },
          { label: 'Alertes Critiques Actives', val: `${alerts.length}`, sub: 'Dakar, Thiès, Kaolack', color: 'text-red-600' },
          { label: 'Collectes Mobiles Actives', val: '3', sub: 'UCAD, Thiès, Diamniadio', color: 'text-blue-600' },
        ].map((kpi, i) => (
          <div
            key={i}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-xs font-semibold text-slate-500">{kpi.label}</p>
            <p className={`mt-2 font-display text-3xl font-black ${kpi.color} dark:text-white`}>
              {kpi.val}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Réserves Globales CNTS */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Stocks Stratégiques Nationaux (Banque Centrale CNTS)
        </h2>
        <BloodStockGrid stocks={stocks} readOnly />
      </section>

      {/* 2 Colonnes : Carte Régionale & Collectes Mobiles */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Réserves par région */}
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Niveau des Réserves par Région Médicale
            </h3>
            <span className="text-xs text-slate-400">14 régions</span>
          </div>

          <div className="space-y-3">
            {REGIONAL_RESERVES.map((reg) => (
              <div
                key={reg.region}
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{reg.region}</span>
                    {reg.status === 'critique' ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950/80 dark:text-red-300">
                        Critique ({reg.need_urgent})
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                        Sous contrôle
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{reg.stock_total} poches disponibles</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-20 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        reg.rate < 50 ? 'bg-red-500' : reg.rate < 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${reg.rate}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold w-9 text-right">{reg.rate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collectes Mobiles CNTS */}
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Campagnes & Camions de Collecte Mobiles
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
              <Truck className="h-3.5 w-3.5" />
              CNTS Mobile
            </span>
          </div>

          <div className="space-y-3">
            {MOBILE_CAMPAIGNS.map((camp) => (
              <div
                key={camp.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{camp.title}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-red-500" />
                      {camp.location}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3 text-blue-500" />
                      {camp.date}
                    </p>
                  </div>

                  {camp.status === 'en_cours' ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse">
                      En cours
                    </span>
                  ) : (
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Planifié
                    </span>
                  )}
                </div>

                {camp.status === 'en_cours' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Progression : <strong>{camp.collected_bags}</strong> / {camp.target_bags} poches
                    </span>
                    <span className="font-bold text-emerald-600">
                      {Math.round((camp.collected_bags / camp.target_bags) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal Alerte Nationale */}
      <CreateBloodAlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onSubmit={(data) => {
          createAlert({
            facility_id: 'fac-cnts',
            facility_name: 'Centre National de Transfusion Sanguine (CNTS)',
            facility_city: 'Dakar (Fann)',
            facility_lat: 14.6931,
            facility_lng: -17.4667,
            blood_group: data.blood_group,
            urgency: data.urgency,
            bags_needed: data.bags_needed,
            clinical_reason: `Alerte Nationale CNTS · ${data.clinical_reason}`,
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * data.expires_in_hours).toISOString(),
          })
        }}
        facilityName="CNTS Sénégal (National)"
      />
    </div>
  )
}
