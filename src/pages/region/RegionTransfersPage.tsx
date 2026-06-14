import { TransfersTable } from '@/components/transfers/TransfersTable'

export default function RegionTransfersPage() {
  return <TransfersTable title="Transferts de la région" subtitle="Demandes intra et inter-région" basePath="/region/transferts" />
}
