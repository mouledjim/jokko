import { useId } from 'react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'

/**
 * Illustrations anatomiques « atlas médical moderne » — traits fins, dégradés
 * teal, lueur douce, mouvement réaliste. En pause si prefers-reduced-motion.
 */

/** Cœur anatomique qui bat (lub-dub) avec lueur synchronisée et vaisseaux. */
export function HeartBeat({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 140 140" className={className} role="img" aria-label="Cœur qui bat">
      <defs>
        <linearGradient id={`hg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#5eead4" />
        </linearGradient>
        <radialGradient id={`hglow-${id}`} cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
        </radialGradient>
        <filter id={`hf-${id}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.1" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Lueur pulsée */}
      <circle
        cx="68"
        cy="78"
        r="44"
        fill={`url(#hglow-${id})`}
        className={cn(!reduce && 'animate-heart-glow')}
        style={{ transformOrigin: '68px 78px' }}
      />

      <g
        fill="none"
        stroke={`url(#hg-${id})`}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#hf-${id})`}
        className={cn(!reduce && 'animate-heartbeat')}
        style={{ transformOrigin: '70px 80px' }}
      >
        {/* Myocarde (asymétrique, apex en bas) */}
        <path d="M74 120 C53 111 33 95 31 68 C30 52 41 39 56 41 C65 42 71 48 75 57 C79 47 87 41 96 44 C109 48 114 61 109 77 C103 99 89 112 74 120 Z" />
        {/* Sillon interventriculaire antérieur + artère LAD */}
        <path d="M75 60 C70 76 68 96 75 116" strokeOpacity="0.55" />
        {/* Aorte ascendante + crosse */}
        <path d="M80 56 C83 38 79 28 70 22 C63 17 61 12 64 7" />
        {/* Branches de la crosse aortique */}
        <path d="M65 13 q5 -4 10 -2" strokeOpacity="0.85" />
        <path d="M70 10 q5 -4 10 -1" strokeOpacity="0.85" />
        {/* Tronc pulmonaire */}
        <path d="M90 52 C95 41 101 37 109 38" />
        {/* Veine cave supérieure */}
        <path d="M98 58 C104 51 110 51 115 56" strokeOpacity="0.8" />
        {/* Auricule droite */}
        <path d="M50 50 C43 47 38 51 41 58" strokeOpacity="0.7" />
      </g>
    </svg>
  )
}

/** Poumons qui respirent : bronches, lobes, diaphragme et flux d'air. */
export function Lungs({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 140 140" className={className} role="img" aria-label="Poumons qui respirent">
      <defs>
        <linearGradient id={`lg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
        <filter id={`lf-${id}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.9" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g fill="none" stroke={`url(#lg-${id})`} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" filter={`url(#lf-${id})`}>
        {/* Trachée + carène + bronches souches */}
        <path d="M70 16 L70 50" />
        <path d="M70 50 C65 57 56 59 49 65" />
        <path d="M70 50 C75 57 84 59 91 65" />

        {/* Poumon gauche (3 lobes suggérés) */}
        <g className={cn(!reduce && 'animate-lung')} style={{ transformOrigin: '52px 64px' }}>
          <path d="M60 54 C42 58 26 74 26 98 C26 116 38 126 52 121 C61 118 63 107 63 95 L63 60 C63 56 62 54 60 54 Z" />
          <path d="M50 68 C46 73 44 80 44 90" strokeOpacity="0.5" />
          <path d="M53 78 C49 82 47 88 47 96" strokeOpacity="0.4" />
        </g>

        {/* Poumon droit */}
        <g className={cn(!reduce && 'animate-lung')} style={{ transformOrigin: '88px 64px', animationDelay: '0.15s' }}>
          <path d="M80 54 C98 58 114 74 114 98 C114 116 102 126 88 121 C79 118 77 107 77 95 L77 60 C77 56 78 54 80 54 Z" />
          <path d="M90 68 C94 73 96 80 96 90" strokeOpacity="0.5" />
          <path d="M87 78 C91 82 93 88 93 96" strokeOpacity="0.4" />
        </g>

        {/* Diaphragme */}
        <path d="M24 124 C50 134 90 134 116 124" strokeOpacity="0.6" className={cn(!reduce && 'animate-diaphragm')} />
      </g>

      {/* Flux d'air le long de la trachée */}
      {!reduce && (
        <g fill="#99f6e4">
          <circle cx="70" cy="24" r="1.6" className="animate-airflow" />
          <circle cx="70" cy="32" r="1.4" className="animate-airflow" style={{ animationDelay: '1.4s' }} />
        </g>
      )}
    </svg>
  )
}

/** Tracé ECG sur papier millimétré, avec balayage lumineux. */
export function EcgContinuous({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const id = useId().replace(/:/g, '')
  const d = 'M0 45 H34 l5 -3 l4 8 l6 -34 l7 52 l6 -27 l4 7 l5 -3 H120 l5 -3 l4 8 l6 -34 l7 52 l6 -27 l4 7 l5 -3 H240'
  return (
    <svg viewBox="0 0 240 90" preserveAspectRatio="none" className={className} role="img" aria-label="Tracé ECG continu">
      <defs>
        <pattern id={`grid-${id}`} width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M12 0 H0 V12" fill="none" stroke="#14b8a6" strokeWidth="0.4" strokeOpacity="0.18" />
        </pattern>
        <linearGradient id={`eg-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#5eead4" />
        </linearGradient>
        <filter id={`ef-${id}`} x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="240" height="90" fill={`url(#grid-${id})`} />
      {/* Ligne de base discrète */}
      <path d={d} fill="none" stroke="#14b8a6" strokeWidth="1" strokeOpacity="0.15" />
      {/* Tracé animé */}
      <path
        d={d}
        fill="none"
        stroke={`url(#eg-${id})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#ef-${id})`}
        pathLength={240}
        strokeDasharray={240}
        className={cn(!reduce && 'animate-ecg-draw')}
      />
      {!reduce && (
        <circle r="3.2" fill="#ccfbf1" filter={`url(#ef-${id})`}>
          <animateMotion dur="2.6s" repeatCount="indefinite" path={d} />
        </circle>
      )}
    </svg>
  )
}
