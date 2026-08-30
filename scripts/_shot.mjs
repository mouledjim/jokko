import { existsSync } from 'node:fs'
import puppeteer from 'puppeteer-core'
const BASE = 'http://localhost:5173'
const exe = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe','C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find((p)=>existsSync(p))
const b = await puppeteer.launch({ executablePath: exe, headless:'new', args:['--no-sandbox','--window-size=1440,900'] })
const p = await b.newPage()
await p.setViewport({ width:1366, height:820 })
const errs=[]; p.on('pageerror',e=>errs.push(e.message))
// Landing
await p.goto(`${BASE}/`,{waitUntil:'domcontentloaded',timeout:15000}).catch(()=>{})
await p.waitForSelector('h1',{timeout:15000}).catch(()=>{})
await new Promise(r=>setTimeout(r,2600)) // laisse charger les images
console.log('root children =', await p.evaluate(()=>document.getElementById('root')?.childElementCount ?? -1), '| body len =', await p.evaluate(()=>document.body.innerText.length))
await p.screenshot({ path:'scripts/screenshots/v3-hero.png' })
await p.evaluate(()=>{const h=[...document.querySelectorAll('h2')].find(x=>x.textContent.includes('Au service'));h?.scrollIntoView({block:'center'})})
await new Promise(r=>setTimeout(r,1800))
await p.screenshot({ path:'scripts/screenshots/v3-band.png' })
// Login
await p.goto(`${BASE}/login`,{waitUntil:'domcontentloaded',timeout:15000}).catch(()=>{})
await p.waitForSelector('h1',{timeout:15000}).catch(()=>{})
await new Promise(r=>setTimeout(r,2600))
await p.screenshot({ path:'scripts/screenshots/v3-login.png' })
console.log('captures OK | erreurs =', errs.length)
errs.slice(0,4).forEach(e=>console.log('  ',e.slice(0,110)))
await b.close()
