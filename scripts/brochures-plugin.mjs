// Vite plugin: turns site-data/brochures.mjs into plain HTML cards inside brochures.html
// (at build time and in the dev server), so search engines see real text, not JavaScript.
import { BROCHURES } from '../site-data/brochures.mjs'

const SITE = 'https://asad.co.za'
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function brochureCards() {
  return BROCHURES.map((b) => {
    const url = `${SITE}/brochures/${b.file}`
    const related = b.page ? `\n            <a class="brochure-related" href="${esc(b.page)}">${esc(b.pageLabel || 'Related page')} &rarr;</a>` : ''
    return `          <article class="brochure-card">
            <div class="brochure-img"><img width="${b.w}" height="${b.h}" src="${esc(b.image)}" alt="${esc(b.alt)}" loading="lazy"></div>
            <div class="brochure-body">
              <h2>${esc(b.title)}</h2>
              <p>${esc(b.desc)}</p>${related}
              <div class="brochure-actions">
                <a class="btn btn-solid" href="/brochures/${esc(b.file)}" target="_blank" rel="noopener" aria-label="View ${esc(b.title)} as a PDF">View PDF</a>
              </div>
            </div>
          </article>`
  }).join('\n')
}

export function brochureJsonLd() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ASAD Living Pods brochures',
    url: `${SITE}/brochures`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: BROCHURES.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.title,
        url: `${SITE}/brochures/${b.file}`,
      })),
    },
  })
}

export default function brochuresPlugin() {
  return {
    name: 'asad-brochures',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (!ctx.filename || !/brochures\.html$/.test(ctx.filename)) return html
        return html
          .replace('<!--BROCHURE_CARDS-->', brochureCards())
          .replace('<!--BROCHURE_JSONLD-->', `<script type="application/ld+json">${brochureJsonLd()}</script>`)
      },
    },
  }
}
