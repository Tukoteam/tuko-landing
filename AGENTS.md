# AGENTS.md — tuko-landing

Guía para agentes / CTO trabajando en este repo.

## Realidad del proyecto

- Sitio **estático** en **Netlify** (`publish = "."`).
- Producto: botón Shopify de compra en pareja / grupo (no WooCommerce en este sitio).
- Contacto público preferido en producto: `joan@tukoteam.com` (algunos HTML pueden aún mostrar emails antiguos; no “arreglar” legales sin OK).
- Equipo: 2 personas. Org GitHub: **Tukoteam**.

## No tocar (salvo tarea explícita)

- Diseño visual, copy de marketing, comportamiento del widget embebido en demos.
- App / plugin / backend / Shopify (`plugin-tuko`).
- “Arreglar” el CMS: vive en `_to-migrate/blog-cms/` y no se publica.

## Convenciones

- Nombres de assets: **kebab-case**, sin espacios ni mayúsculas.
- Imágenes: WebP preferido; max ~1600px desktop + `-800w` para banners; `loading="lazy"` fuera del LCP.
- OG: hoy conviven `assets/og-image.png` y `assets/og-image-v8.png` (homes usan v8; resto png) — unificar solo con OK de Joan.
- Hosting: fuente de verdad `netlify.toml` + `_redirects` + `_headers`. No reintroducir `.htaccess`.
- GA4 solo tras consentimiento (`tuko_cookie_consent=accepted`); banner en home + legales + `tuko-ai`.
- Scripts recurrentes: ver `scripts/README.md` / `package.json`. One-shots en `scripts/_archive/`.
- Preview local: `npx serve .` (usa `serve.json` cleanUrls). Commits pequeños; no push a `main` sin OK.
- Posts ES-only (`compra-colectiva-ecommerce`): no inventar EN; selector EN → `/en/blog/`.
- Natrue: publicado en `/blog/natrue-x-tuko` (+ EN). `primer-articulo`: 301 → `/blog/`. Ver `docs/SPRINT3-CTO-OPINION.md`.
- Siguiente win estructural: `publish = "site"` (PR B). No publicar docs/scripts desde la raíz.

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

- Home: `index.html` + `assets/css/home.css` + `assets/js/home-*.js`
- i18n resto: `assets/js/i18n.js` + árbol `en/`
- Legales canónicos: `/privacidad`, `/terminos` (root HTML; `/pages/*` redirige)

## Flujo

1. Rama desde `main`.
2. Cambios + commits claros.
3. PR → merge → Netlify deploy.
4. Preview Netlify para redirects y assets.
