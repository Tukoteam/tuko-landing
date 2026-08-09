/**
 * Genera /en/privacidad y /en/terminos (legales EN reales) + cablea hreflang ES.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landing = path.resolve(__dirname, '..');
const i18nPath = path.join(landing, 'assets', 'js', 'i18n.js');

const PAGES = [
  {
    src: 'pages/privacidad.html',
    out: 'en/privacidad.html',
    slug: 'privacidad',
    enTitle: 'Privacy Policy — Tuko',
    enDesc: 'How Tuko collects and processes personal data through its website and Shopify group-buying plugin.',
    esCanon: 'https://tukoteam.com/privacidad',
    enCanon: 'https://tukoteam.com/en/privacidad',
  },
  {
    src: 'pages/terminos.html',
    out: 'en/terminos.html',
    slug: 'terminos',
    enTitle: 'Terms of Use — Tuko',
    enDesc: 'Terms governing access to and use of the Tuko website.',
    esCanon: 'https://tukoteam.com/terminos',
    enCanon: 'https://tukoteam.com/en/terminos',
  },
];

function extractEnDict(i18nSrc) {
  const start = i18nSrc.indexOf('en: {');
  if (start < 0) throw new Error('en block not found');
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
  // eslint-disable-next-line no-new-func
  return new Function(`return (${i18nSrc.slice(start + 'en: '.length, end)});`)();
}

function bakeI18n(html, dict) {
  let h = html.replace(
    /<([a-zA-Z][\w:-]*)((?:\s[^>]*)?\sdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g,
    (full, tag, attrs, key) => {
      if (!Object.prototype.hasOwnProperty.call(dict, key)) return full;
      return `<${tag}${attrs}>${dict[key]}</${tag}>`;
    }
  );
  return h;
}

function buildEnPage(srcHtml, cfg, dict) {
  let h = bakeI18n(srcHtml, dict);

  h = h.replace(/<title>[^<]*<\/title>/, `<title>${cfg.enTitle}</title>`);
  h = h.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${cfg.enDesc}">`
  );
  h = h.replace(
    /<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${cfg.enCanon}">`
  );

  h = h.replace(/property="og:url" content="[^"]*"/, `property="og:url" content="${cfg.enCanon}"`);
  h = h.replace(/property="og:title" content="[^"]*"/, `property="og:title" content="${cfg.enTitle}"`);
  h = h.replace(/property="og:description" content="[^"]*"/, `property="og:description" content="${cfg.enDesc}"`);
  h = h.replace(/property="og:locale" content="es_ES"/, 'property="og:locale" content="en_US"');
  h = h.replace(/name="twitter:title" content="[^"]*"/, `name="twitter:title" content="${cfg.enTitle}"`);
  h = h.replace(/"inLanguage": "es-ES"/g, '"inLanguage": "en"');
  h = h.replace(/"name": "Inicio"/g, '"name": "Home"');
  h = h.replace(/"name": "Política de privacidad"/g, '"name": "Privacy Policy"');
  h = h.replace(/"name": "Términos de uso"/g, '"name": "Terms of use"');

  // Schema/page URLs → EN (before setting hreflang/data-url)
  h = h.replace(/https:\/\/tukoteam\.com\/pages\/privacidad\.html/g, 'https://tukoteam.com/en/privacidad');
  h = h.replace(/https:\/\/tukoteam\.com\/pages\/terminos\.html/g, 'https://tukoteam.com/en/terminos');
  h = h.replace(/https:\/\/tukoteam\.com\/privacidad(?![\w/-])/g, 'https://tukoteam.com/en/privacidad');
  h = h.replace(/https:\/\/tukoteam\.com\/terminos(?![\w/-])/g, 'https://tukoteam.com/en/terminos');
  h = h.replace(/\/en\/en\//g, '/en/');

  // Breadcrumb home → /en/
  h = h.replace(
    /("item": ")https:\/\/tukoteam\.com\/(")/,
    '$1https://tukoteam.com/en/$2'
  );

  // html attrs + hreflang LAST (so URL rewrites cannot break ES links)
  h = h.replace(
    /<html\b[^>]*>/,
    `<html lang="en" data-url-es="${cfg.esCanon}" data-url-en="${cfg.enCanon}">`
  );
  h = h.replace(/<link rel="alternate" hreflang="[^"]+" href="[^"]*">\n?/g, '');
  h = h.replace(
    /(<link rel="canonical" href="[^"]+">)/,
    `$1\n<link rel="alternate" hreflang="es" href="${cfg.esCanon}">\n<link rel="alternate" hreflang="en" href="${cfg.enCanon}">\n<link rel="alternate" hreflang="x-default" href="${cfg.esCanon}">`
  );

  // Paths: pages/ uses ../assets → from en/ also ../assets
  // Nav home/blog/ai for EN tree
  h = h.replace(/href="\.\.\/index\.html"/g, 'href="./"');
  h = h.replace(/href="\.\.\/index\.html#/g, 'href="./#');
  h = h.replace(/href="\.\.\/blog\/index\.html"/g, 'href="blog/"');
  h = h.replace(/href="\.\.\/tuko-ai"/g, 'href="tuko-ai"');
  h = h.replace(/locale=es/g, 'locale=en');
  h = h.replace(/i18n\.js\?v=[^"]+/g, 'i18n.js?v=20260809d');

  // Footer legal cross-links (same folder under /en/)
  h = h.replace(/href="privacidad\.html"/g, 'href="privacidad"');
  h = h.replace(/href="terminos\.html"/g, 'href="terminos"');
  // terms_p6 baked link may still say privacidad.html inside HTML string from i18n
  h = h.replace(
    /href="privacidad\.html" target="_blank"/g,
    'href="privacidad" target="_blank"'
  );

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

  // Skip link
  h = h.replace(
    />(Saltar al contenido|Skip to content)</,
    '>Skip to content<'
  );

  return h;
}

function patchEsLegal(srcPath, cfg) {
  let h = fs.readFileSync(srcPath, 'utf8');
  if (!/data-url-en=/.test(h)) {
    h = h.replace(
      /<html\b[^>]*>/,
      `<html lang="es" data-url-es="${cfg.esCanon}" data-url-en="${cfg.enCanon}">`
    );
  } else {
    h = h.replace(/data-url-es="[^"]*"/, `data-url-es="${cfg.esCanon}"`);
    h = h.replace(/data-url-en="[^"]*"/, `data-url-en="${cfg.enCanon}"`);
  }

  // Canonical → clean URL
  h = h.replace(
    /<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${cfg.esCanon}">`
  );
  h = h.replace(/property="og:url" content="[^"]*"/, `property="og:url" content="${cfg.esCanon}"`);

  // Real hreflang (remove ?lang=en)
  h = h.replace(/<link rel="alternate" hreflang="[^"]+" href="[^"]*">\n?/g, '');
  h = h.replace(
    /(<link rel="canonical" href="[^"]+">)/,
    `$1\n<link rel="alternate" hreflang="es" href="${cfg.esCanon}">\n<link rel="alternate" hreflang="en" href="${cfg.enCanon}">\n<link rel="alternate" hreflang="x-default" href="${cfg.esCanon}">`
  );

  // Schema URLs → clean
  h = h.replace(/https:\/\/tukoteam\.com\/pages\/privacidad\.html/g, 'https://tukoteam.com/privacidad');
  h = h.replace(/https:\/\/tukoteam\.com\/pages\/terminos\.html/g, 'https://tukoteam.com/terminos');

  h = h.replace(/i18n\.js\?v=[^"]+/g, 'i18n.js?v=20260809d');
  fs.writeFileSync(srcPath, h);
}

function ensureSitemap(sm) {
  for (const cfg of PAGES) {
    if (sm.includes(`${cfg.enCanon}</loc>`)) continue;
    const entry = `
  <url>
    <loc>${cfg.enCanon}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
`;
    const esLoc = cfg.esCanon;
    if (sm.includes(`${esLoc}</loc>`)) {
      sm = sm.replace(
        new RegExp(`(<loc>${esLoc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/loc>[\\s\\S]*?<\\/url>)`),
        `$1\n${entry}`
      );
    } else {
      sm = sm.replace('</urlset>', `${entry}</urlset>`);
    }
  }
  return sm;
}

function ensureRedirects() {
  const redirectsPath = path.join(landing, '_redirects');
  let r = fs.readFileSync(redirectsPath, 'utf8');
  for (const cfg of PAGES) {
    const line = `/en/${cfg.slug}.html`;
    if (!r.includes(line)) {
      r += `${line.padEnd(40)} /en/${cfg.slug}                         301!\n`;
    }
  }
  fs.writeFileSync(redirectsPath, r);

  const netlifyPath = path.join(landing, 'netlify.toml');
  let n = fs.readFileSync(netlifyPath, 'utf8');
  for (const cfg of PAGES) {
    const from = `/en/${cfg.slug}.html`;
    if (!n.includes(`from = "${from}"`)) {
      n += `
[[redirects]]
  from = "${from}"
  to = "/en/${cfg.slug}"
  status = 301
  force = true
`;
    }
  }
  fs.writeFileSync(netlifyPath, n);
}

function patchEnFooters() {
  const targets = [
    path.join(landing, 'en', 'index.html'),
    path.join(landing, 'en', 'tuko-ai.html'),
    ...fs
      .readdirSync(path.join(landing, 'en', 'blog'))
      .filter((f) => f.endsWith('.html'))
      .map((f) => path.join(landing, 'en', 'blog', f)),
  ];
  for (const p of targets) {
    if (!fs.existsSync(p)) continue;
    let h = fs.readFileSync(p, 'utf8');
    const before = h;
    // From en/blog → ../privacidad ; from en/ → privacidad
    if (p.includes(`${path.sep}blog${path.sep}`)) {
      h = h.replace(/href="\.\.\/\.\.\/pages\/privacidad\.html"/g, 'href="../privacidad"');
      h = h.replace(/href="\.\.\/\.\.\/pages\/terminos\.html"/g, 'href="../terminos"');
      h = h.replace(/href="pages\/privacidad\.html"/g, 'href="../privacidad"');
      h = h.replace(/href="pages\/terminos\.html"/g, 'href="../terminos"');
    } else {
      h = h.replace(/href="pages\/privacidad\.html"/g, 'href="privacidad"');
      h = h.replace(/href="pages\/terminos\.html"/g, 'href="terminos"');
      h = h.replace(/href="\.\.\/pages\/privacidad\.html"/g, 'href="privacidad"');
      h = h.replace(/href="\.\.\/pages\/terminos\.html"/g, 'href="terminos"');
    }
    if (h !== before) {
      fs.writeFileSync(p, h);
      console.log('footer patched', path.relative(landing, p));
    }
  }
}

// Fix EN terms link inside i18n for privacidad sibling
function patchI18nTermsLink() {
  let i18n = fs.readFileSync(i18nPath, 'utf8');
  const next = i18n.replace(
    /terms_p6: 'The processing of personal data is governed by our <a href="privacidad\.html" target="_blank">Privacy Policy<\/a>\.'/,
    `terms_p6: 'The processing of personal data is governed by our <a href="privacidad" target="_blank">Privacy Policy</a>.'`
  );
  if (next !== i18n) {
    fs.writeFileSync(i18nPath, next);
    console.log('i18n terms_p6 link → privacidad');
  }
}

const dict = extractEnDict(fs.readFileSync(i18nPath, 'utf8'));
patchI18nTermsLink();
const dict2 = extractEnDict(fs.readFileSync(i18nPath, 'utf8'));

for (const cfg of PAGES) {
  const srcPath = path.join(landing, cfg.src);
  const outPath = path.join(landing, cfg.out);
  const src = fs.readFileSync(srcPath, 'utf8');
  const enHtml = buildEnPage(src, cfg, dict2);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, enHtml);
  console.log('wrote', cfg.out);
  patchEsLegal(srcPath, cfg);
  console.log('patched ES', cfg.src);
}

const smPath = path.join(landing, 'sitemap.xml');
fs.writeFileSync(smPath, ensureSitemap(fs.readFileSync(smPath, 'utf8')));
ensureRedirects();
patchEnFooters();
console.log('DONE legal EN');
