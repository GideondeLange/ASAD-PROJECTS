// Generates the HTML pages from scripts/site/pods.mjs.
//   npm run pages
// Writes: index, asad-pods, finishes, gallery, contact, asad-pods/<slug>,
// and re-skins the blog pages' navigation and footer.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { PODS, CATEGORIES, SPEC, ADDONS, INCLUDED, EXCLUDED, fmtPrice } from './pods.mjs';
import { SITE, esc, head, nav, footer, ctaBand } from './layout.mjs';
import { SERVICES, BUILD_OUT } from './services.mjs';
import { GALLERY, GALLERY_CATS } from './gallery.mjs';

const webImg = (name) => (name.startsWith('/') ? name : `/images/web/${name}.jpg`);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const write = (rel, html) => {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  console.log('wrote', rel);
};

const dimsCache = {};
async function dims(webPath) {
  if (!dimsCache[webPath]) {
    const m = await sharp(path.join(root, 'public', webPath)).metadata();
    dimsCache[webPath] = `width="${m.width}" height="${m.height}"`;
  }
  return dimsCache[webPath];
}

const byCat = (cat) => PODS.filter((p) => p.category === cat);
const minSize = Math.min(...PODS.map((p) => p.size));
const maxSize = Math.max(...PODS.map((p) => p.size));
const minPrice = Math.min(...PODS.map((p) => p.price));

async function podCard(p, { feature = false, delay = 0 } = {}) {
  return `
          <a class="pod-card reveal${delay ? ' d' + delay : ''}${feature ? ' feature' : ''}" href="/asad-pods/${p.slug}" data-cat="${p.category}">
            <div class="media gray"><img ${await dims(p.image)} src="${p.image}" alt="${esc(p.alt)}" loading="lazy"></div>
            <div class="pod-card-meta">
              <div>
                <span class="cat">${esc(CATEGORIES[p.category].label)}</span>
                <h3>${esc(p.name)}</h3>
              </div>
              <span class="size">${p.size}<small>M²</small></span>
            </div>
            <div class="price"><span>From</span><b>${fmtPrice(p.price)} <small>excl. VAT</small></b></div>
          </a>`;
}

/* ───────────────────────────── HOME ───────────────────────────── */
async function home() {
  const featured = ['2-bedroom', '1-bedroom-living-unit', 'pod-5', 'pod-4', 'pod-6', 'entertainment-pod'].map((s) => PODS.find((p) => p.slug === s));
  const cards = (await Promise.all(featured.map((p, i) => podCard(p, { delay: i % 3 })))).join('');
  const schema = [{
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    name: 'ASAD Living Pods by Asad Projects',
    url: SITE.url,
    logo: SITE.url + '/images/shared/asad-projects-logo-v4.png',
    image: SITE.url + '/images/chosen/asad-pod5.jpg',
    description: 'Bespoke compact accommodation built in steel and timber: family homes, off-grid cabins, guest suites, backyard and commercial pods across South Africa.',
    address: { '@type': 'PostalAddress', streetAddress: 'Unit 13, Turbo Park, Paul Smith Rd, Anderbolt', addressLocality: 'Boksburg', addressRegion: 'Gauteng', addressCountry: 'ZA' },
    telephone: SITE.tel,
    email: SITE.email,
    areaServed: { '@type': 'Country', name: 'South Africa' },
    sameAs: [SITE.facebook],
    openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '07:30' },
  }];
  const html = head({
    title: 'ASAD Living Pods | Bespoke Steel & Timber Pods in South Africa',
    desc: 'Bespoke compact accommodation built in steel and timber. Family homes, off-grid cabins, guest suites, backyard and commercial pods from 4 m² to 100 m², from R45 000. Boksburg, Gauteng.',
    path: '/', schema,
  }) + nav('') + `
  <main id="main">

    <section class="hero">
      <div class="hero-bg"><img src="/images/web/home-hero.jpg" width="960" height="1280" alt="ASAD A-frame pod on a steel base in the bush" style="object-position:50% 38%" fetchpriority="high"></div>
      <div class="hero-content">
        <span class="eyebrow">Residential · Commercial · Off-grid</span>
        <h1>Compact living, <em>built to last.</em></h1>
        <p class="lead">Bespoke compact accommodation, built in steel and timber.</p>
        <div class="btn-row">
          <a href="/asad-pods" class="btn btn-solid">Explore the pods</a>
          <a href="/contact" class="btn">Request a quote</a>
        </div>
      </div>
      <div class="hero-foot"><div class="container"><span>${PODS.length} designs · ${minSize}–${maxSize} m²</span><span>Boksburg · South Africa</span></div></div>
    </section>

    <section class="section section-light on-light">
      <div class="container two-col">
        <div>
          <span class="eyebrow">About us</span>
          <h2 class="statement reveal">Built to last.<br><em>Made to fit.</em></h2>
        </div>
        <div class="copy reveal d1">
          <p class="lead">ASAD Projects specialises in crafting bespoke, compact accommodation units tailored to each client’s unique design.</p>
          <p>Combining durability with aesthetic appeal, our structures offer exceptional value — ideal for off-grid retreats and investment properties with attractive returns.</p>
          <a class="link-arrow" href="/contact">Start your project</a>
        </div>
      </div>
    </section>

    <section class="section section-light on-light" style="padding-top:0">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">The pods</span><h2 class="reveal">Every pod, <em>one standard.</em></h2></div>
          <a class="link-arrow" href="/asad-pods">View all ${PODS.length} pods</a>
        </div>
        <div class="pod-grid">${cards}
        </div>
      </div>
    </section>

    <section class="section section-dark">
      <div class="container">
        <div class="stats">
          <div class="stat reveal"><div class="num">${PODS.length}</div><div class="label">Pod designs, each adaptable</div></div>
          <div class="stat reveal d1"><div class="num">${minSize}–${maxSize}<small>m²</small></div><div class="label">From a guard house to a family home</div></div>
          <div class="stat reveal d2"><div class="num">100<small>km</small></div><div class="label">Delivery &amp; installation included from Boksburg</div></div>
          <div class="stat reveal d3"><div class="num"><small>from</small> R${Math.round(minPrice / 1000)}k</div><div class="label">Excl. VAT, quoted per pod</div></div>
        </div>
      </div>
    </section>

    <section class="section section-dark" style="padding-top:0">
      <div class="container two-col">
        <div class="media tall gray reveal"><img src="/images/web/asad-pod6.jpg" width="1600" height="1600" alt="Timber-lined pod interior with steel-framed glazing" loading="lazy"></div>
        <div class="copy">
          <span class="eyebrow">Key features</span>
          <h2 class="reveal">Steel bones. <em>Timber warmth.</em></h2>
          <ul class="feature-list" style="margin-top:2.6rem">
            <li class="reveal"><span>01</span>Robust steel structure engineered for longevity</li>
            <li class="reveal"><span>02</span>Real timber cladding &amp; floors for warm, natural interiors</li>
            <li class="reveal"><span>03</span>Custom kitchen &amp; bathrooms to client specification</li>
            <li class="reveal"><span>04</span>Compact footprint from ${minSize} m² to ${maxSize} m², fully adaptable</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section section-light on-light">
      <div class="container">
        <span class="eyebrow">Benefits</span>
        <h2 class="reveal" style="margin-bottom:3.5rem;max-width:18ch">Designed around <em>you.</em></h2>
        <div class="benefits">
          <div class="benefit reveal"><span class="n">01</span><h3>Tailored designs reflecting client preferences</h3></div>
          <div class="benefit reveal d1"><span class="n">02</span><h3>Attractive investment returns through strategic placement</h3></div>
          <div class="benefit reveal d2"><span class="n">03</span><h3>Eco-friendly options with full solar integration</h3></div>
          <div class="benefit reveal d3"><span class="n">04</span><h3>Rapid deployment for swift, on-site establishment</h3></div>
        </div>
      </div>
    </section>

    <section class="section section-dark">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">Services</span><h2 class="reveal">More than a pod. <em>One team.</em></h2></div>
          <a class="link-arrow" href="/services">All services</a>
        </div>
        <ul class="svc-list">
${SERVICES.map((s) => `          <li class="reveal"><a href="/services#${s.slug}"><span class="n">${s.n}</span><span class="t">${esc(s.name)}</span><span class="d">${esc(s.short)}</span></a></li>`).join('\n')}
        </ul>
      </div>
    </section>

    <section class="section section-light on-light">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">Gallery</span><h2 class="reveal">Built, <em>not rendered.</em></h2></div>
          <a class="link-arrow" href="/gallery">View the gallery</a>
        </div>
        <div class="mini-grid">
${[6, 7, 8, 9, 15].map((n) => `          <a class="media" href="/gallery#interior"><img src="/images/web/asad-pod${n}.jpg" width="1600" height="1600" alt="ASAD pod interior" loading="lazy"></a>`).join('\n')}
        </div>
      </div>
    </section>
${ctaBand(PODS)}
  </main>
` + footer(PODS);
  write('index.html', html);
}

/* ───────────────────────────── PODS INDEX ───────────────────────────── */
async function podsIndex() {
  const cards = (await Promise.all(PODS.map((p, i) => podCard(p, { delay: i % 3 })))).join('');
  const schema = [{
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ASAD Living Pods',
    itemListElement: PODS.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE.url}/asad-pods/${p.slug}`, name: p.name })),
  }];
  const html = head({
    title: 'Pods & Pricing | ASAD Living Pods',
    desc: `All ${PODS.length} ASAD living pods with sizes and prices: family homes, off-grid cabins, guest suites, backyard and commercial pods from ${fmtPrice(minPrice)} excl. VAT.`,
    path: '/asad-pods', schema,
  }) + nav('pods') + `
  <main id="main">
    <header class="page-head has-img">
      <div class="head-bg"><img src="/images/web/asad-pod1.jpg" width="1600" height="1600" alt="" fetchpriority="high"></div>
      <div class="container">
        <p class="breadcrumb"><a href="/">Home</a><span>/</span>Pods</p>
        <h1>The <em>pods.</em></h1>
        <p class="lead">${PODS.length} designs, from a ${minSize} m² guard house to a ${maxSize} m² family home. Every pod is built in steel and timber and tailored to your site.</p>
      </div>
    </header>

    <section class="section-tight section-light on-light" style="padding-top:clamp(3rem,6vw,5rem)">
      <div class="container">
        <div class="filter-bar" id="pod-filter" data-target="#pod-list" role="group" aria-label="Filter pods">
          <button type="button" class="active" data-cat="all">All</button>
${Object.entries(CATEGORIES).map(([k, c]) => `          <button type="button" data-cat="${k}">${esc(c.label)}</button>`).join('\n')}
        </div>
        <div class="pod-grid" id="pod-list">${cards}
        </div>
        <p class="note">All prices exclude VAT, connection to mains, COC certificates, plan approval from municipalities, transport and installation. See <a href="/finishes" style="border-bottom:1px solid currentColor">Finishes &amp; Options</a> for what is included. Renders are for illustration purposes only; actual designs are available on quotation.</p>
      </div>
    </section>

${ctaBand(PODS)}
  </main>
` + footer(PODS);
  write('asad-pods.html', html);
}

/* ───────────────────────────── POD PAGE ───────────────────────────── */
async function podPage(p, i) {
  const prev = PODS[(i - 1 + PODS.length) % PODS.length];
  const next = PODS[(i + 1) % PODS.length];
  const url = `${SITE.url}/asad-pods/${p.slug}`;
  const schema = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url + '/' },
      { '@type': 'ListItem', position: 2, name: 'Pods', item: SITE.url + '/asad-pods' },
      { '@type': 'ListItem', position: 3, name: p.name, item: url },
    ] },
    { '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.summary,
      image: SITE.url + p.image, brand: { '@type': 'Brand', name: 'ASAD Living Pods' },
      offers: { '@type': 'Offer', priceCurrency: 'ZAR', price: String(p.price), availability: 'https://schema.org/InStock', url } },
  ];
  const facts = (p.facts || []).map((f) => `<li>${esc(f)}</li>`).join('');
  const specList = (p.spec || []).map((s) => `<li>${esc(s)}</li>`).join('');
  const overview = `
          <div class="copy">
            <span class="eyebrow">Overview</span>
            <h2 class="reveal" style="font-size:clamp(1.9rem,3.4vw,2.9rem)">${esc(p.summary)}</h2>
${p.tags.length ? `            <div class="tags" style="margin-top:2.2rem">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
${facts || specList ? `            <ul class="check-list" style="margin-top:1.6rem">${facts}${specList}</ul>` : ''}
${p.note ? `            <p class="note">${esc(p.note)}</p>` : ''}
            <p class="note">See <a href="/finishes" style="border-bottom:1px solid currentColor">Included &amp; Excluded</a>. All prices exclude VAT, connection to mains, COC certificates, plan approval from municipalities, transport and installation. T’s &amp; C’s apply.</p>
          </div>`;
  const extra = p.gallery && p.gallery.length ? p.gallery[0] : null;
  const side = p.plan
    ? `<div class="reveal"><div class="plan-box"><img ${await dims(p.plan)} src="${p.plan}" alt="${esc(p.name)} floor plan, ${p.size} m²" loading="lazy"></div><p class="plan-cap">Floor plan · ${p.size} m²</p></div>`
    : extra
      ? `<div class="media tall reveal"><img ${await dims('/images/pods/' + extra + '.jpg')} src="/images/pods/${extra}.jpg" alt="${esc(p.name)} — alternative view" loading="lazy"></div>`
      : '';

  const html = head({
    title: `${p.name} — ${p.size} m² from ${fmtPrice(p.price)} | ASAD Living Pods`,
    desc: `${p.summary} ${p.size} m², from ${fmtPrice(p.price)} excl. VAT. Built in steel and timber by Asad Projects, Boksburg.`,
    path: `/asad-pods/${p.slug}`, image: p.image, schema, type: 'product',
  }) + nav('pods') + `
  <main id="main">
    <header class="pod-hero">
      <div class="pod-hero-copy">
        <p class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/asad-pods">Pods</a><span>/</span>${esc(p.name)}</p>
        <span class="eyebrow">${esc(p.label)}</span>
        <h1>${esc(p.name)}</h1>
        <div class="spec-strip">
          <div><span class="k">Size</span><span class="v">${p.size}<small>m²</small></span></div>
          <div><span class="k">From</span><span class="v">${fmtPrice(p.price)}</span></div>
          <div><span class="k">VAT</span><span class="v" style="font-size:1.2rem;line-height:1.4">Excluded</span></div>
        </div>
        <div class="btn-row" style="margin-top:2.4rem">
          <a href="/contact?pod=${p.slug}" class="btn btn-solid" data-enquire="${esc(p.name)}">Enquire about this pod</a>
          <a href="${SITE.whatsapp}" class="btn" target="_blank" rel="noopener" data-wa>WhatsApp</a>
        </div>
      </div>
      <div class="pod-hero-media"><img ${await dims(p.image)} src="${p.image}" alt="${esc(p.alt)}" fetchpriority="high"></div>
    </header>

    <section class="section section-light on-light">
      <div class="container two-col top">
${overview}
${side}
      </div>
    </section>
    <section class="section section-dark">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">Services</span><h2 class="reveal">Build it <em>out.</em></h2></div>
          <a class="link-arrow" href="/services">All services</a>
        </div>
        <div class="benefits">
${BUILD_OUT.map((b, n) => `          <a class="benefit reveal${n ? ' d' + n : ''}" href="/services#${b.service}"><span class="n">0${n + 1}</span><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p><span class="pr">${esc(b.price)}</span></a>`).join('\n')}
        </div>
        <p class="note">Solar, a septic tank, a back-up water system, a hot tub, a fireplace and aircon can also be added to any pod. <a href="/finishes" style="border-bottom:1px solid currentColor">See all add-ons and prices</a>.</p>
      </div>
    </section>
${ctaBand(PODS, { title: `Interested in the <em>${esc(p.name)}?</em>` })}
    <nav class="pod-nav" aria-label="More pods">
      <a href="/asad-pods/${prev.slug}"><span class="k">← Previous</span><span class="v">${esc(prev.name)}</span></a>
      <a href="/asad-pods/${next.slug}"><span class="k">Next →</span><span class="v">${esc(next.name)}</span></a>
    </nav>
  </main>
` + footer(PODS);
  write(`asad-pods/${p.slug}.html`, html);
}

/* ───────────────────────────── FINISHES ───────────────────────────── */
async function finishes() {
  const interiors = Array.from({ length: 15 }, (_, i) => i + 1);
  const html = head({
    title: 'Finishes, Inclusions & Options | ASAD Living Pods',
    desc: 'Interior finishes, what is included and excluded in every ASAD pod quotation, and optional add-ons such as solar, decking, pergolas, hot tubs and fireplaces.',
    path: '/finishes', image: '/images/pods/interior-1.jpg',
  }) + nav('finishes') + `
  <main id="main">
    <header class="page-head">
      <div class="container">
        <p class="breadcrumb"><a href="/">Home</a><span>/</span>Finishes &amp; Options</p>
        <h1>Finishes &amp; <em>options.</em></h1>
        <p class="lead">Finishes and colours are your choice and confirmed on quotation. Everything below can be added to any pod.</p>
      </div>
    </header>

    <section class="section section-light on-light">
      <div class="container two-col top">
        <div><span class="eyebrow">Interior options</span><h2 class="reveal">Your pod, <em>finished your way.</em></h2></div>
        <ul class="feature-list">
          <li class="reveal"><span>01</span><div><strong style="font-weight:400">Kitchenette</strong><br>All units include a prep bowl &amp; 2-burner gas stove (bottle not incl.). Custom-designed cabinetry to your requirement. Additional island — optional extra.</div></li>
          <li class="reveal"><span>02</span><div><strong style="font-weight:400">Bathrooms</strong><br>Top-flush toilet, floating vanity with top-mount basin, corner shower unit and PVC wall tiling. Custom bathroom designs — optional extra.</div></li>
          <li class="reveal"><span>03</span><div><strong style="font-weight:400">Wall &amp; ceiling cladding</strong><br>CCA-treated pine tongue &amp; groove · Drywall · Ply board · Insulated cement panels.</div></li>
          <li class="reveal"><span>04</span><div><strong style="font-weight:400">Interior design (optional extra)</strong><br>Fully furnished · Wallpaper and slat paneling.</div></li>
        </ul>
      </div>
    </section>

    <section class="section section-dark">
      <div class="container">
        <div class="section-head"><div><span class="eyebrow">Interior gallery</span><h2 class="reveal">Living area, kitchenette, <em>bathroom, bedrooms.</em></h2></div></div>
        <div class="mini-grid">
${(await Promise.all(interiors.map(async (n) => `          <div class="media lb-trigger" style="cursor:zoom-in"><img ${await dims('/images/pods/interior-' + n + '.jpg')} src="/images/pods/interior-${n}.jpg" alt="Finished ASAD pod interior ${n}" loading="lazy"></div>`))).join('\n')}
        </div>
        <p class="note">Photos show finished units, with aluminium-framed glazing. Finishes and colours are your choice and confirmed on quotation.</p>
      </div>
    </section>

    <section class="section section-light on-light">
      <div class="container">
        <span class="eyebrow">Your quotation</span>
        <h2 class="reveal" style="margin-bottom:3.5rem">Included &amp; <em>excluded.</em></h2>
        <div class="two-col top">
          <div><h3 style="margin-bottom:1.4rem">Included</h3><ul class="check-list">${INCLUDED.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>
          <div><h3 style="margin-bottom:1.4rem">Excluded</h3><ul class="check-list">${EXCLUDED.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>
        </div>
        <p class="note">Actual designs and final specifications are confirmed on quotation.</p>
      </div>
    </section>

    <section class="section section-dark">
      <div class="container two-col top">
        <div><span class="eyebrow">Personalise</span><h2 class="reveal">Optional <em>add-ons.</em></h2><p class="lead" style="margin-top:1.5rem">Everything below can be added to any pod. Prices exclude VAT.</p></div>
        <ul class="price-table">${ADDONS.map(([n, pr]) => `<li class="reveal"><span>${esc(n)}</span><span>${esc(pr)}</span></li>`).join('')}</ul>
      </div>
    </section>
${ctaBand(PODS)}
  </main>
` + footer(PODS);
  write('finishes.html', html);
}

/* ───────────────────────────── SERVICES ───────────────────────────── */
async function services() {
  const sections = [];
  for (const [i, s] of SERVICES.entries()) {
    const light = i % 2 === 0;
    const imgs = (await Promise.all(s.images.map(async (n, k) => `            <div class="media lb-trigger"><img ${await dims(webImg(n))} src="${webImg(n)}" alt="${esc(s.name)} — project ${k + 1}" loading="lazy"></div>`))).join('\n');
    sections.push(`
    <section class="section ${light ? 'section-light on-light' : 'section-dark'}" id="${s.slug}">
      <div class="container two-col top${light ? '' : ' flip'}">
        <div class="copy">
          <span class="eyebrow">Service ${s.n}</span>
          <h2 class="reveal">${esc(s.name)}</h2>
          <p class="lead" style="margin-top:1.6rem">${esc(s.copy[0])}</p>
          <p>${esc(s.copy[1])}</p>
          <span class="eyebrow plain" style="margin:2.4rem 0 0.6rem">With your pod</span>
          <ul class="check-list">${s.tie.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          <div class="btn-row" style="margin-top:2.4rem">
            <a href="/contact?service=${s.slug}" class="btn btn-solid">Get a quote</a>
            ${s.link ? `<a href="${s.link[0]}" class="btn">${esc(s.link[1])}</a>` : '<a href="/gallery#' + (({ 'bespoke-steelwork': 'steelwork', 'custom-glazed-steelwork': 'glazing', 'construction-renovation': 'construction', 'carpentry-kitchens': 'carpentry', 'pergolas-decking': 'decking' })[s.slug] || 'pods') + '" class="btn">See it in the gallery</a>'}
          </div>
        </div>
        <div class="svc-grid reveal d1">
${imgs}
        </div>
      </div>
    </section>`);
  }
  const html = head({
    title: 'Services | Pods, Steelwork, Glazing, Carpentry, Decking | ASAD Living Pods',
    desc: 'Everything that goes into an ASAD pod, and available with it: bespoke steelwork, custom glazed steelwork, construction & renovation, carpentry & kitchens, pergolas & decking.',
    path: '/services', image: '/images/web/asad-pod3.jpg',
  }) + nav('services') + `
  <main id="main">
    <header class="page-head">
      <div class="container">
        <p class="breadcrumb"><a href="/">Home</a><span>/</span>Services</p>
        <h1>One team. <em>Every trade.</em></h1>
        <p class="lead">Steel, glass, timber and concrete under one roof. Every service below goes into a pod, and every one can be added to the pod you choose.</p>
        <ul class="svc-jump">
${SERVICES.map((s) => `          <li><a href="#${s.slug}"><span>${s.n}</span>${esc(s.name)}</a></li>`).join('\n')}
        </ul>
      </div>
    </header>
${sections.join('\n')}
${ctaBand(PODS)}
  </main>
` + footer(PODS);
  write('services.html', html);
}

/* ───────────────────────────── GALLERY ───────────────────────────── */
async function gallery() {
  const sections = [];
  let counter = 0;
  for (const [key, label] of GALLERY_CATS) {
    const inCat = GALLERY.filter((g) => g.cat === key);
    const items = [];
    for (const g of inCat) {
      const src = webImg(g.file);
      items.push(`            <div class="masonry-item"><img ${await dims(src)} src="${src}" alt="${esc(g.alt)} ${++counter}" loading="lazy"></div>`);
    }
    sections.push(`
        <section class="gallery-section" id="${key}">
          <div class="gallery-section-head"><h2>${esc(label)}</h2><span>${inCat.length} photos</span></div>
          <div class="masonry-grid">
${items.join('\n')}
          </div>
        </section>`);
  }
  const html = head({
    title: 'Gallery | ASAD Living Pods',
    desc: 'Photos of ASAD pods and our work: pod exteriors and interiors, decking and pergolas, steelwork, glazing, carpentry and kitchens, and construction.',
    path: '/gallery',
  }) + nav('gallery') + `
  <main id="main">
    <header class="page-head">
      <div class="container">
        <p class="breadcrumb"><a href="/">Home</a><span>/</span>Gallery</p>
        <h1>Built, <em>not rendered.</em></h1>
        <p class="lead">Real pods on real sites, and the work that goes into them. Choose a section, then tap an image to enlarge.</p>
      </div>
    </header>
    <section class="section-tight section-dark" style="padding-bottom:clamp(4rem,8vw,7rem)">
      <div class="container">
        <nav class="filter-bar jump" aria-label="Gallery sections">
${GALLERY_CATS.map(([k, label]) => `          <a href="#${k}">${esc(label)}</a>`).join('\n')}
        </nav>
${sections.join('\n')}
      </div>
    </section>
${ctaBand(PODS)}
  </main>
` + footer(PODS);
  write('gallery.html', html);
}

/* ───────────────────────────── CONTACT ───────────────────────────── */
async function contact() {
  const html = head({
    title: 'Contact & Get a Quote | ASAD Living Pods',
    desc: 'Request a quote for your ASAD living pod. Call 083 371 5807, WhatsApp or send an enquiry. Unit 13, Turbo Park, Anderbolt, Boksburg.',
    path: '/contact',
  }) + nav('contact') + `
  <main id="main">
    <header class="page-head">
      <div class="container">
        <p class="breadcrumb"><a href="/">Home</a><span>/</span>Contact</p>
        <h1>Let’s build <em>yours.</em></h1>
        <p class="lead">Tell us about your site and what you need the space to do. We typically respond within one business day.</p>
      </div>
    </header>

    <section class="section section-light on-light">
      <div class="container contact-grid">
        <div>
          <form id="contact-form" action="contact.php" method="POST">
            <div class="field"><label for="name">Your name</label><input type="text" id="name" name="name" autocomplete="name" required></div>
            <div class="field"><label for="email">Email address</label><input type="email" id="email" name="email" autocomplete="email" required></div>
            <div class="field"><label for="phone">Phone number (optional)</label><input type="tel" id="phone" name="phone" autocomplete="tel"></div>
            <div class="field"><label for="service">Pod or service of interest</label><input type="text" id="service" name="service" list="pod-options" placeholder="e.g. 2 Bedroom Pod, Decking"></div>
            <datalist id="pod-options">
${[...PODS.map((p) => [p.name, p.slug]), ...SERVICES.map((s) => [s.name, s.slug])].map(([n, s]) => `              <option value="${esc(n)}" data-slug="${s}"></option>`).join('\n')}
            </datalist>
            <div class="field"><label for="message">Your message</label><textarea id="message" name="message" required></textarea></div>
            <input type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;">
            <button type="submit" class="btn btn-solid">Send message</button>
            <p class="form-error" id="form-error" role="alert" hidden>Something went wrong. Please try again, or WhatsApp us instead.</p>
            <p class="form-note">We typically respond within 1 business day.</p>
          </form>
          <div class="form-success" id="form-success" hidden>
            <h3>Thank you for your enquiry.</h3>
            <p>Your message has been sent. We’ll get back to you within 1 business day.</p>
          </div>
        </div>

        <aside class="contact-details">
          <h2>Contact <em>details</em></h2>
          <div class="cd-item"><span class="k">Showroom &amp; workshop</span><p>${SITE.address[0]},<br>${SITE.address[1]}</p></div>
          <div class="cd-item"><span class="k">Hours</span><p>Mon–Fri: 7:30am onwards</p></div>
          <div class="cd-item"><span class="k">Phone &amp; WhatsApp</span><p>Edward: <a href="tel:${SITE.tel}">${SITE.phone}</a> · <a href="${SITE.whatsapp}" target="_blank" rel="noopener" data-wa>WhatsApp</a></p></div>
          <div class="cd-item"><span class="k">Email</span><p><a href="mailto:${SITE.email}">${SITE.email}</a></p></div>
          <div class="cd-item"><span class="k">Facebook</span><p><a href="${SITE.facebook}" target="_blank" rel="noopener">facebook.com/asadprojects</a></p></div>
        </aside>
      </div>
    </section>
  </main>
` + footer(PODS);
  write('contact.html', html);
}

/* ───────────────────────────── BLOG RE-SKIN ───────────────────────────── */
function reskinBlog() {
  const dir = path.join(root, 'blog');
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.html'))) {
    const file = path.join(dir, f);
    let html = fs.readFileSync(file, 'utf8');
    html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^>]*>/, '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">');
    html = html.replace(/<link rel="stylesheet" href="[^"]*css\/style\.css">/, '<link rel="stylesheet" href="/css/style.css">');
    html = html.replace(/<script type="module" src="[^"]*main\.js"><\/script>/, '<script type="module" src="/js/main.js"></script>');
    html = html.replace(/<meta name="theme-color" content="[^"]*">/, '<meta name="theme-color" content="#0b0b0b">');
    const start = html.indexOf('<nav id="navbar"') >= 0 ? html.indexOf('<nav id="navbar"') : html.indexOf('<header id="navbar"');
    const main = html.indexOf('<main>');
    if (start > 0 && main > start) html = html.slice(0, start) + nav('journal').trimStart() + '\n  ' + html.slice(main);
    // the footer runs to the end of the file (scripts, </body>, </html>), and footer() supplies all of it
    const footerStart = html.indexOf('<footer');
    if (footerStart > 0) html = html.slice(0, footerStart) + footer(PODS).trimStart();
    fs.writeFileSync(file, html);
    console.log('re-skinned blog/' + f);
  }
}

/* ───────────────────────────── SITEMAP ───────────────────────────── */
function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const blog = fs.readdirSync(path.join(root, 'blog')).filter((n) => n.endsWith('.html') && n !== 'index.html').map((n) => n.replace('.html', ''));
  const urls = [
    ['/', 'weekly', '1.0'], ['/asad-pods', 'weekly', '0.9'],
    ...PODS.map((p) => [`/asad-pods/${p.slug}`, 'monthly', '0.8']),
    ['/services', 'monthly', '0.8'], ['/finishes', 'monthly', '0.7'], ['/gallery', 'weekly', '0.7'], ['/contact', 'monthly', '0.6'], ['/blog/', 'weekly', '0.8'],
    ...blog.map((b) => [`/blog/${b}`, 'monthly', '0.7']),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(([u, f, p]) => `  <url><loc>${SITE.url}${u}</loc><lastmod>${today}</lastmod><changefreq>${f}</changefreq><priority>${p}</priority></url>`).join('\n') + '\n</urlset>\n';
  write('public/sitemap.xml', xml);
}

await home();
await podsIndex();
for (let i = 0; i < PODS.length; i++) await podPage(PODS[i], i);
await services();
await finishes();
await gallery();
await contact();
reskinBlog();
sitemap();
