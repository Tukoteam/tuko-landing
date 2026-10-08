/**
 * One-shot: write src/partials from current site chrome (absolute paths).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'src', 'partials');
fs.mkdirSync(outDir, { recursive: true });

const themeHead = `<script>(function(){try{var t=localStorage.getItem("tuko_theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();</script>`;

const navEs = `<!-- NAV -->
<header role="banner">
<nav aria-label="Navegación principal">
  <a href="/" class="nav-logo">
    <img src="/assets/images/tuko-logo-nav.webp" width="840" height="321" alt="Tuko" decoding="async">
  </a>
  <ul class="nav-links">
    <li><a href="/#como-funciona" data-i18n="nav_link_como_funciona">Cómo funciona</a></li>
    <li><a href="/#beneficios" data-i18n="nav_link_beneficios">Por qué funciona</a></li>
    <li><a href="/#precios" data-i18n="nav_link_precios">Precios</a></li>
    <li><a href="/blog/" data-i18n="nav_link_blog">Blog</a></li>
    <li><a href="/tuko-ai" data-i18n="nav_link_ia">tuko AI</a></li>
    <li><a href="/#solicitud" class="nav-cta" data-i18n="nav_cta">Acceder al piloto</a></li>
  </ul>
  <button type="button" class="theme-toggle" id="themeToggle" aria-label="Activar modo oscuro" aria-pressed="false">
    <svg class="theme-icon theme-icon--moon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    <svg class="theme-icon theme-icon--sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
  </button>
  <button class="nav-hamburger" id="navHamburger" aria-label="Abrir menú" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
  <div class="lang-switcher" role="group" aria-label="Selector de idioma" data-active="es">
    <span class="lang-thumb" aria-hidden="true"></span>
    <button type="button" class="lang-opt active" data-lang="es" aria-label="Cambiar idioma a Español">
      <span class="lang-opt-flag" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="22" height="15"><rect width="3" height="2" fill="#c60b1e"/><rect width="3" height="1" y="0.5" fill="#ffc400"/></svg>
      </span>
      <span class="lang-opt-label">ES</span>
    </button>
    <button type="button" class="lang-opt" data-lang="en" aria-label="Switch language to English">
      <span class="lang-opt-flag" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="22" height="15"><path fill="#012169" d="M0 0h60v30H0z"/><path stroke="#fff" stroke-width="6" d="M0 0l60 30M60 0L0 30"/><path stroke="#C8102E" stroke-width="4" d="M0 0l60 30M60 0L0 30"/><path stroke="#fff" stroke-width="10" d="M30 0v30M0 15h60"/><path stroke="#C8102E" stroke-width="6" d="M30 0v30M0 15h60"/></svg>
      </span>
      <span class="lang-opt-label">EN</span>
    </button>
  </div>
</nav>
</header>

<!-- MOBILE MENU -->
<div class="mobile-menu" id="mobileMenu" role="dialog" aria-label="Menú de navegación" aria-hidden="true">
  <a href="/#como-funciona" data-i18n="nav_link_como_funciona">Cómo funciona</a>
  <a href="/#beneficios" data-i18n="nav_link_beneficios">Por qué funciona</a>
  <a href="/#precios" data-i18n="nav_link_precios">Precios</a>
  <a href="/blog/" data-i18n="nav_link_blog">Blog</a>
  <a href="/tuko-ai" data-i18n="nav_link_ia">tuko AI</a>
  <div class="mobile-lang">
    <p class="mobile-lang-label" data-i18n="nav_lang_label">Idioma</p>
    <div class="lang-switcher mobile-lang-switcher" role="group" aria-label="Selector de idioma" data-active="es">
      <span class="lang-thumb" aria-hidden="true"></span>
      <button type="button" class="lang-opt active" data-lang="es" aria-label="Cambiar idioma a Español">
        <span class="lang-opt-flag" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="22" height="15"><rect width="3" height="2" fill="#c60b1e"/><rect width="3" height="1" y="0.5" fill="#ffc400"/></svg>
        </span>
        <span class="lang-opt-label">ES</span>
      </button>
      <button type="button" class="lang-opt" data-lang="en" aria-label="Switch language to English">
        <span class="lang-opt-flag" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="22" height="15"><path fill="#012169" d="M0 0h60v30H0z"/><path stroke="#fff" stroke-width="6" d="M0 0l60 30M60 0L0 30"/><path stroke="#C8102E" stroke-width="4" d="M0 0l60 30M60 0L0 30"/><path stroke="#fff" stroke-width="10" d="M30 0v30M0 15h60"/><path stroke="#C8102E" stroke-width="6" d="M30 0v30M0 15h60"/></svg>
        </span>
        <span class="lang-opt-label">EN</span>
      </button>
    </div>
  </div>
  <a href="/#solicitud" class="mobile-cta" data-i18n="nav_cta">Acceder al piloto</a>
</div>`;

const navEn = navEs
  .replace(/data-active="es"/g, 'data-active="en"')
  .replace(/class="lang-opt active" data-lang="es"/g, 'class="lang-opt" data-lang="es"')
  .replace(/class="lang-opt" data-lang="en"/g, 'class="lang-opt active" data-lang="en"')
  .replace(/href="\/#/g, 'href="/en/#')
  .replace(/href="\/blog\/"/g, 'href="/en/blog/"')
  .replace(/href="\/tuko-ai"/g, 'href="/en/tuko-ai"')
  .replace(/href="\/"/g, 'href="/en/"')
  .replace(/aria-label="Navegación principal"/g, 'aria-label="Main navigation"')
  .replace(/aria-label="Abrir menú"/g, 'aria-label="Open menu"')
  .replace(/aria-label="Selector de idioma"/g, 'aria-label="Language selector"')
  .replace(/aria-label="Menú de navegación"/g, 'aria-label="Navigation menu"')
  .replace(/aria-label="Activar modo oscuro"/g, 'aria-label="Switch to dark mode"')
  .replace(/>Cómo funciona</g, '>How it works<')
  .replace(/>Por qué funciona</g, '>Why it works<')
  .replace(/>Precios</g, '>Pricing<')
  .replace(/>Acceder al piloto</g, '>Join the pilot<')
  .replace(/>Idioma</g, '>Language<');

// Pull footer SVG+structure from blog index, normalize absolute links
const blogIndex = fs.readFileSync(path.join(root, 'site/blog/index.html'), 'utf8');
const footM = blogIndex.match(/<!-- FOOTER -->\s*<footer>[\s\S]*?<\/footer>/);
if (!footM) throw new Error('footer missing');
let footerEs = footM[0]
  .replace(/href="\.\.\/index\.html#precios"/g, 'href="/#precios"')
  .replace(/href="\.\.\/index\.html"/g, 'href="/"')
  .replace(/href="\.\.\/"/g, 'href="/"');
const footerEn = footerEs
  .replace(/href="\/#precios"/g, 'href="/en/#precios"')
  .replace(/href="\/"/g, 'href="/en/"')
  .replace(/href="\/privacidad"/g, 'href="/en/privacidad"')
  .replace(/href="\/terminos"/g, 'href="/en/terminos"')
  .replace(
    />Descuentos por objetivo para tiendas Shopify\. Vende más unidades sin regalar margen\.</g,
    '>Goal-based discounts for Shopify stores. Sell more units without giving away margin.<'
  )
  .replace(/>Contacto</g, '>Contact<')
  .replace(/>Producto</g, '>Product<')
  .replace(/>Precios</g, '>Pricing<')
  .replace(/>Legales</g, '>Legal<')
  .replace(/>Política de privacidad</g, '>Privacy policy<')
  .replace(/>Términos y condiciones</g, '>Terms and conditions<')
  .replace(
    />© 2026 Tuko\. Todos los derechos reservados\.</g,
    '>© 2026 Tuko. All rights reserved.<'
  );

fs.writeFileSync(path.join(outDir, 'theme-head.html'), themeHead + '\n');
fs.writeFileSync(path.join(outDir, 'nav-es.html'), navEs + '\n');
fs.writeFileSync(path.join(outDir, 'nav-en.html'), navEn + '\n');
fs.writeFileSync(path.join(outDir, 'footer-es.html'), footerEs + '\n');
fs.writeFileSync(path.join(outDir, 'footer-en.html'), footerEn + '\n');
console.log('wrote partials to', outDir);
