import { motion } from 'framer-motion'
import { EcgLine } from '@/components/brand/EcgLine'
import { Img } from '@/components/landing/Img'

const DOC_LOGIN = 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=1000&q=80'

/** Panneau visuel de la page de connexion (desktop) : médecin + dégradé rouge. */
export function LoginAside() {
  return (
    <div className="relative hidden overflow-hidden lg:block lg:w-[54%]">
      <Img src={DOC_LOGIN} alt="Soignant" className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-800/90 via-rose-700/75 to-rose-500/45" aria-hidden />

      <div className="relative flex h-full flex-col justify-between p-12 xl:p-16 text-white">
        <div />
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <EcgLine className="mb-8 h-12 w-48 text-white/90" />
          <h2 className="max-w-md font-display text-4xl leading-tight font-bold tracking-tight xl:text-[2.75rem]">
            Chaque minute compte. Donnons-les au patient.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-rose-50/90">
            La carte nationale des lits et la coordination des transferts inter-hospitaliers, en temps réel.
          </p>
        </motion.div>

        <div className="flex items-center gap-6">
          <Stat value="15" label="établissements" />
          <span className="h-8 w-px bg-white/25" aria-hidden />
          <Stat value="14" label="régions médicales" />
          <span className="h-8 w-px bg-white/25" aria-hidden />
          <Stat value="< 2 s" label="mise à jour temps réel" />
        </div>
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold tabular-nums text-white">{value}</p>
      <p className="text-xs text-rose-100/80">{label}</p>
    </div>
  )
}
