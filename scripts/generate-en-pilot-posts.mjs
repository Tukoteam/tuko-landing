/**
 * Genera posts EN piloto (natrue-x-tuko, shiji-incubator) con HTML real en /en/blog/.
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
    .replace(/\\u2019/g, '’');
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

  const catalog = [
    ...articles,
    {
      slug: p.slug,
      locale: 'es',
      status: 'published',
      title,
      publishedAt: p.publishedAt,
      category: p.category,
    },
  ];
  const html = render.renderPostHtml(article, {
    articles: catalog,
    sibling: { slug: p.slug, locale: 'es', status: 'published' },
  });
  fs.writeFileSync(path.join(enDir, `${p.slug}.html`), html);
  fs.writeFileSync(
    path.join(contentDir, `${p.slug}.en.json`),
    `${JSON.stringify(render.toRepoContentJson(article), null, 2)}\n`
  );
  store.saveArticle(article);
  console.log('OK', p.slug, title.slice(0, 48), 'words=', words);
}

let index = render.bootstrapEnIndexHtml();
for (const a of articles) index = render.upsertCardInIndex(index, a);
fs.writeFileSync(path.join(enDir, 'index.html'), index);

let sm = fs.readFileSync(path.join(landing, 'sitemap.xml'), 'utf8');
sm = render.ensureSitemapEnIndex(sm);
for (const a of articles) sm = render.upsertSitemap(sm, a);
fs.writeFileSync(path.join(landing, 'sitemap.xml'), sm);

for (const p of posts) {
  const esPath = path.join(landing, 'blog', `${p.slug}.html`);
  if (!fs.existsSync(esPath)) continue;
  let html = fs.readFileSync(esPath, 'utf8');
  const esUrl = `https://tukoteam.com/blog/${p.slug}`;
  const enUrl = `https://tukoteam.com/en/blog/${p.slug}`;
  const links = [
    `<link rel="alternate" hreflang="es" href="${esUrl}">`,
    `<link rel="alternate" hreflang="en" href="${enUrl}">`,
    `<link rel="alternate" hreflang="x-default" href="${esUrl}">`,
  ].join('\n');
  html = html.replace(/<!-- hreflang EN retirado[\s\S]*?-->\n?/i, '');
  html = html.replace(/<link rel="alternate" hreflang="[^"]+" href="[^"]*">\n?/gi, '');
  if (!html.includes('hreflang="en"')) {
    html = html.replace(/(<link rel="canonical" href="[^"]+">)/i, `$1\n${links}`);
  }
  if (!/data-url-en=/.test(html)) {
    html = html.replace(/<html([^>]*)>/i, (_m, attrs) => {
      let a = attrs || '';
      if (!/\blang=/.test(a)) a += ' lang="es"';
      return `<html${a} data-url-es="${esUrl}" data-url-en="${enUrl}">`;
    });
  } else {
    html = html.replace(/data-url-en="[^"]*"/, `data-url-en="${enUrl}"`);
  }
  html = html.replace(/i18n\.js\?v=[^"]+/g, 'i18n.js?v=20260809a');
  fs.writeFileSync(esPath, html);
  console.log('patched ES', p.slug);
}

console.log('done');
