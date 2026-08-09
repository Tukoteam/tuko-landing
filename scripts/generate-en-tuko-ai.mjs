/**
 * Genera en/tuko-ai.html (página EN real) desde tuko-ai.html + assets/js/i18n.js
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landing = path.resolve(__dirname, '..');
const srcPath = path.join(landing, 'tuko-ai.html');
const outPath = path.join(landing, 'en', 'tuko-ai.html');
const i18nPath = path.join(landing, 'assets', 'js', 'i18n.js');

const EN_TITLE = 'tuko AI — Automated group buying with AI';
const EN_DESC =
  'tuko AI analyzes your market, competitors, calendar and your own sales to generate group-buying campaigns automatically. In development.';
const EN_OG =
  'tuko AI builds your group buying campaigns for you: it reads your store and market, and decides what to group, at what price and when. In development.';

function extractEnDict(i18nSrc) {
  const start = i18nSrc.indexOf('en: {');
  if (start < 0) throw new Error('en block not found in i18n.js');
  let i = start + 'en: '.length;
  let depth = 0;
  let end = -1;
  for (; i < i18nSrc.length; i++) {
    const ch = i18nSrc[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end < 0) throw new Error('en brace match failed');
  // eslint-disable-next-line no-new-func
  return new Function(`return (${i18nSrc.slice(start + 'en: '.length, end)});`)();
}

function bakeI18n(html, dict) {
  let h = html.replace(
    /<([a-zA-Z][\w:-]*)((?:\s[^>]*)?\sdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g,
    (full, tag, attrs, key) => {
      if (!Object.prototype.hasOwnProperty.call(dict, key)) return full;
      const val = dict[key];
      if (tag.toLowerCase() === 'input' || tag.toLowerCase() === 'textarea') {
        // placeholder via attribute
        let a = attrs;
        if (/placeholder=/.test(a)) a = a.replace(/placeholder="[^"]*"/, `placeholder="${val.replace(/"/g, '&quot;')}"`);
        else a += ` placeholder="${val.replace(/"/g, '&quot;')}"`;
        return `<${tag}${a}>`;
      }
      return `<${tag}${attrs}>${val}</${tag}>`;
    }
  );
  // Self-closing / void inputs with data-i18n already handled if they use />
  h = h.replace(
    /<input([^>]*\sdata-i18n="([^"]+)"[^>]*)\/?>/g,
    (full, attrs, key) => {
      if (!Object.prototype.hasOwnProperty.call(dict, key)) return full;
      const val = dict[key].replace(/"/g, '&quot;');
      let a = attrs;
      if (/placeholder=/.test(a)) a = a.replace(/placeholder="[^"]*"/, `placeholder="${val}"`);
      else a += ` placeholder="${val}"`;
      return `<input${a}>`;
    }
  );
  return h;
}

function patchSeo(html) {
  let h = html;
  h = h.replace(
    /<html\b[^>]*>/,
    '<html lang="en" data-url-es="https://tukoteam.com/tuko-ai" data-url-en="https://tukoteam.com/en/tuko-ai">'
  );
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${EN_TITLE}</title>`);
  h = h.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${EN_DESC}">`
  );
  h = h.replace(
    /<link rel="canonical" href="[^"]*">/,
    '<link rel="canonical" href="https://tukoteam.com/en/tuko-ai">'
  );
  h = h.replace(
    /<!-- hreflang EN retirado[\s\S]*?-->/,
    [
      '<link rel="alternate" hreflang="es" href="https://tukoteam.com/tuko-ai">',
      '<link rel="alternate" hreflang="en" href="https://tukoteam.com/en/tuko-ai">',
      '<link rel="alternate" hreflang="x-default" href="https://tukoteam.com/tuko-ai">',
    ].join('\n')
  );
  h = h.replace(/property="og:url" content="[^"]*"/, 'property="og:url" content="https://tukoteam.com/en/tuko-ai"');
  h = h.replace(/property="og:title" content="[^"]*"/, `property="og:title" content="${EN_TITLE}"`);
  h = h.replace(/property="og:description" content="[^"]*"/, `property="og:description" content="${EN_OG}"`);
  h = h.replace(/property="og:locale" content="es_ES"/, 'property="og:locale" content="en_US"');
  if (!h.includes('og:locale:alternate')) {
    h = h.replace(
      /(<meta property="og:locale" content="en_US">)/,
      '$1\n<meta property="og:locale:alternate" content="es_ES">'
    );
  }
  h = h.replace(/name="twitter:title" content="[^"]*"/, `name="twitter:title" content="${EN_TITLE}"`);
  h = h.replace(/name="twitter:description" content="[^"]*"/, `name="twitter:description" content="${EN_OG}"`);
  h = h.replace(/"inLanguage": "es-ES"/g, '"inLanguage": "en"');
  // Solo URLs de página/schema — no tocar hreflang/data-url ES
  h = h.replace(/"url": "https:\/\/tukoteam\.com\/tuko-ai"/g, '"url": "https://tukoteam.com/en/tuko-ai"');
  h = h.replace(/"@id": "https:\/\/tukoteam\.com\/tuko-ai#/g, '"@id": "https://tukoteam.com/en/tuko-ai#');
  h = h.replace(
    /("item": "https:\/\/tukoteam\.com\/)tuko-ai(")/g,
    '$1en/tuko-ai$2'
  );
  h = h.replace(/"name": "Inicio"/, '"name": "Home"');
  h = h.replace(
    /("name": "Home",\s*"item": ")https:\/\/tukoteam\.com\/(")/,
    '$1https://tukoteam.com/en/$2'
  );
  return h;
}

function rewritePaths(html) {
  let h = html;
  for (const attr of ['href', 'src']) {
    h = h.replace(
      new RegExp(`(${attr}=["'])((?:assets|blog|pages|index\\.html)[^"']*)(["'])`, 'g'),
      `$1../$2$3`
    );
  }
  // Home → /en/
  h = h.replace(/href="\.\.\/index\.html"/g, 'href="./"');
  h = h.replace(/href="\.\.\/blog\/index\.html"/g, 'href="blog/"');
  // Self link stays tuko-ai (pretty under /en/)
  h = h.replace(/href="tuko-ai"/g, 'href="tuko-ai"');
  h = h.replace(/locale=es/g, 'locale=en');
  h = h.replace(/i18n\.js\?v=[^"]+/g, 'i18n.js?v=20260809d');
  h = h.replace(/main\.js\?v=[^"]+/g, (m) => m); // leave
  h = h.replace(/href="pages\/privacidad\.html"/g, 'href="privacidad"');
  h = h.replace(/href="pages\/terminos\.html"/g, 'href="terminos"');
  h = h.replace(/href="\.\.\/pages\/privacidad\.html"/g, 'href="privacidad"');
  h = h.replace(/href="\.\.\/pages\/terminos\.html"/g, 'href="terminos"');
  // Lang switcher EN active
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

function patchEsPage(html) {
  let h = html;
  if (!/data-url-en=/.test(h)) {
    h = h.replace(
      /<html lang="es">/,
      '<html lang="es" data-url-es="https://tukoteam.com/tuko-ai" data-url-en="https://tukoteam.com/en/tuko-ai">'
    );
  }
  h = h.replace(
    /<!-- hreflang EN retirado[\s\S]*?-->/,
    [
      '<link rel="alternate" hreflang="es" href="https://tukoteam.com/tuko-ai">',
      '<link rel="alternate" hreflang="en" href="https://tukoteam.com/en/tuko-ai">',
      '<link rel="alternate" hreflang="x-default" href="https://tukoteam.com/tuko-ai">',
    ].join('\n')
  );
  h = h.replace(/i18n\.js\?v=[^"]+/g, 'i18n.js?v=20260809c');
  return h;
}

function ensureSitemap(sm) {
  if (sm.includes('https://tukoteam.com/en/tuko-ai</loc>')) return sm;
  const entry = `
  <url>
    <loc>https://tukoteam.com/en/tuko-ai</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
`;
  return sm.replace(
    /(<loc>https:\/\/tukoteam\.com\/tuko-ai<\/loc>[\s\S]*?<\/url>)/,
    `$1\n${entry}`
  );
}

function ensureRedirects() {
  const redirectsPath = path.join(landing, '_redirects');
  let r = fs.readFileSync(redirectsPath, 'utf8');
  if (!r.includes('/en/tuko-ai.html')) {
    r += '/en/tuko-ai.html                             /en/tuko-ai                            301!\n';
    fs.writeFileSync(redirectsPath, r);
  }
  const netlifyPath = path.join(landing, 'netlify.toml');
  let n = fs.readFileSync(netlifyPath, 'utf8');
  if (!n.includes('from = "/en/tuko-ai.html"')) {
    n += `
[[redirects]]
  from = "/en/tuko-ai.html"
  to = "/en/tuko-ai"
  status = 301
  force = true
`;
    fs.writeFileSync(netlifyPath, n);
  }
}

function patchEnHomeNav() {
  const p = path.join(landing, 'en', 'index.html');
  let h = fs.readFileSync(p, 'utf8');
  h = h.replace(/href="\.\.\/tuko-ai"/g, 'href="tuko-ai"');
  h = h.replace(/href="\.\.\/tuko-ai#/g, 'href="tuko-ai#');
  // schema URLs for tuko-ai → EN
  h = h.replace(/https:\/\/tukoteam\.com\/tuko-ai/g, 'https://tukoteam.com/en/tuko-ai');
  h = h.replace(/https:\/\/tukoteam\.com\/en\/en\/tuko-ai/g, 'https://tukoteam.com/en/tuko-ai');
  fs.writeFileSync(p, h);
}

function patchEnBlogAiLinks() {
  const blogDir = path.join(landing, 'en', 'blog');
  for (const f of fs.readdirSync(blogDir).filter((x) => x.endsWith('.html'))) {
    const p = path.join(blogDir, f);
    let html = fs.readFileSync(p, 'utf8');
    const next = html.replace(/href="\.\.\/\.\.\/tuko-ai"/g, 'href="../tuko-ai"');
    if (next !== html) {
      fs.writeFileSync(p, next);
      console.log('blog AI link', f);
    }
  }
}

// ── main ──
const src = fs.readFileSync(srcPath, 'utf8');
const en = extractEnDict(fs.readFileSync(i18nPath, 'utf8'));
if (!en.ia_lead) throw new Error('missing ia_lead EN');

let out = bakeI18n(src, en);
out = patchSeo(out);
out = rewritePaths(out);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, out);
console.log('wrote', outPath, 'has EN lead=', out.includes('builds your'));

fs.writeFileSync(srcPath, patchEsPage(src));
console.log('patched ES tuko-ai.html');

const smPath = path.join(landing, 'sitemap.xml');
fs.writeFileSync(smPath, ensureSitemap(fs.readFileSync(smPath, 'utf8')));
ensureRedirects();
patchEnHomeNav();
patchEnBlogAiLinks();

// bump i18n on EN blog chrome too
for (const f of fs.readdirSync(path.join(landing, 'en', 'blog')).filter((x) => x.endsWith('.html'))) {
  const p = path.join(landing, 'en', 'blog', f);
  let h = fs.readFileSync(p, 'utf8');
  const n = h.replace(/i18n\.js\?v=20260809b/g, 'i18n.js?v=20260809c');
  if (n !== h) fs.writeFileSync(p, n);
}

console.log('DONE');
