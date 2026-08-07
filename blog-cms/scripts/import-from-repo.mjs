/**
 * Importa artículos HTML de /blog a content/*.json (fuente de verdad).
 * No requiere credenciales.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const blogDir = path.join(root, 'blog');
const outDir = path.join(root, 'blog-cms', 'content');

const SKIP = new Set(['index.html', 'primer-articulo.html']);

function stripTags(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extract(html, slug) {
  const title = (html.match(/<title>([^<]+)<\/title>/i) || [])[1]?.replace(/\s*—\s*Blog Tuko$/, '').trim() || slug;
  const desc = (html.match(/name="description"\s+content="([^"]*)"/i) || [])[1] || '';
  const canonical = (html.match(/rel="canonical"\s+href="([^"]*)"/i) || [])[1] || `https://tukoteam.com/blog/${slug}`;
  const published = (html.match(/"datePublished":\s*"([^"]+)"/) || [])[1] || new Date().toISOString().slice(0, 10);
  const main = (html.match(/<main[\s\S]*?<\/main>/i) || [])[0] || '';
  const bodyHtml = main.replace(/^<main[^>]*>/i, '').replace(/<\/main>$/i, '').trim();
  const wordCount = stripTags(bodyHtml).split(/\s+/).filter(Boolean).length;

  return {
    slug,
    status: 'published',
    title,
    description: desc,
    canonical,
    locale: 'es',
    datePublished: published,
    dateModified: published,
    author: { type: 'Organization', name: 'Tuko' },
    wordCount,
    bodyHtml,
    seo: {
      canonicalClean: true,
      noFakeHreflang: true,
    },
  };
}

fs.mkdirSync(outDir, { recursive: true });
const files = fs.readdirSync(blogDir).filter((f) => f.endsWith('.html') && !SKIP.has(f));
const index = [];

for (const file of files) {
  const slug = file.replace(/\.html$/, '');
  const html = fs.readFileSync(path.join(blogDir, file), 'utf8');
  const doc = extract(html, slug);
  const out = path.join(outDir, `${slug}.json`);
  fs.writeFileSync(out, JSON.stringify(doc, null, 2), 'utf8');
  index.push({ slug, title: doc.title, status: doc.status, datePublished: doc.datePublished, wordCount: doc.wordCount });
  console.log('imported', slug, `(${doc.wordCount} words)`);
}

fs.writeFileSync(path.join(outDir, '_index.json'), JSON.stringify({ importedAt: new Date().toISOString(), articles: index }, null, 2));
console.log(`\n✓ ${index.length} artículos → blog-cms/content/`);
