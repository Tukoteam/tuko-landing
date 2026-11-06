/**
 * Exporta nav, footer, estilos y modo noche de los artículos a un módulo CommonJS
 * que usa el Blog CMS del Hub (render.js), para que lo publicado sea igual que la web.
 *
 * Uso: npm run export:cms-shell [ruta a tuko-platform]
 * Ejecutar tras `npm run build` cuando cambie el nav, el footer o sus estilos.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(__dirname, '..', 'site');
const platform = process.argv[2] || path.resolve(__dirname, '..', '..', 'tuko-platform');
const out = path.join(platform, 'apps', 'api', 'src', 'services', 'blogCms', 'shellFragments.js');

const SAMPLE = 'compra-colectiva-ecommerce.html';

function must(match, what) {
  if (!match) throw new Error(`No encuentro ${what}`);
  return match[0];
}

function fragments(file) {
  const html = fs.readFileSync(file, 'utf8');
  return {
    header: `${must(html.match(/<header role="banner">[\s\S]*?(?=<main\b)/), 'el header').trimEnd()}\n`,
    footer: must(html.match(/<!-- FOOTER -->\s*<footer>[\s\S]*?<\/footer>/), 'el footer'),
    themeBoot: must(html.match(/<script>\(function\(\)\{try\{var t=localStorage\.getItem\("tuko_theme"\)[^\n]*<\/script>/), 'el arranque del tema'),
    styles: ['main', 'tuko-theme', 'blog']
      .map((name) => must(html.match(new RegExp(`<link rel="stylesheet" href="/assets/css/${name}\\.css[^>]*>`)), `${name}.css`))
      .join('\n'),
    scripts: ['main', 'tuko-theme', 'i18n']
      .map((name) => must(html.match(new RegExp(`<script src="/assets/js/${name}\\.js[^>]*></script>`)), `${name}.js`))
      .join('\n'),
  };
}

const es = fragments(path.join(site, 'blog', SAMPLE));
const en = fragments(path.join(site, 'en', 'blog', SAMPLE));

const body = `/**
 * Shell compartido con los artículos de la web: nav, footer, estilos y modo noche.
 * Generado por tuko-landing/scripts/export-shell-for-cms.mjs — no editar a mano.
 */
module.exports = {
  ARTICLE_HEADER: ${JSON.stringify(es.header)},
  ARTICLE_FOOTER: ${JSON.stringify(es.footer)},
  ARTICLE_HEADER_EN: ${JSON.stringify(en.header)},
  ARTICLE_FOOTER_EN: ${JSON.stringify(en.footer)},
  ARTICLE_THEME_BOOT: ${JSON.stringify(es.themeBoot)},
  ARTICLE_STYLES: ${JSON.stringify(es.styles)},
  ARTICLE_SCRIPTS: ${JSON.stringify(es.scripts)},
};
`;

fs.writeFileSync(out, body);
console.log(`Shell exportado a ${out}`);
