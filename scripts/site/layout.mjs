// Shared page furniture: <head>, navigation, footer. Used by build.mjs.

export const SITE = {
  name: 'ASAD Living Pods',
  url: 'https://asad.co.za',
  phone: '083 371 5807',
  tel: '+27833715807',
  email: 'info@asad.co.za',
  address: ['Unit 13, Turbo Park, Paul Smith Rd', 'Anderbolt, Boksburg, Gauteng'],
  reg: 'Reg No. 2018/589606/07',
  whatsapp: 'https://wa.me/+27833715807',
  facebook: 'https://www.facebook.com/asadprojects',
};

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const FONTS = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap';

export function head({ title, desc, path, image = '/images/chosen/asad-pod5.jpg', schema = [], type = 'website' }) {
  const canonical = SITE.url + path;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-GEDC4PJXDX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-GEDC4PJXDX');
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#0b0b0b">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${SITE.url}${image}">
  <meta property="og:type" content="${type}">
  <link rel="canonical" href="${canonical}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${FONTS}" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
${schema.map((s) => `  <script type="application/ld+json">\n  ${JSON.stringify(s, null, 2).replace(/\n/g, '\n  ')}\n  </script>`).join('\n')}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
`;
}

const LINKS = [
  ['pods', '/asad-pods', 'Pods'],
  ['services', '/services', 'Services'],
  ['finishes', '/finishes', 'Finishes'],
  ['gallery', '/gallery', 'Gallery'],
  ['journal', '/blog/', 'Journal'],
];

export function nav(active = '') {
  const a = (k) => (k === active ? ' class="active" aria-current="page"' : '');
  return `
  <header id="navbar" class="site-nav">
    <div class="nav-inner">
      <a class="brand" href="/" aria-label="ASAD Living Pods — home">
        <span class="brand-mark">ASAD</span>
        <span class="brand-sub">Living Pods</span>
      </a>
      <nav aria-label="Main navigation">
        <ul class="nav-links">
${LINKS.map(([k, href, label]) => `          <li><a href="${href}"${a(k)}>${esc(label)}</a></li>`).join('\n')}
          <li><a href="/contact" class="nav-cta${active === 'contact' ? ' active' : ''}">Get a Quote</a></li>
        </ul>
      </nav>
      <button class="nav-toggle" id="nav-hamburger" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-mobile"><span></span><span></span></button>
    </div>
  </header>
  <div class="nav-mobile" id="nav-mobile">
    <a class="nm-link" href="/">Home</a>
${LINKS.map(([, href, label]) => `    <a class="nm-link" href="${href}">${esc(label)}</a>`).join('\n')}
    <a class="nm-link" href="/contact">Get a Quote</a>
    <div class="nm-meta">
      <a href="tel:${SITE.tel}">${SITE.phone}</a>
      <a href="mailto:${SITE.email}">${SITE.email}</a>
    </div>
  </div>
`;
}

export function footer(pods) {
  return `
  <footer class="site-footer" role="contentinfo">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="/" aria-label="ASAD Living Pods — home">
            <span class="brand-mark">ASAD</span>
            <span class="brand-sub">Living Pods</span>
          </a>
          <p>Bespoke compact accommodation, built in steel and timber.</p>
        </div>
        <div>
          <h4>Pods</h4>
          <ul>
${pods.slice(0, 6).map((p) => `            <li><a href="/asad-pods/${p.slug}">${esc(p.name)}</a></li>`).join('\n')}
            <li><a href="/asad-pods">All pods</a></li>
          </ul>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><a href="/services">Services</a></li>
            <li><a href="/finishes">Finishes &amp; Options</a></li>
            <li><a href="/gallery">Gallery</a></li>
            <li><a href="/blog/">Journal</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li>${SITE.address[0]},<br>${SITE.address[1]}</li>
            <li><a href="tel:${SITE.tel}">${SITE.phone}</a></li>
            <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
            <li><a href="${SITE.whatsapp}" target="_blank" rel="noopener" data-wa>WhatsApp</a> · <a href="${SITE.facebook}" target="_blank" rel="noopener">Facebook</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2026 Asad Projects · ${SITE.reg}</span>
        <span>Website by <a href="#">Celestial Visions</a></span>
      </div>
    </div>
  </footer>

  <script type="module" src="/js/main.js"></script>
</body>
</html>
`;
}

export function ctaBand(pods, { title = 'Let’s build <em>yours.</em>' } = {}) {
  return `
    <section class="section cta-band">
      <div class="container">
        <div>
          <span class="eyebrow">Get in touch</span>
          <h2 class="reveal">${title}</h2>
        </div>
        <div class="contact-lines reveal d1">
          <a href="/contact">Request a quote</a>
          <a href="tel:${SITE.tel}">${SITE.phone}</a>
          <a href="mailto:${SITE.email}">${SITE.email}</a>
          <a href="${SITE.whatsapp}" target="_blank" rel="noopener" data-wa>WhatsApp Edward</a>
        </div>
      </div>
    </section>
`;
}
