/** E2E des 3 améliorations : historique d'occupation + API FHIR (page). */
import { existsSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4173'
const exe = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe','C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find((p)=>existsSync(p))
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox','--window-size=1440,900'] })

let fail = 0
const assert = (c, m) => { console.log(`${c ? 'OK' : 'KO'} ${m}`); if (!c) fail++ }

async function login(email) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  const errors = []
  page.on('console', (m) => { const t = m.text(); if ((m.type()==='error'||m.type()==='warning') && !t.includes('openstreetmap') && !t.includes('Failed to load resource') && !t.includes('tile') && !t.includes('DevTools') && !t.toLowerCase().includes('service worker')) errors.push(t) })
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('input[type=email]')
  await page.type('input[type=email]', email)
  await page.type('input[type=password]', 'Jokko2026!')
  await Promise.all([page.waitForFunction(() => !location.pathname.startsWith('/login'), { timeout: 15000 }), page.click('button[type=submit]')])
  return { page, errors }
}

// Historique d'occupation (admin stats)
{
  const { page, errors } = await login('admin.principal@jokkosante.sn')
  await page.goto(`${BASE}/admin/stats`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('h1')
  await new Promise((r) => setTimeout(r, 1800))
  const body = await page.evaluate(() => document.body.innerText)
  assert(body.includes('Occupation des lits'), 'courbe « Occupation des lits — historique » présente (admin)')
  const charts = await page.$$eval('svg.recharts-surface', (e) => e.length)
  assert(charts >= 3, `graphiques Recharts rendus (${charts})`)
  assert(errors.length === 0, `admin/stats sans erreur console (${errors.length})`)
  await page.screenshot({ path: 'scripts/screenshots/stats-occupation.png' })
  await page.browserContext().close()
}

// API FHIR (page interop nationale)
{
  const { page, errors } = await login('superadmin@jokkosante.sn')
  await page.goto(`${BASE}/national/interop`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('h1')
  await new Promise((r) => setTimeout(r, 1800))
  const body = await page.evaluate(() => document.body.innerText)
  assert(body.includes('HL7 FHIR'), 'page interopérabilité HL7 FHIR affichée')
  assert(body.includes('rpc/fhir_availability'), 'point d\'accès FHIR affiché')
  assert(body.includes('"resourceType"') && body.includes('Bundle'), 'Bundle FHIR rendu en direct')
  assert(body.includes('Location'), 'ressources Location présentes dans le Bundle')
  assert(errors.length === 0, `interop sans erreur console (${errors.length})`)
  await page.screenshot({ path: 'scripts/screenshots/interop-fhir.png' })
  await page.browserContext().close()
}

await browser.close()
console.log(fail === 0 ? '\n✓ E2E améliorations : tout est vert' : `\n✗ E2E améliorations : ${fail} anomalie(s)`)
process.exit(fail === 0 ? 0 : 1)
