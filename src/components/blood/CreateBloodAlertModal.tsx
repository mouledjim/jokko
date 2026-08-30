import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Building2 } from 'lucide-react'
import type { BloodGroup, AlertUrgencyLevel } from '@/types/blood'

interface CreateBloodAlertModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    facility_name: string
    facility_city: string
    blood_group: BloodGroup
    urgency: AlertUrgencyLevel
    bags_needed: number
    clinical_reason: string
    expires_in_hours: number
  }) => void
  defaultBloodGroup?: BloodGroup
  facilityName?: string
}

const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']

export function CreateBloodAlertModal({
  isOpen,
  onClose,
  onSubmit,
  defaultBloodGroup = 'O-',
  facilityName = 'Hôpital Principal de Dakar',
}: CreateBloodAlertModalProps) {
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(defaultBloodGroup)
  const [urgency, setUrgency] = useState<AlertUrgencyLevel>('vital')
  const [bagsNeeded, setBagsNeeded] = useState(3)
  const [reason, setReason] = useState('')
  const [expiresHours, setExpiresHours] = useState(4)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      facility_name: facilityName,
      facility_city: 'Dakar (Plateau)',
      blood_group: bloodGroup,
      urgency,
      bags_needed: bagsNeeded,
      clinical_reason: reason.trim() || 'Urgence clinique vitale / Bloc opératoire',
      expires_in_hours: expiresHours,
    })
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-sans">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Émettre un Appel d'Urgence Transfusionnelle
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Diffusion immédiate vers les donneurs compatibles et le CNTS</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
            {/* Hôpital émetteur */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Building2 className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                <span>Établissement émetteur :</span>
              </div>
              <p className="mt-0.5 font-bold text-slate-900 dark:text-white text-sm">{facilityName}</p>
            </div>

            {/* Choix du Groupe Sanguin */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Groupe Sanguin Requis
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {BLOOD_GROUPS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setBloodGroup(g)}
                    className={`h-10 rounded-md font-bold transition-all text-xs ${
                      bloodGroup === g
                        ? 'bg-slate-900 text-white ring-2 ring-slate-900 dark:bg-white dark:text-slate-900 dark:ring-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Niveau d'urgence */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Degré de Priorité Clinique
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'vital', label: 'Urgence Vitale', sub: 'Bloc / < 1h' },
                  { id: 'urgent', label: 'Besoin Urgent', sub: '< 4 heures' },
                  { id: 'preventive', label: 'Réserve Préventive', sub: 'Besoins du jour' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setUrgency(item.id as AlertUrgencyLevel)}
                    className={`rounded-lg border p-2.5 text-left transition-all ${
                      urgency === item.id
                        ? 'border-slate-900 bg-slate-100 text-slate-900 font-bold dark:border-white dark:bg-slate-800 dark:text-white'
                        : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400'
                    }`}
                  >
                    <p className="text-xs">{item.label}</p>
                    <p className="text-[10px] opacity-75 font-normal">{item.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantité requise & validité */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre de concentrés érythrocytaires (poches)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={bagsNeeded}
                  onChange={(e) => setBagsNeeded(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Durée de validité de l'alerte
                </label>
                <select
                  value={expiresHours}
                  onChange={(e) => setExpiresHours(parseInt(e.target.value))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none"
                >
                  <option value={2}>2 heures</option>
                  <option value={4}>4 heures</option>
                  <option value={8}>8 heures</option>
                  <option value={24}>24 heures</option>
                </select>
              </div>
            </div>

            {/* Contexte clinique anonymisé */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Motif / Service demandeur (anonymisé)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Hémorragie de la délivrance · Maternité"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none"
              />
            </div>

            {/* Boutons d'action */}
            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                <Send className="h-3.5 w-3.5" />
                Diffuser l'Alerte
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
