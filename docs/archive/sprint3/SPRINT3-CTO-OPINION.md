# Opinión CTO — diagnóstico Lovable (Sprint 3)

Fecha: 2026-10-08. Contexto: post merge Sprint 2 (`chore/landing-sprint2` → `main`).

## Veredicto

El diagnóstico de Lovable es **sólido**. La dirección correcta es:

`publish = "site"` + redirects/headers en **una sola fuente** (`netlify.toml`) + **CI** (links / sitemap / hreflang).

No hace falta Astro/Eleventy con ~10 posts. No tocar Shopify/plugin.

## Acuerdo fuerte

- Publicar todo el repo (`publish = "."`) filtra poco → docs/scripts/AGENTS en 200.
- Redirects duplicados (`netlify.toml` + `_redirects`) → deriva.
- `_headers` diverge (Permissions-Policy; CSP solo en toml).
- Natrue: 301 a URL limpia que 404 → crítico (arreglado en PR A con default → `/blog/`).
- i18n = 3 fuentes de verdad → mayor riesgo de mantenimiento a medio plazo.
- Header/footer copiados; `?v=` manual + CSS `immutable` → ya sufrido en prod.
- CI de enlaces/sitemap/hreflang → alto valor para equipo de 2.

## Matices / orden recomendado

| PR | Contenido | Notas |
|----|-----------|--------|
| **A** | Natrue → `/blog/`, retirar `primer-articulo`, quitar redirects zombi | Bugs SEO en prod (este PR) |
| **B** | `publish = "site"` + unificar redirects/headers | Mayor win estructural |
| **C** | CI: links, sitemap, hreflang, drift EN | |
| **D** | partials + `build.mjs` + cache-bust | Build Node mínimo; documentar en AGENTS |
| **E** | i18n JSON único (`src/locales`) | No mezclar con B |

No priorizar “lazy/meta cosmético” ni borrar banners huérfanos antes de lista + OK Joan.

## Decisiones Joan (siguen abiertas salvo default PR A)

1. Natrue: **republicado** como HTML estático ES/EN (2026-10-08). El Hub CMS lo había despublicado el 24-sep; el contenido sigue también en `_to-migrate/blog-cms`.
2. `primer-articulo`: **default aplicado** = retirar + 301 → `/blog/`.
3. OG png vs v8 — pendiente.
4. PDF vs HTML legal — pendiente.
5. Banners huérfanos (redes/emails) — lista antes de borrar.
6. Fuente de `landing-demo/` — ¿dónde vive el src?

## Estructura norte (aprobada)

```text
site/          → único publish
src/           → locales + partials (no público)
scripts/       → generate / sync / check
docs/          → fuera de publish
netlify.toml   → redirects + headers únicos
```
