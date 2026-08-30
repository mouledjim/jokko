import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { BLOOD_COMPATIBILITY, type BloodGroup } from '@/types/blood'

interface BloodCompatibilityModalProps {
  isOpen: boolean
  onClose: () => void
  selectedGroup?: BloodGroup
}

const ALL_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']

export function BloodCompatibilityModal({ isOpen, onClose, selectedGroup = 'O-' }: BloodCompatibilityModalProps) {
  if (!isOpen) return null

  const info = BLOOD_COMPATIBILITY[selectedGroup]

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
          <div className="flex items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Règles de Compatibilité Transfusionnelle (Système ABO / Rhésus)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Normes cliniques du Centre National de Transfusion Sanguine</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="font-semibold text-slate-900 dark:text-white">
                Groupe sélectionné : <span className="font-bold text-slate-900 dark:text-white underline">{selectedGroup}</span>
              </p>
              {selectedGroup === 'O-' && (
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  Le groupe <strong>O négatif (O-)</strong> est donneur universel pour les globules rouges. Il est réservé en priorité aux situations d'urgence vitale immédiate avant groupage.
                </p>
              )}
              {selectedGroup === 'AB+' && (
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  Le groupe <strong>AB positif (AB+)</strong> est receveur universel pour les concentrés érythrocytaires.
                </p>
              )}
            </div>

            {/* Qui peut recevoir */}
            <div>
              <p className="font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 text-[11px] mb-1.5">
                Le sang d'un donneur {selectedGroup} peut être transfusé à :
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {ALL_GROUPS.map((g) => {
                  const canGive = info.canGiveTo.includes(g)
                  return (
                    <div
                      key={g}
                      className={`flex items-center justify-between rounded-md p-2 border font-medium ${
                        canGive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'border-slate-200 bg-slate-50 text-slate-400 opacity-50 dark:border-slate-800 dark:bg-slate-800'
                      }`}
                    >
                      <span className="font-bold">{g}</span>
                      {canGive ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <span className="text-[10px]">—</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* De qui peut-on recevoir */}
            <div>
              <p className="font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 text-[11px] mb-1.5">
                Un patient {selectedGroup} peut recevoir le sang de :
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {ALL_GROUPS.map((g) => {
                  const canReceive = info.canReceiveFrom.includes(g)
                  return (
                    <div
                      key={g}
                      className={`flex items-center justify-between rounded-md p-2 border font-medium ${
                        canReceive
                          ? 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300'
                          : 'border-slate-200 bg-slate-50 text-slate-400 opacity-50 dark:border-slate-800 dark:bg-slate-800'
                      }`}
                    >
                      <span className="font-bold">{g}</span>
                      {canReceive ? <Check className="h-3.5 w-3.5 text-blue-600" /> : <span className="text-[10px]">—</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end dark:border-slate-800">
            <button
              onClick={onClose}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              Fermer la fiche
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
