/**
 * Alinea header/footer/theme de artículos del blog con la landing
 * (menú Cómo funciona…, theme toggle, footer 4 cols centrado).
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const shellPath = path.resolve(
  root,
  '..',
  'plugin-tuko-git',
  'backend',
  'src',
  'services',
  'blogCms',
  'shellFragments.js'
);
const { ARTICLE_HEADER, ARTICLE_FOOTER, ARTICLE_SCRIPTS } = require(shellPath);

const THEME_BOOT =
  '<script>(function(){try{var t=localStorage.getItem("tuko_theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();</script>';
const THEME_CSS =
  '<link rel="stylesheet" href="/assets/css/tuko-theme.css?v=20261003j">';

function localizeEn(fragment) {
  return String(fragment || '')
    .replace(/href="\.\.\/index\.html#([^"]+)"/g, 'href="/en/#$1"')
    .replace(/href="\.\.\/index\.html"/g, 'href="/en/"')
    .replace(/href="\.\.\/tuko-ai"/g, 'href="/en/tuko-ai"')
    .replace(/href="\/blog\/"/g, 'href="/en/blog/"')
    .replace(/>Cómo funciona</g, '>How it works<')
    .replace(/>Por qué funciona</g, '>Why it works<')
    .replace(/>Precios</g, '>Pricing<')
    .replace(/>Acceder al piloto</g, '>Join the pilot<')
    .replace(/>Producto</g, '>Product<')
    .replace(/>Idioma</g, '>Language<')
    .replace(/>Contacto</g, '>Contact<')
    .replace(/>Legales</g, '>Legal<')
    .replace(/>Política de privacidad</g, '>Privacy policy<')
    .replace(/>Términos y condiciones</g, '>Terms and conditions<')
    .replace(
      />Un cliente entra\. Trae a otro\. Los dos compran\.</g,
      '>One customer walks in. Brings another. Both buy.<'
    )
    .replace(
      />© 2026 Tuko\. Todos los derechos reservados\.</g,
      '>© 2026 Tuko. All rights reserved.<'
    )
    .replace(/aria-label="Navegación principal"/g, 'aria-label="Main navigation"')
    .replace(/aria-label="Abrir menú"/g, 'aria-label="Open menu"')
    .replace(/aria-label="Selector de idioma"/g, 'aria-label="Language selector"')
    .replace(/aria-label="Menú de navegación"/g, 'aria-label="Navigation menu"')
    .replace(/aria-label="Activar modo oscuro"/g, 'aria-label="Switch to dark mode"')
    .replace(/data-active="es"/g, 'data-active="en"')
    .replace(
      /(<button type="button" class="lang-opt) active(" data-lang="es")/g,
      '$1$2'
    )
    .replace(
      /(<button type="button" class="lang-opt)(" data-lang="en")/g,
      '$1 active$2'
    );
}

function patchFile(filePath, isEn) {
  let html = fs.readFileSync(filePath, 'utf8');
  const header = isEn ? localizeEn(ARTICLE_HEADER) : ARTICLE_HEADER;
  const footer = isEn ? localizeEn(ARTICLE_FOOTER) : ARTICLE_FOOTER;
  const scripts = ARTICLE_SCRIPTS;

  // Header + mobile menu (hasta <main)
  html = html.replace(
    /<header\b[\s\S]*?(?=<main\b)/i,
    `${header.trim()}\n\n`
  );

  // Footer
  if (/<!--\s*FOOTER\s*-->[\s\S]*?<\/footer>/i.test(html)) {
    html = html.replace(/<!--\s*FOOTER\s*-->[\s\S]*?<\/footer>/i, footer.trim());
  } else {
    html = html.replace(/<footer\b[\s\S]*?<\/footer>/i, footer.replace(/^<!-- FOOTER -->\s*/, '').trim());
  }

  // Theme boot script
  if (!html.includes('tuko_theme')) {
    html = html.replace(
      /(<meta\s+name="viewport"[^>]*>)/i,
      `$1\n${THEME_BOOT}`
    );
  }

  // Theme CSS
  if (!html.includes('tuko-theme.css')) {
    html = html.replace(
      /(<link\s+rel="stylesheet"\s+href="[^"]*blog\.css[^"]*">)/i,
      `$1\n${THEME_CSS}`
    );
    if (!html.includes('tuko-theme.css')) {
      html = html.replace(
        /(<link\s+rel="stylesheet"\s+href="[^"]*main\.css[^"]*">)/i,
        `$1\n${THEME_CSS}`
      );
    }
  }

  // Cache-bust main.css for footer center
  html = html.replace(
    /href="(\/?assets\/css\/main\.css)\?v=[^"]+"/g,
    'href="$1?v=20261008a"'
  );

  // Scripts: ensure theme + absolute paths
  const scriptsBlock = scripts.trim();
  if (/<script[^>]*src="[^"]*main\.js[^"]*"[\s\S]*?<\/body>/i.test(html)) {
    html = html.replace(
      /(?:<script[^>]*src="[^"]*(?:main|i18n|tuko-theme)\.js[^"]*"[^>]*><\/script>\s*)+(?=<\/body>)/i,
      `${scriptsBlock}\n`
    );
  } else {
    html = html.replace(/<\/body>/i, `${scriptsBlock}\n</body>`);
  }

  fs.writeFileSync(filePath, html);
  console.log('patched', path.relative(root, filePath));
}

const esDir = path.join(root, 'site', 'blog');
const enDir = path.join(root, 'site', 'en', 'blog');

for (const f of fs.readdirSync(esDir)) {
  if (!f.endsWith('.html') || f === 'index.html') continue;
  patchFile(path.join(esDir, f), false);
}
if (fs.existsSync(enDir)) {
  for (const f of fs.readdirSync(enDir)) {
    if (!f.endsWith('.html') || f === 'index.html') continue;
    patchFile(path.join(enDir, f), true);
  }
}

console.log('done');
