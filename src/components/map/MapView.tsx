import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { MapPin, LocateFixed, Phone, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/providers/AuthProvider'
import { useFacilityAvailability, useAllServiceAvailability } from '@/features/availability/api'
import { useEquipment } from '@/features/equipment/api'
import { useSpecialties } from '@/features/reference/api'
import { distanceKm, formatDistance, SENEGAL_CENTER } from '@/lib/geo'
import { facilityState, serviceState, STATE_COLOR, STATE_LABEL, type AvailabilityState } from '@/features/map/markerColor'
import { isStale } from '@/lib/format'
import { EQUIPMENT_LABEL, FACILITY_TYPE_LABEL } from '@/lib/roles'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Field'
import { EcgLoader } from '@/components/brand/EcgLine'
import { ErrorState } from '@/components/feedback/ErrorState'
import type { EquipmentType, EquipmentStatus } from '@/types/db'

const EQUIPMENT_TYPES: EquipmentType[] = ['scanner', 'irm', 'bloc_operatoire', 'generateur_oxygene', 'ambulance', 'laboratoire']

interface Pos {
  lat: number
  lng: number
}

function makeIcon(color: string, label: string): L.DivIcon {
  return L.divIcon({
    className: 'jokko-marker',
    html: `<div style="position:relative;width:34px;height:34px">
      <span style="position:absolute;inset:0;border-radius:9999px;background:${color};opacity:.2"></span>
      <span style="position:absolute;inset:6px;border-radius:9999px;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font:600 12px Inter,system-ui,sans-serif;box-shadow:0 1px 5px rgba(15,23,42,.35);font-variant-numeric:tabular-nums">${label}</span>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16],
  })
}

function FitBounds({ points, fitKey }: { points: Pos[]; fitKey: string }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]))
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey])
  return null
}

export function MapView({
  title,
  subtitle,
  onRequestTransfer,
}: {
  title: string
  subtitle: string
  onRequestTransfer?: (facilityId: string) => void
}) {
  const { facility } = useAuth()
  const facilities = useFacilityAvailability()
  const services = useAllServiceAvailability()
  const equipment = useEquipment()
  const specialties = useSpecialties()

  const [specialtyId, setSpecialtyId] = useState('')
  const [eqFilter, setEqFilter] = useState<Set<EquipmentType>>(new Set())
  const [radius, setRadius] = useState(0) // 0 = illimité
  const [pos, setPos] = useState<Pos | null>(null)
  const [posSource, setPosSource] = useState<'gps' | 'hopital' | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  // Position de référence : géoloc navigateur, sinon position de l'hôpital.
  useEffect(() => {
    let cancelled = false
    function fallbackToHospital() {
      const mine = facilities.data?.find((f) => f.facility_id === facility?.id)
      if (mine && !cancelled) {
        setPos({ lat: mine.latitude, lng: mine.longitude })
        setPosSource('hopital')
      }
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          if (cancelled) return
          setPos({ lat: p.coords.latitude, lng: p.coords.longitude })
          setPosSource('gps')
        },
        () => fallbackToHospital(),
        { timeout: 5000 },
      )
    } else {
      fallbackToHospital()
    }
    return () => {
      cancelled = true
    }
  }, [facilities.data, facility?.id])

  const servicesByFacility = useMemo(() => {
    const map = new Map<string, typeof services.data>()
    for (const s of services.data ?? []) {
      const list = map.get(s.facility_id) ?? []
      list.push(s)
      map.set(s.facility_id, list)
    }
    return map
  }, [services.data])

  const equipmentByFacility = useMemo(() => {
    const map = new Map<string, typeof equipment.data>()
    for (const e of equipment.data ?? []) {
      const list = map.get(e.facility_id) ?? []
      list.push(e)
      map.set(e.facility_id, list)
    }
    return map
  }, [equipment.data])

  const results = useMemo(() => {
    const out = (facilities.data ?? [])
      .map((f) => {
        const facServices = servicesByFacility.get(f.facility_id) ?? []
        const facEquipment = equipmentByFacility.get(f.facility_id) ?? []

        let state: AvailabilityState
        let freeLabel: number
        if (specialtyId) {
          const svc = facServices?.find((s) => s.specialty_id === specialtyId && s.is_active)
          if (!svc) return null
          state = serviceState({ bedsFree: svc.beds_free, stale: isStale(svc.last_bed_update) })
          freeLabel = svc.beds_free
        } else {
          state = facilityState({ bedsFree: f.beds_free, occupancyRate: f.occupancy_rate, stale: isStale(f.last_bed_update) })
          freeLabel = f.beds_free
        }

        if (eqFilter.size > 0) {
          const ok = [...eqFilter].every((t) => facEquipment?.some((e) => e.type === t && e.status === 'fonctionnel'))
          if (!ok) return null
        }

        const distance = pos ? distanceKm(pos, { lat: f.latitude, lng: f.longitude }) : null
        if (radius > 0 && distance != null && distance > radius) return null

        return { f, state, freeLabel, distance, facServices, facEquipment }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)

    if (pos) out.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    return out
  }, [facilities.data, servicesByFacility, equipmentByFacility, specialtyId, eqFilter, radius, pos])

  const fitKey = `${specialtyId}|${[...eqFilter].sort().join(',')}|${results.length}`
  const points = results.map((r) => ({ lat: r.f.latitude, lng: r.f.longitude }))

  const toggleEq = (t: EquipmentType) =>
    setEqFilter((prev) => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t)
      else next.add(t)
      return next
    })

  const loading = facilities.isLoading || services.isLoading
  const error = facilities.isError || services.isError

  return (
    <div className="flex h-[calc(100vh-8.5rem)] min-h-[520px] flex-col">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setPanelOpen((o) => !o)}>
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            Filtres
          </Button>
        }
      />

      <div className="flex min-h-0 flex-1 gap-4">
        {/* Panneau de filtres */}
        <FilterPanel
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          specialties={specialties.data ?? []}
          specialtyId={specialtyId}
          setSpecialtyId={setSpecialtyId}
          eqFilter={eqFilter}
          toggleEq={toggleEq}
          radius={radius}
          setRadius={setRadius}
          pos={pos}
          posSource={posSource}
          resultCount={results.length}
        />

        {/* Carte */}
        <Card className="relative min-h-0 flex-1 overflow-hidden p-0">
          {loading ? (
            <EcgLoader label="Chargement de la carte…" />
          ) : error ? (
            <ErrorState onRetry={() => { facilities.refetch(); services.refetch() }} />
          ) : (
            <>
              <MapContainer
                center={[SENEGAL_CENTER.lat, SENEGAL_CENTER.lng]}
                zoom={7}
                scrollWheelZoom
                className="h-full w-full"
                style={{ background: '#aadaff' }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds points={points} fitKey={fitKey} />
                {results.map((r) => (
                  <Marker
                    key={r.f.facility_id}
                    position={[r.f.latitude, r.f.longitude]}
                    icon={makeIcon(STATE_COLOR[r.state], r.state === 'stale' ? '•' : String(r.freeLabel))}
                  >
                    <Popup minWidth={260} maxWidth={300}>
                      <FacilityPopup
                        name={r.f.name}
                        type={FACILITY_TYPE_LABEL[r.f.type]}
                        region={r.f.region_name}
                        phone={r.f.phone}
                        distance={r.distance}
                        state={r.state}
                        services={r.facServices ?? []}
                        equipment={r.facEquipment ?? []}
                        highlightSpecialtyId={specialtyId || null}
                        onRequestTransfer={onRequestTransfer ? () => onRequestTransfer(r.f.facility_id) : undefined}
                      />
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Légende */}
              <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[11px] shadow-md backdrop-blur dark:border-garde-bord dark:bg-garde-surface/95">
                {(['available', 'tension', 'full', 'stale'] as AvailabilityState[]).map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATE_COLOR[s] }} />
                    <span className="text-slate-600 dark:text-slate-300">{STATE_LABEL[s]}</span>
                  </div>
                ))}
              </div>

              {results.length === 0 && (
                <div className="absolute inset-x-0 top-3 z-[1000] mx-auto w-fit rounded-full bg-garde/80 px-4 py-1.5 text-[13px] font-medium text-white">
                  Aucun établissement ne correspond aux filtres
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

function FilterPanel(props: {
  open: boolean
  onClose: () => void
  specialties: { id: string; name: string }[]
  specialtyId: string
  setSpecialtyId: (v: string) => void
  eqFilter: Set<EquipmentType>
  toggleEq: (t: EquipmentType) => void
  radius: number
  setRadius: (n: number) => void
  pos: Pos | null
  posSource: 'gps' | 'hopital' | null
  resultCount: number
}) {
  const body = (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-[13px] font-semibold text-slate-700 dark:text-slate-200">Spécialité requise</p>
        <Select value={props.specialtyId} onChange={(e) => props.setSpecialtyId(e.target.value)}>
          <option value="">Toutes les spécialités</option>
          {props.specialties.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
      </div>

      <div>
        <p className="mb-2 text-[13px] font-semibold text-slate-700 dark:text-slate-200">Équipement fonctionnel requis</p>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_TYPES.map((t) => {
            const active = props.eqFilter.has(t)
            return (
              <button
                key={t}
                type="button"
                onClick={() => props.toggleEq(t)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-[12px] font-medium transition',
                  active
                    ? 'border-bloc bg-bloc text-white'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-garde-bord dark:text-slate-300 dark:hover:bg-white/5',
                )}
                aria-pressed={active}
              >
                {EQUIPMENT_LABEL[t]}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">Rayon de distance</p>
          <span className="text-[12px] text-slate-400 tabular-nums">{props.radius === 0 ? 'Illimité' : `${props.radius} km`}</span>
        </div>
        <input
          type="range"
          min={0}
          max={500}
          step={10}
          value={props.radius}
          onChange={(e) => props.setRadius(Number(e.target.value))}
          className="w-full accent-bloc"
          disabled={!props.pos}
          aria-label="Rayon de distance en kilomètres"
        />
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
          <LocateFixed className="h-3 w-3" aria-hidden />
          {props.pos
            ? props.posSource === 'gps'
              ? 'Position : géolocalisation activée'
              : 'Position : votre établissement'
            : 'Position indisponible'}
        </p>
      </div>

      <div className="rounded-xl bg-bloc/5 px-3 py-2.5 text-[13px] font-medium text-bloc dark:bg-bloc-clair/10 dark:text-bloc-clair">
        {props.resultCount} établissement{props.resultCount > 1 ? 's' : ''} affiché{props.resultCount > 1 ? 's' : ''}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <Card className="hidden w-72 shrink-0 overflow-y-auto p-5 lg:block">{body}</Card>

      {/* Mobile : feuille latérale */}
      {props.open && (
        <div className="fixed inset-0 z-[1100] lg:hidden">
          <div className="absolute inset-0 bg-garde/50" onClick={props.onClose} aria-hidden />
          <div className="absolute inset-y-0 right-0 w-[85%] max-w-sm overflow-y-auto bg-white p-5 shadow-xl dark:bg-garde-surface">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Filtres</h2>
              <button type="button" onClick={props.onClose} aria-label="Fermer" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            {body}
          </div>
        </div>
      )}
    </>
  )
}

function FacilityPopup(props: {
  name: string
  type: string
  region: string
  phone: string
  distance: number | null
  state: AvailabilityState
  services: { facility_service_id: string; specialty_name: string; color_key: string; beds_free: number; beds_total: number }[]
  equipment: { id: string; type: EquipmentType; status: EquipmentStatus }[]
  highlightSpecialtyId: string | null
  onRequestTransfer?: () => void
}) {
  return (
    <div className="jokko-popup" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: '#0F172A' }}>{props.name}</p>
      <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 8px' }}>
        {props.type} · {props.region}
        {props.distance != null ? ` · ${formatDistance(props.distance)}` : ''}
      </p>

      <p style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', margin: '6px 0 4px' }}>
        Lits libres par service
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 130, overflowY: 'auto' }}>
        {props.services.length === 0 && <span style={{ fontSize: 12, color: '#94A3B8' }}>Aucun service</span>}
        {props.services.map((s) => (
          <div key={s.facility_service_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
            <span style={{ color: '#334155' }}>{s.specialty_name}</span>
            <span style={{ fontWeight: 700, color: s.beds_free > 0 ? '#16A34A' : '#DC2626', fontVariantNumeric: 'tabular-nums' }}>
              {s.beds_free}/{s.beds_total}
            </span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', margin: '8px 0 4px' }}>
        Équipements
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {props.equipment.map((e) => (
          <span
            key={e.id}
            style={{
              fontSize: 11,
              padding: '2px 7px',
              borderRadius: 9999,
              background: e.status === 'fonctionnel' ? '#DCFCE7' : e.status === 'en_panne' ? '#FEE2E2' : '#FEF3C7',
              color: e.status === 'fonctionnel' ? '#15803D' : e.status === 'en_panne' ? '#B91C1C' : '#B45309',
            }}
          >
            {EQUIPMENT_LABEL[e.type]}
          </span>
        ))}
      </div>

      {props.phone && (
        <a
          href={`tel:${props.phone.replace(/\s/g, '')}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 13, color: '#0B5E59', fontWeight: 600, textDecoration: 'none' }}
        >
          <span style={{ display: 'inline-flex' }}><Phone size={14} /></span>
          {props.phone}
        </a>
      )}

      {props.onRequestTransfer && (
        <button
          type="button"
          onClick={props.onRequestTransfer}
          style={{
            marginTop: 10,
            width: '100%',
            background: '#0B5E59',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '8px 12px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <MapPin size={14} />
          Demander un transfert ici
        </button>
      )}
    </div>
  )
}
