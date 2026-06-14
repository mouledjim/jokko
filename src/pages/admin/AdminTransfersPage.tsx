import { TransfersTable } from '@/components/transfers/TransfersTable'

export default function AdminTransfersPage() {
  return <TransfersTable title="Transferts de l'établissement" subtitle="Demandes entrantes et sortantes" basePath="/app/transferts" />
}
