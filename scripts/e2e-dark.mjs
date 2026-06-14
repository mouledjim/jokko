/** Vérifie le mode Garde (sombre) sur une page applicative. */
import { existsSync } from 'node:fs'
import puppeteer from 'puppeteer-core'
const BASE = 'http://localhost:4173'
const exe = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe','C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find((p)=>existsSync(p))
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox','--window-size=1440,900'] })
const ctx = await browser.createBrowserContext()
const page = await ctx.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' })
await page.waitForSelector('input[type=email]')
await page.type('input[type=email]', 'admin.principal@jokkosante.sn')
await page.type('input[type=password]', 'Jokko2026!')
await Promise.all([page.waitForFunction(() => !location.pathname.startsWith('/login')), page.click('button[type=submit]')])
await page.waitForSelector('h1')
// Active le mode Garde via le vrai bouton bascule du header
await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => (x.getAttribute('aria-label') || '').includes('mode Garde')); b?.click() })
await new Promise((r) => setTimeout(r, 1200))
const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
console.log('mode Garde actif (classe .dark) =', isDark)
await page.screenshot({ path: 'scripts/screenshots/mode-garde.png' })
await page.goto(`${BASE}/admin/stats`, { waitUntil: 'networkidle0' })
await page.waitForSelector('h1')
await new Promise((r) => setTimeout(r, 1500))
await page.screenshot({ path: 'scripts/screenshots/mode-garde-stats.png' })
await browser.close()
console.log(isDark ? '✓ mode Garde OK' : '✗ mode Garde KO')
