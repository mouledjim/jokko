/** E2E Phase 3 — Carte Leaflet : marqueurs, popup riche, filtres spécialité + équipement. */
import { existsSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4173'
const exe = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe','C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find((p)=>existsSync(p))
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox', '--window-size=1440,900'] })
const ctx = await browser.createBrowserContext()
const page = await ctx.newPage()
await page.setViewport({ width: 1440, height: 900 })
const errors = []
page.on('console', (m) => {
  const t = m.text()
  const noise = t.includes('openstreetmap') || t.includes('Failed to load resource') || t.includes('tile') || t.includes('DevTools')
  if ((m.type() === 'error' || m.type() === 'warning') && !noise) errors.push(t)
})
page.on('pageerror', (e) => errors.push(e.message))

let fail = 0
const assert = (c, m) => { console.log(`${c ? 'OK' : 'KO'} ${m}`); if (!c) fail++ }

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' })
await page.waitForSelector('input[type=email]')
await page.type('input[type=email]', 'medecin.pikine@jokkosante.sn')
await page.type('input[type=password]', 'Jokko2026!')
await Promise.all([
  page.waitForFunction(() => !location.pathname.startsWith('/login'), { timeout: 15000 }),
  page.click('button[type=submit]'),
])
await page.goto(`${BASE}/app/carte`, { waitUntil: 'networkidle0' })
await page.waitForSelector('.leaflet-container', { timeout: 10000 })
await page.waitForSelector('.leaflet-marker-icon', { timeout: 10000 })
await new Promise((r) => setTimeout(r, 1500))

const total = await page.$$eval('.leaflet-marker-icon', (e) => e.length)
assert(total > 5, `marqueurs affichés sur la carte (${total})`)

// Popup riche (sur la carte complète) : clic du marqueur le plus central
async function tryOpenPopup() {
  const boxes = (await Promise.all((await page.$$('.leaflet-marker-icon')).map((m) => m.boundingBox()))).filter(Boolean)
  const ordered = boxes.sort((a, b) => Math.abs(a.x - 850) - Math.abs(b.x - 850))
  for (const b of ordered.slice(0, 6)) {
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
    await new Promise((r) => setTimeout(r, 500))
    if (await page.$('.leaflet-popup')) return true
  }
  return false
}
const opened = await tryOpenPopup()
await new Promise((r) => setTimeout(r, 400))
const popupText = opened ? await page.$eval('.leaflet-popup-pane', (e) => e.textContent || '').catch(() => '') : ''
assert(opened && (popupText.includes('Lits libres') || popupText.includes('Équipements')), 'popup riche affichée au clic')
await page.screenshot({ path: 'scripts/screenshots/carte.png' })

// Ferme la popup
await page.keyboard.press('Escape').catch(() => {})
await page.evaluate(() => document.querySelector('.leaflet-popup-close-button')?.click())
await new Promise((r) => setTimeout(r, 400))

// Filtre spécialité = Réanimation
const reaVal = await page.$$eval('select option', (opts) => {
  const o = opts.find((x) => x.textContent.trim() === 'Réanimation')
  return o ? o.value : ''
})
await page.select('select', reaVal)
await new Promise((r) => setTimeout(r, 1200))
const afterSpec = await page.$$eval('.leaflet-marker-icon', (e) => e.length)
assert(afterSpec > 0 && afterSpec < total, `filtre Réanimation : ${total} -> ${afterSpec} marqueurs`)

// Filtre équipement = Scanner
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Scanner')
  btn?.click()
})
await new Promise((r) => setTimeout(r, 1200))
const afterEq = await page.$$eval('.leaflet-marker-icon', (e) => e.length)
assert(afterEq > 0 && afterEq <= afterSpec, `+ filtre Scanner fonctionnel : ${afterSpec} -> ${afterEq} marqueurs`)

assert(errors.length === 0, `aucune erreur console (${errors.length})`)
if (errors.length) errors.slice(0, 5).forEach((e) => console.log('   ' + e.slice(0, 140)))

await browser.close()
console.log(fail === 0 ? '\n✓ E2E carte : tout est vert' : `\n✗ E2E carte : ${fail} anomalie(s)`)
process.exit(fail === 0 ? 0 : 1)
