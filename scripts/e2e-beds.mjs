/**
 * E2E Phase 2 — Lits & temps réel.
 * Vérifie : rendu de la grille, cycle de statut optimiste, scénario hors-ligne
 * (mise en file + badge « En attente » + synchro au retour réseau).
 */
import { existsSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4173'
const exe = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].find((p) => existsSync(p))

const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox'] })
const ctx = await browser.createBrowserContext()
const page = await ctx.newPage()
const errors = []
page.on('console', (m) => {
  const t = m.text()
  // On ignore les échecs réseau provoqués VOLONTAIREMENT par le test hors-ligne.
  const networkNoise =
    t.includes('ERR_INTERNET_DISCONNECTED') ||
    t.includes('Failed to load resource') ||
    t.includes('DevTools')
  if ((m.type() === 'error' || m.type() === 'warning') && !networkNoise) errors.push(t)
})
page.on('pageerror', (e) => errors.push(e.message))

let fail = 0
const assert = (cond, msg) => {
  console.log(`${cond ? 'OK' : 'KO'} ${msg}`)
  if (!cond) fail++
}

async function login() {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('input[type=email]')
  await page.type('input[type=email]', 'medecin.pikine@jokkosante.sn')
  await page.type('input[type=password]', 'Jokko2026!')
  await Promise.all([
    page.waitForFunction(() => !location.pathname.startsWith('/login'), { timeout: 15000 }),
    page.click('button[type=submit]'),
  ])
}

await login()
await page.goto(`${BASE}/app/lits`, { waitUntil: 'networkidle0' })
await page.waitForSelector('[data-testid=bed-tile]', { timeout: 10000 })
const tileCount = await page.$$eval('[data-testid=bed-tile]', (els) => els.length)
assert(tileCount > 0, `grille de lits rendue (${tileCount} tuiles)`)

// Cycle de statut optimiste
const firstSel = '[data-testid=bed-tile]'
const before = await page.$eval(firstSel, (el) => el.getAttribute('data-status'))
await page.click(firstSel)
await page.waitForFunction(
  (b) => document.querySelector('[data-testid=bed-tile]')?.getAttribute('data-status') !== b,
  { timeout: 5000 },
  before,
)
const after = await page.$eval(firstSel, (el) => el.getAttribute('data-status'))
assert(before !== after, `cycle de statut optimiste : ${before} -> ${after}`)

// Scénario hors-ligne : couper le réseau, changer 2 lits, vérifier la mise en file
await page.setOfflineMode(true)
await new Promise((r) => setTimeout(r, 400))
const bannerOffline = await page.evaluate(() => document.body.innerText.includes('Hors ligne'))
assert(bannerOffline, 'bandeau hors-ligne affiché')

// Re-sélectionne à chaque clic (les nœuds sont recréés au re-render)
async function clickTileByLabel(label) {
  await page.evaluate((lbl) => {
    const el = [...document.querySelectorAll('[data-testid=bed-tile]')].find(
      (e) => e.getAttribute('data-label') === lbl,
    )
    el?.click()
  }, label)
  await new Promise((r) => setTimeout(r, 350))
}
const labels = await page.$$eval('[data-testid=bed-tile]', (els) =>
  els.slice(1, 3).map((e) => e.getAttribute('data-label')),
)
for (const lbl of labels) await clickTileByLabel(lbl)
await new Promise((r) => setTimeout(r, 400))
const pendingCount = await page.$$eval('[data-testid=bed-tile][data-pending=true]', (els) => els.length)
assert(pendingCount >= 2, `lits en attente de synchro hors-ligne (${pendingCount})`)

// Retour réseau : la file se rejoue
await page.setOfflineMode(false)
await page.evaluate(() => window.dispatchEvent(new Event('online')))
await page
  .waitForFunction(() => document.querySelectorAll('[data-testid=bed-tile][data-pending=true]').length === 0, {
    timeout: 10000,
  })
  .catch(() => {})
const stillPending = await page.$$eval('[data-testid=bed-tile][data-pending=true]', (els) => els.length)
assert(stillPending === 0, 'file rejouée au retour du réseau (plus de lits en attente)')

assert(errors.length === 0, `aucune erreur console (${errors.length})`)
if (errors.length) errors.slice(0, 5).forEach((e) => console.log('   ' + e.slice(0, 140)))

await page.screenshot({ path: 'scripts/screenshots/medecin-lits.png' })
await browser.close()
console.log(fail === 0 ? '\n✓ E2E lits : tout est vert' : `\n✗ E2E lits : ${fail} anomalie(s)`)
process.exit(fail === 0 ? 0 : 1)
