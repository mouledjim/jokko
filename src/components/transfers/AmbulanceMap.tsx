import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import { useReducedMotion } from 'framer-motion'

interface Point {
  lat: number
  lng: number
  name: string
}

const facilityIcon = (color: string) =>
  L.divIcon({
    className: '',
    html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })

const ambulanceIcon = L.divIcon({
  className: '',
  html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:#0B5E59;box-shadow:0 2px 6px rgba(0,0,0,.4)">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10H6"/><path d="M8 8v4"/><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

function Fit({ from, to }: { from: Point; to: Point }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(
      L.latLngBounds([
        [from.lat, from.lng],
        [to.lat, to.lng],
      ]),
      { padding: [40, 40] },
    )
  }, [map, from, to])
  return null
}

/** Mini-carte : ambulance animée progressant entre deux établissements. */
export function AmbulanceMap({ from, to }: { from: Point; to: Point }) {
  const reduce = useReducedMotion()
  const [t, setT] = useState(reduce ? 0.5 : 0)

  useEffect(() => {
    if (reduce) return
    let progress = 0
    const id = setInterval(() => {
      progress += 0.008
      if (progress > 1) progress = 0
      setT(progress)
    }, 50)
    return () => clearInterval(id)
  }, [reduce])

  const pos: [number, number] = [from.lat + (to.lat - from.lat) * t, from.lng + (to.lng - from.lng) * t]

  return (
    <div className="h-56 overflow-hidden rounded-xl border border-slate-200 dark:border-garde-bord">
      <MapContainer center={[(from.lat + to.lat) / 2, (from.lng + to.lng) / 2]} zoom={9} scrollWheelZoom={false} dragging className="h-full w-full" style={{ background: '#aadaff' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        <Fit from={from} to={to} />
        <Polyline positions={[[from.lat, from.lng], [to.lat, to.lng]]} pathOptions={{ color: '#0B5E59', weight: 3, dashArray: '8 8', opacity: 0.7 }} />
        <Marker position={[from.lat, from.lng]} icon={facilityIcon('#64748B')} />
        <Marker position={[to.lat, to.lng]} icon={facilityIcon('#16A34A')} />
        <Marker position={pos} icon={ambulanceIcon} />
      </MapContainer>
    </div>
  )
}
