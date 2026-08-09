/**
 * Verifica canonical limpio, hreflang solo cuando existe /en/ real, sitemap sin .html en blog.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
let errors = 0;

function fail(msg) {
  console.error('✗', msg);
  errors += 1;
}
function ok(msg) {
  console.log('✓', msg);
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
if (/blog\/[^<\s]+\.html/.test(sitemap)) fail('sitemap aún tiene URLs .html de blog');
else ok('sitemap: URLs de blog limpias');
if (/hreflang="en"[^>]*\?lang=en/.test(sitemap) || /\?lang=en/.test(sitemap)) {
  fail('sitemap aún declara hreflang/?lang=en falso');
} else ok('sitemap: sin hreflang EN falso (?lang=en)');
if (fs.existsSync(path.join(root, 'en/blog/index.html'))) {
  if (!sitemap.includes('https://tukoteam.com/en/blog/')) {
    fail('sitemap falta índice EN /en/blog/');
  } else ok('sitemap: incluye /en/blog/');
}

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (/hreflang="en"/.test(index)) fail('index.html aún tiene hreflang en (landing EN real pendiente)');
else ok('index.html: sin hreflang EN (correcto hasta /en/ home)');

const redirects = fs.readFileSync(path.join(root, '_redirects'), 'utf8');
if (!/blog\/:slug\.html/.test(redirects) && !/natrue-x-tuko\.html/.test(redirects)) {
  fail('_redirects sin reglas blog .html → limpia');
} else ok('_redirects: 301 blog .html → limpia');

const blogFiles = fs
  .readdirSync(path.join(root, 'blog'))
  .filter((f) => f.endsWith('.html') && f !== 'index.html' && f !== 'primer-articulo.html');

for (const file of blogFiles) {
  const slug = file.replace(/\.html$/, '');
  const html = fs.readFileSync(path.join(root, 'blog', file), 'utf8');
  const canon = (html.match(/rel="canonical"\s+href="([^"]+)"/) || [])[1];
  if (!canon) {
    fail(`${file}: sin canonical`);
    continue;
  }
  if (canon.endsWith('.html')) fail(`${file}: canonical termina en .html (${canon})`);
  else if (!canon.endsWith(`/blog/${slug}`)) fail(`${file}: canonical inesperado ${canon}`);
  else ok(`${file}: canonical limpio`);

  const enFile = path.join(root, 'en/blog', file);
  const hasEn = fs.existsSync(enFile);
  const hasHreflangEn = /hreflang="en"/.test(html);
  if (hasEn && !hasHreflangEn) fail(`${file}: existe EN pero falta hreflang`);
  else if (!hasEn && hasHreflangEn && /\?lang=en/.test(html)) {
    fail(`${file}: hreflang en falso (?lang=en)`);
  } else if (hasEn && hasHreflangEn) ok(`${file}: hreflang ES↔EN`);
  else ok(`${file}: sin hreflang EN (sin pareja)`);
}

const enDir = path.join(root, 'en/blog');
if (fs.existsSync(enDir)) {
  const enFiles = fs
    .readdirSync(enDir)
    .filter((f) => f.endsWith('.html') && f !== 'index.html');
  for (const file of enFiles) {
    const slug = file.replace(/\.html$/, '');
    const html = fs.readFileSync(path.join(enDir, file), 'utf8');
    const canon = (html.match(/rel="canonical"\s+href="([^"]+)"/) || [])[1];
    if (!canon) fail(`en/${file}: sin canonical`);
    else if (!canon.endsWith(`/en/blog/${slug}`)) fail(`en/${file}: canonical inesperado ${canon}`);
    else ok(`en/${file}: canonical limpio`);
    if (!/hreflang="es"/.test(html)) fail(`en/${file}: falta hreflang es`);
    else ok(`en/${file}: hreflang presente`);
    if (!/lang="en"/.test(html) && !/<html lang="en"/.test(html)) {
      fail(`en/${file}: html lang no es en`);
    }
  }
  ok(`en/blog: ${enFiles.length} post(s) EN`);
}

const analytics = path.join(root, 'assets', 'js', 'blog-analytics.js');
if (!fs.existsSync(analytics)) fail('falta assets/js/blog-analytics.js');
else ok('GA4 blog events presentes');

console.log(errors ? `\n${errors} error(es)` : '\n✓ SEO verify OK');
process.exit(errors ? 1 : 0);
