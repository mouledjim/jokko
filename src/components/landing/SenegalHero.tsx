import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface Dot {
  id: string
  name: string
  x: number
  y: number
}

// Positions stylisées (viewBox 440x320) — agencement évoquant le Sénégal.
const DOTS: Dot[] = [
  { id: 'dakar', name: 'Dakar', x: 56, y: 150 },
  { id: 'thies', name: 'Thiès', x: 100, y: 150 },
  { id: 'stlouis', name: 'Saint-Louis', x: 120, y: 64 },
  { id: 'touba', name: 'Touba', x: 168, y: 138 },
  { id: 'kaolack', name: 'Kaolack', x: 165, y: 188 },
  { id: 'tamba', name: 'Tambacounda', x: 300, y: 175 },
  { id: 'ziguinchor', name: 'Ziguinchor', x: 95, y: 282 },
  { id: 'kedougou', name: 'Kédougou', x: 345, y: 238 },
]

const TRANSFERS: { from: string; to: string; label: string }[] = [
  { from: 'thies', to: 'dakar', label: 'Réanimation · accepté en 38 s' },
  { from: 'touba', to: 'dakar', label: 'Cardiologie · accepté en 52 s' },
  { from: 'kaolack', to: 'thies', label: 'Maternité · accepté en 1 min' },
  { from: 'tamba', to: 'kedougou', label: 'Pédiatrie · accepté en 44 s' },
  { from: 'ziguinchor', to: 'kaolack', label: 'Traumatologie · accepté en 47 s' },
]

const SENEGAL_PATH =
  'M70 70 L300 58 L412 108 L360 198 L252 208 L252 234 L150 234 L150 210 L112 250 L96 286 L70 262 L58 150 Z'

export function SenegalHero() {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setI((n) => (n + 1) % TRANSFERS.length), 4000)
    return () => clearInterval(id)
  }, [reduce])

  const t = TRANSFERS[i]
  const from = DOTS.find((d) => d.id === t.from)!
  const to = DOTS.find((d) => d.id === t.to)!
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2 - 28
  const connector = `M${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`

  return (
    <svg viewBox="0 0 440 320" className="h-full w-full" role="img" aria-label="Carte du Sénégal et transferts en temps réel">
      <defs>
        <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0e3b38" />
          <stop offset="100%" stopColor="#0b2e2c" />
        </linearGradient>
      </defs>

      {/* Territoire */}
      <path d={SENEGAL_PATH} fill="url(#land)" stroke="#14b8a6" strokeWidth="1.5" strokeOpacity="0.5" />

      {/* Connecteur ECG entre deux hôpitaux */}
      {!reduce && (
        <AnimatePresence mode="wait">
          <motion.g key={i}>
            <motion.path
              d={connector}
              fill="none"
              stroke="#5eead4"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0.9 }}
              animate={{ pathLength: 1, opacity: [0.9, 0.9, 0] }}
              transition={{ duration: 3.6, times: [0, 0.5, 1], ease: 'easeInOut' }}
            />
            <motion.circle
              r="3.5"
              fill="#99f6e4"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 3.6 }}
            >
              <animateMotion dur="1.6s" repeatCount="1" path={connector} />
            </motion.circle>
            <motion.foreignObject
              x={Math.min(mx, 300)}
              y={my - 26}
              width="150"
              height="24"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: [0, 1, 1, 0], y: 0 }}
              transition={{ duration: 3.6, times: [0, 0.15, 0.8, 1] }}
            >
              <div className="rounded-full bg-bloc-clair/15 px-2 py-0.5 text-center text-[9px] font-medium whitespace-nowrap text-bloc-clair backdrop-blur">
                {t.label}
              </div>
            </motion.foreignObject>
          </motion.g>
        </AnimatePresence>
      )}

      {/* Hôpitaux pulsants */}
      {DOTS.map((d, idx) => {
        const active = !reduce && (d.id === from.id || d.id === to.id)
        return (
          <g key={d.id}>
            {!reduce && (
              <circle cx={d.x} cy={d.y} r="5" fill="#14b8a6" opacity="0.25">
                <animate attributeName="r" values="5;11;5" dur="3s" begin={`${idx * 0.4}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" begin={`${idx * 0.4}s`} repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={d.x} cy={d.y} r={active ? 5 : 4} fill={active ? '#99f6e4' : '#2dd4bf'} stroke="#0b2e2c" strokeWidth="1" />
          </g>
        )
      })}
    </svg>
  )
}
