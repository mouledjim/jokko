import { motion } from 'framer-motion'
import { EcgLine } from '@/components/brand/EcgLine'

/** Panneau visuel de la page de connexion (desktop). Fond sombre + ECG. */
export function LoginAside() {
  const dots = [
    { x: '22%', y: '32%', d: 0 },
    { x: '64%', y: '24%', d: 0.6 },
    { x: '48%', y: '54%', d: 1.2 },
    { x: '74%', y: '64%', d: 0.3 },
    { x: '32%', y: '72%', d: 0.9 },
  ]
  return (
    <div className="relative hidden overflow-hidden bg-garde lg:block lg:w-[54%]">
      {/* Halo teal */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-bloc/30 blur-[120px]" aria-hidden />
      <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-bloc-clair/15 blur-[100px]" aria-hidden />

      {/* Points hôpitaux qui pulsent */}
      <div className="absolute inset-0" aria-hidden>
        {dots.map((dot, i) => (
          <span key={i} className="absolute" style={{ left: dot.x, top: dot.y }}>
            <span className="relative flex h-3 w-3">
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-bloc-clair"
                animate={{ scale: [1, 2.6, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2.6, repeat: Infinity, delay: dot.d, ease: 'easeInOut' }}
              />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-bloc-clair" />
            </span>
          </span>
        ))}
      </div>

      <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
        <div />
        <div>
          <EcgLine className="mb-8 h-12 w-48 text-bloc-clair" />
          <h2 className="max-w-md font-display text-4xl leading-tight font-semibold tracking-tight text-white xl:text-[2.75rem]">
            Trouver un lit ne devrait jamais prendre des heures.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-300">
            La carte nationale des lits disponibles et la coordination des transferts
            inter-hospitaliers, en temps réel.
          </p>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <Stat value="15" label="établissements" />
          <span className="h-8 w-px bg-white/10" aria-hidden />
          <Stat value="14" label="régions médicales" />
          <span className="h-8 w-px bg-white/10" aria-hidden />
          <Stat value="< 2 s" label="mise à jour temps réel" />
        </div>
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-semibold tabular-nums text-bloc-clair">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}
