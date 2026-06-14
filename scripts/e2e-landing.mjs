/** E2E Phase 6 — Landing : hero, SVG anatomiques, sections, PWA, navigation. */
import { existsSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4173'
const exe = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe','C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find((p)=>existsSync(p))
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox','--window-size=1440,900'] })
const ctx = await browser.createBrowserContext()
const page = await ctx.newPage()
await page.setViewport({ width: 1440, height: 900 })
const errors = []
page.on('console', (m) => { const t = m.text(); if ((m.type()==='error'||m.type()==='warning') && !t.includes('openstreetmap') && !t.includes('Failed to load resource') && !t.includes('tile') && !t.includes('DevTools') && !t.toLowerCase().includes('service worker')) errors.push(t) })
page.on('pageerror', (e) => errors.push(e.message))

let fail = 0
const assert = (c, m) => { console.log(`${c ? 'OK' : 'KO'} ${m}`); if (!c) fail++ }

await page.goto(`${BASE}/`, { waitUntil: 'networkidle0' })
await page.waitForSelector('h1', { timeout: 10000 })
const h1 = await page.$eval('h1', (e) => e.textContent || '')
assert(h1.includes('Trouver un lit'), `hero affiché ("${h1.slice(0, 40)}")`)

const svgLabels = await page.$$eval('svg[aria-label]', (els) => els.map((e) => e.getAttribute('aria-label')))
assert(svgLabels.some((l) => l?.includes('Sénégal')), 'carte du Sénégal présente')
assert(svgLabels.some((l) => l?.includes('Cœur')), 'animation cœur présente')
assert(svgLabels.some((l) => l?.includes('Poumons')), 'animation poumons présente')
assert(svgLabels.some((l) => l?.includes('ECG')), 'animation ECG présente')

const bodyText = await page.evaluate(() => document.body.innerText)
assert(bodyText.includes('Le problème'), 'section problème présente')
assert(bodyText.includes('Comment ça marche'), 'section fonctionnement présente')
assert(bodyText.includes('CDP'), 'positionnement / conformité CDP présent')

const hasManifest = await page.$eval('link[rel="manifest"]', (e) => !!e.getAttribute('href')).catch(() => false)
assert(hasManifest, 'manifest PWA lié dans le <head>')

await page.screenshot({ path: 'scripts/screenshots/landing-hero.png' })
// Scroll vers les animations anatomiques
await page.evaluate(() => window.scrollTo(0, 1700))
await new Promise((r) => setTimeout(r, 800))
await page.screenshot({ path: 'scripts/screenshots/landing-anatomy.png' })

// Navigation "Voir la démo"
await page.evaluate(() => window.scrollTo(0, 0))
await page.evaluate(() => { const a = [...document.querySelectorAll('a')].find((x) => x.textContent.includes('Voir la démo')); a?.click() })
await page.waitForFunction(() => location.pathname === '/login', { timeout: 8000 }).catch(() => {})
assert(await page.evaluate(() => location.pathname === '/login'), 'bouton « Voir la démo » mène à /login')

assert(errors.length === 0, `aucune erreur console (${errors.length})`)
errors.slice(0, 5).forEach((e) => console.log('   ' + e.slice(0, 140)))

// prefers-reduced-motion : la page reste fonctionnelle
const page2 = await ctx.newPage()
await page2.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
await page2.goto(`${BASE}/`, { waitUntil: 'networkidle0' })
await page2.waitForSelector('h1')
assert(await page2.$eval('h1', (e) => (e.textContent || '').includes('Trouver')), 'landing OK en prefers-reduced-motion')

await browser.close()
console.log(fail === 0 ? '\n✓ E2E landing : tout est vert' : `\n✗ E2E landing : ${fail} anomalie(s)`)
process.exit(fail === 0 ? 0 : 1)
