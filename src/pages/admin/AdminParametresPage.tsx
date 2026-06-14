import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import { LocationPicker } from '@/components/map/LocationPicker'
import { useFacilities } from '@/features/reference/api'
import { useUpdateFacility } from '@/features/facilities/api'

export default function AdminParametresPage() {
  const { facility } = useAuth()
  const facilities = useFacilities()
  const update = useUpdateFacility()
  const mine = facilities.data?.find((f) => f.id === facility?.id)

  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [pos, setPos] = useState({ lat: 0, lng: 0 })

  useEffect(() => {
    if (mine) {
      setPhone(mine.phone)
      setAddress(mine.address)
      setPos({ lat: mine.latitude, lng: mine.longitude })
    }
  }, [mine])

  const save = async () => {
    if (!facility) return
    await update.mutateAsync({ id: facility.id, patch: { phone, address, latitude: pos.lat, longitude: pos.lng } })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Paramètres" subtitle={facility?.name} />
      <Card>
        <CardHeader title="Coordonnées de l'établissement" subtitle="Téléphone, adresse et position sur la carte" />
        <CardBody className="space-y-4 pt-2">
          {facilities.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Input label="Adresse" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300">Position (glissez le marqueur)</label>
                <LocationPicker lat={pos.lat} lng={pos.lng} onChange={(lat, lng) => setPos({ lat, lng })} />
                <p className="mt-1.5 text-[12px] text-slate-400 tabular-nums">{pos.lat ? `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}` : '—'}</p>
              </div>
              <div className="flex justify-end">
                <Button onClick={save} loading={update.isPending}>Enregistrer</Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
