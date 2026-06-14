/** E2E Phase 5 — toutes les pages admin/région/national se chargent sans erreur. */
import { existsSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4173'
const exe = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe','C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find((p)=>existsSync(p))
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox','--window-size=1440,900'] })

let fail = 0
const assert = (c, m) => { console.log(`${c ? 'OK' : 'KO'} ${m}`); if (!c) fail++ }

async function session(email) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  const errors = []
  page.on('console', (m) => { const t = m.text(); if ((m.type()==='error'||m.type()==='warning') && !t.includes('openstreetmap') && !t.includes('Failed to load resource') && !t.includes('tile') && !t.includes('DevTools')) errors.push(t) })
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('input[type=email]')
  await page.type('input[type=email]', email)
  await page.type('input[type=password]', 'Jokko2026!')
  await Promise.all([page.waitForFunction(() => !location.pathname.startsWith('/login'), { timeout: 15000 }), page.click('button[type=submit]')])
  return { page, errors }
}

async function visit(page, errors, path, label) {
  errors.length = 0
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {})
  await new Promise((r) => setTimeout(r, 1200))
  const h1 = await page.$eval('h1', (e) => (e.textContent || '').trim()).catch(() => '')
  const bodyLen = (await page.evaluate(() => document.body.innerText.length))
  const onPath = await page.evaluate(() => location.pathname)
  const ok = onPath === path && h1.length > 0 && bodyLen > 200 && errors.length === 0
  assert(ok, `${label.padEnd(30)} h1="${h1.slice(0, 28)}" errs=${errors.length}`)
  if (errors.length) errors.slice(0, 3).forEach((e) => console.log('     ' + e.slice(0, 130)))
}

console.log('— Admin hôpital —')
{
  const { page, errors } = await session('admin.principal@jokkosante.sn')
  await visit(page, errors, '/admin/services', 'Services & équipements')
  await visit(page, errors, '/admin/transferts', 'Transferts (CSV)')
  await visit(page, errors, '/admin/personnel', 'Personnel')
  await visit(page, errors, '/admin/stats', 'Statistiques')
  await visit(page, errors, '/admin/parametres', 'Paramètres')
  await page.browserContext().close()
}
console.log('— Super admin (MSAS) —')
{
  const { page, errors } = await session('superadmin@jokkosante.sn')
  await visit(page, errors, '/national/transferts', 'Tous les transferts')
  await visit(page, errors, '/national/stats', 'Statistiques nationales')
  await visit(page, errors, '/national/audit', "Journal d'audit")
  await visit(page, errors, '/national/etablissements', 'Établissements CRUD')
  await visit(page, errors, '/national/utilisateurs', 'Utilisateurs')
  await visit(page, errors, '/national/regions', 'Régions')
  await visit(page, errors, '/national/parametres', 'Paramètres plateforme')
  await page.browserContext().close()
}
console.log('— Admin régional —')
{
  const { page, errors } = await session('region.dakar@jokkosante.sn')
  await visit(page, errors, '/region/etablissements', 'Établissements région')
  await visit(page, errors, '/region/transferts', 'Transferts région')
  await visit(page, errors, '/region/stats', 'Statistiques région')
  await page.browserContext().close()
}

await browser.close()
console.log(fail === 0 ? '\n✓ E2E admin/région/national : tout est vert' : `\n✗ ${fail} anomalie(s)`)
process.exit(fail === 0 ? 0 : 1)
