import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env.js'

/**
 * Client Supabase avec privilèges d'administration (service_role).
 * Utilisé UNIQUEMENT côté serveur (Railway) pour la gestion des utilisateurs,
 * l'interopérabilité et les audits sécurisés.
 */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
