import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  PORT: z.string().default('4000').transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().url('SUPABASE_URL doit être une URL valide'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10, 'SUPABASE_SERVICE_ROLE_KEY requise'),
  CORS_ORIGIN: z.string().default('*'),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.warn(
    '⚠️ [Backend Config] Certaines variables d\'environnement sont manquantes ou incomplètes :',
    _env.error.format()
  )
}

export const env = _env.success
  ? _env.data
  : {
      PORT: parseInt(process.env.PORT || '4000', 10),
      NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      SUPABASE_URL: process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_role_key',
      CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    }
