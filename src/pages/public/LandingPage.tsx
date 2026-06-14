import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, Send, Truck, ShieldCheck, Activity, Sun, Moon } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { EcgLine } from '@/components/brand/EcgLine'
import { useTheme } from '@/providers/ThemeProvider'
import { SenegalHero } from '@/components/landing/SenegalHero'
import { HeartBeat, Lungs, EcgContinuous } from '@/components/landing/Anatomy'
import { NumberTicker } from '@/components/shadcn/number-ticker'
import { ShimmerButton } from '@/components/shadcn/shimmer-button'
import { Meteors } from '@/components/shadcn/meteors'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5 },
}

export default function LandingPage() {
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-garde text-white">
      {/* En-tête */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-garde/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo textClassName="text-white" />
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="rounded-lg p-2 text-slate-300 transition hover:bg-white/5" aria-label="Changer de thème">
              {theme === 'garde' ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
            </button>
            <Link to="/login" className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-bloc-clair px-4 text-[13px] font-semibold text-garde transition hover:bg-teal-300">
              Se connecter
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-bloc/40 blur-[140px]" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <motion.span {...fadeUp} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] font-medium text-bloc-clair">
              <span className="h-1.5 w-1.5 rounded-full bg-bloc-clair" /> Coordination inter-hospitalière · Sénégal
            </motion.span>
            <motion.h1 {...fadeUp} transition={{ duration: 0.5, delay: 0.05 }} className="mt-5 font-display text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl">
              Trouver un lit ne devrait jamais prendre des heures.
            </motion.h1>
            <motion.p {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-300">
              La carte nationale des lits disponibles et la coordination des transferts inter-hospitaliers, en temps réel — pour que chaque minute compte là où elle sauve.
            </motion.p>
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.15 }} className="mt-8 flex flex-wrap items-center gap-3">
              <ShimmerButton onClick={() => navigate('/login')} shimmerColor="#5eead4" background="#0b5e59" className="h-12 px-6 text-[15px] font-semibold">
                Voir la démo <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </ShimmerButton>
              <a href="#fonctionnement" className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 px-6 text-[15px] font-semibold text-white transition hover:bg-white/5">
                Découvrir
              </a>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative aspect-[440/320] w-full rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <SenegalHero />
          </motion.div>
        </div>
        <EcgLine className="h-8 w-full text-bloc-clair/30" />
      </section>

      {/* Le problème */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <motion.h2 {...fadeUp} className="text-center font-display text-2xl font-semibold sm:text-3xl">Le problème, aujourd'hui</motion.h2>
        <motion.p {...fadeUp} className="mx-auto mt-3 max-w-xl text-center text-slate-400">
          Quand un patient doit être transféré, le médecin téléphone d'hôpital en hôpital pour trouver une place. Des heures perdues.
        </motion.p>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { v: 4, s: ' h', t: 'perdues en moyenne à chercher une place par téléphone' },
            { v: 15, s: '+', t: 'appels passés pour un seul transfert complexe' },
            { v: 100, s: '%', t: 'des établissements coordonnés sur une seule plateforme' },
          ].map((c, i) => (
            <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
              <p className="font-display text-4xl font-semibold text-bloc-clair tabular-nums">
                <NumberTicker value={c.v} className="text-bloc-clair" />
                {c.s}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{c.t}</p>
            </motion.div>
          ))}
        </div>
        <p className="mt-6 text-center text-[11px] text-slate-500">Données illustratives.</p>
      </section>

      {/* Comment ça marche */}
      <section id="fonctionnement" className="border-y border-white/5 bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <motion.h2 {...fadeUp} className="text-center font-display text-2xl font-semibold sm:text-3xl">Comment ça marche</motion.h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: Eye, title: 'Voir', text: 'La carte nationale des lits libres par service et des équipements, en temps réel.' },
              { icon: Send, title: 'Demander', text: 'Une demande de transfert anonymisée, envoyée en quelques secondes à l\'établissement le plus adapté.' },
              { icon: Truck, title: 'Transférer', text: 'Acceptation tracée et chronométrée, suivi du patient jusqu\'à son arrivée.' },
            ].map((s, i) => (
              <motion.div key={s.title} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.12 }} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-bloc-clair/15 text-bloc-clair">
                  <s.icon className="h-7 w-7" aria-hidden />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{i + 1}. {s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-slate-400">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Conçu pour le corps médical — animations anatomiques */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <motion.h2 {...fadeUp} className="text-center font-display text-2xl font-semibold sm:text-3xl">Conçu pour le corps médical</motion.h2>
        <motion.p {...fadeUp} className="mx-auto mt-3 max-w-xl text-center text-slate-400">
          Une exigence clinique, jusque dans le moindre détail.
        </motion.p>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { svg: <HeartBeat className="h-28 w-28" />, title: 'Cardiologie : chaque minute compte', text: 'Les urgences cardiologiques exigent une orientation immédiate vers le bon plateau technique.' },
            { svg: <Lungs className="h-28 w-28" />, title: 'Réanimation : visibilité sur l\'oxygène et les respirateurs', text: 'Connaître en direct les capacités de réanimation et les équipements critiques disponibles.' },
            { svg: <EcgContinuous className="h-20 w-40" />, title: 'Le temps réel au service du vital', text: 'Chaque changement de disponibilité se propage instantanément à tous les établissements.' },
          ].map((p, i) => (
            <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.12 }} className="flex flex-col items-center rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-8 text-center">
              <div className="flex h-32 items-center justify-center">{p.svg}</div>
              <h3 className="mt-4 font-display text-[15px] font-semibold text-bloc-clair">{p.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Positionnement */}
      <section className="border-y border-white/5 bg-white/[0.015]">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center">
          <motion.h2 {...fadeUp} className="font-display text-2xl font-semibold sm:text-3xl">Pensé pour s'intégrer à l'écosystème national</motion.h2>
          <motion.p {...fadeUp} className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-400">
            Jokko Santé est un module de coordination complémentaire de l'existant. Il ne remplace pas le dossier patient : les données y sont minimales et anonymisées (initiales, âge, sexe, motif), conformément aux exigences de la CDP. Interopérabilité prévue via HL7 FHIR.
          </motion.p>
          <motion.div {...fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-slate-500">
            {['Dossier Patient Unique (DPU)', 'DHIS2', 'HL7 FHIR', 'Conformité CDP'].map((x) => (
              <span key={x} className="inline-flex items-center gap-2 text-[13px] font-medium">
                <ShieldCheck className="h-4 w-4 text-bloc-clair/70" aria-hidden /> {x}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-4xl overflow-hidden px-5 py-20 text-center">
        <Meteors number={18} className="opacity-40" />
        <Activity className="relative mx-auto h-10 w-10 text-bloc-clair" aria-hidden />
        <h2 className="relative mt-4 font-display text-3xl font-semibold">Prêt à voir Jokko Santé en action ?</h2>
        <p className="relative mx-auto mt-3 max-w-md text-slate-400">Connectez-vous avec un compte de démonstration et jouez le scénario complet d'un transfert.</p>
        <div className="relative mt-7 flex justify-center">
          <ShimmerButton onClick={() => navigate('/login')} shimmerColor="#5eead4" background="#0b5e59" className="h-12 px-7 text-[15px] font-semibold">
            Voir la démo <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </ShimmerButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-[13px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <Logo textClassName="text-slate-300" />
          </div>
          <p>Projet candidat — prototype de démonstration. Données illustratives anonymisées (CDP).</p>
          <p>contact@jokkosante.sn</p>
        </div>
      </footer>
    </div>
  )
}
