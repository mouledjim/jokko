import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Stethoscope,
  Building2,
  Map,
  ShieldCheck,
  Droplet,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Logo } from '@/components/brand/Logo'

const PORTALS = [
  {
    role: 'medecin',
    title: 'Espace Médecin & Soignant',
    subtitle: 'Urgences, lits en temps réel & transferts',
    path: '/login?role=medecin',
    directPath: '/app',
    icon: Stethoscope,
    badge: 'Opérationnel',
    color: 'bg-rose-50 border-rose-200 text-rose-700',
    buttonColor: '#e11d48',
    description: 'Gestion des lits du service, consultation de la carte des disponibilités et demandes de transferts inter-hospitaliers.',
  },
  {
    role: 'admin_hopital',
    title: 'Direction & Admin Hôpital',
    subtitle: 'Gestion globale de l’établissement',
    path: '/login?role=admin_hopital',
    directPath: '/admin',
    icon: Building2,
    badge: 'Établissement',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    buttonColor: '#2563eb',
    description: 'Administration des services, des lits, des équipements techniques et gestion du personnel médical.',
  },
  {
    role: 'admin_regional',
    title: 'Régulation & Admin Régional',
    subtitle: 'Supervision médicale territoriale',
    path: '/login?role=admin_regional',
    directPath: '/region',
    icon: Map,
    badge: 'Région',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    buttonColor: '#059669',
    description: 'Suivi des tensions régionales, flux de transferts inter-structures et équilibrage des capacités.',
  },
  {
    role: 'super_admin',
    title: 'Ministère de la Santé (MSAS)',
    subtitle: 'Vue nationale & audit central',
    path: '/login?role=super_admin',
    directPath: '/national',
    icon: ShieldCheck,
    badge: 'National',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    buttonColor: '#7c3aed',
    description: 'Tableau de bord national, supervision des banques de sang CNTS, interopérabilité FHIR et journal d’audit.',
  },
  {
    role: 'donneur',
    title: 'Portail Donneur Citoyen',
    subtitle: 'Urgences transfusionnelles & CNTS',
    path: '/donneur',
    directPath: '/donneur',
    icon: Droplet,
    badge: 'Grand Public',
    color: 'bg-red-50 border-red-200 text-red-700',
    buttonColor: '#dc2626',
    description: 'Consultation des pénuries de sang en direct, simulateur d’éligibilité et pass prioritaire pour le don.',
  },
]

export default function PortailPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased selection:bg-rose-100 selection:text-rose-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-rose-100/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo textClassName="text-slate-900" />
          <Link
            to="/login"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-rose-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700"
          >
            Connexion directe
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700">
            <Sparkles className="h-3.5 w-3.5 text-rose-600" />
            Portails d'Accès Sécurisés · Sénégal
          </span>
          <h1 className="mt-5 font-display text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
            Choisissez votre espace <span className="text-rose-600">Jokko Santé</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-slate-500">
            Accédez directement à l'interface adaptée à votre rôle dans le système de santé sénégalais.
          </p>
        </div>

        {/* Portals Grid */}
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PORTALS.map((portal, idx) => (
            <motion.div
              key={portal.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col justify-between rounded-3xl border border-rose-100 bg-white p-7 shadow-sm transition hover:-translate-y-1.5 hover:shadow-xl hover:shadow-rose-600/10"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl border ${portal.color}`}>
                    <portal.icon className="h-6 w-6" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                    {portal.badge}
                  </span>
                </div>

                <h2 className="mt-5 font-display text-lg font-bold text-slate-900">{portal.title}</h2>
                <p className="text-xs font-semibold text-rose-600 mt-0.5">{portal.subtitle}</p>
                <p className="mt-3 text-xs leading-relaxed text-slate-500">{portal.description}</p>
              </div>

              <div className="mt-8 pt-4 border-t border-rose-50">
                <Link
                  to={portal.path}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
                >
                  <span>Accéder à l'espace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-rose-100 bg-white py-8 text-center text-xs text-slate-400">
        <p>Jokko Santé · Plateforme nationale de coordination inter-hospitalière (Sénégal)</p>
      </footer>
    </div>
  )
}
