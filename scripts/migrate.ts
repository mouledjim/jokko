/**
 * Jokko Santé — Runner de migrations SQL.
 *
 * Applique dans l'ordre les fichiers de supabase/migrations/ qui ne l'ont
 * pas encore été (suivi dans public.schema_migrations).
 *
 * La connexion directe db.<ref>.supabase.co étant IPv6-only, le script
 * bascule automatiquement sur le pooler régional Supabase (IPv4) en
 * découvrant la bonne région.
 *
 * Usage : npm run db:migrate
 */
import 'dotenv/config'
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from 'pg'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD

if (!SUPABASE_URL || !DB_PASSWORD) {
  console.error(
    'Variables manquantes : VITE_SUPABASE_URL et SUPABASE_DB_PASSWORD doivent être renseignées dans .env',
  )
  process.exit(1)
}

const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0]

interface Candidate {
  label: string
  host: string
  port: number
  user: string
}

const REGIONS = [
  'eu-west-3',
  'eu-west-1',
  'eu-central-1',
  'eu-north-1',
  'eu-central-2',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'ca-central-1',
  'sa-east-1',
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
]

const candidates: Candidate[] = [
  {
    label: 'connexion directe',
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    user: 'postgres',
  },
  ...['aws-1', 'aws-0'].flatMap((prefix) =>
    REGIONS.map((region) => ({
      label: `pooler ${region} (${prefix})`,
      host: `${prefix}-${region}.pooler.supabase.com`,
      port: 5432,
      user: `postgres.${projectRef}`,
    })),
  ),
]

async function tryConnect(candidate: Candidate): Promise<Client | null> {
  const client = new Client({
    host: candidate.host,
    port: candidate.port,
    user: candidate.user,
    password: DB_PASSWORD,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  })
  try {
    await client.connect()
    return client
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await client.end().catch(() => undefined)
    if (/password authentication failed/i.test(msg)) {
      console.error(
        `\n✗ Mot de passe refusé par ${candidate.host}.\n` +
          '  Vérifiez SUPABASE_DB_PASSWORD dans .env (réinitialisable dans le dashboard : Settings → Database).',
      )
      process.exit(1)
    }
    return null
  }
}

async function connectAnyhow(): Promise<{ client: Client; label: string }> {
  for (const candidate of candidates) {
    process.stdout.write(`→ Essai ${candidate.label} (${candidate.host})… `)
    const client = await tryConnect(candidate)
    if (client) {
      console.log('connecté ✓')
      return { client, label: candidate.label }
    }
    console.log('échec')
  }
  console.error(
    '\n✗ Impossible de joindre la base de données.\n' +
      '  Solution de secours : ouvrez le dashboard Supabase → SQL Editor et collez le contenu\n' +
      '  des fichiers supabase/migrations/*.sql dans l\'ordre (0001, 0002, …).',
  )
  process.exit(1)
}

async function main() {
  const here = dirname(fileURLToPath(import.meta.url))
  const migrationsDir = join(here, '..', 'supabase', 'migrations')
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  if (files.length === 0) {
    console.log('Aucune migration trouvée.')
    return
  }

  const { client, label } = await connectAnyhow()
  console.log(`\nConnexion établie via ${label}.`)

  try {
    await client.query(`
      create table if not exists public.schema_migrations (
        name text primary key,
        applied_at timestamptz not null default now()
      );
      alter table public.schema_migrations enable row level security;
    `)

    const appliedRows = await client.query<{ name: string }>(
      'select name from public.schema_migrations',
    )
    const applied = new Set(appliedRows.rows.map((r) => r.name))

    let count = 0
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`= ${file} déjà appliquée`)
        continue
      }
      const sql = readFileSync(join(migrationsDir, file), 'utf8')
      console.log(`→ Application de ${file}…`)
      await client.query('begin')
      try {
        await client.query(sql)
        await client.query('insert into public.schema_migrations (name) values ($1)', [file])
        await client.query('commit')
        count += 1
        console.log(`✓ ${file} appliquée`)
      } catch (err) {
        await client.query('rollback')
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`\n✗ Échec dans ${file} : ${msg}`)
        process.exit(1)
      }
    }

    console.log(
      count === 0
        ? '\nBase déjà à jour — rien à appliquer.'
        : `\n${count} migration(s) appliquée(s) avec succès.`,
    )
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('Erreur inattendue :', err)
  process.exit(1)
})
