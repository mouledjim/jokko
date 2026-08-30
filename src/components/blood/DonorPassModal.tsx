import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Navigation, Clock, Lightbulb, Building2 } from 'lucide-react'
import type { DonorCommitment } from '@/types/blood'

interface DonorPassModalProps {
  commitment: DonorCommitment | null
  onClose: () => void
}

export function DonorPassModal({ commitment, onClose }: DonorPassModalProps) {
  if (!commitment) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
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
          className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 font-sans"
        >
          {/* Header */}
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50 flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Ministère de la Santé · CNTS Sénégal
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Convocation Prioritaire · Don de Sang d'Urgence
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Code Box */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Numéro d'enregistrement d'urgence
              </p>
              <p className="mt-1 font-mono text-3xl font-bold tracking-widest text-slate-900 dark:text-white">
                {commitment.pass_code}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Groupe sanguin du donneur : <strong className="text-slate-900 dark:text-white">{commitment.donor_blood_group}</strong>
              </p>
            </div>

            {/* Destination details */}
            <div className="rounded-lg border border-slate-100 p-4 space-y-2.5 text-xs text-slate-700 dark:border-slate-800 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500">Établissement demandeur :</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{commitment.facility_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500 shrink-0" />
                <div>
                  <span className="text-slate-500">Arrivée estimée :</span> ~{commitment.eta_minutes} minutes
                </div>
              </div>

              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium pt-1">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>La banque de sang a été notifiée de votre arrivée.</span>
              </div>
            </div>

            {/* Checklist */}
            <div className="rounded-lg bg-slate-50 p-3.5 text-xs text-slate-600 dark:bg-slate-800/40 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-slate-500" />
                Consignes à l'arrivée :
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                <li>Présentez-vous directement à la banque de sang / laboratoire.</li>
                <li>Munissez-vous d'une pièce d'identité (CNI / Passeport).</li>
                <li>Hydratez-vous bien avant et après le prélèvement.</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(commitment.facility_name)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <Navigation className="h-3.5 w-3.5" />
                Itinéraire Google Maps
              </a>
              <button
                onClick={onClose}
                className="w-full sm:w-auto rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Fermer
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
