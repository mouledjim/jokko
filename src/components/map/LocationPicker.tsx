import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import { SENEGAL_CENTER } from '@/lib/geo'

const pin = L.divIcon({
  className: '',
  html: `<div style="width:22px;height:22px;border-radius:9999px 9999px 9999px 0;background:#0B5E59;border:2px solid #fff;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
})

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], map.getZoom())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

/** Carte avec marqueur déplaçable pour choisir une position (glisser ou cliquer). */
export function LocationPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number
  lng: number
  onChange: (lat: number, lng: number) => void
}) {
  const hasPos = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)
  const center: [number, number] = hasPos ? [lat, lng] : [SENEGAL_CENTER.lat, SENEGAL_CENTER.lng]
  return (
    <div className="h-56 overflow-hidden rounded-xl border border-slate-200 dark:border-garde-bord">
      <MapContainer center={center} zoom={hasPos ? 12 : 7} className="h-full w-full" style={{ background: '#aadaff' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        <ClickHandler onChange={onChange} />
        {hasPos && <Recenter lat={lat} lng={lng} />}
        {hasPos && (
          <Marker
            position={[lat, lng]}
            icon={pin}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const p = e.target.getLatLng()
                onChange(p.lat, p.lng)
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  )
}
