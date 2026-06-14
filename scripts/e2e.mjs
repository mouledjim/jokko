/**
 * Test E2E headless (Edge/Chrome via puppeteer-core).
 * Vérifie : connexion des 5 rôles, rendu non vide, zéro erreur console,
 * garde de routes (accès refusé) et page 404. Capture des écrans.
 *
 * Prérequis : un serveur sur http://localhost:4173 (npm run preview).
 */
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const BASE = process.env.E2E_BASE ?? 'http://localhost:4173'
const here = dirname(fileURLToPath(import.meta.url))
const shotDir = join(here, 'screenshots')
if (!existsSync(shotDir)) mkdirSync(shotDir, { recursive: true })

const BROWSERS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
]
const executablePath = BROWSERS.find((p) => existsSync(p))
if (!executablePath) {
  console.error('Aucun navigateur Chromium trouvé.')
  process.exit(1)
}

const PW = 'Jokko2026!'
const ACCOUNTS = [
  { email: 'superadmin@jokkosante.sn', home: '/national', title: 'national' },
  { email: 'admin.principal@jokkosante.sn', home: '/admin', title: 'admin' },
  { email: 'medecin.pikine@jokkosante.sn', home: '/app', title: 'medecin-pikine' },
  { email: 'medecin.principal@jokkosante.sn', home: '/app', title: 'medecin-principal' },
  { email: 'region.dakar@jokkosante.sn', home: '/region', title: 'region' },
]

const browser = await puppeteer.launch({
  executablePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
})

let failures = 0
const ignore = (txt) =>
  txt.includes('Download the React DevTools') ||
  txt.includes('vite') ||
  txt.includes('[vite]')

/** Crée un contexte isolé (cookies/localStorage propres) pour chaque scénario. */
async function newContext() {
  if (typeof browser.createBrowserContext === 'function') return browser.createBrowserContext()
  return browser.createIncognitoBrowserContext()
}

async function login(page, email) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('input[type=email]', { timeout: 15000 })
  await page.type('input[type=email]', email)
  await page.type('input[type=password]', PW)
  await Promise.all([
    page.waitForFunction(() => !location.pathname.startsWith('/login'), { timeout: 15000 }),
    page.click('button[type=submit]'),
  ])
}

async function run() {
  for (const acc of ACCOUNTS) {
    const ctx = await newContext()
    const page = await ctx.newPage()
    await page.setViewport({ width: 1440, height: 900 })
    const errors = []
    page.on('console', (m) => {
      if ((m.type() === 'error' || m.type() === 'warning') && !ignore(m.text())) errors.push(`[${m.type()}] ${m.text()}`)
    })
    page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))

    try {
      await login(page, acc.email)
      const path = await page.evaluate(() => location.pathname)
      const homeOk = path.startsWith(acc.home)
      await page.waitForSelector('h1', { timeout: 10000 })
      await new Promise((r) => setTimeout(r, 1500)) // laisse les données se charger
      const h1 = (await page.$eval('h1', (el) => el.textContent || '')).trim()
      const bodyLen = (await page.$eval('body', (el) => el.innerText || '')).length
      await page.screenshot({ path: join(shotDir, `${acc.title}.png`) })

      const ok = homeOk && h1.length > 0 && bodyLen > 200 && errors.length === 0
      if (!ok) failures++
      console.log(
        `${ok ? 'OK' : 'KO'} ${acc.email.padEnd(34)} path=${path.padEnd(10)} h1="${h1.slice(0, 32)}" bodyLen=${bodyLen} errs=${errors.length}`,
      )
      if (errors.length) errors.slice(0, 5).forEach((e) => console.log('     ' + e.slice(0, 140)))
    } catch (err) {
      failures++
      console.log(`KO ${acc.email} : ${err.message}`)
    }
    await ctx.close()
  }

  // Garde de route : un médecin vers /national -> /acces-refuse
  {
    const ctx = await newContext()
    const page = await ctx.newPage()
    await login(page, 'medecin.pikine@jokkosante.sn')
    await page.goto(`${BASE}/national`, { waitUntil: 'networkidle0' })
    const path = await page.evaluate(() => location.pathname)
    const ok = path === '/acces-refuse'
    if (!ok) failures++
    console.log(`${ok ? 'OK' : 'KO'} garde de route médecin -> /national redirige vers ${path}`)
    await page.screenshot({ path: join(shotDir, 'acces-refuse.png') })
    await ctx.close()
  }

  // 404
  {
    const ctx = await newContext()
    const page = await ctx.newPage()
    await page.goto(`${BASE}/route-inexistante-xyz`, { waitUntil: 'networkidle0' })
    const txt = await page.$eval('body', (el) => el.innerText || '')
    const ok = txt.includes('introuvable') || txt.includes('404')
    if (!ok) failures++
    console.log(`${ok ? 'OK' : 'KO'} page 404 affichée`)
    await page.screenshot({ path: join(shotDir, '404.png') })
    await ctx.close()
  }

  // Login mobile 390px + mode Garde via media (capture)
  {
    const ctx = await newContext()
    const page = await ctx.newPage()
    await page.setViewport({ width: 390, height: 844, isMobile: true })
    await login(page, 'medecin.pikine@jokkosante.sn')
    await page.waitForSelector('h1')
    await new Promise((r) => setTimeout(r, 1200))
    await page.screenshot({ path: join(shotDir, 'medecin-mobile.png') })
    console.log('OK capture mobile 390px (medecin)')
    await ctx.close()
  }
}

await run()
await browser.close()
console.log(failures === 0 ? '\n✓ E2E : tout est vert' : `\n✗ E2E : ${failures} anomalie(s)`)
process.exit(failures === 0 ? 0 : 1)
