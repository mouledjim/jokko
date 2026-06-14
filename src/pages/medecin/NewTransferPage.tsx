import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Send, MapPin } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/providers/ToastProvider'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { cn } from '@/lib/cn'
import { useSpecialties } from '@/features/reference/api'
import { useFacilityAvailability, useAllServiceAvailability } from '@/features/availability/api'
import { useEquipment } from '@/features/equipment/api'
import { useCreateTransfer } from '@/features/transfers/api'
import { buildSuggestions } from '@/features/transfers/suggestions'
import { transferDraft } from '@/features/transfers/draft'
import { EQUIPMENT_LABEL, SEVERITY_LABEL } from '@/lib/roles'
import type { EquipmentType, TransferSeverity } from '@/types/db'

const STEPS = ['Patient', 'Destination', 'Récapitulatif']
const EQUIPMENT_TYPES: EquipmentType[] = ['scanner', 'irm', 'bloc_operatoire', 'generateur_oxygene', 'ambulance', 'laboratoire']
const SEVERITIES: TransferSeverity[] = ['stable', 'urgent', 'critique']
const SEV_STYLE: Record<TransferSeverity, string> = {
  stable: 'border-constante bg-constante/10 text-constante',
  urgent: 'border-triage bg-triage/10 text-triage',
  critique: 'border-vital bg-vital/10 text-vital',
}

export default function NewTransferPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()
  const create = useCreateTransfer()

  const specialties = useSpecialties()
  const facilities = useFacilityAvailability()
  const services = useAllServiceAvailability()
  const equipment = useEquipment()

  const [form, setForm] = useState(() => {
    const d = transferDraft.get()
    const preTo = params.get('to')
    return preTo ? { ...d, to_facility_id: preTo } : d
  })
  const [step, setStep] = useState(form.step)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (patch: Partial<typeof form>) => {
    setForm((prev) => {
      const next = { ...prev, ...patch }
      transferDraft.set(next)
      return next
    })
  }
  const goStep = (s: number) => {
    setStep(s)
    update({ step: s })
  }

  const fromPosition = useMemo(() => {
    const mine = facilities.data?.find((f) => f.facility_id === profile?.facility_id)
    return mine ? { lat: mine.latitude, lng: mine.longitude } : null
  }, [facilities.data, profile?.facility_id])

  const suggestions = useMemo(() => {
    if (!form.specialty_id || !profile?.facility_id) return []
    return buildSuggestions({
      fromFacilityId: profile.facility_id,
      fromPosition,
      specialtyId: form.specialty_id,
      requiredEquipment: form.requiredEquipment,
      facilities: facilities.data ?? [],
      services: services.data ?? [],
      equipment: equipment.data ?? [],
    })
  }, [form.specialty_id, form.requiredEquipment, facilities.data, services.data, equipment.data, fromPosition, profile?.facility_id])

  const validateStep0 = () => {
    const e: Record<string, string> = {}
    if (!/^[A-Za-zÀ-ÿ]{2,3}$/.test(form.patient_initials.trim())) e.patient_initials = '2 à 3 lettres.'
    const age = Number(form.patient_age)
    if (!form.patient_age || Number.isNaN(age) || age < 0 || age > 130) e.patient_age = 'Âge invalide.'
    if (!form.specialty_id) e.specialty_id = 'Choisissez un service.'
    if (form.motif.trim().length < 3) e.motif = 'Précisez le motif clinique.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (step === 0 && !validateStep0()) return
    if (step === 1 && !form.to_facility_id) {
      toast.error('Destination requise', 'Sélectionnez un établissement destinataire.')
      return
    }
    goStep(Math.min(step + 1, 2))
  }

  const specialtyName = specialties.data?.find((s) => s.id === form.specialty_id)?.name ?? '—'
  const destination = facilities.data?.find((f) => f.facility_id === form.to_facility_id)

  const submit = async () => {
    try {
      const id = await create.mutateAsync({
        patient_initials: form.patient_initials.trim().toUpperCase(),
        patient_age: Number(form.patient_age),
        patient_sex: form.patient_sex,
        severity: form.severity,
        specialty_id: form.specialty_id,
        motif: form.motif.trim(),
        clinical_notes: form.clinical_notes.trim(),
        vitals: {
          ta: form.ta || undefined,
          fc: form.fc ? Number(form.fc) : undefined,
          spo2: form.spo2 ? Number(form.spo2) : undefined,
          temp: form.temp ? Number(form.temp) : undefined,
          glasgow: form.glasgow ? Number(form.glasgow) : undefined,
        },
        to_facility_id: form.to_facility_id,
      })
      transferDraft.reset()
      navigate(`/app/transferts/${id}`)
    } catch {
      // toast géré par la mutation
    }
  }

  const toggleEquip = (t: EquipmentType) =>
    update({
      requiredEquipment: form.requiredEquipment.includes(t)
        ? form.requiredEquipment.filter((x) => x !== t)
        : [...form.requiredEquipment, t],
    })

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Nouvelle demande de transfert" subtitle="Renseignez le patient puis choisissez la destination" />

      {/* Stepper */}
      <ol className="mb-6 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition',
                i < step ? 'bg-bloc text-white' : i === step ? 'bg-bloc text-white' : 'bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400',
              )}
            >
              {i < step ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
            </span>
            <span className={cn('hidden text-[13px] font-medium sm:block', i === step ? 'text-slate-900 dark:text-white' : 'text-slate-400')}>{label}</span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-slate-200 dark:bg-garde-bord" />}
          </li>
        ))}
      </ol>

      <Card>
        <CardBody>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
            >
              {step === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Input label="Initiales" placeholder="AD" maxLength={3} required value={form.patient_initials} onChange={(e) => update({ patient_initials: e.target.value })} error={errors.patient_initials} />
                    <Input label="Âge" type="number" min={0} max={130} required value={form.patient_age} onChange={(e) => update({ patient_age: e.target.value })} error={errors.patient_age} />
                    <div className="col-span-2">
                      <label className="mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300">Sexe</label>
                      <div className="flex gap-2">
                        {(['M', 'F'] as const).map((s) => (
                          <button key={s} type="button" onClick={() => update({ patient_sex: s })} className={cn('h-10 flex-1 rounded-xl border text-sm font-medium transition', form.patient_sex === s ? 'border-bloc bg-bloc/10 text-bloc' : 'border-slate-200 text-slate-600 dark:border-garde-bord dark:text-slate-300')}>
                            {s === 'M' ? 'Masculin' : 'Féminin'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300">Gravité</label>
                    <div className="grid grid-cols-3 gap-2">
                      {SEVERITIES.map((s) => (
                        <button key={s} type="button" onClick={() => update({ severity: s })} className={cn('h-11 rounded-xl border text-sm font-semibold transition', form.severity === s ? SEV_STYLE[s] : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-garde-bord dark:text-slate-400')}>
                          {SEVERITY_LABEL[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Select label="Service requis" required value={form.specialty_id} onChange={(e) => update({ specialty_id: e.target.value })} error={errors.specialty_id}>
                    <option value="">Sélectionner un service</option>
                    {specialties.data?.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>

                  <Input label="Motif clinique" placeholder="Ex. AVC ischémique, besoin imagerie + réanimation" required value={form.motif} onChange={(e) => update({ motif: e.target.value })} error={errors.motif} />

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300">Constantes</label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                      <Input placeholder="TA 12/8" value={form.ta} onChange={(e) => update({ ta: e.target.value })} />
                      <Input placeholder="FC" type="number" value={form.fc} onChange={(e) => update({ fc: e.target.value })} />
                      <Input placeholder="SpO₂ %" type="number" value={form.spo2} onChange={(e) => update({ spo2: e.target.value })} />
                      <Input placeholder="T° °C" type="number" step="0.1" value={form.temp} onChange={(e) => update({ temp: e.target.value })} />
                      <Input placeholder="Glasgow" type="number" value={form.glasgow} onChange={(e) => update({ glasgow: e.target.value })} />
                    </div>
                  </div>

                  <Textarea label="Notes complémentaires" placeholder="Antécédents, traitements en cours, précautions…" value={form.clinical_notes} onChange={(e) => update({ clinical_notes: e.target.value })} />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <p className="mb-2 text-[13px] font-semibold text-slate-700 dark:text-slate-200">Équipement requis (affine les suggestions)</p>
                    <div className="flex flex-wrap gap-2">
                      {EQUIPMENT_TYPES.map((t) => (
                        <button key={t} type="button" onClick={() => toggleEquip(t)} className={cn('rounded-full border px-3 py-1.5 text-[12px] font-medium transition', form.requiredEquipment.includes(t) ? 'border-bloc bg-bloc text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-garde-bord dark:text-slate-300')}>
                          {EQUIPMENT_LABEL[t]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                      Établissements suggérés ({suggestions.length})
                    </p>
                    {suggestions.length === 0 ? (
                      <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400 dark:bg-white/5">
                        Aucun établissement ne propose ce service avec l'équipement requis.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {suggestions.map((s) => {
                          const selected = form.to_facility_id === s.facilityId
                          return (
                            <button
                              key={s.facilityId}
                              type="button"
                              onClick={() => update({ to_facility_id: s.facilityId })}
                              className={cn('flex w-full items-center gap-3 rounded-xl border p-3 text-left transition', selected ? 'border-bloc bg-bloc/5 ring-1 ring-bloc dark:bg-bloc-clair/10' : 'border-slate-200 hover:bg-slate-50 dark:border-garde-bord dark:hover:bg-white/5')}
                            >
                              <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', selected ? 'border-bloc bg-bloc' : 'border-slate-300')}>
                                {selected && <Check className="h-3 w-3 text-white" aria-hidden />}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{s.name}</p>
                                <p className="truncate text-[12px] text-slate-500 dark:text-slate-400">{s.reasons.join(' · ')}</p>
                              </div>
                              <span className={cn('shrink-0 font-display text-lg font-semibold tabular-nums', s.freeBeds > 0 ? 'text-constante' : 'text-vital')}>{s.freeBeds}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <Recap label="Patient" value={`${form.patient_initials.toUpperCase()} · ${form.patient_age} ans · ${form.patient_sex === 'M' ? 'Masculin' : 'Féminin'}`} />
                  <Recap label="Gravité" value={SEVERITY_LABEL[form.severity]} />
                  <Recap label="Service requis" value={specialtyName} />
                  <Recap label="Motif" value={form.motif} />
                  <Recap label="Constantes" value={[form.ta && `TA ${form.ta}`, form.fc && `FC ${form.fc}`, form.spo2 && `SpO₂ ${form.spo2}%`, form.temp && `T° ${form.temp}`, form.glasgow && `Glasgow ${form.glasgow}`].filter(Boolean).join(' · ') || 'Non renseignées'} />
                  <Recap label="Destination" value={destination?.name ?? '—'} highlight />
                  {form.clinical_notes && <Recap label="Notes" value={form.clinical_notes} />}
                  <p className="rounded-xl bg-bloc/5 px-4 py-3 text-[13px] text-bloc dark:bg-bloc-clair/10 dark:text-bloc-clair">
                    L'établissement destinataire recevra la demande en temps réel et pourra l'accepter ou la refuser.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-garde-bord">
            {step > 0 ? (
              <Button variant="secondary" onClick={() => goStep(step - 1)}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Précédent
              </Button>
            ) : (
              <span />
            )}
            {step < 2 ? (
              <Button onClick={next}>
                Continuer
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            ) : (
              <Button onClick={submit} loading={create.isPending}>
                <Send className="h-4 w-4" aria-hidden />
                Envoyer la demande
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {form.to_facility_id && step === 1 && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-slate-400">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          Destination sélectionnée : {destination?.name}
        </p>
      )}
    </div>
  )
}

function Recap({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex gap-4">
      <span className="w-28 shrink-0 text-[13px] font-medium text-slate-400">{label}</span>
      <span className={cn('text-sm', highlight ? 'font-semibold text-bloc dark:text-bloc-clair' : 'text-slate-800 dark:text-slate-100')}>{value}</span>
    </div>
  )
}
