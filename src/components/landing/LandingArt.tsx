import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'

const RED = '#e11d48'
const INK = '#9f1239'

/** Ambulance vue de profil — roues qui tournent (effet « roule »). */
export function Ambulance({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const wheel = (cx: number) => (
    <g style={{ transformOrigin: `${cx}px 96px` }} className={cn(!reduce && 'animate-[spin_1.1s_linear_infinite]')}>
      <circle cx={cx} cy="96" r="15" fill="#1f2937" />
      <circle cx={cx} cy="96" r="15" fill="none" stroke="#374151" strokeWidth="2" />
      <circle cx={cx} cy="96" r="6.5" fill="#e5e7eb" />
      <g stroke="#9ca3af" strokeWidth="2">
        <line x1={cx} y1="83" x2={cx} y2="109" />
        <line x1={cx - 13} y1="96" x2={cx + 13} y2="96" />
        <line x1={cx - 9} y1="87" x2={cx + 9} y2="105" />
        <line x1={cx - 9} y1="105" x2={cx + 9} y2="87" />
      </g>
    </g>
  )
  return (
    <svg viewBox="0 0 240 120" className={className} role="img" aria-label="Ambulance">
      {/* Caisse */}
      <rect x="22" y="40" width="150" height="56" rx="9" fill="#ffffff" stroke={RED} strokeWidth="3" />
      {/* Cabine */}
      <path d="M172 96 V58 q0-6 6-6 h14 q5 0 8 4 l16 22 q3 4 3 9 v9 q0 0 0 0 H172 Z" fill="#ffffff" stroke={RED} strokeWidth="3" />
      {/* Bandeau rouge */}
      <rect x="22" y="62" width="150" height="9" fill={RED} opacity="0.9" />
      {/* Croix médicale */}
      <g fill={RED}>
        <rect x="64" y="48" width="9" height="26" rx="1.5" />
        <rect x="55.5" y="56.5" width="26" height="9" rx="1.5" />
      </g>
      {/* Pare-brise */}
      <path d="M178 58 h12 q3 0 5 3 l9 13 h-26 Z" fill="#dbeafe" stroke={RED} strokeWidth="2" />
      {/* Gyrophare */}
      <rect x="92" y="33" width="20" height="8" rx="3" fill={RED} className={cn(!reduce && 'animate-pulse')} />
      {/* Phare */}
      <circle cx="214" cy="84" r="4" fill="#fde68a" />
      {/* Sol */}
      <line x1="0" y1="112" x2="240" y2="112" stroke={INK} strokeWidth="2" strokeDasharray="14 10" opacity="0.35" />
      {wheel(70)}
      {wheel(186)}
    </svg>
  )
}

/** Stéthoscope — trait rouge, pavillon qui bat doucement. */
export function Stethoscope({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Stéthoscope">
      <g fill="none" stroke={RED} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        {/* Embouts auriculaires */}
        <circle cx="50" cy="34" r="6" fill={RED} />
        <circle cx="92" cy="34" r="6" fill={RED} />
        {/* Tubes binauraux */}
        <path d="M50 40 C48 70 54 92 71 100" />
        <path d="M92 40 C94 70 88 92 71 100" />
        {/* Tube principal */}
        <path d="M71 100 C71 132 96 150 124 150 C150 150 156 132 156 120" />
        {/* Connecteur au pavillon */}
        <path d="M156 120 v8" />
      </g>
      {/* Pavillon (diaphragme) */}
      <g style={{ transformOrigin: '156px 142px' }} className={cn(!reduce && 'animate-heartbeat')}>
        <circle cx="156" cy="142" r="16" fill="#fff" stroke={RED} strokeWidth="4" />
        <circle cx="156" cy="142" r="8" fill="none" stroke={RED} strokeWidth="2" opacity="0.5" />
      </g>
    </svg>
  )
}

/** Cage thoracique stylisée — trait rouge. */
export function Ribcage({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Cage thoracique">
      <g className={cn(!reduce && 'animate-breathe')} style={{ transformOrigin: '100px 110px', animationDuration: '4.2s' }}>
        <g fill="none" stroke={RED} strokeWidth="3.5" strokeLinecap="round">
          {/* Colonne + sternum */}
          <path d="M100 28 V150" strokeWidth="4" />
          <path d="M100 60 V120" stroke={INK} strokeWidth="3" opacity="0.6" />
          {/* Côtes gauche/droite (paires) */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = 56 + i * 17
            const spread = 34 + i * 9
            const drop = 18 + i * 5
            return (
              <g key={i}>
                <path d={`M100 ${y} C ${100 - spread} ${y - 4}, ${100 - spread - 6} ${y + drop}, ${100 - 14} ${y + drop + 10}`} />
                <path d={`M100 ${y} C ${100 + spread} ${y - 4}, ${100 + spread + 6} ${y + drop}, ${100 + 14} ${y + drop + 10}`} />
              </g>
            )
          })}
        </g>
      </g>
    </svg>
  )
}

/** Poche de sang médicale — niveau de liquide avec pulsation et gouttelette. */
export function BloodBag({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="Poche de sang de transfusion">
      {/* Attache haute */}
      <rect x="85" y="15" width="30" height="14" rx="4" fill="#ffffff" stroke={RED} strokeWidth="3" />
      <circle cx="100" cy="22" r="4" fill={RED} />
      
      {/* Poche principale */}
      <rect x="45" y="28" width="110" height="135" rx="18" fill="#ffffff" stroke={RED} strokeWidth="3.5" />
      
      {/* Sang dans la poche */}
      <path
        d="M 48 70 Q 75 66 100 70 T 152 70 L 152 145 Q 152 160 137 160 L 63 160 Q 48 160 48 145 Z"
        fill={RED}
        opacity="0.9"
        className={cn(!reduce && 'animate-pulse')}
      />
      
      {/* Étiquette centrale */}
      <rect x="65" y="80" width="70" height="42" rx="6" fill="#ffffff" stroke="#fecdd3" strokeWidth="1.5" />
      <text x="100" y="100" textAnchor="middle" fill={RED} fontSize="14" fontWeight="bold" fontFamily="monospace">O- NEG</text>
      <text x="100" y="113" textAnchor="middle" fill="#881337" fontSize="8" fontWeight="600">CNTS · 450 mL</text>

      {/* Graduation */}
      <line x1="145" y1="50" x2="138" y2="50" stroke="#f43f5e" strokeWidth="2" />
      <line x1="145" y1="65" x2="135" y2="65" stroke="#f43f5e" strokeWidth="2" />
      <line x1="145" y1="80" x2="138" y2="80" stroke="#f43f5e" strokeWidth="2" />
      <line x1="145" y1="95" x2="135" y2="95" stroke="#f43f5e" strokeWidth="2" />

      {/* Tubulure et goutte */}
      <path d="M 100 163 V 180 Q 100 190 115 190 H 130" fill="none" stroke={RED} strokeWidth="3" strokeLinecap="round" />
      <circle cx="138" cy="190" r="4" fill={RED} className={cn(!reduce && 'animate-ping')} style={{ animationDuration: '2s' }} />
    </svg>
  )
}

/** Navette express / véhicule de transport urgent de sang — roues qui tournent. */
export function BloodTransport({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const wheel = (cx: number) => (
    <g style={{ transformOrigin: `${cx}px 96px` }} className={cn(!reduce && 'animate-[spin_1.1s_linear_infinite]')}>
      <circle cx={cx} cy="96" r="15" fill="#1f2937" />
      <circle cx={cx} cy="96" r="15" fill="none" stroke="#374151" strokeWidth="2" />
      <circle cx={cx} cy="96" r="6.5" fill="#e5e7eb" />
      <g stroke="#9ca3af" strokeWidth="2">
        <line x1={cx} y1="83" x2={cx} y2="109" />
        <line x1={cx - 13} y1="96" x2={cx + 13} y2="96" />
        <line x1={cx - 9} y1="87" x2={cx + 9} y2="105" />
        <line x1={cx - 9} y1="105" x2={cx + 9} y2="87" />
      </g>
    </g>
  )
  return (
    <svg viewBox="0 0 240 120" className={className} role="img" aria-label="Transport urgent de poches de sang">
      {/* Caisse fourgonette CNTS */}
      <rect x="22" y="40" width="150" height="56" rx="9" fill="#ffffff" stroke={RED} strokeWidth="3" />
      {/* Cabine */}
      <path d="M172 96 V58 q0-6 6-6 h14 q5 0 8 4 l16 22 q3 4 3 9 v9 q0 0 0 0 H172 Z" fill="#ffffff" stroke={RED} strokeWidth="3" />
      {/* Bandeau rouge CNTS */}
      <rect x="22" y="62" width="150" height="12" fill={RED} opacity="0.95" />
      <text x="96" y="71" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold" letterSpacing="1">URGENCE SANG</text>
      {/* Symbole goutte de sang */}
      <g fill={RED}>
        <path d="M 68 46 C 68 46 60 55 60 60 C 60 64.4 63.6 68 68 68 C 72.4 68 76 64.4 76 60 C 76 55 68 46 68 46 Z" />
      </g>
      {/* Pare-brise */}
      <path d="M178 58 h12 q3 0 5 3 l9 13 h-26 Z" fill="#fee2e2" stroke={RED} strokeWidth="2" />
      {/* Gyrophare sang */}
      <rect x="92" y="33" width="20" height="8" rx="3" fill={RED} className={cn(!reduce && 'animate-pulse')} />
      {/* Phare */}
      <circle cx="214" cy="84" r="4" fill="#fde68a" />
      {/* Sol */}
      <line x1="0" y1="112" x2="240" y2="112" stroke={INK} strokeWidth="2" strokeDasharray="14 10" opacity="0.35" />
      {wheel(70)}
      {wheel(186)}
    </svg>
  )
}
