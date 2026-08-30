import { motion } from 'framer-motion'
import { Plus, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { BloodStockItem, BloodGroup } from '@/types/blood'

interface BloodStockGridProps {
  stocks: BloodStockItem[]
  onUpdateStock?: (bloodGroup: BloodGroup, delta: number) => void
  onTriggerAlert?: (bloodGroup: BloodGroup) => void
  readOnly?: boolean
}

export function BloodStockGrid({ stocks, onUpdateStock, onTriggerAlert, readOnly = false }: BloodStockGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stocks.map((stock) => {
        const isCritical = stock.quantity_bags <= stock.minimum_threshold / 2
        const isWarning = stock.quantity_bags <= stock.minimum_threshold && !isCritical

        return (
          <motion.div
            key={stock.blood_group}
            whileHover={{ y: -2 }}
            className={`relative overflow-hidden rounded-2xl border p-4 transition-all ${
              isCritical
                ? 'border-red-200 bg-red-50/70 dark:border-red-900/50 dark:bg-red-950/30'
                : isWarning
                ? 'border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/30'
                : 'border-emerald-100 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-black ${
                    isCritical
                      ? 'bg-red-600 text-white shadow-sm shadow-red-500/30'
                      : isWarning
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-emerald-600 text-white shadow-sm'
                  }`}
                >
                  {stock.blood_group}
                </span>
              </span>

              {isCritical ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/60 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-300">
                  <AlertTriangle className="h-3 w-3" />
                  Critique
                </span>
              ) : isWarning ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  Faible
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" />
                  Optimal
                </span>
              )}
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {stock.quantity_bags}
                  <span className="ml-1 text-xs font-normal text-slate-500 dark:text-slate-400">poches</span>
                </p>
                <p className="text-[11px] text-slate-400">Seuil min : {stock.minimum_threshold}</p>
              </div>

              <div className="flex h-10 w-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 p-0.5">
                <div
                  className={`w-full self-end rounded-full transition-all duration-500 ${
                    isCritical ? 'bg-red-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{
                    height: `${Math.min(100, Math.max(10, (stock.quantity_bags / (stock.minimum_threshold * 2)) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {!readOnly && onUpdateStock && (
              <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 pt-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onUpdateStock(stock.blood_group, -1)}
                    disabled={stock.quantity_bags <= 0}
                    className="grid h-6 w-6 place-items-center rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-slate-600 hover:bg-slate-100 dark:text-slate-200 disabled:opacity-40"
                    title="Déduire 1 poche"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStock(stock.blood_group, 1)}
                    className="grid h-6 w-6 place-items-center rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-slate-600 hover:bg-slate-100 dark:text-slate-200"
                    title="Ajouter 1 poche"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {onTriggerAlert && isCritical && (
                  <button
                    type="button"
                    onClick={() => onTriggerAlert(stock.blood_group)}
                    className="rounded-lg bg-red-600 px-2 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-red-700 transition"
                  >
                    Alerter
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
