import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'

const STROKE = '#5eead4' // teal clair sur fond sombre

/** Cœur anatomique stylisé qui bat (systole/diastole). */
export function HeartBeat({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Cœur qui bat">
      <g
        fill="none"
        stroke={STROKE}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(!reduce && 'animate-heartbeat')}
        style={{ transformOrigin: '60px 66px' }}
      >
        {/* Corps du cœur */}
        <path d="M60 96 C40 80 26 68 26 52 C26 40 35 32 45 32 C52 32 57 36 60 42 C63 36 68 32 75 32 C85 32 94 40 94 52 C94 68 80 80 60 96 Z" />
        {/* Sillon interventriculaire */}
        <path d="M60 50 C57 62 56 74 60 90" opacity="0.7" />
        {/* Aorte et tronc pulmonaire */}
        <path d="M62 40 C64 28 60 22 54 18" />
        <path d="M70 38 C74 30 80 28 86 30" />
        <path d="M48 36 C44 28 40 26 34 28" opacity="0.8" />
        {/* Oreillettes suggérées */}
        <path d="M40 40 C34 38 30 42 32 48" opacity="0.6" />
        <path d="M80 42 C86 40 90 44 88 50" opacity="0.6" />
      </g>
    </svg>
  )
}

/** Poumons qui respirent, bronches en traits fins. */
export function Lungs({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Poumons qui respirent">
      <g fill="none" stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {/* Trachée + bronches */}
        <path d="M60 16 L60 44" />
        <path d="M60 44 C56 50 50 52 46 56" />
        <path d="M60 44 C64 50 70 52 74 56" />
        {/* Poumon gauche */}
        <g className={cn(!reduce && 'animate-lung')} style={{ transformOrigin: '48px 56px' }}>
          <path d="M52 48 C40 50 28 60 28 78 C28 92 36 100 46 98 C52 96 54 88 54 78 L54 52 C54 50 53 48 52 48 Z" />
          <path d="M46 60 C42 64 40 70 40 78" opacity="0.6" />
        </g>
        {/* Poumon droit */}
        <g className={cn(!reduce && 'animate-lung')} style={{ transformOrigin: '72px 56px', animationDelay: '0.3s' }}>
          <path d="M68 48 C80 50 92 60 92 78 C92 92 84 100 74 98 C68 96 66 88 66 78 L66 52 C66 50 67 48 68 48 Z" />
          <path d="M74 60 C78 64 80 70 80 78" opacity="0.6" />
        </g>
      </g>
    </svg>
  )
}

/** Tracé ECG continu qui se dessine en boucle avec un point de tête lumineux. */
export function EcgContinuous({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const d = 'M0 40 H30 l6 -22 l8 44 l7 -30 l5 16 l4 -8 H110 l6 -16 l8 32 l7 -22 l5 12 H240'
  return (
    <svg viewBox="0 0 240 80" preserveAspectRatio="none" className={className} role="img" aria-label="Tracé ECG continu">
      <path
        d={d}
        fill="none"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={240}
        strokeDasharray={240}
        className={cn(!reduce && 'animate-ecg-draw')}
      />
      {!reduce && (
        <circle r="3" fill="#99f6e4">
          <animateMotion dur="2.6s" repeatCount="indefinite" path={d} />
        </circle>
      )}
    </svg>
  )
}
