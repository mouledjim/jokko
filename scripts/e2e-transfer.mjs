/**
 * E2E Phase 4 — Scénario de démonstration §6 sur deux clients.
 * Pikine crée un transfert critique → l'Hôpital Principal le reçoit EN TEMPS RÉEL,
 * l'accepte → Pikine voit l'acceptation → en route → arrivé, tout en temps réel.
 */
import { existsSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4173'
const exe = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe','C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find((p)=>existsSync(p))
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox', '--window-size=1440,900'] })

let fail = 0
const assert = (c, m) => { console.log(`${c ? 'OK' : 'KO'} ${m}`); if (!c) fail++ }
const allErrors = []

async function newPage(email) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  page.on('console', (m) => {
    const t = m.text()
    if ((m.type() === 'error' || m.type() === 'warning') && !t.includes('openstreetmap') && !t.includes('Failed to load resource') && !t.includes('tile') && !t.includes('DevTools')) allErrors.push(`${email}: ${t}`)
  })
  page.on('pageerror', (e) => allErrors.push(`${email}: ${e.message}`))
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('input[type=email]')
  await page.type('input[type=email]', email)
  await page.type('input[type=password]', 'Jokko2026!')
  await Promise.all([
    page.waitForFunction(() => !location.pathname.startsWith('/login'), { timeout: 15000 }),
    page.click('button[type=submit]'),
  ])
  return page
}
const clickByText = (page, text) => page.evaluate((t) => {
  const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === t)
  b?.click()
  return !!b
}, text)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// — Écran A : médecin de Pikine —
const A = await newPage('medecin.pikine@jokkosante.sn')
await A.goto(`${BASE}/app/transferts/nouveau`, { waitUntil: 'networkidle0' })
await A.waitForSelector('input[placeholder="AD"]')

// — Écran B : médecin de l'Hôpital Principal, sur les transferts entrants —
const B = await newPage('medecin.principal@jokkosante.sn')
await B.goto(`${BASE}/app/entrants`, { waitUntil: 'networkidle0' })
await B.waitForSelector('h1')

// Étape 1 : patient
await A.type('input[placeholder="AD"]', 'DMO')
await A.type('input[type=number]:not([placeholder])', '58')
await A.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Critique')?.click())
const reaVal = await A.$$eval('select option', (opts) => opts.find((o) => o.textContent.trim() === 'Réanimation')?.value || '')
await A.select('select', reaVal)
await A.type('input[placeholder^="Ex."]', 'Infarctus du myocarde — réanimation requise')
await clickByText(A, 'Continuer')

// Étape 2 : destination = Hôpital Principal
await A.waitForFunction(() => document.body.innerText.includes('Établissements suggérés'))
await wait(600)
const picked = await A.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Hôpital Principal de Dakar'))
  b?.click()
  return !!b
})
assert(picked, 'suggestion « Hôpital Principal de Dakar » proposée et sélectionnée')
await clickByText(A, 'Continuer')

// Étape 3 : envoi
await A.waitForFunction(() => document.body.innerText.includes('Récapitulatif') || [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Envoyer')))
await wait(300)
const sent = await clickByText(A, 'Envoyer la demande')
console.log('  bouton Envoyer cliqué =', sent)
try {
  await A.waitForFunction(() => /\/app\/transferts\/[0-9a-f-]{30,}/.test(location.pathname), { timeout: 15000 })
} catch {
  console.log('  URL après envoi =', A.url())
  console.log('  body =', (await A.evaluate(() => document.body.innerText)).slice(0, 500))
  console.log('  erreurs =', allErrors.join(' | '))
  throw new Error('navigation après envoi échouée')
}
await A.waitForFunction(() => {
  const el = document.querySelector('h1 .font-mono')
  return el && /^TRF-/.test(el.textContent.trim())
}, { timeout: 8000 })
const reference = await A.$eval('h1 .font-mono', (e) => e.textContent.trim())
assert(/^TRF-/.test(reference), `demande créée (${reference})`)

// — Écran B : la demande apparaît EN TEMPS RÉEL (sans rechargement) —
let appeared = false
try {
  await B.waitForFunction((ref) => document.body.innerText.includes(ref), { timeout: 12000 }, reference)
  appeared = true
} catch { appeared = false }
assert(appeared, 'écran B : la demande entrante apparaît en temps réel (sans reload)')

// B accepte
await clickByText(B, 'Accepter')
await B.waitForFunction(() => document.body.innerText.includes("Confirmer l'acceptation"), { timeout: 5000 })
await clickByText(B, "Confirmer l'acceptation")
await wait(1500)

// — Écran A : statut passe à « Accepté » en temps réel —
let accepted = false
try {
  await A.waitForFunction(() => document.body.innerText.includes('Accepté'), { timeout: 12000 })
  accepted = true
} catch { accepted = false }
assert(accepted, 'écran A : statut « Accepté » reçu en temps réel')

// A marque en route → mini-carte ambulance
await clickByText(A, 'Marquer en route')
let enRoute = false
try {
  await A.waitForFunction(() => document.querySelector('.leaflet-container') && document.body.innerText.includes('En route'), { timeout: 10000 })
  enRoute = true
} catch { enRoute = false }
assert(enRoute, 'écran A : « En route » + mini-carte ambulance affichée')

// A marque arrivé
await clickByText(A, 'Marquer arrivé')
let arrived = false
try {
  await A.waitForFunction(() => document.body.innerText.includes('Arrivé') && document.body.innerText.includes('clôturé'), { timeout: 10000 })
  arrived = true
} catch { arrived = false }
assert(arrived, 'écran A : « Arrivé » — transfert clôturé')

await A.screenshot({ path: 'scripts/screenshots/transfert-detail.png' })
assert(allErrors.length === 0, `aucune erreur console (${allErrors.length})`)
allErrors.slice(0, 6).forEach((e) => console.log('   ' + e.slice(0, 140)))

await browser.close()
console.log(fail === 0 ? '\n✓ E2E transfert (scénario jury) : tout est vert' : `\n✗ E2E transfert : ${fail} anomalie(s)`)
process.exit(fail === 0 ? 0 : 1)
