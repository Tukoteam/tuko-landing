/**
 * Genera / actualiza TODAS las versiones EN del blog (salvo primer-articulo).
 * - en/blog/{slug}.html + blog-cms/content/{slug}.en.json
 * - índice EN, sitemap, redirects
 * - hreflang + data-url-* en cada post ES emparejado
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landing = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);
const cmsRoot = path.resolve(
  landing,
  '../plugin-tuko-main/plugin-tuko-main/backend/src/services/blogCms'
);
const render = require(path.join(cmsRoot, 'render.js'));
const store = require(path.join(cmsRoot, 'store.js'));

const i18nSrc = fs.readFileSync(path.join(landing, 'assets/js/i18n.js'), 'utf8');
const enStart = i18nSrc.indexOf('en: {');
const enBlock = i18nSrc.slice(enStart, i18nSrc.indexOf('\n};', enStart));

function grab(key) {
  const re = new RegExp(
    `${key}:\\s*'((?:\\\\'|[^'])*)'|${key}:\\s*"((?:\\\\"|[^"])*)"`
  );
  const m = enBlock.match(re);
  if (!m) return '';
  const raw = m[1] != null ? m[1] : m[2];
  return raw
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\u201c/g, '“')
    .replace(/\\u201d/g, '”')
    .replace(/\\u2019/g, '’')
    .replace(/\\u2013/g, '–');
}

function bodyFromKeys(keys) {
  const parts = [];
  let listBuf = [];
  const flushList = () => {
    if (!listBuf.length) return;
    parts.push(`<ul>\n${listBuf.join('\n')}\n</ul>`);
    listBuf = [];
  };
  for (const k of keys) {
    const t = grab(k);
    if (!t) continue;
    if (k.includes('_li')) {
      listBuf.push(`<li>${t}</li>`);
      continue;
    }
    flushList();
    if (k.includes('_h2_')) parts.push(`<h2>${t}</h2>`);
    else if (!k.includes('_title') && !k.includes('_meta')) parts.push(`<p>${t}</p>`);
  }
  flushList();
  return parts.join('\n');
}

function patchEsPost(slug, hasEn) {
  const esPath = path.join(landing, 'blog', `${slug}.html`);
  if (!fs.existsSync(esPath)) return;
  let html = fs.readFileSync(esPath, 'utf8');
  const esUrl = `https://tukoteam.com/blog/${slug}`;
  const enUrl = hasEn
    ? `https://tukoteam.com/en/blog/${slug}`
    : 'https://tukoteam.com/en/blog/';

  html = html.replace(/<!-- hreflang EN retirado[\s\S]*?-->\n?/i, '');
  html = html.replace(/<link rel="alternate" hreflang="[^"]+" href="[^"]*">\n?/gi, '');

  if (hasEn) {
    const links = [
      `<link rel="alternate" hreflang="es" href="${esUrl}">`,
      `<link rel="alternate" hreflang="en" href="${enUrl}">`,
      `<link rel="alternate" hreflang="x-default" href="${esUrl}">`,
    ].join('\n');
    if (!html.includes('hreflang="en"')) {
      html = html.replace(/(<link rel="canonical" href="[^"]+">)/i, `$1\n${links}`);
    }
  }

  if (/data-url-en=/.test(html)) {
    html = html.replace(/data-url-es="[^"]*"/, `data-url-es="${esUrl}"`);
    html = html.replace(/data-url-en="[^"]*"/, `data-url-en="${enUrl}"`);
  } else {
    html = html.replace(/<html([^>]*)>/i, (_m, attrs) => {
      let a = attrs || '';
      if (!/\blang=/.test(a)) a += ' lang="es"';
      a = a.replace(/\sdata-url-es="[^"]*"/, '').replace(/\sdata-url-en="[^"]*"/, '');
      return `<html${a} data-url-es="${esUrl}" data-url-en="${enUrl}">`;
    });
  }

  html = html.replace(/i18n\.js\?v=[^"]+/g, 'i18n.js?v=20260809b');
  fs.writeFileSync(esPath, html);
  console.log('patched ES', slug, hasEn ? '↔ EN' : '→ /en/blog/');
}

const posts = [
  {
    slug: 'natrue-x-tuko',
    titleKey: 'natrue_title',
    description: 'How natural cosmetics and group buying can go hand in hand.',
    publishedAt: '2026-03-17',
    category: 'novedades',
    keys: [
      'natrue_h2_1', 'natrue_p1', 'natrue_p2', 'natrue_p3',
      'natrue_h2_2', 'natrue_p4', 'natrue_p5', 'natrue_p6', 'natrue_li1', 'natrue_li2', 'natrue_p7', 'natrue_p8',
      'natrue_h2_3', 'natrue_p9', 'natrue_p10', 'natrue_p11', 'natrue_p12',
      'natrue_h2_4', 'natrue_p13', 'natrue_p14', 'natrue_p15', 'natrue_p16',
      'natrue_h2_5', 'natrue_p17', 'natrue_p18', 'natrue_p19', 'natrue_p20', 'natrue_p21',
      'natrue_h2_6', 'natrue_p22', 'natrue_p23', 'natrue_p24', 'natrue_p25', 'natrue_p26',
    ],
  },
  {
    slug: 'gran-paso-tuko',
    titleKey: 'granpaso_title',
    description: 'Shopify prototype, presence in Switzerland and new team connections.',
    publishedAt: '2026-02-19',
    category: 'novedades',
    keys: [
      'granpaso_p1',
      'granpaso_h2_1', 'granpaso_p2', 'granpaso_p3',
      'granpaso_h2_2', 'granpaso_p4', 'granpaso_p5',
      'granpaso_h2_3', 'granpaso_p6', 'granpaso_p7', 'granpaso_p8', 'granpaso_p9',
      'granpaso_h2_4', 'granpaso_p10', 'granpaso_p11',
    ],
  },
  {
    slug: 'new-formulas-shanghai',
    titleKey: 'newformulas_title',
    description: 'Pitching Tuko in Shanghai to founders and investors.',
    publishedAt: '2025-11-14',
    category: 'eventos',
    keys: [
      'newformulas_p1', 'newformulas_p2',
      'newformulas_h2_1', 'newformulas_p3', 'newformulas_p4', 'newformulas_p5', 'newformulas_p6',
      'newformulas_h2_2', 'newformulas_p7', 'newformulas_p8', 'newformulas_p9', 'newformulas_p10',
      'newformulas_h2_3', 'newformulas_p11', 'newformulas_p12', 'newformulas_p13', 'newformulas_p14',
    ],
  },
  {
    slug: 'ocea-hub-shanghai',
    titleKey: 'ocea_title',
    description: 'Tuko on stage at OCEA HUB in Shanghai.',
    publishedAt: '2025-10-20',
    category: 'eventos',
    keys: [
      'ocea_p1',
      'ocea_h2_1', 'ocea_p2', 'ocea_p3', 'ocea_p4',
      'ocea_h2_2', 'ocea_p5', 'ocea_p6',
      'ocea_h2_3', 'ocea_p7',
    ],
  },
  {
    slug: 'spain-innovation-day',
    titleKey: 'spain_title',
    description: 'Spanish startups, ICEX and connections across Asia.',
    publishedAt: '2025-09-30',
    category: 'eventos',
    keys: [
      'spain_p1',
      'spain_h2_1', 'spain_p2', 'spain_p3',
      'spain_h2_2', 'spain_p4',
      'spain_h2_3', 'spain_p5', 'spain_p6',
    ],
  },
  {
    slug: 'stron-tech-trek',
    titleKey: 'stron_title',
    description: "Inside China's tech ecosystem with Xiji Incubator.",
    publishedAt: '2025-09-23',
    category: 'eventos',
    keys: [
      'stron_p1',
      'stron_h2_1', 'stron_p2',
      'stron_h2_2', 'stron_p3', 'stron_p4',
      'stron_h2_3', 'stron_p5', 'stron_p6',
    ],
  },
  {
    slug: 'shiji-incubator',
    titleKey: 'shiji_title',
    description: 'We start our journey at Xiji Incubator Shanghai.',
    publishedAt: '2025-09-10',
    category: 'eventos',
    keys: [
      'shiji_p1', 'shiji_p2', 'shiji_p3', 'shiji_p4',
      'shiji_h2_1', 'shiji_p5', 'shiji_p6', 'shiji_p7', 'shiji_p8',
      'shiji_h2_2', 'shiji_p9', 'shiji_p10',
      'shiji_h2_3', 'shiji_p11', 'shiji_p12',
    ],
  },
];

const enDir = path.join(landing, 'en/blog');
const contentDir = path.join(landing, 'blog-cms/content');
fs.mkdirSync(enDir, { recursive: true });
fs.mkdirSync(contentDir, { recursive: true });

const articles = [];
for (const p of posts) {
  let cover = null;
  const esHtmlPath = path.join(landing, 'blog', `${p.slug}.html`);
  if (fs.existsSync(esHtmlPath)) {
    const h = fs.readFileSync(esHtmlPath, 'utf8');
    const og = h.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (og) cover = og[1];
  }
  const bodyHtml = bodyFromKeys(p.keys);
  const title = grab(p.titleKey);
  if (!title || !bodyHtml) {
    console.error('SKIP incomplete', p.slug, { title: !!title, body: bodyHtml.length });
    continue;
  }
  const words = bodyHtml.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const article = {
    id: `${p.slug}.en`,
    slug: p.slug,
    locale: 'en',
    translationOf: p.slug,
    status: 'published',
    title,
    metaTitle: title,
    description: p.description,
    bodyHtml,
    category: p.category,
    mins: Math.max(1, Math.round(words / 220)),
    author: 'Tuko Team',
    tags: [],
    coverImage: cover,
    publishedAt: p.publishedAt,
    updatedAt: new Date().toISOString(),
  };
  articles.push(article);
  console.log('built', p.slug, 'words=', words);
}

const catalog = [
  ...articles,
  ...articles.map((a) => ({
    slug: a.slug,
    locale: 'es',
    status: 'published',
    title: a.title,
    publishedAt: a.publishedAt,
    category: a.category,
    coverImage: a.coverImage,
    mins: a.mins,
    author: 'Equipo Tuko',
  })),
];

for (const article of articles) {
  const html = render.renderPostHtml(article, {
    articles: catalog,
    sibling: { slug: article.slug, locale: 'es', status: 'published' },
  });
  fs.writeFileSync(path.join(enDir, `${article.slug}.html`), html);
  fs.writeFileSync(
    path.join(contentDir, `${article.slug}.en.json`),
    `${JSON.stringify(render.toRepoContentJson(article), null, 2)}\n`
  );
  store.saveArticle(article);
}

let index = render.bootstrapEnIndexHtml();
// newest first for grid
const byDate = [...articles].sort((a, b) =>
  String(b.publishedAt).localeCompare(String(a.publishedAt))
);
for (const a of byDate) index = render.upsertCardInIndex(index, a);
fs.writeFileSync(path.join(enDir, 'index.html'), index);

let sm = fs.readFileSync(path.join(landing, 'sitemap.xml'), 'utf8');
sm = render.ensureSitemapEnIndex(sm);
for (const a of articles) sm = render.upsertSitemap(sm, a);
fs.writeFileSync(path.join(landing, 'sitemap.xml'), sm);

const enSlugs = new Set(articles.map((a) => a.slug));
const allEs = fs
  .readdirSync(path.join(landing, 'blog'))
  .filter((f) => f.endsWith('.html') && f !== 'index.html')
  .map((f) => f.replace(/\.html$/, ''));

for (const slug of allEs) {
  patchEsPost(slug, enSlugs.has(slug));
}

// redirects
const redirectsPath = path.join(landing, '_redirects');
let redirects = fs.readFileSync(redirectsPath, 'utf8');
if (!redirects.includes('/en/blog/index.html')) {
  redirects += '\n/en/blog/index.html                         /en/blog/                              301!\n';
}
for (const slug of enSlugs) {
  const line = `/en/blog/${slug}.html`;
  if (!redirects.includes(line)) {
    redirects += `/en/blog/${slug}.html                 /en/blog/${slug}                 301!\n`;
  }
}
fs.writeFileSync(redirectsPath, redirects);

// netlify.toml — append missing EN redirects if needed
const netlifyPath = path.join(landing, 'netlify.toml');
let netlify = fs.readFileSync(netlifyPath, 'utf8');
for (const slug of enSlugs) {
  const from = `/en/blog/${slug}.html`;
  if (!netlify.includes(from)) {
    netlify += `
[[redirects]]
  from = "${from}"
  to = "/en/blog/${slug}"
  status = 301
  force = true
`;
  }
}
if (!netlify.includes('from = "/en/blog/index.html"')) {
  netlify += `
[[redirects]]
  from = "/en/blog/index.html"
  to = "/en/blog/"
  status = 301
  force = true
`;
}
fs.writeFileSync(netlifyPath, netlify);

console.log('DONE', articles.length, 'EN posts');
