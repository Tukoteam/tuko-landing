/**
 * Copia header + footer del blog index a todos los artículos.
 * Así coinciden banderas ES/EN y el footer-inner nuevos.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogDir = path.resolve(__dirname, '..', 'blog');
const indexPath = path.join(blogDir, 'index.html');
const index = fs.readFileSync(indexPath, 'utf8');

// Hasta <main — evita cortar el mobile-menu en el primer </div> interno
const headerMatch = index.match(
  /<header role="banner">[\s\S]*?(?=<main\b)/
);
const footerMatch = index.match(/<!-- FOOTER -->\s*<footer>[\s\S]*?<\/footer>/);
if (!headerMatch || !footerMatch) {
  console.error('No pude extraer header/footer de blog/index.html');
  process.exit(1);
}

const header = headerMatch[0].trimEnd() + '\n';
const footer = footerMatch[0];
const scripts =
  '<script src="../assets/js/main.js?v=20260731o" defer></script>\n<script src="../assets/js/i18n.js?v=20260804c" defer></script>';

if (!header.includes('mobile-cta') || !header.includes('</div>')) {
  console.error('Header incompleto (falta mobile-menu cerrado)');
  process.exit(1);
}

const files = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith('.html') && f !== 'index.html');

let ok = 0;
for (const f of files) {
  const p = path.join(blogDir, f);
  let html = fs.readFileSync(p, 'utf8');

  // Quitar restos rotos / shell viejo hasta <main
  html = html.replace(
    /(?:<!--\s*NAV\s*-->\s*)?(?:<header\b[\s\S]*?<\/header>\s*)?(?:<nav\b[\s\S]*?<\/nav>\s*)?(?:<div class="mobile-menu"[\s\S]*?)?(?=<main\b)/,
    `${header}\n`
  );

  html = html.replace(
    /(?:<!--\s*FOOTER\s*-->\s*)?<footer\b[\s\S]*?<\/footer>/,
    footer
  );

  html = html.replace(
    /<script src="\.\.\/assets\/js\/main\.js[^"]*"[^>]*><\/script>\s*<script src="\.\.\/assets\/js\/i18n\.js[^"]*"[^>]*><\/script>/,
    scripts
  );

  if (
    !html.includes('lang-switcher') ||
    !html.includes('footer-inner') ||
    !html.includes('mobile-cta') ||
    !html.includes('id="mobileMenu"')
  ) {
    console.error('INCOMPLETE', f);
    process.exit(2);
  }

  // mobile-menu debe cerrar antes de main
  const mainIdx = html.indexOf('<main');
  const chunk = html.slice(0, mainIdx);
  if (!chunk.includes('mobile-cta')) {
    console.error('mobile-menu truncado en', f);
    process.exit(3);
  }

  fs.writeFileSync(p, html);
  ok += 1;
  console.log('OK', f);
}

console.log(`DONE ${ok}/${files.length}`);
