/**
 * Exporta header/footer del blog index a un módulo CommonJS
 * que usa el Blog CMS del Hub (render.js).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const index = fs.readFileSync(
  path.resolve(__dirname, '..', 'blog', 'index.html'),
  'utf8'
);

let header = index.match(/<header role="banner">[\s\S]*?(?=<main\b)/)[0].trimEnd();
const footer = index.match(/<!-- FOOTER -->\s*<footer>[\s\S]*?<\/footer>/)[0];

// Logo inline enorme → favicon (mismo look, HTML ligero para commits del CMS)
header = header.replace(
  /<img src="data:image\/png;base64,[^"]+"[^>]*>/,
  '<img src="../assets/favicon.svg" alt="tuko" width="120" height="40" decoding="async">'
);

const out = path.resolve(
  __dirname,
  '..',
  '..',
  'plugin-tuko-main',
  'plugin-tuko-main',
  'backend',
  'src',
  'services',
  'blogCms',
  'shellFragments.js'
);

const body = `/**
 * Shell compartido con blog/index.html (banderas + footer-inner).
 * Generado por tuko-landing/scripts/export-shell-for-cms.mjs — no editar a mano.
 */
module.exports = {
  ARTICLE_HEADER: ${JSON.stringify(header + '\n')},
  ARTICLE_FOOTER: ${JSON.stringify(footer)},
  ARTICLE_SCRIPTS: ${JSON.stringify(
    '<script src="../assets/js/main.js?v=20260731o" defer></script>\n<script src="../assets/js/i18n.js?v=20260804c" defer></script>'
  )},
};
`;

fs.writeFileSync(out, body);
console.log('Wrote', out, 'header', header.length, 'footer', footer.length);
