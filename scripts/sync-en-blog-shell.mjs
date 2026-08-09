/**
 * Iguala el shell del blog EN al ES (logo, hero deco, sidebar, filtros)
 * y regenera assets/tuko-nav-logo.png desde el logo base64 del ES.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landing = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const cmsRoot = path.resolve(
  landing,
  '../plugin-tuko-main/plugin-tuko-main/backend/src/services/blogCms'
);
const render = require(path.join(cmsRoot, 'render.js'));

const esPath = path.join(landing, 'blog/index.html');
const enPath = path.join(landing, 'en/blog/index.html');
const es = fs.readFileSync(esPath, 'utf8');
const en = fs.readFileSync(enPath, 'utf8');

const logoM = es.match(/<img src="(data:image\/png;base64,[^"]+)"[^>]*alt="tuko"/i)
  || es.match(/class="nav-logo">\s*<img src="(data:image\/png;base64,[^"]+)"/i);
if (!logoM) throw new Error('No base64 logo in ES blog');
const logoSrc = logoM[1];
const b64 = logoSrc.replace(/^data:image\/png;base64,/, '');
fs.writeFileSync(path.join(landing, 'assets/tuko-nav-logo.png'), Buffer.from(b64, 'base64'));
console.log('wrote assets/tuko-nav-logo.png', Buffer.from(b64, 'base64').length);

// Collect EN cards + count from current EN index
const cards = [...en.matchAll(/<article class="bp-card"[\s\S]*?<\/article>/gi)].map((m) => m[0]);
if (!cards.length) throw new Error('No EN cards found');

// Category counts from EN cards
function catOf(card) {
  const m = card.match(/data-cat="([^"]+)"/i);
  return m ? m[1] : 'novedades';
}
const cats = { todos: cards.length, eventos: 0, producto: 0, novedades: 0 };
for (const c of cards) {
  const cat = catOf(c);
  if (cats[cat] != null) cats[cat] += 1;
  else cats[cat] = 1;
}

const headEnd = en.indexOf('</head>');
const head = `<!DOCTYPE html>
<html lang="en" data-url-es="https://tukoteam.com/blog/" data-url-en="https://tukoteam.com/en/blog/">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Tuko Blog — Group buying for ecommerce</title>
<meta name="theme-color" content="#3D50F2">
<link rel="icon" href="/assets/favicon.png?v=5" sizes="32x32" type="image/png">
<link rel="icon" href="/assets/favicon.svg?v=5" type="image/svg+xml">
<meta name="description" content="Tuko blog: use cases, news and group buying strategies for Shopify stores.">
<link rel="canonical" href="https://tukoteam.com/en/blog/">
<link rel="alternate" hreflang="es" href="https://tukoteam.com/blog/">
<link rel="alternate" hreflang="en" href="https://tukoteam.com/en/blog/">
<link rel="alternate" hreflang="x-default" href="https://tukoteam.com/blog/">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:url" content="https://tukoteam.com/en/blog/">
<meta property="og:title" content="Tuko Blog — Group buying for ecommerce">
<meta property="og:description" content="Use cases, news and group buying strategies for Shopify stores.">
<meta property="og:image" content="https://tukoteam.com/assets/og-image.png">
<meta property="og:site_name" content="Tuko">
<meta property="og:locale" content="en_US">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://tukoteam.com/en/blog/#webpage",
  "url": "https://tukoteam.com/en/blog/",
  "name": "Tuko Blog",
  "description": "Use cases, news and group buying strategies for Shopify stores.",
  "inLanguage": "en",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Tuko",
    "url": "https://tukoteam.com/en/"
  }
}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Mona+Sans:ital,wdth,wght@0,75..125,200..900;1,75..125,200..900&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Mona+Sans:ital,wdth,wght@0,75..125,200..900;1,75..125,200..900&display=swap" rel="stylesheet"></noscript>
<link rel="stylesheet" href="/assets/css/main.css?v=20260731o">
<link rel="stylesheet" href="/assets/css/blog.css?v=20260809c">
<script src="/assets/js/ga4-loader.js" defer></script>
<script src="/assets/js/blog-analytics.js" defer></script>
</head>`;

const header = render.localizeShell
  ? null
  : null;

// Use render's localizeShell via bootstrap pieces — import properly
const { ARTICLE_HEADER, ARTICLE_FOOTER } = require(path.join(cmsRoot, 'shellFragments.js'));
// localizeShell is not exported — duplicate minimal absolute logo inject
function enShell(fragment) {
  // call through bootstrap by requiring render internals: re-read render and eval? 
  // Simpler: use render.bootstrapEnIndexHtml and then replace middle.
  return fragment; // placeholder
}

// Prefer exported localize via rendering a tiny bootstrap and slicing — use require cache hack
const localize = (() => {
  // Re-implement the same transforms used in render.js for EN
  let html = String(ARTICLE_HEADER || '');
  html = html
    .replace(/src="(?:\.\.\/)+assets\//g, 'src="/assets/')
    .replace(/href="(?:\.\.\/)+assets\//g, 'href="/assets/')
    .replace(/href="\.\.\/index\.html"/g, 'href="/en/"')
    .replace(/href="\.\.\/"/g, 'href="/en/"')
    .replace(/href="\.\.\/tuko-ai"/g, 'href="/en/tuko-ai"')
    .replace(/href="\.\.\/privacidad"/g, 'href="/en/privacidad"')
    .replace(/href="\.\.\/terminos"/g, 'href="/en/terminos"')
    .replace(/href="index"/g, 'href="/en/blog/"')
    .replace(/apps\.shopify\.com\/tuko\?locale=es/g, 'apps.shopify.com/tuko?locale=en')
    .replace(/aria-label="Navegación principal"/g, 'aria-label="Main navigation"')
    .replace(/aria-label="Abrir menú"/g, 'aria-label="Open menu"')
    .replace(/aria-label="Selector de idioma"/g, 'aria-label="Language selector"')
    .replace(/aria-label="Menú de navegación"/g, 'aria-label="Navigation menu"')
    .replace(/>Inicio</g, '>Home<')
    .replace(/>Descárgala en Shopify</g, '>Get it on Shopify<')
    .replace(/>Idioma</g, '>Language<')
    .replace(
      />Compras colectivas para tiendas Shopify\. Más ventas, menos dependencia de anuncios\.</g,
      '>Group buying for Shopify stores. More sales. Less ad dependency.<'
    )
    .replace(/>Contacto</g, '>Contact<')
    .replace(/>Legales</g, '>Legal<')
    .replace(/>Política de privacidad</g, '>Privacy policy<')
    .replace(/>Términos y condiciones</g, '>Terms and conditions<')
    .replace(
      />© 2026 Tuko\. Todos los derechos reservados\.</g,
      '>© 2026 Tuko. All rights reserved.<'
    )
    .replace(/data-active="es"/g, 'data-active="en"')
    .replace(/(<button type="button" class="lang-opt) active(" data-lang="es")/g, '$1$2')
    .replace(/(<button type="button" class="lang-opt)(" data-lang="en")/g, '$1 active$2');
  // Force correct logo (transparent wordmark from ES)
  html = html.replace(
    /<img src="[^"]*" alt="tuko"[^>]*>/i,
    `<img src="${logoSrc}" alt="tuko" width="120" height="40" decoding="async">`
  );
  return html;
})();

let footer = String(ARTICLE_FOOTER || '');
footer = footer
  .replace(/href="\.\.\/index\.html"/g, 'href="/en/"')
  .replace(/href="\.\.\/"/g, 'href="/en/"')
  .replace(/href="\.\.\/pages\/privacidad\.html"/g, 'href="/en/privacidad"')
  .replace(/href="\.\.\/privacidad"/g, 'href="/en/privacidad"')
  .replace(/href="\.\.\/pages\/terminos\.html"/g, 'href="/en/terminos"')
  .replace(/href="\.\.\/terminos"/g, 'href="/en/terminos"')
  .replace(
    />Compras colectivas para tiendas Shopify\. Más ventas, menos dependencia de anuncios\.</g,
    '>Group buying for Shopify stores. More sales. Less ad dependency.<'
  )
  .replace(/>Contacto</g, '>Contact<')
  .replace(/>Legales</g, '>Legal<')
  .replace(/>Política de privacidad</g, '>Privacy policy<')
  .replace(/>Términos y condiciones</g, '>Terms and conditions<')
  .replace(
    />© 2026 Tuko\. Todos los derechos reservados\.</g,
    '>© 2026 Tuko. All rights reserved.<'
  )
  .replace(/href="\.\.\/pages\//g, 'href="/en/');

const filterScript = es.match(/<script>\s*\/\* Blog: filtro[\s\S]*?<\/script>/);
if (!filterScript) throw new Error('filter script missing in ES');

const out = `${head}
<body>
${localize}
<main id="main-content">
<section class="blog-hero">
  <div class="blog-hero-content">
    <div class="bh-badge" data-i18n="blog_badge">Resources</div>
    <h1 data-i18n="blog_title">Blog</h1>
    <p data-i18n="blog_subtitle">Use cases, news and group buying strategies.</p>
  </div>
  <img class="bh-deco-right" src="/assets/images/Asset 08 (1).svg" alt="" aria-hidden="true" width="400" height="400" decoding="async">
</section>
<section class="blog-list-section">
  <div class="bp-layout">
    <aside class="bp-side">
      <div class="bp-side-inner">
        <h2 class="bp-side-title" data-i18n="blog_categories">Categories</h2>
        <ul class="bp-cats" id="bp-cats">
          <li><button type="button" class="bp-cat is-active" data-cat="todos">
            <span data-i18n="blog_cat_all">All articles</span>
            <span class="bp-cat-n">${cats.todos || cards.length}</span>
          </button></li>
          <li><button type="button" class="bp-cat" data-cat="eventos">
            <span data-i18n="blog_cat_eventos">Events</span>
            <span class="bp-cat-n">${cats.eventos || 0}</span>
          </button></li>
          <li><button type="button" class="bp-cat" data-cat="producto">
            <span data-i18n="blog_cat_producto">Product</span>
            <span class="bp-cat-n">${cats.producto || 0}</span>
          </button></li>
          <li><button type="button" class="bp-cat" data-cat="novedades">
            <span data-i18n="blog_cat_novedades">News</span>
            <span class="bp-cat-n">${cats.novedades || 0}</span>
          </button></li>
        </ul>
        <h2 class="bp-side-title bp-side-title--sort" data-i18n="blog_sort">Sort by</h2>
        <div class="bp-select-wrap">
          <select id="bp-sort" class="bp-select" aria-label="Sort articles">
            <option value="new" data-i18n="blog_sort_new">Newest first</option>
            <option value="old" data-i18n="blog_sort_old">Oldest first</option>
            <option value="short" data-i18n="blog_sort_short">Shortest read</option>
            <option value="az" data-i18n="blog_sort_az">Title A–Z</option>
          </select>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
    </aside>
    <div class="bp-main">
      <p class="bp-count"><span id="bp-count-n">${cards.length}</span> <span data-i18n="blog_count">articles</span></p>
      <div class="bp-grid" id="bp-grid">
${cards.join('\n')}
      </div>
      <p class="bp-empty" id="bp-empty" hidden data-i18n="blog_empty">No articles in this category yet.</p>
    </div>
  </div>
</section>
</main>
${footer}
${filterScript[0]}
<script src="/assets/js/main.js?v=20260731o" defer></script>
<script src="/assets/js/i18n.js?v=20260809c" defer></script>
</body>
</html>
`;

fs.writeFileSync(enPath, out);
console.log('wrote', enPath, 'cards=', cards.length);

// Patch EN article pages logo to base64 as well
const enBlogDir = path.join(landing, 'en/blog');
for (const f of fs.readdirSync(enBlogDir)) {
  if (!f.endsWith('.html') || f === 'index.html') continue;
  let html = fs.readFileSync(path.join(enBlogDir, f), 'utf8');
  const next = html.replace(
    /(<a href="[^"]*" class="nav-logo">\s*)<img src="[^"]*" alt="tuko"[^>]*>/i,
    `$1<img src="${logoSrc}" alt="tuko" width="120" height="40" decoding="async">`
  );
  if (next !== html) {
    fs.writeFileSync(path.join(enBlogDir, f), next);
    console.log('logo patched', f);
  }
}

// Keep shellFragments pointing at /assets/tuko-nav-logo.png (now fixed file)
console.log('DONE');
