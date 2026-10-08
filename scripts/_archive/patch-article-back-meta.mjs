/**
 * Solo dentro de <main>: flecha SVG en "Volver al blog" + fecha/autor + color vía .article-*.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogDir = path.resolve(__dirname, '..', 'blog');

const BACK_ARROW =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>';

const META_BY_FILE = {
  'natrue-x-tuko.html': { i18n: 'natrue_meta', text: '17 mar 2026 · Equipo Tuko' },
  'gran-paso-tuko.html': { i18n: 'granpaso_meta', text: '19 feb 2026 · Equipo Tuko' },
  'new-formulas-shanghai.html': { i18n: 'newformulas_meta', text: '14 nov 2025 · Equipo Tuko' },
  'ocea-hub-shanghai.html': { i18n: 'ocea_meta', text: '20 oct 2025 · Equipo Tuko' },
  'spain-innovation-day.html': { i18n: 'spain_meta', text: '30 sep 2025 · Equipo Tuko' },
  'stron-tech-trek.html': { i18n: 'stron_meta', text: '23 sep 2025 · Equipo Tuko' },
  'shiji-incubator.html': { i18n: 'shiji_meta', text: '10 sep 2025 · Equipo Tuko' },
  'primer-articulo.html': { i18n: null, text: '20 oct 2025 · Equipo Tuko' },
  'blog-cms-prueba.html': { i18n: null, text: '7 ago 2026 · Equipo Tuko' },
};

function backLink(href) {
  return `<a href="${href}" class="article-back">${BACK_ARROW}<span data-i18n="article_back">Volver al blog</span></a>`;
}

function metaLine(meta) {
  const attrs = meta.i18n
    ? ` class="article-meta" data-i18n="${meta.i18n}"`
    : ' class="article-meta"';
  return `<p${attrs}>${meta.text}</p>`;
}

function patchMain(mainHtml, meta) {
  let main = mainHtml;

  const linkRe =
    /<a\s+[^>]*href="([^"]+)"[^>]*>[\s\S]*?(?:Volver al blog|Back to blog)[\s\S]*?<\/a>/i;
  const m = main.match(linkRe);
  if (!m) throw new Error('no back link in main');
  const href = m[1];

  main = main.replace(
    /<a\s+[^>]*href="[^"]+"[^>]*>[\s\S]*?(?:Volver al blog|Back to blog)[\s\S]*?<\/a>\s*(?:<p\s+[^>]*(?:class="article-meta"|data-i18n="\w+_meta"|#757575|#A0A0A0)[^>]*>[\s\S]*?<\/p>\s*)?/i,
    `${backLink(href)}\n  ${metaLine(meta)}\n  `
  );

  // Si había otra meta vieja debajo (ocea/spain con style), quitar duplicados
  main = main.replace(
    /(<p class="article-meta"[^>]*>[\s\S]*?<\/p>)\s*<p\s+[^>]*(?:data-i18n="\w+_meta"|#A0A0A0)[^>]*>[\s\S]*?<\/p>/i,
    '$1'
  );

  return main;
}

for (const f of Object.keys(META_BY_FILE)) {
  const meta = META_BY_FILE[f];
  const p = path.join(blogDir, f);
  let html = fs.readFileSync(p, 'utf8');

  html = html.replace(/(\.article-back\s*\{[\s\S]*?color:\s*)#A0A0A0/i, '$1#4D4D4D');
  html = html.replace(/(\.article-meta\s*\{[\s\S]*?color:\s*)#A0A0A0/i, '$1#4D4D4D');
  // stron/shiji: display inline-block → dejar que main.css mande en flex+svg
  html = html.replace(
    /\.article-back\s*\{[\s\S]*?\}\s*\.article-back:hover\s*\{[^}]*\}\s*\.article-meta\s*\{[\s\S]*?\}/,
    `/* article-back / article-meta: estilos en assets/css/main.css */`
  );

  const mainMatch = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i);
  if (!mainMatch) {
    console.error('NO MAIN', f);
    process.exit(2);
  }

  const patchedMain = patchMain(mainMatch[0], meta);
  if (!patchedMain.includes('path d="M19 12H5"') || !patchedMain.includes('class="article-meta"')) {
    console.error('INCOMPLETE', f);
    process.exit(3);
  }

  // Header intacto
  if (!html.includes('nav-logo') || !html.includes('lang-switcher')) {
    console.error('HEADER MISSING BEFORE PATCH', f);
    process.exit(4);
  }

  html = html.replace(mainMatch[0], patchedMain);

  if (!html.includes('nav-logo') || !html.includes('lang-switcher')) {
    console.error('HEADER BROKEN AFTER PATCH', f);
    process.exit(5);
  }

  fs.writeFileSync(p, html);
  console.log('OK', f);
}

console.log('DONE');
