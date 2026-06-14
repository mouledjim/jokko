import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Textarea, Select } from '@/components/ui/Field'
import { useTransferAction } from '@/features/transfers/api'

const REFUSAL_REASONS = [
  'Aucun lit disponible dans le service',
  'Plateau technique insuffisant pour ce cas',
  'Équipement requis indisponible',
  'Service en tension maximale',
]

/** Boutons Accepter / Refuser + modales, réutilisés (entrants & détail). */
export function RespondActions({
  transferId,
  serviceName,
  onDone,
}: {
  transferId: string
  serviceName: string
  onDone?: () => void
}) {
  const action = useTransferAction()
  const [accepting, setAccepting] = useState(false)
  const [refusing, setRefusing] = useState(false)
  const [reasonChoice, setReasonChoice] = useState(REFUSAL_REASONS[0])
  const [reasonText, setReasonText] = useState('')

  const accept = async () => {
    await action.mutateAsync({ id: transferId, action: 'accepte' })
    setAccepting(false)
    onDone?.()
  }
  const refuse = async () => {
    const reason = [reasonChoice, reasonText.trim()].filter(Boolean).join(' — ')
    await action.mutateAsync({ id: transferId, action: 'refuse', refusalReason: reason })
    setRefusing(false)
    onDone?.()
  }

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => setAccepting(true)} className="flex-1">
          <Check className="h-4 w-4" aria-hidden />
          Accepter
        </Button>
        <Button variant="secondary" onClick={() => setRefusing(true)} className="flex-1">
          <X className="h-4 w-4" aria-hidden />
          Refuser
        </Button>
      </div>

      {/* Accepter : confirmation + animation de validation */}
      <Modal
        open={accepting}
        onClose={() => setAccepting(false)}
        title="Accepter le transfert"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAccepting(false)}>Annuler</Button>
            <Button onClick={accept} loading={action.isPending}>Confirmer l'acceptation</Button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-constante/15 text-constante"
          >
            <Check className="h-7 w-7" aria-hidden />
          </motion.span>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Le patient sera admis en <span className="font-semibold">{serviceName}</span>. L'établissement
            demandeur en sera notifié immédiatement.
          </p>
        </div>
      </Modal>

      {/* Refuser : motif obligatoire */}
      <Modal
        open={refusing}
        onClose={() => setRefusing(false)}
        title="Refuser le transfert"
        description="Un motif est obligatoire pour informer l'établissement demandeur."
        footer={
          <>
            <Button variant="secondary" onClick={() => setRefusing(false)}>Annuler</Button>
            <Button variant="danger" onClick={refuse} loading={action.isPending}>Confirmer le refus</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Select label="Motif" value={reasonChoice} onChange={(e) => setReasonChoice(e.target.value)}>
            {REFUSAL_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
          <Textarea label="Précision (optionnel)" placeholder="Détail complémentaire…" value={reasonText} onChange={(e) => setReasonText(e.target.value)} />
        </div>
      </Modal>
    </>
  )
}
