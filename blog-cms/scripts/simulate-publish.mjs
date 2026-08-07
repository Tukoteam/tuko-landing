/**
 * Simula qué ficheros tocaría una publicación (sin escribir en GitHub).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const contentDir = path.join(root, 'blog-cms', 'content');

const articles = fs.readdirSync(contentDir)
  .filter((f) => f.endsWith('.json') && f !== '_index.json')
  .map((f) => f.replace(/\.json$/, ''));

console.log('tuko · CMS simulate-publish\n');
console.log('Repo: desarollotuko/pre-landing@main');
console.log(`Artículos en content/: ${articles.length}\n`);
console.log('Ficheros que tocaría un republish completo (commit atómico):\n');

const files = [
  'sitemap.xml',
  'blog/index.html',
  ...articles.map((s) => `blog/${s}.html`),
  ...articles.map((s) => `blog-cms/content/${s}.json`),
];

for (const f of files) {
  const abs = path.join(root, f);
  const exists = fs.existsSync(abs);
  console.log(`  ${exists ? 'M' : 'A'}  ${f}`);
}

console.log('\n✓ Simulación OK — nada escrito en remoto.');
console.log('Para publicar de verdad: configurar secrets/ + .env y npm run publish');
