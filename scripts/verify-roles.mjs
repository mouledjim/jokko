import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const URL = process.env.VITE_SUPABASE_URL
const KEY = process.env.VITE_SUPABASE_ANON_KEY
const PW = 'Jokko2026!'

const accounts = [
  ['superadmin@jokkosante.sn', 'super_admin'],
  ['admin.principal@jokkosante.sn', 'admin_hopital'],
  ['medecin.pikine@jokkosante.sn', 'medecin'],
  ['medecin.principal@jokkosante.sn', 'medecin'],
  ['region.dakar@jokkosante.sn', 'admin_regional'],
]

let allOk = true
for (const [email, expectedRole] of accounts) {
  const sb = createClient(URL, KEY)
  const { data: auth, error: ae } = await sb.auth.signInWithPassword({ email, password: PW })
  if (ae) {
    console.log(`KO ${email}: login ${ae.message}`)
    allOk = false
    continue
  }
  const { data: prof } = await sb
    .from('profiles')
    .select('role')
    .eq('auth_id', auth.user.id)
    .single()
  const roleOk = prof.role === expectedRole
  const fac = await sb.from('v_facility_availability').select('beds_free').limit(1000)
  const tr = await sb.from('transfer_requests').select('id').limit(1000)
  const notif = await sb.from('notifications').select('id').limit(1000)
  const audit = await sb.from('audit_logs').select('id').limit(5)
  const auditExpected = expectedRole === 'super_admin'
  const auditOk = auditExpected ? (audit.data?.length ?? 0) > 0 : (audit.data?.length ?? 0) === 0
  console.log(
    `${roleOk ? 'OK' : 'KO'} ${email.padEnd(34)} role=${prof.role.padEnd(14)} ` +
      `fac=${fac.data?.length ?? 'ERR'} transferts=${tr.data?.length ?? 'ERR'} notifs=${notif.data?.length ?? 'ERR'} ` +
      `audit=${audit.data?.length ?? 0}${auditOk ? '' : ' (anomalie RLS)'}`,
  )
  if (!roleOk || !auditOk) allOk = false
  await sb.auth.signOut()
}
console.log(allOk ? '\nTOUS LES ROLES OK' : '\nDES ANOMALIES DETECTEES')
