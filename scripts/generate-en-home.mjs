/**
 * Genera en/index.html (home EN real) desde index.html + translations.en
 * y cablea hreflang / data-url / redirects / sitemap / enlaces Home del blog EN.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landing = path.resolve(__dirname, '..');
const srcPath = path.join(landing, 'index.html');
const outPath = path.join(landing, 'en', 'index.html');

const EN_TITLE = 'Tuko — Group Buying for Shopify Stores';
const EN_DESC =
  'Let shoppers buy together and unlock better prices inside your Shopify store. Tiered group discounts that grow sales through word of mouth—not bigger ad budgets.';
const EN_OG_DESC =
  'Group buying for Shopify: shoppers join together, unlock better prices, and grow your store through word of mouth—without pouring more money into ads.';

function extractTranslations(html) {
  const start = html.indexOf('const translations = {');
  if (start < 0) throw new Error('translations block not found');
  let i = start + 'const translations = '.length;
  let depth = 0;
  let end = -1;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end < 0) throw new Error('translations brace match failed');
  // eslint-disable-next-line no-new-func
  const translations = new Function(`return (${html.slice(start + 'const translations = '.length, end)});`)();
  return translations;
}

function bakeI18n(html, dict) {
  // Reemplaza el interior de tags con data-i18n (misma etiqueta de cierre).
  return html.replace(
    /<([a-zA-Z][\w:-]*)((?:\s[^>]*)?\sdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g,
    (full, tag, attrs, key, _inner) => {
      if (!Object.prototype.hasOwnProperty.call(dict, key)) return full;
      return `<${tag}${attrs}>${dict[key]}</${tag}>`;
    }
  );
}

function patchSeoHead(html) {
  let h = html;
  h = h.replace(
    /<html\b[^>]*>/,
    '<html lang="en" data-url-es="https://tukoteam.com/" data-url-en="https://tukoteam.com/en/">'
  );
  h = h.replace(
    /<title>[^<]*<\/title>/,
    `<title>${EN_TITLE}</title>`
  );
  h = h.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${EN_DESC}">`
  );
  h = h.replace(
    /<link rel="canonical" href="[^"]*">/,
    '<link rel="canonical" href="https://tukoteam.com/en/">'
  );
  h = h.replace(
    /<!-- hreflang EN retirado[\s\S]*?-->/,
    [
      '<link rel="alternate" hreflang="es" href="https://tukoteam.com/">',
      '<link rel="alternate" hreflang="en" href="https://tukoteam.com/en/">',
      '<link rel="alternate" hreflang="x-default" href="https://tukoteam.com/">',
    ].join('\n')
  );
  h = h.replace(/content="Spanish"/, 'content="English"');
  h = h.replace(/<meta name="language" content="Spanish">/, '<meta name="language" content="English">');
  h = h.replace(/content="es_ES"/g, 'content="en_US"');
  h = h.replace(
    /<meta property="og:locale:alternate" content="en_US">/,
    '<meta property="og:locale:alternate" content="es_ES">'
  );
  // After locale swap, og:locale became en_US; fix alternate if both became en
  h = h.replace(
    /(<meta property="og:locale" content=")en_US(">)/,
    '$1en_US$2'
  );
  h = h.replace(/property="og:url" content="[^"]*"/, 'property="og:url" content="https://tukoteam.com/en/"');
  h = h.replace(/property="og:title" content="[^"]*"/g, `property="og:title" content="${EN_TITLE}"`);
  h = h.replace(
    /property="og:description" content="[^"]*"/,
    `property="og:description" content="${EN_OG_DESC}"`
  );
  h = h.replace(/name="twitter:title" content="[^"]*"/, `name="twitter:title" content="${EN_TITLE}"`);
  h = h.replace(
    /name="twitter:description" content="[^"]*"/,
    `name="twitter:description" content="${EN_OG_DESC}"`
  );
  h = h.replace(/name="DC.title" content="[^"]*"/, `name="DC.title" content="${EN_TITLE}"`);
  h = h.replace(/name="DC.language" content="es"/, 'name="DC.language" content="en"');
  h = h.replace(
    /name="DC.identifier" content="[^"]*"/,
    'name="DC.identifier" content="https://tukoteam.com/en/"'
  );
  h = h.replace(/"inLanguage": "es-ES"/g, '"inLanguage": "en"');
  h = h.replace(
    /"url": "https:\/\/tukoteam\.com\/"/g,
    (m, offset, full) => {
      // Keep organization root URL; change WebSite/Service page URLs near #website
      return m;
    }
  );
  // WebSite @id block url
  h = h.replace(
    /("@id": "https:\/\/tukoteam\.com\/#website",\s*"url": ")https:\/\/tukoteam\.com\/(")/,
    '$1https://tukoteam.com/en/$2'
  );
  h = h.replace(
    /("@id": "https:\/\/tukoteam\.com\/#service",[\s\S]*?"url": ")https:\/\/tukoteam\.com\/(")/,
    '$1https://tukoteam.com/en/$2'
  );
  h = h.replace(
    /("name": "Inicio",\s*"item": ")https:\/\/tukoteam\.com\/(")/,
    '$1https://tukoteam.com/en/$2'
  );
  h = h.replace(/"name": "Inicio"/, '"name": "Home"');
  return h;
}

function rewritePaths(html) {
  let h = html;
  // Asset / relative roots → one level up
  const attrs = ['href', 'src', 'poster'];
  for (const attr of attrs) {
    h = h.replace(
      new RegExp(`(${attr}=["'])((?:assets|blog|pages|landing-demo|tuko-ai)[^"']*)(["'])`, 'g'),
      `$1../$2$3`
    );
  }
  // prefetch already covered by href
  // Blog nav: prefer clean /en/blog/
  h = h.replace(/href="\.\.\/blog\/index\.html"/g, 'href="blog/"');
  h = h.replace(/href="\.\.\/blog\/"/g, 'href="blog/"');
  // tuko AI EN sibling
  h = h.replace(/href="\.\.\/tuko-ai"/g, 'href="tuko-ai"');
  h = h.replace(/href="\.\.\/tuko-ai#/g, 'href="tuko-ai#');
  h = h.replace(/https:\/\/tukoteam\.com\/tuko-ai/g, 'https://tukoteam.com/en/tuko-ai');
  h = h.replace(/https:\/\/tukoteam\.com\/en\/en\/tuko-ai/g, 'https://tukoteam.com/en/tuko-ai');
  // Shopify locale
  h = h.replace(/locale=es/g, 'locale=en');
  // Video default EN
  h = h.replace(/data-yt-id="jVCZzMbC-Ek"/, 'data-yt-id="qdiZLc4M2ik"');
  h = h.replace(
    /src="https:\/\/i\.ytimg\.com\/vi\/jVCZzMbC-Ek\//,
    'src="https://i.ytimg.com/vi/qdiZLc4M2ik/'
  );
  // Lang switcher: EN active
  h = h.replace(
    /(<button type="button" class="lang-opt) active(" data-lang="es")/g,
    '$1$2'
  );
  h = h.replace(
    /(<button type="button" class="lang-opt)(" data-lang="en")/g,
    '$1 active$2'
  );
  h = h.replace(/data-active="es"/g, 'data-active="en"');
  return h;
}

function patchLocaleJs(html) {
  const resolve = `function resolveLang() {
  var path = (location.pathname || '').replace(/\\/$/, '') || '/';
  if (path === '/en' || path.indexOf('/en/') === 0) return 'en';
  var q = new URLSearchParams(location.search).get('lang');
  if (q === 'es' || q === 'en') return q;
  return localStorage.getItem('tuko_lang') || 'es';
}`;

  const sync = `function syncSeoLang(lang) {
  var root = document.documentElement;
  if (root.getAttribute('data-url-es') && root.getAttribute('data-url-en')) return;
  var path = (location.pathname || '').replace(/\\/$/, '') || '/';
  if (path === '/en' || path.indexOf('/en/') === 0) return;
  var base = location.origin + location.pathname;
  var url  = lang === 'en' ? base + '?lang=en' : base;
  var can = document.querySelector('link[rel="canonical"]');
  if (can) can.setAttribute('href', url);
  var og = document.querySelector('meta[property="og:url"]');
  if (og) og.setAttribute('content', url);
  var loc = document.querySelector('meta[property="og:locale"]');
  if (loc) loc.setAttribute('content', lang === 'en' ? 'en_US' : 'es_ES');
  var alt = document.querySelector('meta[property="og:locale:alternate"]');
  if (alt) alt.setAttribute('content', lang === 'en' ? 'es_ES' : 'en_US');
}`;

  const navHelper = `
function localeNavUrl(lang) {
  var root = document.documentElement;
  var attr = lang === 'en' ? 'data-url-en' : 'data-url-es';
  var url = root.getAttribute(attr);
  if (!url) return null;
  try { return new URL(url, location.origin); } catch (e) { return null; }
}
`;

  let h = html;
  h = h.replace(
    /\/\* El idioma puede venir en la URL[\s\S]*?function resolveLang\(\) \{[\s\S]*?\n\}/,
    `/* Idioma: path /en gana; si no, ?lang; si no, localStorage. */\n${resolve}`
  );
  h = h.replace(
    /\/\* Mantiene canonical[\s\S]*?function syncSeoLang\(lang\) \{[\s\S]*?\n\}/,
    `/* No reescribir SEO en URLs reales /en/. */\n${sync}`
  );

  // Inject localeNavUrl before setLanguage if missing
  if (!h.includes('function localeNavUrl')) {
    h = h.replace(/function setLanguage\(lang, opts\) \{/, `${navHelper}\nfunction setLanguage(lang, opts) {`);
  }

  // Navigate across / ↔ /en/ when data-url-* differ
  if (!h.includes('/* En home con URL /en/ real')) {
    h = h.replace(
      /function setLanguage\(lang, opts\) \{\r?\n  if \(!translations\[lang\]\) return;/,
      `function setLanguage(lang, opts) {
  if (!translations[lang]) return;
  /* En home con URL /en/ real: navegar en lugar de solo swap JS */
  var dest = localeNavUrl(lang);
  if (dest) {
    var herePath = location.pathname.replace(/\\/$/, '') || '/';
    var destPath = dest.pathname.replace(/\\/$/, '') || '/';
    if (destPath !== herePath) {
      localStorage.setItem('tuko_lang', lang);
      location.href = dest.href;
      return;
    }
  }`
    );
  }
  return h;
}

function patchEsHome(html) {
  let h = html;
  if (!/data-url-en=/.test(h)) {
    h = h.replace(
      /<html\b([^>]*)>/,
      '<html lang="es" data-url-es="https://tukoteam.com/" data-url-en="https://tukoteam.com/en/">'
    );
  }
  if (!/hreflang="en"[^>]*\/en\//.test(h)) {
    h = h.replace(
      /<!-- hreflang EN retirado[\s\S]*?-->/,
      [
        '<link rel="alternate" hreflang="es" href="https://tukoteam.com/">',
        '<link rel="alternate" hreflang="en" href="https://tukoteam.com/en/">',
        '<link rel="alternate" hreflang="x-default" href="https://tukoteam.com/">',
      ].join('\n')
    );
  }
  return patchLocaleJs(h);
}

function ensureSitemap(sm) {
  if (sm.includes('https://tukoteam.com/en/</loc>')) return sm;
  const entry = `
  <url>
    <loc>https://tukoteam.com/en/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
  // Insert after root /
  return sm.replace(
    /(<loc>https:\/\/tukoteam\.com\/<\/loc>[\s\S]*?<\/url>)/,
    `$1\n${entry}`
  );
}

function ensureRedirects() {
  const redirectsPath = path.join(landing, '_redirects');
  let r = fs.readFileSync(redirectsPath, 'utf8');
  if (!r.includes('/en/index.html')) {
    r += '\n/en/index.html                              /en/                                 301!\n';
    fs.writeFileSync(redirectsPath, r);
  }
  const netlifyPath = path.join(landing, 'netlify.toml');
  let n = fs.readFileSync(netlifyPath, 'utf8');
  if (!n.includes('from = "/en/index.html"')) {
    n += `
[[redirects]]
  from = "/en/index.html"
  to = "/en/"
  status = 301
  force = true
`;
    fs.writeFileSync(netlifyPath, n);
  }
}

function patchEnBlogHomes() {
  const blogDir = path.join(landing, 'en', 'blog');
  for (const f of fs.readdirSync(blogDir).filter((x) => x.endsWith('.html'))) {
    const p = path.join(blogDir, f);
    let html = fs.readFileSync(p, 'utf8');
    const before = html;
    // Logo / home links that pointed at ES root
    html = html.replace(/href="\.\.\/\.\.\/index\.html"/g, 'href="../"');
    html = html.replace(/href="\.\.\/\.\.\/"/g, 'href="../"');
    // data-i18n nav_link_inicio anchors sometimes href="../../index.html"
    if (html !== before) {
      fs.writeFileSync(p, html);
      console.log('patched home link', f);
    }
  }
}

// ── main ──
const src = fs.readFileSync(srcPath, 'utf8');
const translations = extractTranslations(src);
const en = translations.en;
if (!en || !en.hero_title) throw new Error('EN translations missing');

let enHtml = src;
enHtml = bakeI18n(enHtml, en);
enHtml = patchSeoHead(enHtml);
enHtml = rewritePaths(enHtml);
enHtml = patchLocaleJs(enHtml);

// Count baked keys
const baked = (enHtml.match(/data-i18n="/g) || []).length;
const sample = enHtml.includes('Turn your traffic');
if (!sample) console.warn('WARN: hero EN title not found after bake');

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, enHtml);
console.log('wrote', outPath, 'bytes=', enHtml.length, 'data-i18n=', baked);

// Patch ES home
fs.writeFileSync(srcPath, patchEsHome(src));
console.log('patched ES index.html');

// Sitemap
const smPath = path.join(landing, 'sitemap.xml');
fs.writeFileSync(smPath, ensureSitemap(fs.readFileSync(smPath, 'utf8')));
console.log('sitemap ok');

ensureRedirects();
console.log('redirects ok');

patchEnBlogHomes();
console.log('DONE');
