import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useReducedMotion, useInView, type Variants } from 'framer-motion'
import {
  ArrowRight,
  Eye,
  Send,
  ShieldCheck,
  Heart,
  MapPin,
  Clock,
  Phone,
  CheckCircle,
  AlertCircle,
  Droplet,
  Check,
  Activity,
  HeartPulse,
  Sparkles,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { Logo } from '@/components/brand/Logo'
import { HeartBeat, Lungs, EcgContinuous } from '@/components/landing/Anatomy'
import { BloodBag, BloodTransport, Stethoscope } from '@/components/landing/LandingArt'
import { Img } from '@/components/landing/Img'
import { NumberTicker } from '@/components/shadcn/number-ticker'
import { ShimmerButton } from '@/components/shadcn/shimmer-button'
import { useBloodStore } from '@/features/blood/bloodStore'

const RED = '#e11d48'

const DONOR_HERO = '/images/donor-hero.jpg'
const DONOR_BG = '/images/donor-bg.jpg'
const DONOR_BANNER = '/images/donor-banner.jpg'

// Matrice de compatibilité sanguine (ABO / Rhésus)
const BLOOD_COMPATIBILITY: Record<
  string,
  { giveTo: string[]; receiveFrom: string[]; tag: string; desc: string }
> = {
  'O-': {
    giveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    receiveFrom: ['O-'],
    tag: 'Donneur Universel',
    desc: 'Indispensable en urgence vitale immédiate au bloc opératoire quand le groupe du patient est encore inconnu.',
  },
  'O+': {
    giveTo: ['O+', 'A+', 'B+', 'AB+'],
    receiveFrom: ['O+', 'O-'],
    tag: 'Groupe le plus fréquent',
    desc: 'Le groupe le plus répandu au Sénégal, vital pour les urgences en maternité et traumatologie.',
  },
  'A-': {
    giveTo: ['A-', 'A+', 'AB-', 'AB+'],
    receiveFrom: ['A-', 'O-'],
    tag: 'Groupe rare',
    desc: 'Précieux pour les transfusions ciblées et les soins programmés des personnes du groupe A et AB.',
  },
  'A+': {
    giveTo: ['A+', 'AB+'],
    receiveFrom: ['A+', 'A-', 'O+', 'O-'],
    tag: 'Forte demande',
    desc: 'Compatible avec près de la moitié des patients hospitalisés nécessitant une transfusion.',
  },
  'B-': {
    giveTo: ['B-', 'B+', 'AB-', 'AB+'],
    receiveFrom: ['B-', 'O-'],
    tag: 'Groupe rare',
    desc: 'Essentiel pour répondre aux besoins spécifiques et imprévus des patients B- et AB-.',
  },
  'B+': {
    giveTo: ['B+', 'AB+'],
    receiveFrom: ['B+', 'B-', 'O+', 'O-'],
    tag: 'Très demandé',
    desc: 'Très présent dans la population sénégalaise, hautement nécessaire en hématologie.',
  },
  'AB-': {
    giveTo: ['AB-', 'AB+'],
    receiveFrom: ['AB-', 'A-', 'B-', 'O-'],
    tag: 'Groupe très rare',
    desc: 'Moins de 1% de la population, précieux donneur universel de plasma thérapeutique.',
  },
  'AB+': {
    giveTo: ['AB+'],
    receiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    tag: 'Receveur Universel',
    desc: 'Peut recevoir du sang de tous les groupes sanguins lors d’un besoin vital.',
  },
}

const FIXED_CENTERS = [
  {
    name: 'Centre National de Transfusion Sanguine (CNTS)',
    address: 'Avenue Cheikh Anta Diop (en face Fann), Dakar',
    hours: 'Lun - Sam : 08h00 - 18h00',
    phone: '33 821 28 38',
  },
  {
    name: 'Banque de Sang · Hôpital Principal de Dakar',
    address: '1, Avenue Nelson Mandela, Dakar Plateau',
    hours: '24h/24 · Service des urgences',
    phone: '33 839 50 50',
  },
  {
    name: 'Banque de Sang · CHU Dalal Jamm',
    address: 'Guédiawaye, Dakar',
    hours: 'Lun - Ven : 08h30 - 16h30',
    phone: '33 879 20 00',
  },
  {
    name: 'Centre Régional de Transfusion Sanguine · Thiès',
    address: 'Hôpital Régional Ahmadou Sakhir Ndiéguène, Thiès',
    hours: 'Lun - Sam : 08h00 - 15h00',
    phone: '33 951 10 20',
  },
]

function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const variants: Variants = {
    hidden: { opacity: 0, y },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } },
  }
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </motion.div>
  )
}

function TrackMarker({ label, side }: { label: string; side: 'left' | 'right' }) {
  return (
    <div className={`absolute bottom-6 ${side === 'left' ? 'left-0' : 'right-0'} flex flex-col items-center`}>
      <span className="mb-2 rounded-full border border-rose-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 shadow-sm">
        {label}
      </span>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-600 text-white shadow-md">
        <Droplet className="h-5 w-5 fill-white" />
      </span>
      <span className="mt-1 h-3 w-[3px] bg-rose-300" />
    </div>
  )
}

export default function DonneurLandingPage() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const { alerts } = useBloodStore()
  const activeAlerts = alerts.filter((a) => a.status === 'active')

  // Parallaxe Hero
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: heroProg } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroFloat = useTransform(heroProg, [0, 1], [0, reduce ? 0 : -50])

  // Track Transport animé (démarre quand la section est visible)
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [trackW, setTrackW] = useState(900)
  const transportInView = useInView(sectionRef, { margin: '-80px 0px' })

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setTrackW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Simulateur éligibilité
  const [ageOk, setAgeOk] = useState<boolean | null>(null)
  const [weightOk, setWeightOk] = useState<boolean | null>(null)
  const [delayOk, setDelayOk] = useState<boolean | null>(null)

  const isEligible = ageOk === true && weightOk === true && delayOk === true
  const isEvaluated = ageOk !== null && weightOk !== null && delayOk !== null

  const handleConfetti = () => {
    try {
      void confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.65 },
        colors: ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#ffffff'],
      })
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (isEligible) {
      handleConfetti()
    }
  }, [isEligible])

  // Sélecteur compatibilité
  const [selectedGroup, setSelectedGroup] = useState<string>('O-')

  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased selection:bg-rose-100 selection:text-rose-900">
      {/* En-tête Citoyen & Logo */}
      <header className="sticky top-0 z-50 border-b border-rose-100/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <Logo textClassName="text-slate-900" />
            <span className="hidden sm:inline-block h-5 w-px bg-rose-200" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 border border-red-200/70">
              <Droplet className="h-3 w-3 fill-red-600 text-red-600" />
              Espace Donneur Citoyen
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/donneur/urgences"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-rose-600 px-4 sm:px-5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-rose-700"
            >
              <Droplet className="h-3.5 w-3.5 fill-white text-white" />
              <span>Besoins Urgents ({activeAlerts.length})</span>
            </Link>
            <a
              href="#simulateur"
              className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 px-4 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Suis-je éligible ?
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION SUR FOND BLANC LUMINEUX AVEC PARALLAXE */}
      <section ref={heroRef} className="relative overflow-hidden bg-white">
        {/* Filigrane d'ambiance très subtil sur fond blanc */}
        <div className="pointer-events-none absolute inset-0">
          <Img
            src={DONOR_BG}
            alt=""
            className="h-full w-full object-cover opacity-[0.04]"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/60 via-white/85 to-white" aria-hidden />
        <div className="pointer-events-none absolute -top-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-rose-200/50 blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute top-40 -left-24 h-80 w-80 rounded-full bg-rose-100 blur-[100px]" aria-hidden />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-[12px] font-semibold text-rose-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600" />
                </span>
                Mobilisation Citoyenne · CNTS Sénégal
              </span>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="mt-6 font-display text-[2.6rem] leading-[1.05] font-bold tracking-tight text-slate-900 sm:text-6xl">
                Chaque don de sang est une <span className="text-rose-600">vie sauvée.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-md text-[16px] leading-relaxed text-slate-500">
                La plateforme citoyenne du Sénégal qui alerte les donneurs volontaires en temps réel lors des pénuries critiques dans les banques de sang et maternités.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ShimmerButton
                  onClick={() => navigate('/donneur/urgences')}
                  shimmerColor="#fecdd3"
                  background={RED}
                  className="h-12 px-7 text-[15px] font-semibold shadow-lg shadow-rose-600/20"
                >
                  Besoins Urgents en Direct <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </ShimmerButton>
                <a
                  href="#simulateur"
                  className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-red-200 bg-red-50/90 px-6 text-[15px] font-bold text-red-700 transition hover:bg-red-100 shadow-sm"
                >
                  <ShieldCheck className="h-4 w-4 text-red-600" />
                  Tester mon éligibilité
                </a>
                <a
                  href="#parcours"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 px-5 text-[14px] font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50"
                >
                  Découvrir
                </a>
              </div>
            </Reveal>
          </div>

          {/* Visuel Hero : Carte médecin & donneur + surcouches animées */}
          <motion.div style={{ y: heroFloat }} className="relative mx-auto w-full max-w-sm">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-rose-100 shadow-[0_30px_80px_-30px_rgba(225,29,72,0.4)]">
              <Img
                src={DONOR_HERO}
                alt="Donneur de sang souriant et geste citoyen"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-950/35 via-transparent to-transparent" aria-hidden />
              
              {/* Badge Cœur vibrant */}
              <motion.div
                animate={reduce ? {} : { y: [0, -9, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-4 left-4 rounded-2xl border border-rose-100 bg-white/90 p-2.5 shadow-lg backdrop-blur"
              >
                <HeartBeat className="h-12 w-12" />
              </motion.div>

              {/* Badge Poche de sang animée */}
              <motion.div
                animate={reduce ? {} : { y: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-4 right-4 rounded-2xl border border-rose-100 bg-white/90 p-2 shadow-lg backdrop-blur"
              >
                <BloodBag className="h-12 w-12" />
              </motion.div>

              {/* Tracé continu au bas */}
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-rose-100 bg-white/92 px-3 py-2 shadow-lg backdrop-blur">
                <EcgContinuous className="h-8 w-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* LE PROBLÈME AUJOURD'HUI (MÉTRIQUES CLÉS DONNEURS) */}
      <section className="mx-auto max-w-6xl px-5 py-20 bg-white">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            L'urgence du don au Sénégal
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">
            Chaque jour, des mères en maternité, des accidentés de la route et des enfants anémiques dépendent de la disponibilité immédiate du sang.
          </p>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { v: 160, s: ' 000+', t: 'poches de sang nécessaires par an pour répondre aux urgences' },
            { v: 15, s: ' min', t: 'durée moyenne d’un prélèvement pour sauver jusqu’à 3 vies' },
            { v: 100, s: '%', t: 'gratuit, sécurisé et anonyme selon les normes du CNTS et de l’OMS' },
          ].map((c, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="group rounded-3xl border border-rose-100 bg-white p-7 text-center shadow-sm transition hover:-translate-y-1 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-600/10">
                <p className="font-display text-5xl font-bold text-rose-600 tabular-nums">
                  <NumberTicker value={c.v} className="text-rose-600" />
                  {c.s}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-slate-500">{c.t}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-[11px] text-slate-400">Données officielles CNTS & Ministère de la Santé du Sénégal.</p>
      </section>

      {/* BANDEAU DONNEURS & SOLIDARITÉ CITOYENNE */}
      <section className="relative overflow-hidden">
        <Img src={DONOR_BANNER} alt="Solidarité don de sang au Sénégal" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-rose-700/95 via-rose-600/85 to-rose-500/60" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-5 py-24 text-white">
          <Reveal>
            <p className="text-[13px] font-semibold tracking-widest text-rose-100 uppercase">
              Au service de la vie et des malades
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl leading-tight font-bold sm:text-4xl">
              Donner aux soignants le sang nécessaire, au bon moment.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-rose-50/90">
              Chaque seconde gagnée lors d'une hémorragie obstétricale ou d'une intervention chirurgicale est une seconde qui sauve. Jokko Donneur met la solidarité numérique au service du geste qui guérit.
            </p>
          </Reveal>
          <div className="mt-9 flex flex-wrap gap-8">
            {[
              { v: 14, s: '', t: 'régions médicales connectées' },
              { v: 2, s: ' s', t: 'pour propager une alerte ciblée' },
              { v: 3, s: ' vies', t: 'sauvées par chaque don' },
            ].map((k, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div>
                  <p className="font-display text-4xl font-bold tabular-nums">
                    <NumberTicker value={k.v} className="text-white" />
                    {k.s}
                  </p>
                  <p className="text-[13px] text-rose-100/80">{k.t}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HISTOIRE — LE PARCOURS DU DONNEUR EN DIRECT */}
      <section
        ref={sectionRef}
        id="parcours"
        className="relative overflow-hidden border-y border-rose-100 bg-gradient-to-b from-rose-50/60 to-white py-24"
      >
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              De l'alerte au geste qui sauve
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">
              De la notification au prélèvement, le parcours du donneur est fluide et sécurisé.
            </p>
          </Reveal>

          {/* Animation du véhicule de transfusion le long de la piste */}
          <div ref={trackRef} className="relative mt-16 h-44">
            <TrackMarker label="Alerte Pénurie (Maternité / Urgences)" side="left" />
            <TrackMarker label="Donneur Mobilisé & CNTS" side="right" />
            <div className="absolute inset-x-0 bottom-6 h-[3px] overflow-hidden bg-rose-200">
              <motion.div
                className="h-full w-full"
                style={{
                  backgroundImage: 'repeating-linear-gradient(90deg,#e11d48 0 18px,transparent 18px 36px)',
                  backgroundSize: '36px 100%',
                }}
                animate={reduce || !transportInView ? {} : { backgroundPositionX: ['0px', '-36px'] }}
                transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            <motion.div
              className="absolute bottom-3 left-0 w-40"
              animate={
                reduce
                  ? { x: trackW * 0.4 }
                  : transportInView
                    ? { x: [-40, trackW - 120] }
                    : { x: -40 }
              }
              transition={
                reduce || !transportInView
                  ? { duration: 0 }
                  : { duration: 7.5, repeat: Infinity, ease: 'linear' }
              }
            >
              <BloodTransport className="w-40 drop-shadow-lg" />
            </motion.div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              {
                icon: Eye,
                t: 'Le citoyen voit, en direct, les pénuries de sang dans sa localité.',
              },
              {
                icon: Send,
                t: 'Il confirme sa venue et reçoit son pass prioritaire en quelques secondes.',
              },
              {
                icon: ShieldCheck,
                t: 'Le prélèvement est encadré et la poche de sang tracée jusqu’au receveur.',
              },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <p className="text-[14px] leading-relaxed text-slate-600">{s.t}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CONÇU POUR SAUVER DES VIES (LES 4 PILIERS DU DON) */}
      <section className="mx-auto max-w-6xl px-5 py-24 bg-white">
        <Reveal>
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Conçu pour sauver des vies
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">
            Une mobilisation ciblée et sécurisée, jusque dans le moindre détail.
          </p>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              art: <HeartBeat className="h-28 w-28" />,
              icon: HeartPulse,
              title: 'Urgences vitales',
              text: 'Acheminement immédiat des poches vers les blocs chirurgicaux et réanimations.',
            },
            {
              art: <BloodBag className="h-28 w-28" />,
              icon: Droplet,
              title: 'Maternités',
              text: 'Prévention vitale des hémorragies post-partum pour protéger les mamans.',
            },
            {
              art: <Lungs className="h-28 w-28" />,
              icon: Activity,
              title: 'Hématologie',
              text: 'Prise en charge des anémies sévères et des drépanocytoses au Sénégal.',
            },
            {
              art: <Stethoscope className="h-28 w-28" />,
              icon: Sparkles,
              title: 'Suivi donneur',
              text: 'Bilan de santé systématique avant don et collation offerte par le personnel.',
            },
          ].map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-rose-100 bg-white p-7 text-center shadow-sm transition hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-rose-600/10">
                <div
                  className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-rose-50 transition group-hover:scale-150"
                  aria-hidden
                />
                <div className="relative flex h-32 items-center justify-center">{p.art}</div>
                <h3 className="relative mt-3 inline-flex items-center gap-2 font-display text-lg font-bold text-rose-600">
                  <p.icon className="h-4 w-4" />
                  {p.title}
                </h3>
                <p className="relative mt-2 text-[13.5px] leading-relaxed text-slate-500">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CALCULATEUR DE COMPATIBILITÉ SANGUINE (ABO & RHÉSUS) */}
      <section id="compatibilite" className="mx-auto max-w-6xl px-5 py-24 bg-white">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
              <Droplet className="h-3.5 w-3.5 fill-rose-600 text-rose-600" />
              Matrice Transfusionnelle
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Quel est votre groupe sanguin ?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-500">
              Sélectionnez votre groupe pour visualiser à qui vous pouvez donner vos globules rouges et de qui vous pouvez recevoir.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 rounded-3xl border border-rose-100 bg-white p-6 sm:p-10 shadow-sm">
            {/* Boutons des 8 groupes sanguins */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {Object.keys(BLOOD_COMPATIBILITY).map((bg) => (
                <button
                  key={bg}
                  onClick={() => setSelectedGroup(bg)}
                  className={`h-12 w-16 sm:w-20 rounded-2xl font-mono text-base font-black transition-all ${
                    selectedGroup === bg
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105'
                      : 'border border-rose-100 bg-rose-50/60 text-slate-700 hover:bg-rose-100/80'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>

            {/* Fiche interactive du groupe sélectionné */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Vous pouvez donner vos globules rouges à :</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {BLOOD_COMPATIBILITY[selectedGroup].giveTo.map((g) => (
                    <span
                      key={g}
                      className="rounded-xl bg-emerald-600 px-3.5 py-1.5 font-mono text-sm font-bold text-white shadow-xs"
                    >
                      {g}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-xs text-emerald-900/80 leading-relaxed">
                  {BLOOD_COMPATIBILITY[selectedGroup].desc}
                </p>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-6">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <Droplet className="h-4 w-4 text-rose-600 fill-rose-600" />
                  <span>En cas de besoin vital, vous pouvez recevoir de :</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {BLOOD_COMPATIBILITY[selectedGroup].receiveFrom.map((g) => (
                    <span
                      key={g}
                      className="rounded-xl bg-rose-600 px-3.5 py-1.5 font-mono text-sm font-bold text-white shadow-xs"
                    >
                      {g}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-md border border-rose-200 bg-white px-2.5 py-1 text-xs font-bold text-rose-700">
                    Statut : {BLOOD_COMPATIBILITY[selectedGroup].tag}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* SIMULATEUR D'ÉLIGIBILITÉ INTERACTIF AVEC CONFETTIS */}
      <section id="simulateur" className="border-y border-rose-100 bg-rose-50/40 py-20">
        <div className="mx-auto max-w-4xl px-5">
          <Reveal>
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-rose-200 px-3.5 py-1 text-xs font-bold text-rose-700">
                <ShieldCheck className="h-3.5 w-3.5 text-rose-600" />
                Vérification Express
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Simulateur d'Éligibilité au Don
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-500">
                Vérifiez en 3 questions si vous pouvez donner votre sang aujourd'hui selon les critères officiels du CNTS.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10 rounded-3xl border border-rose-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              {/* Question 1 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 pb-5">
                <div>
                  <p className="font-display font-bold text-slate-900 text-sm sm:text-base">
                    1. Avez-vous entre 18 et 60 ans ?
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Âge légal requis pour le don bénévole au Sénégal.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAgeOk(true)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      ageOk === true
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                        : 'border border-slate-200 text-slate-700 hover:bg-rose-50'
                    }`}
                  >
                    Oui
                  </button>
                  <button
                    onClick={() => setAgeOk(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      ageOk === false
                        ? 'bg-slate-800 text-white'
                        : 'border border-slate-200 text-slate-700 hover:bg-rose-50'
                    }`}
                  >
                    Non
                  </button>
                </div>
              </div>

              {/* Question 2 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 pb-5">
                <div>
                  <p className="font-display font-bold text-slate-900 text-sm sm:text-base">
                    2. Pesez-vous au moins 50 kg ?
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Poids minimal requis pour assurer le confort et la sécurité du donneur.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWeightOk(true)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      weightOk === true
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                        : 'border border-slate-200 text-slate-700 hover:bg-rose-50'
                    }`}
                  >
                    Oui
                  </button>
                  <button
                    onClick={() => setWeightOk(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      weightOk === false
                        ? 'bg-slate-800 text-white'
                        : 'border border-slate-200 text-slate-700 hover:bg-rose-50'
                    }`}
                  >
                    Non
                  </button>
                </div>
              </div>

              {/* Question 3 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 pb-5">
                <div>
                  <p className="font-display font-bold text-slate-900 text-sm sm:text-base">
                    3. Votre dernier don remonte à plus de 3 mois (ou premier don) ?
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Intervalle recommandé pour renouveler les réserves en fer et hémoglobine.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDelayOk(true)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      delayOk === true
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                        : 'border border-slate-200 text-slate-700 hover:bg-rose-50'
                    }`}
                  >
                    Oui
                  </button>
                  <button
                    onClick={() => setDelayOk(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      delayOk === false
                        ? 'bg-slate-800 text-white'
                        : 'border border-slate-200 text-slate-700 hover:bg-rose-50'
                    }`}
                  >
                    Non
                  </button>
                </div>
              </div>

              {/* Verdict interactif */}
              {isEvaluated && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl p-5 text-xs ${
                    isEligible
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border border-amber-200 bg-amber-50 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isEligible ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    )}
                    <span className="font-display font-bold text-base">
                      {isEligible
                        ? 'Félicitations, vous êtes éligible au don de sang !'
                        : 'Vous ne remplissez pas les conditions immédiates.'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed">
                    {isEligible
                      ? 'Vous pouvez répondre dès maintenant à l’une des alertes hospitalières en cours pour recevoir votre pass prioritaire.'
                      : 'Merci pour votre générosité. Consultez les équipes médicales du CNTS pour plus de précisions.'}
                  </p>
                  {isEligible && (
                    <div className="mt-4">
                      <ShimmerButton
                        onClick={() => navigate('/donneur/urgences')}
                        shimmerColor="#a7f3d0"
                        background="#059669"
                        className="h-10 px-5 text-xs font-bold text-white shadow-md"
                      >
                        Consulter les alertes et obtenir mon pass →
                      </ShimmerButton>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTION DES BESOINS URGENTS EN DIRECT (LIVE FEED) */}
      <section className="mx-auto max-w-6xl px-5 py-24 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1 text-xs font-bold text-rose-700">
              <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
              Temps Réel · CNTS Sénégal
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Besoins Hospitaliers Actuels ({activeAlerts.length})
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Ces demandes émanent directement des services d'urgence et des banques de sang sénégalaises.
            </p>
          </div>

          <Link
            to="/donneur/urgences"
            className="inline-flex items-center gap-2 text-sm font-bold text-rose-600 hover:text-rose-700"
          >
            <span>Voir toutes les alertes géolocalisées</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeAlerts.slice(0, 6).map((alert, i) => (
            <Reveal key={alert.id} delay={i * 0.08}>
              <div className="h-full flex flex-col justify-between rounded-3xl border border-rose-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-600/10">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-xl bg-rose-600 px-3 py-1 font-mono text-sm font-black text-white shadow-xs">
                      {alert.blood_group}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        alert.urgency === 'vital'
                          ? 'bg-red-100 text-red-700 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {alert.urgency === 'vital' ? 'Urgence Vitale' : 'Besoin Urgent'}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-base font-bold text-slate-900">
                    {alert.facility_name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {alert.clinical_reason}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-rose-50 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Besoin : {alert.bags_needed} poche(s)
                  </span>
                  <button
                    onClick={() => navigate('/donneur/urgences')}
                    className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                  >
                    <span>Répondre</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ENGAGEMENTS ET SÉCURITÉ DU DONNEUR */}
      <section className="border-y border-rose-100 bg-rose-50/30 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                La charte du donneur bénévole
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-500">
                Chaque prélèvement respecte scrupuleusement les exigences éthiques et médicales du Sénégal.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Bénévolat & Gratuité',
                desc: 'Le don de sang est un acte civique altruiste, gratuit et anonyme.',
              },
              {
                title: 'Entretien Médical',
                desc: 'Un médecin vérifie votre tension et votre état de forme avant tout don.',
              },
              {
                title: 'Matériel Stérile',
                desc: 'Usage unique exclusif : aucun risque de transmission pour le donneur.',
              },
              {
                title: 'Confidentialité CDP',
                desc: 'Vos données personnelles et médicales sont strictement protégées.',
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm text-center">
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-600 mb-4">
                    <Check className="h-5 w-5" />
                  </span>
                  <h3 className="font-display font-bold text-slate-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CENTRES DE PRÉLÈVEMENT FIXES */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Centres de Prélèvement Fixes au Sénégal
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-500">
                Vous pouvez également vous présenter spontanément dans l'un des centres permanents du réseau CNTS.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FIXED_CENTERS.map((center, i) => (
              <Reveal key={center.name} delay={i * 0.1}>
                <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm space-y-3">
                  <h3 className="font-display text-base font-bold text-slate-900">{center.name}</h3>
                  <p className="flex items-start gap-2 text-xs text-slate-500">
                    <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{center.address}</span>
                  </p>
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{center.hours}</span>
                  </p>
                  <div className="pt-2 border-t border-rose-50">
                    <a
                      href={`tel:${center.phone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-700"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{center.phone}</span>
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden bg-white">
        <div
          className="pointer-events-none absolute inset-0 mx-auto h-64 max-w-3xl rounded-full bg-rose-200/40 blur-[120px]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-5 py-24 text-center">
          <Reveal>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/30">
              <Heart className="h-7 w-7 fill-white" />
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Prêt à sauver des vies aujourd'hui ?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-slate-500">
              Consultez les urgences transfusionnelles de votre région et téléchargez votre convocation prioritaire.
            </p>
            <div className="mt-8 flex justify-center">
              <ShimmerButton
                onClick={() => navigate('/donneur/urgences')}
                shimmerColor="#fecdd3"
                background={RED}
                className="h-12 px-8 text-[15px] font-semibold shadow-lg shadow-rose-600/20"
              >
                Voir les Urgences en Direct <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </ShimmerButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-rose-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-9 text-[13px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Logo textClassName="text-slate-700" />
            <span className="text-xs text-slate-400">· Portail Citoyen Don de Sang</span>
          </div>
          <p>Don de sang bénévole, anonyme et gratuit au Sénégal (conformité CDP & MSAS).</p>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-600 hover:text-rose-600">
              Accueil Jokko Santé
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
