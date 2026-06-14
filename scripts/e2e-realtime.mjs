/**
 * E2E temps réel : deux clients sur la grille de lits du même établissement.
 * Un changement sur l'écran A doit apparaître sur l'écran B sans rechargement.
 */
import { existsSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4173'
const exe = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe','C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find((p)=>existsSync(p))
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox'] })

async function loginLits(email) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('input[type=email]')
  await page.type('input[type=email]', email)
  await page.type('input[type=password]', 'Jokko2026!')
  await Promise.all([
    page.waitForFunction(() => !location.pathname.startsWith('/login'), { timeout: 15000 }),
    page.click('button[type=submit]'),
  ])
  await page.goto(`${BASE}/app/lits`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('[data-testid=bed-tile]')
  return page
}

let fail = 0
const assert = (c, m) => { console.log(`${c ? 'OK' : 'KO'} ${m}`); if (!c) fail++ }

const A = await loginLits('medecin.principal@jokkosante.sn')
const B = await loginLits('medecin.principal@jokkosante.sn')

// Écran A : cycle d'un lit, on lit le nouveau statut
const label = await A.$eval('[data-testid=bed-tile]', (e) => e.getAttribute('data-label'))
await A.evaluate((lbl) => {
  const el = [...document.querySelectorAll('[data-testid=bed-tile]')].find((e) => e.getAttribute('data-label') === lbl)
  el?.click()
}, label)
await new Promise((r) => setTimeout(r, 600))
const newStatus = await A.$eval(`[data-label="${label}"]`, (e) => e.getAttribute('data-status'))
console.log(`écran A : ${label} -> ${newStatus}`)

// Écran B : doit refléter le même statut via Realtime, sans rechargement
let propagated = false
try {
  await B.waitForFunction(
    (lbl, st) => document.querySelector(`[data-label="${lbl}"]`)?.getAttribute('data-status') === st,
    { timeout: 10000 },
    label,
    newStatus,
  )
  propagated = true
} catch {
  propagated = false
}
const bStatus = await B.$eval(`[data-label="${label}"]`, (e) => e.getAttribute('data-status'))
assert(propagated, `écran B reflète ${label} = ${bStatus} via temps réel`)

await browser.close()
console.log(fail === 0 ? '\n✓ Temps réel : propagation OK' : `\n✗ Temps réel : ${fail} anomalie(s)`)
process.exit(fail === 0 ? 0 : 1)
