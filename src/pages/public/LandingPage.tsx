import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useReducedMotion, useInView, type Variants } from 'framer-motion'
import { ArrowRight, Eye, Send, Truck, ShieldCheck, Activity, HeartPulse, Stethoscope as StethoIcon, Droplet, Heart } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { HeartBeat, Lungs, EcgContinuous } from '@/components/landing/Anatomy'
import { Ambulance, Stethoscope, Ribcage } from '@/components/landing/LandingArt'
import { Img } from '@/components/landing/Img'
import { NumberTicker } from '@/components/shadcn/number-ticker'
import { ShimmerButton } from '@/components/shadcn/shimmer-button'

const RED = '#e11d48'
const DOC_HERO = '/images/doctor.jpg'
const DOC_BAND = '/images/dispatch-center.jpg'

function Reveal({ children, delay = 0, y = 28, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const variants: Variants = {
    hidden: { opacity: 0, y },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } },
  }
  return (
    <motion.div className={className} variants={variants} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: heroProg } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroFloat = useTransform(heroProg, [0, 1], [0, reduce ? 0 : -50])

  // Ambulance : démarre uniquement quand la section est visible
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [trackW, setTrackW] = useState(900)
  const ambulanceInView = useInView(sectionRef, { margin: '-80px 0px' })
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setTrackW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* En-tête */}
      <header className="sticky top-0 z-50 border-b border-rose-100/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo textClassName="text-slate-900" />
          <div className="flex items-center gap-3">
            <Link
              to="/donneur"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 text-[13px] font-bold text-red-700 shadow-sm transition hover:bg-red-100"
            >
              <Droplet className="h-3.5 w-3.5 fill-red-600 text-red-600" />
              Espace Donneur Citoyen
            </Link>
            <Link to="/login" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-rose-600 px-5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-rose-700">
              Se connecter
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section ref={heroRef} className="relative overflow-hidden">
        {/* Image médecin en fond très subtil */}
        <Img src={DOC_BAND} alt="" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/60 via-white/85 to-white" aria-hidden />
        <div className="pointer-events-none absolute -top-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-rose-200/50 blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute top-40 -left-24 h-80 w-80 rounded-full bg-rose-100 blur-[100px]" aria-hidden />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-[12px] font-semibold text-rose-700">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600" /></span>
                Coordination hospitalière en temps réel · Sénégal
              </span>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="mt-6 font-display text-[2.6rem] leading-[1.05] font-bold tracking-tight text-slate-900 sm:text-6xl">
                Trouver un lit ne devrait jamais prendre <span className="text-rose-600">des heures.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-md text-[16px] leading-relaxed text-slate-500">
                La carte nationale des lits disponibles et la coordination des transferts inter-hospitaliers, en temps réel — pour gagner les minutes qui sauvent des vies.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ShimmerButton onClick={() => navigate('/login')} shimmerColor="#fecdd3" background={RED} className="h-12 px-7 text-[15px] font-semibold shadow-lg shadow-rose-600/20">
                  Espace Hôpitaux <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </ShimmerButton>
                <Link
                  to="/donneur"
                  className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-red-200 bg-red-50/90 px-6 text-[15px] font-bold text-red-700 transition hover:bg-red-100 shadow-sm"
                >
                  <Droplet className="h-4 w-4 fill-red-600 text-red-600" />
                  App Don de Sang Citoyen
                </Link>
                <a href="#histoire" className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 px-5 text-[14px] font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50">
                  Découvrir
                </a>
              </div>
            </Reveal>
          </div>

          {/* Visuel : médecin réel + surcouches animées */}
          <motion.div style={{ y: heroFloat }} className="relative mx-auto w-full max-w-sm">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-rose-100 shadow-[0_30px_80px_-30px_rgba(225,29,72,0.4)]">
              <Img src={DOC_HERO} alt="Médecin avec stéthoscope" className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-950/35 via-transparent to-transparent" aria-hidden />
              <motion.div animate={reduce ? {} : { y: [0, -9, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-4 left-4 rounded-2xl border border-rose-100 bg-white/90 p-2.5 shadow-lg backdrop-blur">
                <HeartBeat className="h-12 w-12" />
              </motion.div>
              <motion.div animate={reduce ? {} : { y: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-4 right-4 rounded-2xl border border-rose-100 bg-white/90 p-2 shadow-lg backdrop-blur">
                <Stethoscope className="h-11 w-11" />
              </motion.div>
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-rose-100 bg-white/92 px-3 py-2 shadow-lg backdrop-blur">
                <EcgContinuous className="h-8 w-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* LE PROBLÈME */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal><h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Le problème, aujourd'hui</h2></Reveal>
        <Reveal delay={0.05}><p className="mx-auto mt-3 max-w-xl text-center text-slate-500">Faute de visibilité, le médecin appelle d'hôpital en hôpital pour trouver une place. Des heures perdues.</p></Reveal>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { v: 4, s: ' h', t: 'perdues en moyenne à chercher une place par téléphone' },
            { v: 15, s: '+', t: 'appels passés pour un seul transfert complexe' },
            { v: 100, s: '%', t: 'des établissements réunis sur une seule plateforme' },
          ].map((c, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="group rounded-3xl border border-rose-100 bg-white p-7 text-center shadow-sm transition hover:-translate-y-1 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-600/10">
                <p className="font-display text-5xl font-bold text-rose-600 tabular-nums"><NumberTicker value={c.v} className="text-rose-600" />{c.s}</p>
                <p className="mt-3 text-[14px] leading-relaxed text-slate-500">{c.t}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-[11px] text-slate-400">Données illustratives.</p>
      </section>

      {/* BANDEAU MÉDECINS */}
      <section className="relative overflow-hidden">
        <Img src={DOC_BAND} alt="Médecin au travail" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-rose-700/95 via-rose-600/85 to-rose-500/60" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-5 py-24 text-white">
          <Reveal>
            <p className="text-[13px] font-semibold tracking-widest text-rose-100 uppercase">Au service de ceux qui soignent</p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl leading-tight font-bold sm:text-4xl">Donner aux soignants les bonnes informations, au bon moment.</h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-rose-50/90">Chaque seconde gagnée à la recherche d'un lit est une seconde rendue au patient. Jokko Santé met la technologie au service du geste qui sauve.</p>
          </Reveal>
          <div className="mt-9 flex flex-wrap gap-8">
            {[{ v: 15, s: '', t: 'établissements connectés' }, { v: 14, s: '', t: 'régions médicales' }, { v: 2, s: ' s', t: 'pour propager une mise à jour' }].map((k, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div><p className="font-display text-4xl font-bold tabular-nums"><NumberTicker value={k.v} className="text-white" />{k.s}</p><p className="text-[13px] text-rose-100/80">{k.t}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HISTOIRE — L'AMBULANCE QUI ROULE */}
      <section ref={sectionRef} id="histoire" className="relative overflow-hidden border-y border-rose-100 bg-gradient-to-b from-rose-50/60 to-white py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal><h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Du téléphone… au temps réel</h2></Reveal>
          <Reveal delay={0.05}><p className="mx-auto mt-3 max-w-xl text-center text-slate-500">De la demande à l'arrivée, le patient est suivi à chaque étape.</p></Reveal>

          <div ref={trackRef} className="relative mt-16 h-44">
            <Marker label="Pikine" side="left" />
            <Marker label="H. Principal" side="right" />
            <div className="absolute inset-x-0 bottom-6 h-[3px] overflow-hidden bg-rose-200">
              <motion.div className="h-full w-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#e11d48 0 18px,transparent 18px 36px)', backgroundSize: '36px 100%' }} animate={reduce || !ambulanceInView ? {} : { backgroundPositionX: ['0px', '-36px'] }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
            </div>
            <motion.div
              className="absolute bottom-3 left-0 w-40"
              animate={reduce ? { x: trackW * 0.4 } : ambulanceInView ? { x: [-40, trackW - 120] } : { x: -40 }}
              transition={reduce || !ambulanceInView ? { duration: 0 } : { duration: 7.5, repeat: Infinity, ease: 'linear' }}
            >
              <Ambulance className="w-40 drop-shadow-lg" />
            </motion.div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { icon: Eye, t: 'Le médecin voit, en direct, où il reste de la place.' },
              { icon: Send, t: 'Il envoie une demande de transfert anonymisée en quelques secondes.' },
              { icon: Truck, t: "L'acceptation est tracée, l'ambulance suivie jusqu'à l'arrivée." },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600"><s.icon className="h-5 w-5" /></span>
                  <p className="text-[14px] leading-relaxed text-slate-600">{s.t}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CONÇU POUR LE CORPS MÉDICAL */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <Reveal><h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Conçu pour le corps médical</h2></Reveal>
        <Reveal delay={0.05}><p className="mx-auto mt-3 max-w-xl text-center text-slate-500">Une exigence clinique, jusque dans le moindre détail.</p></Reveal>
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { art: <HeartBeat className="h-28 w-28" />, icon: HeartPulse, title: 'Cardiologie', text: 'Chaque minute compte : orientation immédiate vers le bon plateau technique.' },
            { art: <Lungs className="h-28 w-28" />, icon: Activity, title: 'Réanimation', text: "Visibilité directe sur l'oxygène, les respirateurs et les lits critiques." },
            { art: <Ribcage className="h-28 w-28" />, icon: Activity, title: 'Traumatologie', text: 'Le bon hôpital, avec le bon équipement, sans perdre de temps.' },
            { art: <Stethoscope className="h-28 w-28" />, icon: StethoIcon, title: 'Suivi clinique', text: 'Constantes et motif transmis, parcours tracé de bout en bout.' },
          ].map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-rose-100 bg-white p-7 text-center shadow-sm transition hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-rose-600/10">
                <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-rose-50 transition group-hover:scale-150" aria-hidden />
                <div className="relative flex h-32 items-center justify-center">{p.art}</div>
                <h3 className="relative mt-3 inline-flex items-center gap-2 font-display text-lg font-bold text-rose-600"><p.icon className="h-4 w-4" />{p.title}</h3>
                <p className="relative mt-2 text-[13.5px] leading-relaxed text-slate-500">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* POSITIONNEMENT */}
      <section className="border-y border-rose-100 bg-rose-50/40">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <Reveal><h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Pensé pour s'intégrer à l'écosystème national</h2></Reveal>
          <Reveal delay={0.05}><p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-500">Un module de coordination complémentaire de l'existant. Pas un dossier patient : données minimales et anonymisées (initiales, âge, sexe, motif), conformément à la CDP. Interopérabilité via HL7 FHIR.</p></Reveal>
          <Reveal delay={0.1}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
              {['Dossier Patient Unique (DPU)', 'DHIS2', 'HL7 FHIR', 'Conformité CDP'].map((x) => (
                <span key={x} className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500"><ShieldCheck className="h-4 w-4 text-rose-500" /> {x}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTION DON DE SANG & CNTS */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-red-700 via-rose-600 to-red-800 p-8 sm:p-12 text-white shadow-2xl shadow-red-600/20">
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold backdrop-blur-md">
                <Droplet className="h-3.5 w-3.5 fill-white text-white" />
                Nouveau · Module Urgences Transfusionnelles & CNTS
              </span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight">
                Mobiliser les donneurs de sang en temps réel, partout au Sénégal.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-red-100/90 leading-relaxed">
                Quand un bloc opératoire ou une maternité manque de poches de sang (O-, A+, B-…), l'hôpital lance une alerte ciblée. Les citoyens donneurs reçoivent la notification instantanée, confirment leur venue et reçoivent un pass d'accès prioritaire.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/donneur"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-bold text-red-700 shadow-lg transition hover:bg-red-50"
                >
                  <Heart className="h-4 w-4 fill-red-600 text-red-600" />
                  Tester l'App Citoyenne (/donneur)
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
                >
                  Espace Hôpital & CNTS
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { n: '< 2 s', t: 'Diffusion temps réel des alertes sang' },
                { n: '100%', t: 'Compatibilité des groupes ABO / Rhésus' },
                { n: '14', t: 'Régions médicales connectées au CNTS' },
                { n: 'Pass QR', t: 'Code prioritaire remis au donneur' },
              ].map((b, i) => (
                <div key={i} className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 sm:p-5 text-center">
                  <p className="font-display text-2xl sm:text-3xl font-black">{b.n}</p>
                  <p className="mt-1 text-xs text-red-100/80">{b.t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 mx-auto h-64 max-w-3xl rounded-full bg-rose-200/40 blur-[120px]" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-5 py-24 text-center">
          <Reveal>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/30"><HeartPulse className="h-7 w-7" /></span>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Prêt à voir Jokko Santé en action ?</h2>
            <p className="mx-auto mt-3 max-w-md text-slate-500">Connectez-vous avec un compte de démonstration et jouez le scénario complet d'un transfert critique.</p>
            <div className="mt-8 flex justify-center">
              <ShimmerButton onClick={() => navigate('/login')} shimmerColor="#fecdd3" background={RED} className="h-12 px-8 text-[15px] font-semibold shadow-lg shadow-rose-600/20">
                Voir la démo <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </ShimmerButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-rose-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-9 text-[13px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <Logo textClassName="text-slate-700" />
          <p>Projet candidat — prototype de démonstration. Données illustratives anonymisées (CDP).</p>
          <p>contact@jokkosante.sn</p>
        </div>
      </footer>
    </div>
  )
}

function Marker({ label, side }: { label: string; side: 'left' | 'right' }) {
  return (
    <div className={`absolute bottom-6 ${side === 'left' ? 'left-0' : 'right-0'} flex flex-col items-center`}>
      <span className="mb-2 rounded-full border border-rose-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 shadow-sm">{label}</span>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-600 text-white shadow-md">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l7-4 7 4v14" /><path d="M10 12h4M12 10v4" /></svg>
      </span>
      <span className="mt-1 h-3 w-[3px] bg-rose-300" />
    </div>
  )
}
