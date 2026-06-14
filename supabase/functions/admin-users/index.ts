// Jokko Santé — Edge Function « admin-users »
// Création de comptes et réinitialisation de mot de passe avec la clé
// service_role CÔTÉ SERVEUR (jamais exposée au client).
//
// Déploiement :
//   npx supabase login
//   npx supabase functions deploy admin-users --project-ref <project-ref>
// (SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont injectés automatiquement.)
//
// Le client appelle cette fonction via supabase.functions.invoke('admin-users').
// Tant qu'elle n'est pas déployée, l'application bascule sur une création de
// compte côté client (voir src/features/profiles/api.ts).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

function genPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let p = ''
  for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)]
  return p + '!2'
}

// @ts-expect-error Deno global (environnement Edge Functions)
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    // @ts-expect-error Deno global
    const url = Deno.env.get('SUPABASE_URL')
    // @ts-expect-error Deno global
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

    // Identité de l'appelant
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
    const { data: userData, error: uErr } = await admin.auth.getUser(token)
    if (uErr || !userData.user) return json({ error: 'Non authentifié.' }, 401)

    const { data: caller } = await admin
      .from('profiles')
      .select('role, facility_id')
      .eq('auth_id', userData.user.id)
      .single()
    if (!caller || !['admin_hopital', 'super_admin'].includes(caller.role)) {
      return json({ error: 'Accès refusé.' }, 403)
    }

    const body = await req.json()

    if (body.action === 'create') {
      const role = body.role
      if (!['medecin', 'admin_hopital'].includes(role)) return json({ error: 'Rôle invalide.' }, 400)
      const targetFacility = caller.role === 'super_admin' ? body.facility_id : caller.facility_id
      if (!targetFacility) return json({ error: 'Établissement requis.' }, 400)

      const password = genPassword()
      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email: String(body.email).trim(),
        password,
        email_confirm: true,
        user_metadata: { first_name: body.first_name, last_name: body.last_name },
      })
      if (cErr || !created.user) return json({ error: cErr?.message ?? 'Création échouée.' }, 400)

      const { error: pErr } = await admin.from('profiles').insert({
        auth_id: created.user.id,
        first_name: body.first_name,
        last_name: body.last_name,
        role,
        facility_id: targetFacility,
        specialty_id: body.specialty_id ?? null,
        phone: body.phone ?? '',
        is_active: true,
      })
      if (pErr) {
        await admin.auth.admin.deleteUser(created.user.id)
        return json({ error: pErr.message }, 400)
      }
      return json({ password })
    }

    if (body.action === 'reset_password') {
      const { data: prof } = await admin
        .from('profiles')
        .select('auth_id, facility_id')
        .eq('id', body.profile_id)
        .single()
      if (!prof) return json({ error: 'Profil introuvable.' }, 404)
      if (caller.role === 'admin_hopital' && prof.facility_id !== caller.facility_id) {
        return json({ error: 'Accès refusé.' }, 403)
      }
      const password = genPassword()
      const { error } = await admin.auth.admin.updateUserById(prof.auth_id, { password })
      if (error) return json({ error: error.message }, 400)
      return json({ password })
    }

    return json({ error: 'Action inconnue.' }, 400)
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500)
  }
})
