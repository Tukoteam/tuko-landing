/**
 * Restaura la sección "Más artículos" al final de cada post del blog.
 * Uso: node scripts/restore-related-articles.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const blogDir = path.join(root, 'blog');
const indexPath = path.join(blogDir, 'index.html');

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

function parseCards(indexHtml) {
  const cards = [];
  const re = /<article class="bp-card"[^>]*>([\s\S]*?)<\/article>/gi;
  let m;
  while ((m = re.exec(indexHtml))) {
    const block = m[0];
    const href =
      (block.match(/href="([^"]+)"/) || [])[1] ||
      '';
    const slug = href.replace(/\.html$/i, '').split('/').pop();
    if (!slug || slug === 'index') continue;
    const title =
      (block.match(/bp-title"><a[^>]*>([\s\S]*?)<\/a>/) || [])[1]?.replace(/<[^>]+>/g, '').trim() ||
      slug;
    const img = (block.match(/<img[^>]+src="([^"]+)"/) || [])[1] || '';
    const meta =
      (block.match(/bp-meta">\s*<span[^>]*>([\s\S]*?)<\/span>/) || [])[1]?.replace(/<[^>]+>/g, '').trim() ||
      '';
    const mins = Number((block.match(/data-mins="(\d+)"/) || [])[1] || 5);
    const date = (block.match(/data-date="([^"]+)"/) || [])[1] || '';
    const cat = (block.match(/data-cat="([^"]+)"/) || [])[1] || '';
    cards.push({ slug, title, img, meta, mins, date, cat });
  }
  return cards;
}

function pickRelated(currentSlug, cards, limit = 3) {
  const current = cards.find((c) => c.slug === currentSlug);
  const pool = cards.filter((c) => c.slug !== currentSlug);
  const same = current?.cat
    ? pool.filter((c) => c.cat === current.cat).sort((a, b) => b.date.localeCompare(a.date))
    : [];
  const rest = pool
    .filter((c) => !same.includes(c))
    .sort((a, b) => b.date.localeCompare(a.date));
  return [...same, ...rest].slice(0, limit);
}

function buildSection(related) {
  if (!related.length) return '';
  const cards = related
    .map((a) => {
      const href = escapeAttr(a.slug);
      const title = escapeHtml(a.title);
      const img = escapeAttr(a.img);
      const meta = escapeHtml(a.meta || '');
      const mins = Math.max(1, Number(a.mins) || 5);
      return `    <a class="article-related-card" href="${href}">
      <span class="article-related-media">
        <img src="${img}" alt="${title}" width="800" height="500" loading="lazy" decoding="async">
      </span>
      <span class="article-related-card-meta">
        <span>${meta}</span>
        <span aria-hidden="true"> · </span>
        <span>${mins} min</span>
      </span>
      <span class="article-related-card-name">${title}</span>
    </a>`;
    })
    .join('\n');

  return `
  <section class="article-related" aria-labelledby="article-related-heading">
    <h2 class="article-related-title" id="article-related-heading" data-i18n="article_related">Más artículos</h2>
    <div class="article-related-grid">
${cards}
    </div>
  </section>
`;
}

function injectRelated(html, section) {
  // Quitar bloque previo si existía
  let out = html.replace(
    /\s*<section class="article-related"[\s\S]*?<\/section>\s*/i,
    '\n'
  );
  if (/<\/main>/i.test(out)) {
    return out.replace(/<\/main>/i, `${section}</main>`);
  }
  // Fallback: antes del footer
  if (/<!--\s*FOOTER\s*-->/i.test(out)) {
    return out.replace(/<!--\s*FOOTER\s*-->/i, `${section}\n<!-- FOOTER -->`);
  }
  return out;
}

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const catalog = parseCards(indexHtml);
if (!catalog.length) {
  console.error('No se encontraron cards en blog/index.html');
  process.exit(1);
}

const files = fs
  .readdirSync(blogDir)
  .filter((f) => f.endsWith('.html') && f !== 'index.html');

let updated = 0;
for (const file of files) {
  const slug = file.replace(/\.html$/i, '');
  // Skip preview/CMS-only drafts not in index
  if (!catalog.some((c) => c.slug === slug) && slug !== 'blog-cms-prueba' && slug !== 'primer-articulo') {
    console.log('skip (not in index):', file);
    continue;
  }
  const related = pickRelated(slug, catalog, 3);
  const section = buildSection(related);
  if (!section) {
    console.log('skip (no related):', file);
    continue;
  }
  const full = path.join(blogDir, file);
  const prev = fs.readFileSync(full, 'utf8');
  const next = injectRelated(prev, section);
  if (next !== prev) {
    fs.writeFileSync(full, next, 'utf8');
    updated += 1;
    console.log('OK', file, '→', related.map((r) => r.slug).join(', '));
  } else {
    console.log('unchanged', file);
  }
}

console.log(`Done. Updated ${updated} files.`);
