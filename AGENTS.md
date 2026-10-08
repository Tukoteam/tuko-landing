# AGENTS.md — tuko-landing (v1.0)

Guía para agentes / CTO trabajando en este repo.

## Realidad del proyecto

- Sitio **estático** en **Netlify** (`publish = "site"`). Solo se publica la carpeta `site/`.
- Producto: botón Shopify de compra en pareja / grupo (no WooCommerce en este sitio).
- Contacto público preferido en producto: `joan@tukoteam.com` (algunos HTML pueden aún mostrar emails antiguos; no “arreglar” legales sin OK).
- Equipo: 2 personas. Org GitHub: **Tukoteam**.
- **v1.0** = `main` etiquetado `v1.0.0` (hygiene + splits CSS/JS + árbol limpio).

## No tocar (salvo tarea explícita)

- Diseño visual, copy de marketing, comportamiento del widget embebido en demos.
- App / plugin / backend / Shopify (`plugin-tuko`).
- “Arreglar” el Blog CMS: vive en el Hub (`plugin-tuko` backend), no en esta landing.
- Unificar OG dual (`og-image.png` / `og-image-v8.png`) sin OK de Joan.

## Convenciones

- Nombres de assets: **kebab-case**, sin espacios ni mayúsculas.
- Imágenes: WebP preferido; max ~1600px desktop + `-800w` para banners; `loading="lazy"` fuera del LCP.
- Hosting: **única** fuente de redirects/headers → `netlify.toml`. No reintroducir `_redirects`, `_headers` ni `.htaccess`.
- GA4 solo tras consentimiento (`tuko_cookie_consent=accepted`); banner en home + legales + `tuko-ai`.
- CI local: `npm run check:site` (enlaces, sitemap, hreflang, paridad ES/EN, `?v=` únicos). Workflow: `.github/workflows/landing-checks.yml`.
- Preview local: `npx serve .` (usa `serve.json` → `public: "site"`).
- Posts ES-only (`compra-colectiva-ecommerce`): no inventar EN; selector EN → `/en/blog/`.
- Natrue: `/blog/natrue-x-tuko` (+ EN). `primer-articulo`: 301 → `/blog/`.

### Límite de líneas (mantenibilidad)

- Ficheros **editables** nuevos o tocados: **&lt;1000 líneas**.
- **Exentos:** bundles vendor (`landing-demo/**/three-*.js`) y HTML one-shot de demos (`landing-demo/animaciones/**`).
- CSS/JS grandes viven en partes bajo `site/assets/css/{home,theme,main,tuko-ai}/` y `site/assets/js/{home-ui,home-ui-en,home-animations,home-animations-en}/`. `npm run build` **concatena** esas partes en los entry `home.css`, `main.css`, `tuko-theme.css`, `tuko-ai.css`, `home-ui*.js`, `home-animations*.js` (no editar a mano los entry generados).
- Home chrome/secciones: `src/partials/` (`nav-*`, `footer-*`, `theme-head`, `home-hero-*`, `home-faq-*`). Tras build, `site/index.html` puede superar 1000 por expansión de partials; editar partials, no duplicar en HTML.

## Tokens de diseño

```css
--blue: #3D50F2;
--blue-light: #E0E7FF;
--green: #14C492;
--gray-1: #F2F2F2;
--black: #1a1a1a;
```

Fuente: Mona Sans. Títulos con peso alto; párrafos ligeros (`font-weight: 300`).

## Estructura útil

```text
site/           ← ÚNICO publish (HTML, assets, blog, en, demo, sitemap…)
src/partials/   ← nav/footer/theme-head/hero/FAQ (no publicado)
docs/           ← Lighthouse + audit v1 (no publicado)
scripts/        ← build / check / generate / sync (no publicado)
netlify.toml    ← redirects + headers
```

## Build

- Marcadores: `<!-- tuko:partial:NAME -->…<!-- /tuko:partial:NAME -->` o `<!-- tuko:include:NAME -->`.
- `npm run build` → concat CSS/JS parts + inyecta partials + `?v=` = hash sha256[0:8] del asset.
- Tras tocar shell del blog: `npm run sync:blog-shell` y `npm run sync:en-blog-articles`, luego otra vez `npm run build`.
- Antes de push: `npm run build && npm run check:site` → **0 errores, 0 warnings `?v=`**.

## i18n / hosting (essentials)

- Home ES: `site/index.html` + `home.css` / `home-*.js`. Resto EN: árbol `site/en/` + generadores `npm run generate:en-*`.
- Legales canónicos: `/privacidad`, `/terminos` (HTML en `site/`). Dark mode: `tuko-theme.css`.
- Redirects/headers solo en `netlify.toml`. CSP/notas SEO: mantener en Netlify + `check-site`; no reintroducir docs históricos de sprint.

## Flujo

1. Rama desde `main` (solo `main` a largo plazo).
2. Cambios + commits claros.
3. PR → merge → Netlify deploy.
4. Preview Netlify. Comprobar que `/AGENTS.md` da **404**.
