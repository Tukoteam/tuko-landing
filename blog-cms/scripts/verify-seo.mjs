/**
 * Verifica canonical limpio, ausencia de hreflang falso y sitemap sin .html en blog.
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
if (/hreflang="en"[^>]*\?lang=en/.test(sitemap) || /lang=en/.test(sitemap)) {
  fail('sitemap aún declara hreflang/?lang=en');
} else ok('sitemap: sin hreflang EN falso');

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (/hreflang="en"/.test(index)) fail('index.html aún tiene hreflang en');
else ok('index.html: sin hreflang EN');

const redirects = fs.readFileSync(path.join(root, '_redirects'), 'utf8');
if (!/blog\/:slug\.html/.test(redirects)) fail('_redirects sin regla blog/:slug.html');
else ok('_redirects: 301 blog .html → limpia');

const blogFiles = fs.readdirSync(path.join(root, 'blog')).filter((f) => f.endsWith('.html') && f !== 'index.html' && f !== 'primer-articulo.html');
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
  if (/hreflang="en"/.test(html)) fail(`${file}: hreflang en`);
}

const analytics = path.join(root, 'assets', 'js', 'blog-analytics.js');
if (!fs.existsSync(analytics)) fail('falta assets/js/blog-analytics.js');
else ok('GA4 blog events presentes');

console.log(errors ? `\n${errors} error(es)` : '\n✓ SEO verify OK');
process.exit(errors ? 1 : 0);
