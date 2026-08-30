/**
 * Jokko Santé — script de seed idempotent.
 *
 * Peuple la base Supabase avec un jeu de données réaliste et cohérent pour la
 * démonstration : régions, établissements, services, lits (avec les invariants
 * du scénario jury), équipements, ~40 profils, ~32 transferts avec timelines,
 * notifications et journal d'audit.
 *
 * Idempotent : efface les données existantes puis réinsère. Utilise la clé
 * secrète (service_role) — exécuté UNIQUEMENT en local, jamais dans le client.
 *
 * Usage : npm run seed
 */
import 'dotenv/config'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  DEMO_PASSWORD,
  EMAIL_DOMAIN,
  REGIONS,
  SPECIALTIES,
  FACILITIES,
  BED_PREFIX,
  EQUIPMENT_BY_FACILITY,
  EQUIPMENT_FAULTS,
  FIRST_NAMES_M,
  FIRST_NAMES_F,
  LAST_NAMES,
  FIXED_ACCOUNTS,
  EXTRA_MEDECINS,
  MOTIFS,
  REFUSAL_REASONS,
  type EquipmentStatus,
  type EquipmentType,
} from './seed-data.js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    'Variables manquantes : VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY (clé secrète) ' +
      'doivent être renseignées dans .env.',
  )
  process.exit(1)
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// ——— Générateur pseudo-aléatoire déterministe (reproductible) ———
function makeRng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = makeRng(20260613)
const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
const chance = (p: number) => rng() < p

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

interface Row {
  id: string
  [k: string]: unknown
}

async function insertRows(table: string, rows: object[]): Promise<Row[]> {
  const out: Row[] = []
  for (const part of chunk(rows, 500)) {
    const { data, error } = await supabase.from(table).insert(part).select()
    if (error) throw new Error(`Insert ${table} : ${error.message}`)
    out.push(...((data ?? []) as Row[]))
  }
  return out
}

async function deleteAll(table: string) {
  const { error } = await supabase
    .from(table)
    .delete()
    .gte('created_at', '1900-01-01T00:00:00Z')
  if (error) throw new Error(`Delete ${table} : ${error.message}`)
}

async function count(table: string): Promise<number> {
  const { count: c, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
  if (error) throw new Error(`Count ${table} : ${error.message}`)
  return c ?? 0
}

// ——— Étape 1 : nettoyage (ordre des dépendances) ———
async function wipe() {
  console.log('→ Nettoyage des données existantes…')
  for (const t of [
    'donor_commitments',
    'blood_alerts',
    'blood_stocks',
    'transfer_events',
    'transfer_requests',
    'notifications',
    'audit_logs',
    'bed_snapshots',
    'beds',
    'equipment',
    'facility_services',
    'profiles',
  ]) {
    await deleteAll(t)
  }

  // Suppression des comptes auth de démonstration (cascade -> profiles déjà vidés).
  let page = 1
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw new Error(`listUsers : ${error.message}`)
    const users = data.users
    for (const u of users) {
      if (u.email && u.email.endsWith(EMAIL_DOMAIN)) {
        await supabase.auth.admin.deleteUser(u.id)
      }
    }
    if (users.length < 200) break
    page += 1
  }

  for (const t of ['facilities', 'specialties', 'regions']) {
    await deleteAll(t)
  }
}

interface ProfileRow {
  id: string
  facilitySlug?: string
  role: string
  specialtyName?: string
}

async function main() {
  console.log('=== Seed Jokko Santé ===\n')
  await wipe()

  // ——— Régions ———
  console.log('→ Régions…')
  const regionRows = await insertRows('regions', REGIONS)
  const regionId: Record<string, string> = {}
  for (const r of regionRows) regionId[r.name as string] = r.id

  // ——— Spécialités ———
  console.log('→ Spécialités…')
  const specialtyRows = await insertRows('specialties', SPECIALTIES)
  const specialtyId: Record<string, string> = {}
  for (const s of specialtyRows) specialtyId[s.name as string] = s.id

  // ——— Établissements ———
  console.log('→ Établissements…')
  const facilityRows = await insertRows(
    'facilities',
    FACILITIES.map((f) => ({
      name: f.name,
      type: f.type,
      level: f.level,
      region_id: regionId[f.region],
      latitude: f.latitude,
      longitude: f.longitude,
      address: f.address,
      phone: f.phone,
      is_active: true,
    })),
  )
  const facilityIdByName: Record<string, string> = {}
  for (const f of facilityRows) facilityIdByName[f.name as string] = f.id
  const facilityIdBySlug: Record<string, string> = {}
  for (const f of FACILITIES) facilityIdBySlug[f.slug] = facilityIdByName[f.name]

  // ——— Profils + comptes auth ———
  console.log('→ Comptes utilisateurs et profils…')
  const profileInserts: {
    auth_id: string
    first_name: string
    last_name: string
    role: string
    facility_id: string | null
    region_id: string | null
    specialty_id: string | null
    phone: string
    avatar_seed: string
    is_active: boolean
    _facilitySlug?: string
    _specialtyName?: string
  }[] = []

  const phone = () => `+221 7${randInt(0, 8)} ${randInt(100, 999)} ${randInt(10, 99)} ${randInt(10, 99)}`

  async function createAccount(
    email: string,
    first: string,
    last: string,
    role: string,
    facilitySlug?: string,
    regionName?: string,
    specialtyName?: string,
  ) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { first_name: first, last_name: last },
    })
    if (error || !data.user) throw new Error(`createUser ${email} : ${error?.message}`)
    profileInserts.push({
      auth_id: data.user.id,
      first_name: first,
      last_name: last,
      role,
      facility_id: facilitySlug ? facilityIdBySlug[facilitySlug] : null,
      region_id: regionName ? regionId[regionName] : null,
      specialty_id: specialtyName ? specialtyId[specialtyName] : null,
      phone: phone(),
      avatar_seed: `${first}-${last}-${randInt(1000, 9999)}`,
      is_active: true,
      _facilitySlug: facilitySlug,
      _specialtyName: specialtyName,
    })
  }

  // Comptes fixes de démonstration.
  for (const a of FIXED_ACCOUNTS) {
    await createAccount(a.email, a.first, a.last, a.role, a.facilitySlug, a.regionName, a.specialtyName)
  }

  // Un admin_hopital par établissement (sauf Principal, déjà couvert).
  for (const f of FACILITIES) {
    if (f.slug === 'principal') continue
    const first = chance(0.5) ? pick(FIRST_NAMES_F) : pick(FIRST_NAMES_M)
    await createAccount(
      `admin.${f.slug}@jokkosante.sn`,
      first,
      pick(LAST_NAMES),
      'admin_hopital',
      f.slug,
    )
  }

  // Médecins supplémentaires, spécialité prise parmi les services de l'établissement.
  for (const f of FACILITIES) {
    const n = EXTRA_MEDECINS[f.slug] ?? 0
    for (let k = 1; k <= n; k++) {
      const first = chance(0.5) ? pick(FIRST_NAMES_F) : pick(FIRST_NAMES_M)
      const specialty = f.services[(k - 1) % f.services.length]
      await createAccount(
        `medecin.${f.slug}${k}@jokkosante.sn`,
        first,
        pick(LAST_NAMES),
        'medecin',
        f.slug,
        undefined,
        specialty,
      )
    }
  }

  const profileRows = await insertRows(
    'profiles',
    profileInserts.map((p) => {
      const { _facilitySlug, _specialtyName, ...rest } = p
      void _facilitySlug
      void _specialtyName
      return rest
    }),
  )

  // Index des profils par établissement (pour acteurs de lits/transferts).
  const profilesByFacility = new Map<string, ProfileRow[]>()
  const allProfiles: ProfileRow[] = []
  profileRows.forEach((row, i) => {
    const meta = profileInserts[i]
    const p: ProfileRow = {
      id: row.id,
      facilitySlug: meta._facilitySlug,
      role: meta.role,
      specialtyName: meta._specialtyName,
    }
    allProfiles.push(p)
    if (meta._facilitySlug) {
      const list = profilesByFacility.get(meta._facilitySlug) ?? []
      list.push(p)
      profilesByFacility.set(meta._facilitySlug, list)
    }
  })

  const staffOf = (slug: string): ProfileRow[] =>
    (profilesByFacility.get(slug) ?? []).filter(
      (p) => p.role === 'medecin' || p.role === 'admin_hopital',
    )

  // ——— Services par établissement ———
  console.log('→ Services…')
  const serviceInserts: { facility_id: string; specialty_id: string; is_active: boolean; phone_extension: string }[] = []
  for (const f of FACILITIES) {
    for (const sp of f.services) {
      serviceInserts.push({
        facility_id: facilityIdBySlug[f.slug],
        specialty_id: specialtyId[sp],
        is_active: true,
        phone_extension: String(randInt(200, 899)),
      })
    }
  }
  const serviceRows = await insertRows('facility_services', serviceInserts)
  // clé : `${facilitySlug}:${specialtyName}` -> service id
  const serviceIdByKey: Record<string, string> = {}
  {
    let idx = 0
    for (const f of FACILITIES) {
      for (const sp of f.services) {
        serviceIdByKey[`${f.slug}:${sp}`] = serviceRows[idx].id
        idx++
      }
    }
  }

  // ——— Lits ———
  console.log('→ Lits…')
  const now = Date.now()
  const bedInserts: {
    facility_service_id: string
    label: string
    status: string
    updated_at: string
    updated_by: string | null
  }[] = []

  const bedCountFor = (specialty: string): number => {
    if (specialty === 'Réanimation') return randInt(8, 14)
    if (specialty === 'Urgences') return randInt(18, 28)
    if (specialty === 'Néonatologie') return randInt(6, 12)
    if (specialty === 'Maternité') return randInt(12, 22)
    return randInt(10, 20)
  }

  for (const f of FACILITIES) {
    const staff = staffOf(f.slug)
    const updater = staff.length ? pick(staff).id : null
    for (const sp of f.services) {
      const serviceId = serviceIdByKey[`${f.slug}:${sp}`]
      const prefix = BED_PREFIX[sp] ?? 'LIT'
      const isDakar = f.region === 'Dakar'

      let total: number
      let free: number
      if (f.slug === 'principal' && sp === 'Réanimation') {
        // Invariant scénario jury : exactement 2 lits de réa libres.
        total = 14
        free = 2
      } else {
        total = bedCountFor(sp)
        // Occupation 70-95 %, plus tendue pour Urgences/Réa de Dakar.
        const occ =
          isDakar && (sp === 'Urgences' || sp === 'Réanimation')
            ? 0.9 + rng() * 0.07
            : 0.7 + rng() * 0.2
        free = Math.max(0, total - Math.round(total * occ))
      }

      const statuses: string[] = []
      for (let i = 0; i < free; i++) statuses.push('libre')
      let remaining = total - free
      // Quelques lits en nettoyage / hors service pour le réalisme.
      const cleaning = remaining > 4 && chance(0.7) ? randInt(1, 2) : 0
      const broken = remaining > 6 && chance(0.3) ? 1 : 0
      for (let i = 0; i < cleaning && remaining > 0; i++) {
        statuses.push('nettoyage')
        remaining--
      }
      for (let i = 0; i < broken && remaining > 0; i++) {
        statuses.push('hors_service')
        remaining--
      }
      for (let i = 0; i < remaining; i++) statuses.push('occupe')

      statuses.forEach((status, i) => {
        const updatedAt = f.stale
          ? new Date(now - randInt(7, 12) * 3600_000).toISOString()
          : new Date(now - randInt(2, 240) * 60_000).toISOString()
        bedInserts.push({
          facility_service_id: serviceId,
          label: `${prefix}-${String(i + 1).padStart(2, '0')}`,
          status,
          updated_at: updatedAt,
          updated_by: updater,
        })
      })
    }
  }
  await insertRows('beds', bedInserts)

  // ——— Équipements ———
  console.log('→ Équipements…')
  const faultKey = (slug: string, type: EquipmentType) => `${slug}:${type}`
  const faults = new Map<string, EquipmentStatus>()
  for (const fault of EQUIPMENT_FAULTS) faults.set(faultKey(fault.slug, fault.type), fault.status)

  const equipmentInserts: {
    facility_id: string
    type: EquipmentType
    status: EquipmentStatus
    updated_at: string
    updated_by: string | null
  }[] = []
  for (const f of FACILITIES) {
    const staff = staffOf(f.slug)
    const updater = staff.length ? pick(staff).id : null
    for (const type of EQUIPMENT_BY_FACILITY[f.slug] ?? []) {
      equipmentInserts.push({
        facility_id: facilityIdBySlug[f.slug],
        type,
        status: faults.get(faultKey(f.slug, type)) ?? 'fonctionnel',
        updated_at: new Date(now - randInt(1, 72) * 3600_000).toISOString(),
        updated_by: updater,
      })
    }
  }
  await insertRows('equipment', equipmentInserts)

  // ——— Historique d'occupation (30 jours, instantané quotidien) ———
  console.log("→ Historique d'occupation…")
  const serviceIdToSlug: Record<string, string> = {}
  for (const f of FACILITIES) for (const sp of f.services) serviceIdToSlug[serviceIdByKey[`${f.slug}:${sp}`]] = f.slug
  const facStats = new Map<string, { total: number; out: number; occ: number }>()
  for (const b of bedInserts) {
    const slug = serviceIdToSlug[b.facility_service_id]
    const s = facStats.get(slug) ?? { total: 0, out: 0, occ: 0 }
    s.total += 1
    if (b.status === 'hors_service') s.out += 1
    else if (b.status !== 'libre') s.occ += 1
    facStats.set(slug, s)
  }
  const snapshots: {
    facility_id: string
    captured_at: string
    beds_total: number
    beds_free: number
    beds_occupied: number
    occupancy_rate: number
  }[] = []
  for (const f of FACILITIES) {
    const s = facStats.get(f.slug)
    if (!s) continue
    const operational = Math.max(1, s.total - s.out)
    const baseOcc = s.occ / operational
    for (let d = 30; d >= 1; d--) {
      const day = new Date(now - d * 86_400_000)
      day.setHours(8 + randInt(0, 2), randInt(0, 59), 0, 0)
      const occRate = Math.min(0.99, Math.max(0.5, baseOcc + (rng() - 0.5) * 0.16))
      const occupied = Math.round(operational * occRate)
      snapshots.push({
        facility_id: facilityIdBySlug[f.slug],
        captured_at: day.toISOString(),
        beds_total: s.total,
        beds_free: Math.max(0, operational - occupied),
        beds_occupied: occupied,
        occupancy_rate: Math.round(occRate * 100),
      })
    }
  }
  await insertRows('bed_snapshots', snapshots)

  // ——— Transferts ———
  console.log('→ Transferts (timelines, notifications)…')
  // Établissements disposant d'une spécialité (pour choisir la destination).
  const facilitiesBySpecialty = new Map<string, string[]>()
  for (const f of FACILITIES) {
    for (const sp of f.services) {
      const list = facilitiesBySpecialty.get(sp) ?? []
      list.push(f.slug)
      facilitiesBySpecialty.set(sp, list)
    }
  }

  const initials = () => {
    const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return pick(L.split('')) + pick(L.split('')) + (chance(0.4) ? pick(L.split('')) : '')
  }
  const vitalsFor = (severity: string) => {
    if (severity === 'critique')
      return { ta: `${randInt(7, 9)}/${randInt(4, 6)}`, fc: randInt(118, 145), spo2: randInt(83, 90), temp: Number((35 + rng() * 4).toFixed(1)), glasgow: randInt(8, 13) }
    if (severity === 'urgent')
      return { ta: `${randInt(10, 12)}/${randInt(6, 8)}`, fc: randInt(95, 117), spo2: randInt(91, 95), temp: Number((37.4 + rng() * 1.6).toFixed(1)), glasgow: randInt(13, 15) }
    return { ta: `${randInt(12, 13)}/${randInt(7, 8)}`, fc: randInt(68, 90), spo2: randInt(96, 99), temp: Number((36.4 + rng() * 1).toFixed(1)), glasgow: 15 }
  }

  // Repart de TRF-…-0001 ; les références sont ensuite générées par la base
  // (la séquence avance naturellement, évitant toute collision avec les
  // demandes créées en direct par l'application).
  await supabase.rpc('reset_transfer_reference_seq')

  interface TransferPlan {
    fromSlug: string
    toSlug: string
    finalStatus: 'arrive' | 'refuse' | 'annule' | 'accepte' | 'en_attente' | 'en_route'
    requestedAt: number
  }

  // Construit un transfert : insère en_attente puis fait évoluer le statut.
  async function buildTransfer(plan: TransferPlan) {
    const m = pick(MOTIFS)
    // Choisit une destination compatible avec le motif si possible.
    let toSlug = plan.toSlug
    const compatible = (facilitiesBySpecialty.get(m.specialty) ?? []).filter((s) => s !== plan.fromSlug)
    if (compatible.length && !compatible.includes(toSlug)) toSlug = pick(compatible)
    if (toSlug === plan.fromSlug) return

    const severity = chance(0.7) ? m.severity : pick(['stable', 'urgent', 'critique'] as const)
    const fromStaff = staffOf(plan.fromSlug)
    const toStaff = staffOf(toSlug)
    if (!fromStaff.length || !toStaff.length) return
    const requestedBy = pick(fromStaff).id
    const handledBy = pick(toStaff).id
    const age = randInt(1, 92)

    const reqAt = new Date(plan.requestedAt).toISOString()
    const { data, error } = await supabase
      .from('transfer_requests')
      .insert({
        patient_initials: initials(),
        patient_age: age,
        patient_sex: chance(0.5) ? 'M' : 'F',
        severity,
        specialty_id: specialtyId[m.specialty],
        motif: m.motif,
        clinical_notes: chance(0.5) ? 'Patient stabilisé pour le transport. Surveillance continue requise.' : '',
        vitals: vitalsFor(severity),
        from_facility_id: facilityIdBySlug[plan.fromSlug],
        to_facility_id: facilityIdBySlug[toSlug],
        requested_by: requestedBy,
        status: 'en_attente',
        requested_at: reqAt,
      })
      .select()
      .single()
    if (error || !data) throw new Error(`Insert transfer : ${error?.message}`)
    const id = data.id as string

    const responseDelayMin = randInt(2, 240)
    const respAt = new Date(plan.requestedAt + responseDelayMin * 60_000)

    async function step(fields: Record<string, unknown>) {
      const { error: e } = await supabase.from('transfer_requests').update(fields).eq('id', id)
      if (e) throw new Error(`Update transfer ${id} : ${e.message}`)
    }

    if (plan.finalStatus === 'en_attente') return

    if (plan.finalStatus === 'refuse') {
      await step({ status: 'refuse', handled_by: handledBy, responded_at: respAt.toISOString(), refusal_reason: pick(REFUSAL_REASONS) })
      return
    }
    if (plan.finalStatus === 'annule') {
      await step({ status: 'annule' })
      return
    }

    // accepte / en_route / arrive passent d'abord par l'acceptation.
    await step({ status: 'accepte', handled_by: handledBy, responded_at: respAt.toISOString() })
    if (plan.finalStatus === 'accepte') return

    const departAt = new Date(respAt.getTime() + randInt(10, 40) * 60_000)
    await step({ status: 'en_route', departed_at: departAt.toISOString() })
    if (plan.finalStatus === 'en_route') return

    const arriveAt = new Date(departAt.getTime() + randInt(20, 90) * 60_000)
    await step({ status: 'arrive', arrived_at: arriveAt.toISOString() })
  }

  const slugs = FACILITIES.map((f) => f.slug)
  const distribution: TransferPlan['finalStatus'][] = [
    ...Array<TransferPlan['finalStatus']>(18).fill('arrive'),
    ...Array<TransferPlan['finalStatus']>(5).fill('refuse'),
    ...Array<TransferPlan['finalStatus']>(3).fill('annule'),
    ...Array<TransferPlan['finalStatus']>(4).fill('accepte'),
  ]
  for (const finalStatus of distribution) {
    const fromSlug = pick(slugs)
    let toSlug = pick(slugs)
    while (toSlug === fromSlug) toSlug = pick(slugs)
    // accepte = encore en cours -> récent ; le reste réparti sur 30 jours.
    const daysBack = finalStatus === 'accepte' ? randInt(0, 2) : randInt(0, 29)
    const requestedAt = now - daysBack * 86_400_000 - randInt(0, 23) * 3_600_000 - randInt(0, 59) * 60_000
    await buildTransfer({ fromSlug, toSlug, finalStatus, requestedAt })
  }

  // 2 transferts « en cours » à l'instant du seed (contenu vivant pour la démo).
  await buildTransfer({ fromSlug: 'pikine', toSlug: 'fann', finalStatus: 'en_attente', requestedAt: now - 6 * 60_000 })
  await buildTransfer({ fromSlug: 'thies', toSlug: 'principal', finalStatus: 'en_route', requestedAt: now - 42 * 60_000 })

  // ——— Notifications anciennes marquées lues (cloche réaliste) ———
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .lt('created_at', new Date(now - 2 * 86_400_000).toISOString())

  // ——— Journal d'audit cohérent (les triggers ne tracent pas les écritures service_role) ———
  console.log('→ Journal d\'audit…')
  const auditInserts: {
    actor_id: string
    action: string
    entity_type: string
    entity_id: string | null
    metadata: object
    created_at: string
  }[] = []
  for (let i = 0; i < 45; i++) {
    const f = pick(FACILITIES)
    const staff = staffOf(f.slug)
    if (!staff.length) continue
    const actor = pick(staff).id
    const createdAt = new Date(now - randInt(0, 14) * 86_400_000 - randInt(0, 86_400) * 1000).toISOString()
    if (chance(0.6)) {
      const sp = pick(f.services)
      auditInserts.push({
        actor_id: actor,
        action: 'update',
        entity_type: 'beds',
        entity_id: null,
        metadata: { libelle: `${BED_PREFIX[sp]}-${String(randInt(1, 12)).padStart(2, '0')}`, statut_avant: 'occupe', statut_apres: pick(['libre', 'nettoyage']) },
        created_at: createdAt,
      })
    } else {
      auditInserts.push({
        actor_id: actor,
        action: 'update',
        entity_type: 'equipment',
        entity_id: null,
        metadata: { type: pick(EQUIPMENT_BY_FACILITY[f.slug] ?? ['scanner']), statut_apres: pick(['fonctionnel', 'en_panne', 'maintenance']) },
        created_at: createdAt,
      })
    }
  }
  await insertRows('audit_logs', auditInserts)

  // ——— Module Don de Sang & CNTS ———
  console.log('→ Réserves de sang et alertes transfusionnelles…')
  const bloodGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
  const stockInserts = []
  for (const f of facilityRows) {
    for (const bg of bloodGroups) {
      const isCritical = bg === 'O-' || (bg === 'B-' && String(f.name).includes('Fann'))
      stockInserts.push({
        facility_id: f.id,
        blood_group: bg,
        quantity_bags: isCritical ? randInt(0, 2) : randInt(4, 18),
        minimum_threshold: bg === 'O-' ? 6 : randInt(3, 8),
        updated_at: new Date().toISOString(),
      })
    }
  }
  await insertRows('blood_stocks', stockInserts)

  const principalId = facilityIdBySlug['principal']
  const fannId = facilityIdBySlug['fann']
  const dalalId = facilityIdBySlug['dalal-jamm']

  const alertInserts = [
    {
      facility_id: principalId,
      blood_group: 'O-',
      urgency: 'vital',
      bags_needed: 4,
      bags_collected: 1,
      clinical_reason: 'Urgence Vitale · Bloc opératoire maternité (Hémorragie sévère de la délivrance)',
      status: 'active',
      donors_en_route: 1,
      created_at: new Date(now - 25 * 60_000).toISOString(),
      expires_at: new Date(now + 180 * 60_000).toISOString(),
    },
    {
      facility_id: fannId,
      blood_group: 'B-',
      urgency: 'urgent',
      bags_needed: 3,
      bags_collected: 0,
      clinical_reason: 'Polytraumatisme de la route · Réanimation chirurgicale',
      status: 'active',
      donors_en_route: 2,
      created_at: new Date(now - 50 * 60_000).toISOString(),
      expires_at: new Date(now + 240 * 60_000).toISOString(),
    },
    {
      facility_id: dalalId,
      blood_group: 'AB-',
      urgency: 'urgent',
      bags_needed: 2,
      bags_collected: 0,
      clinical_reason: 'Prise en charge hématologie pédiatrique',
      status: 'active',
      donors_en_route: 0,
      created_at: new Date(now - 75 * 60_000).toISOString(),
      expires_at: new Date(now + 300 * 60_000).toISOString(),
    },
  ]
  await insertRows('blood_alerts', alertInserts)

  // ——— Vérification de l'invariant du scénario jury ———
  const { data: reaCheck } = await supabase
    .from('v_service_availability')
    .select('beds_free, beds_total')
    .eq('facility_service_id', serviceIdByKey['principal:Réanimation'])
    .single()

  // ——— Résumé ———
  console.log('\n=== Seed terminé ===')
  for (const t of [
    'regions',
    'specialties',
    'facilities',
    'facility_services',
    'profiles',
    'beds',
    'equipment',
    'transfer_requests',
    'transfer_events',
    'notifications',
    'audit_logs',
    'blood_stocks',
    'blood_alerts',
  ]) {
    console.log(`  ${t.padEnd(20)} : ${await count(t)}`)
  }
  console.log(
    `\n  Invariant démo — Réanimation Hôpital Principal : ${reaCheck?.beds_free}/${reaCheck?.beds_total} lits libres ` +
      (reaCheck?.beds_free === 2 ? '✓' : '✗ ATTENDU 2'),
  )
  console.log('\nComptes de démonstration (mot de passe : ' + DEMO_PASSWORD + ') :')
  for (const a of FIXED_ACCOUNTS) console.log(`  ${a.email}`)
}

main().catch((err) => {
  console.error('\n✗ Erreur de seed :', err instanceof Error ? err.message : err)
  process.exit(1)
})
