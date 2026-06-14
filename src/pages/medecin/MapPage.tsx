import { useNavigate } from 'react-router-dom'
import { MapView } from '@/components/map/MapView'

export default function MapPage() {
  const navigate = useNavigate()
  return (
    <MapView
      title="Carte des lits"
      subtitle="Disponibilités en temps réel sur tout le territoire"
      onRequestTransfer={(facilityId) => navigate(`/app/transferts/nouveau?to=${facilityId}`)}
    />
  )
}
