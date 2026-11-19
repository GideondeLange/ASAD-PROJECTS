// Builds one A4 spec-sheet PDF per pod, using the text, prices and photos that are
// already on each pod page, so the sheets always agree with the website.
//
//   node scripts/make-spec-sheets.cjs            (all sheets)
//   node scripts/make-spec-sheets.cjs guard-house (one sheet)
//
// Output: public/brochures/asad-<pod-name>-spec-sheet.pdf  (same file name every time,
// so links people already shared keep working). Needs Google Chrome installed.
// Photos are never cropped: each one is shown whole (object-fit: contain) on a
// blurred copy of itself.
const fs = require('fs')
const path = require('path')
const os = require('os')
const { execFileSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const PODS = ['pod-1', 'pod-2', 'pod-4', 'pod-5', 'pod-6', 'entertainment-pod', 'office-storage-pod', 'guard-house', 'coffee-shop-pod', 'roof-top-pod']
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(fs.existsSync)
const OUT_HTML = path.join(os.tmpdir(), 'asad-sheets')
fs.mkdirSync(OUT_HTML, { recursive: true })

const dec = (s) => s.replace(/&amp;/g, '&').replace(/&rsquo;|&#8217;/g, '\u2019').replace(/&nbsp;/g, '\u00a0').replace(/&mdash;/g, '\u2014').replace(/&ndash;/g, '\u2013').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const strip = (s) => dec(s.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim()
const all = (re, s) => [...s.matchAll(re)]
const fileUrl = (p) => 'file:///' + path.join(ROOT, 'public', p).replace(/\\/g, '/').replace(/ /g, '%20')
const slugify = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function parse(slug) {
  const html = fs.readFileSync(path.join(ROOT, 'asad-pods', slug + '.html'), 'utf8').replace(/\r\n/g, '\n')
  const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'))
  const get = (re) => { const m = main.match(re); return m ? strip(m[1]) : '' }
  const price = get(/<span class="k">From<\/span><span class="v">([^<]*)<\/span>/)
  const size = (main.match(/<span class="k">Size<\/span><span class="v">(\d+)<small>/) || [])[1]
  const hero = main.match(/pod-hero-media"><img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"/)
  const noteHtml = (main.match(/<p class="note">See <a[^>]*>Included &amp; Excluded<\/a>\.([\s\S]*?)<\/p>/) || [])[1] || ''
  const plan = main.match(/plan-box"><img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"/)
  const galleryBlock = (main.match(/class="pod-gallery[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/) || [''])[0]
  const gallery = all(/<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"/g, galleryBlock)
    .map((m) => ({ src: m[1], alt: dec(m[2]) }))
    .filter((g) => !/under construction|being fitted|fitting the|team /i.test(g.alt))
  return {
    slug,
    cat: get(/<span class="eyebrow">([^<]*)<\/span>\s*<h1>/).split('\u00b7')[0].trim(),
    title: get(/<h1>([^<]*)<\/h1>/),
    size, price,
    hero: hero && { src: hero[1], alt: dec(hero[2]) },
    lead: get(/<span class="eyebrow">Overview<\/span>\s*<h2[^>]*>([\s\S]*?)<\/h2>/),
    tags: all(/<span class="tag">([^<]*)<\/span>/g, main).map((m) => strip(m[1])),
    checks: all(/<li>([^<]*)<\/li>/g, (main.match(/<ul class="check-list"[\s\S]*?<\/ul>/) || [''])[0]).map((m) => strip(m[1])),
    plan: plan && { src: plan[1], alt: dec(plan[2]), cap: get(/<p class="plan-cap">([^<]*)<\/p>/) },
    gallery: gallery.slice(0, 6),
    services: all(/<h3>([^<]*)<\/h3><p>([^<]*)<\/p><span class="pr">([^<]*)<\/span>/g, main).map((m) => ({ name: strip(m[1]), price: strip(m[3]) })),
    note: strip(noteHtml),
  }
}

// a photo shown whole on a blurred copy of itself: nothing is ever cropped
const photo = (src, alt, h, cls = '') => `<div class="photo ${cls}" style="height:${h}px"><img class="bg" src="${fileUrl(src)}" alt=""><img class="fg" src="${fileUrl(src)}" alt="${esc(alt)}"></div>`

const css = `
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0}
html,body{background:#f3f2ef}
body{font-family:'Jost',sans-serif;color:#141414;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;height:297mm;display:flex;flex-direction:column;overflow:hidden;page-break-after:always;background:#f3f2ef}
.page:last-child{page-break-after:auto}
.top{background:#0b0b0b;padding:22px 44px;display:flex;justify-content:space-between;align-items:center}
.top img{height:42px}.top span{color:#a9a8a5;font-size:11px;letter-spacing:.28em;text-transform:uppercase}
.photo{position:relative;overflow:hidden;background:#1c1c1c}
.photo .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:blur(28px) brightness(.55);transform:scale(1.25)}
.photo .fg{position:relative;width:100%;height:100%;object-fit:contain;display:block}
.photo.light{background:#fff;border:1px solid rgba(11,11,11,.14)}
.photo.light .bg{display:none}
.body{padding:28px 44px 0;flex:1}
.cat{font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#6f6f6f}
h1{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:46px;line-height:1.05;margin:6px 0 8px}
.lead{font-size:14.5px;line-height:1.55;color:#3d3d3d;max-width:600px}
.facts{display:flex;margin:20px 0 18px;border-top:1px solid rgba(11,11,11,.18);border-bottom:1px solid rgba(11,11,11,.18)}
.facts div{flex:1;padding:12px 0}.facts div+div{padding-left:20px;border-left:1px solid rgba(11,11,11,.18)}
.facts small{display:block;font-size:9.5px;letter-spacing:.24em;text-transform:uppercase;color:#6f6f6f;margin-bottom:5px}
.facts b{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:26px;white-space:nowrap}
.cols{display:flex;gap:36px}.cols>div{flex:1}
h2{font-size:10.5px;letter-spacing:.28em;text-transform:uppercase;color:#6f6f6f;font-weight:500;margin-bottom:8px}
ul{list-style:none;padding:0}
li{font-size:13px;line-height:1.4;padding:6px 0;border-bottom:1px solid rgba(11,11,11,.12)}
li span{float:right;color:#3d3d3d;margin-left:10px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.chips span{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;border:1px solid rgba(11,11,11,.3);padding:4px 9px}
.note{font-size:10.5px;line-height:1.55;color:#6f6f6f;margin-top:14px}
.foot{background:#0b0b0b;color:#f3f2ef;padding:18px 44px;display:flex;justify-content:space-between;align-items:center;font-size:12.5px}
.foot b{font-family:'Cormorant Garamond',serif;font-weight:400;font-size:21px}
.foot div:last-child{text-align:right;line-height:1.6;color:#a9a8a5}
.p2 .body{padding-top:30px}
.cap{font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#6f6f6f;margin:8px 0 22px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.grid.big{grid-template-columns:repeat(2,1fr);gap:12px}
`

function sheet(p) {
  const incl = [...p.tags.map((t) => t), ...[]]
  const heroH = p.plan || p.gallery.length ? 330 : 400
  const facts = `<div><small>Size</small><b>${p.size} m\u00b2</b></div><div><small>From</small><b>${esc(p.price)}</b></div><div><small>VAT</small><b>Excluded</b></div><div><small>Delivery</small><b>Within 100 km</b></div>`
  const checks = p.checks.length ? p.checks : []
  const svc = p.services.map((s) => `<li>${esc(s.name)} <span>${esc(s.price)}</span></li>`).join('')
  const header = '<div class="top"><img src="' + fileUrl('images/shared/asad-projects-logo-v4.png') + '" alt="ASAD Projects"><span>Pod spec sheet</span></div>'
  const foot = '<div class="foot"><div><b>Bring this pod home.</b></div><div>083 371 5807 \u00b7 info@asad.co.za<br>www.asad.co.za \u00b7 Unit 13, Turbo Park, Paul Smith Rd, Anderbolt, Boksburg</div></div>'
  let page1 = `<div class="page">${header}${photo(p.hero.src, p.hero.alt, heroH)}<div class="body">
    <p class="cat">${esc(p.cat)}</p><h1>${esc(p.title)}</h1><p class="lead">${esc(p.lead)}</p>
    <div class="facts">${facts}</div>
    <div class="cols"><div><h2>Included</h2>${p.tags.length ? '<div class="chips">' + p.tags.map((t) => `<span>${esc(t)}</span>`).join('') + '</div>' : ''}<ul>${checks.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>
    <div><h2>Optional extras</h2><ul>${svc}</ul></div></div>
    <p class="note">${esc(p.note)} Solar, a septic tank, a back-up water system, a hot tub, a fireplace and aircon can also be added. Prices and details as on asad.co.za/asad-pods/${p.slug}.</p>
  </div>${foot}</div>`
  let page2 = ''
  if (p.plan || p.gallery.length) {
    page2 = `<div class="page p2">${header}<div class="body">
      ${p.plan ? `<h2>${esc(p.plan.cap || 'Floor plan')}</h2>${photo(p.plan.src, p.plan.alt, p.gallery.length ? 470 : 760, 'light')}<p class="cap">Concept layout. Custom design and sizes available.</p>` : ''}
      ${p.gallery.length ? `<h2>Gallery</h2><div class="grid${p.plan ? '' : ' big'}">${p.gallery.map((g) => photo(g.src, g.alt, p.plan ? 170 : 300)).join('')}</div>` : ''}
    </div>${foot}</div>`
  }
  const title = `${p.title} spec sheet | ASAD Living Pods`
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>${css}</style></head><body>${page1}${page2}</body></html>`
}

const only = process.argv[2]
const outDir = path.join(ROOT, 'public', 'brochures')
fs.mkdirSync(outDir, { recursive: true })
for (const slug of PODS) {
  if (only && only !== slug) continue
  const p = parse(slug)
  const htmlFile = path.join(OUT_HTML, slug + '.html')
  fs.writeFileSync(htmlFile, sheet(p))
  const name = `asad-${slugify(p.title)}-spec-sheet.pdf`
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=20000', `--print-to-pdf=${path.join(outDir, name)}`, 'file:///' + htmlFile.replace(/\\/g, '/')], { stdio: 'ignore', timeout: 90000 })
  console.log(slug, '->', name, (fs.statSync(path.join(outDir, name)).size / 1024).toFixed(0) + ' KB', '| hero', p.hero.src, '| plan', p.plan ? p.plan.src : '-', '| gallery', p.gallery.length)
}
