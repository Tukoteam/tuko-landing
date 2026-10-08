/**
 * One-shot: normalize blog cards + unify chrome/legal links on secondary pages.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(__dirname, '..', 'site');

function patchBlogCards() {
  const file = path.join(site, 'blog', 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const slugs = [
    'gran-paso-tuko',
    'new-formulas-shanghai',
    'ocea-hub-shanghai',
    'spain-innovation-day',
    'stron-tech-trek',
    'shiji-incubator',
  ];
  for (const slug of slugs) {
    const re = new RegExp(
      `(<article class="bp-card" data-cat="[^"]+" data-date="[^"]+" data-mins="\\d+")(?![^>]*data-cms-slug)(>\\s*<a class="bp-media" href="/blog/${slug}")`,
      'i'
    );
    html = html.replace(re, `$1 data-cms-slug="${slug}" data-locale="es"$2`);
  }
  fs.writeFileSync(file, html);
  console.log(
    'blog cards with cms-slug:',
    (html.match(/data-cms-slug=/g) || []).length
  );
}

const NAV_ES = `  <ul class="nav-links">
    <li><a href="/#como-funciona" data-i18n="nav_link_como_funciona">Cómo funciona</a></li>
    <li><a href="/#beneficios" data-i18n="nav_link_beneficios">Por qué funciona</a></li>
    <li><a href="/#precios" data-i18n="nav_link_precios">Precios</a></li>
    <li><a href="/blog/" data-i18n="nav_link_blog">Blog</a></li>
    <li><a href="/tuko-ai" data-i18n="nav_link_ia">tuko AI</a></li>
    <li><a href="/#solicitud" class="nav-cta" data-i18n="nav_cta">Acceder al piloto</a></li>
  </ul>`;

const NAV_EN = `  <ul class="nav-links">
    <li><a href="/en/#como-funciona" data-i18n="nav_link_como_funciona">How it works</a></li>
    <li><a href="/en/#beneficios" data-i18n="nav_link_beneficios">Why it works</a></li>
    <li><a href="/en/#precios" data-i18n="nav_link_precios">Pricing</a></li>
    <li><a href="/en/blog/" data-i18n="nav_link_blog">Blog</a></li>
    <li><a href="/en/tuko-ai" data-i18n="nav_link_ia">tuko AI</a></li>
    <li><a href="/en/#solicitud" class="nav-cta" data-i18n="nav_cta">Join the pilot</a></li>
  </ul>`;

const THEME_BTN_ES = `  <button type="button" class="theme-toggle" id="themeToggle" aria-label="Activar modo oscuro" aria-pressed="false">
    <svg class="theme-icon theme-icon--moon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    <svg class="theme-icon theme-icon--sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
  </button>`;

const THEME_BTN_EN = THEME_BTN_ES.replace(
  'Activar modo oscuro',
  'Switch to dark mode'
);

function patchChrome(fileRel, isEn) {
  const file = path.join(site, fileRel);
  if (!fs.existsSync(file)) {
    console.log('skip missing', fileRel);
    return;
  }
  let html = fs.readFileSync(file, 'utf8');
  const nav = isEn ? NAV_EN : NAV_ES;
  const themeBtn = isEn ? THEME_BTN_EN : THEME_BTN_ES;

  html = html.replace(/<ul class="nav-links">[\s\S]*?<\/ul>/i, nav);

  // Mobile menu top links (before mobile-lang or first non-hash block)
  if (/<div class="mobile-menu"[^>]*>[\s\S]*?<\/div>\s*<main/i.test(html)) {
    const mobileLinks = isEn
      ? `<a href="/en/#como-funciona" data-i18n="nav_link_como_funciona">How it works</a>
  <a href="/en/#beneficios" data-i18n="nav_link_beneficios">Why it works</a>
  <a href="/en/#precios" data-i18n="nav_link_precios">Pricing</a>
  <a href="/en/blog/" data-i18n="nav_link_blog">Blog</a>
  <a href="/en/tuko-ai" data-i18n="nav_link_ia">tuko AI</a>`
      : `<a href="/#como-funciona" data-i18n="nav_link_como_funciona">Cómo funciona</a>
  <a href="/#beneficios" data-i18n="nav_link_beneficios">Por qué funciona</a>
  <a href="/#precios" data-i18n="nav_link_precios">Precios</a>
  <a href="/blog/" data-i18n="nav_link_blog">Blog</a>
  <a href="/tuko-ai" data-i18n="nav_link_ia">tuko AI</a>`;

    html = html.replace(
      /(<div class="mobile-menu"[^>]*>)\s*([\s\S]*?)(<div class="mobile-lang">)/i,
      `$1\n  ${mobileLinks}\n  $3`
    );

    const mobileCta = isEn
      ? `<a href="/en/#solicitud" class="mobile-cta" data-i18n="nav_cta">Join the pilot</a>`
      : `<a href="/#solicitud" class="mobile-cta" data-i18n="nav_cta">Acceder al piloto</a>`;
    html = html.replace(
      /<a href="[^"]*" class="mobile-cta"[\s\S]*?<\/a>/i,
      mobileCta
    );
  }

  if (!html.includes('theme-toggle')) {
    html = html.replace(
      /(<\/ul>\s*)(<button class="nav-hamburger"|<div class="lang-switcher")/,
      `$1${themeBtn}\n  $2`
    );
  }

  // Theme assets
  if (!html.includes('tuko-theme.css')) {
    html = html.replace(
      /(<link rel="stylesheet" href="[^"]*main\.css[^"]*">)/i,
      `$1\n<link rel="stylesheet" href="/assets/css/tuko-theme.css?v=20261003j">`
    );
  }
  if (!html.includes('tuko_theme')) {
    html = html.replace(
      /(<meta name="viewport"[^>]*>)/i,
      `$1\n<script>(function(){try{var t=localStorage.getItem("tuko_theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();</script>`
    );
  }
  if (!html.includes('tuko-theme.js')) {
    html = html.replace(
      /<\/body>/i,
      `<script src="/assets/js/tuko-theme.js?v=20261002h" defer></script>\n</body>`
    );
  }

  html = html.replace(
    /href="[^"]*assets\/css\/main\.css\?v=[^"]+"/g,
    'href="/assets/css/main.css?v=20261008a"'
  );
  html = html.replace(
    /href="assets\/css\/main\.css\?v=[^"]+"/g,
    'href="/assets/css/main.css?v=20261008a"'
  );

  // Footer legal → HTML pages
  if (isEn) {
    html = html.replace(
      /href="[^"]*politica-de-privacidad\.pdf"[^>]*>/gi,
      'href="/en/privacidad">'
    );
    html = html.replace(
      /href="[^"]*terminos-y-condiciones\.pdf"[^>]*>/gi,
      'href="/en/terminos">'
    );
  } else {
    html = html.replace(
      /href="[^"]*politica-de-privacidad\.pdf"[^>]*>/gi,
      'href="/privacidad">'
    );
    html = html.replace(
      /href="[^"]*terminos-y-condiciones\.pdf"[^>]*>/gi,
      'href="/terminos">'
    );
  }
  // Also relative pages/*.html leftovers
  html = html.replace(/href="[^"]*pages\/privacidad\.html"/gi, isEn ? 'href="/en/privacidad"' : 'href="/privacidad"');
  html = html.replace(/href="[^"]*pages\/terminos\.html"/gi, isEn ? 'href="/en/terminos"' : 'href="/terminos"');

  fs.writeFileSync(file, html);
  console.log('chrome', fileRel);
}

function patchHomeFooterLegal() {
  for (const rel of ['index.html', 'en/index.html', 'blog/index.html', 'en/blog/index.html']) {
    const file = path.join(site, rel);
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    const isEn = rel.startsWith('en/');
    const before = html;
    if (isEn) {
      html = html.replace(/href="[^"]*politica-de-privacidad\.pdf"[^>]*>/gi, 'href="/en/privacidad">');
      html = html.replace(/href="[^"]*terminos-y-condiciones\.pdf"[^>]*>/gi, 'href="/en/terminos">');
    } else {
      html = html.replace(/href="[^"]*politica-de-privacidad\.pdf"[^>]*>/gi, 'href="/privacidad">');
      html = html.replace(/href="[^"]*terminos-y-condiciones\.pdf"[^>]*>/gi, 'href="/terminos">');
    }
    if (html !== before) {
      fs.writeFileSync(file, html);
      console.log('footer legal', rel);
    }
  }
}

patchBlogCards();
for (const f of [
  'privacidad.html',
  'terminos.html',
  'tuko-ai.html',
]) {
  patchChrome(f, false);
}
for (const f of [
  'en/privacidad.html',
  'en/terminos.html',
  'en/tuko-ai.html',
]) {
  patchChrome(f, true);
}
patchHomeFooterLegal();
console.log('done');
