# AGENTS.md — tuko-landing

Guía para agentes / CTO trabajando en este repo.

## Realidad del proyecto

- Sitio **estático** en **Netlify** (`publish = "site"`). Solo se publica la carpeta `site/`.
- Producto: botón Shopify de compra en pareja / grupo (no WooCommerce en este sitio).
- Contacto público preferido en producto: `joan@tukoteam.com` (algunos HTML pueden aún mostrar emails antiguos; no “arreglar” legales sin OK).
- Equipo: 2 personas. Org GitHub: **Tukoteam**.

## No tocar (salvo tarea explícita)

- Diseño visual, copy de marketing, comportamiento del widget embebido en demos.
- App / plugin / backend / Shopify (`plugin-tuko`).
- “Arreglar” el Blog CMS: vive en el Hub (`plugin-tuko` backend), no en esta landing.
- Borrar assets listados en `docs/ORPHAN-ASSETS.md` sin OK de Joan.

## Convenciones

- Nombres de assets: **kebab-case**, sin espacios ni mayúsculas.
- Imágenes: WebP preferido; max ~1600px desktop + `-800w` para banners; `loading="lazy"` fuera del LCP.
- OG: hoy conviven `site/assets/og-image.png` y `site/assets/og-image-v8.png` — unificar solo con OK de Joan.
- Hosting: **única** fuente de redirects/headers → `netlify.toml`. No reintroducir `_redirects`, `_headers` ni `.htaccess`.
- GA4 solo tras consentimiento (`tuko_cookie_consent=accepted`); banner en home + legales + `tuko-ai`.
- Scripts recurrentes: ver `scripts/README.md` / `package.json` (leen/escriben bajo `site/`).
- CI local: `npm run check:site` (enlaces, sitemap, hreflang, paridad ES/EN, sin `_redirects`/`_headers`). Workflow: `.github/workflows/landing-checks.yml`.
- Preview local: `npx serve .` (usa `serve.json` → `public: "site"`).
- Posts ES-only (`compra-colectiva-ecommerce`): no inventar EN; selector EN → `/en/blog/`.
- Natrue: `/blog/natrue-x-tuko` (+ EN). `primer-articulo`: 301 → `/blog/`.

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
src/partials/   ← nav/footer/theme-head (no publicado); editar aquí el chrome
docs/           ← no publicado
scripts/        ← no publicado
netlify.toml    ← redirects + headers
```

## Build (PR D)

- Chrome compartido vive en `src/partials/` (`nav-es`, `nav-en`, `footer-es`, `footer-en`, `theme-head`).
- Marcadores en HTML: `<!-- tuko:partial:NAME -->…<!-- /tuko:partial:NAME -->`.
- Tras editar partials o CSS/JS: `npm run build` (inyecta partials + `?v=` = hash del asset).
- Luego, si tocas shell del blog: `npm run sync:blog-shell` y `npm run sync:en-blog-articles`.
- CI / antes de push: `npm run build && npm run check:site`.

- Home: `site/index.html` + `site/assets/css/home.css` + `site/assets/js/home-*.js`
- i18n resto: `site/assets/js/i18n.js` + árbol `site/en/`
- Legales canónicos: `/privacidad`, `/terminos` (HTML en `site/`)

## Flujo

1. Rama desde `main`.
2. Cambios + commits claros.
3. PR → merge → Netlify deploy.
4. Preview Netlify para redirects y assets. Comprobar que `/AGENTS.md` da **404**.
