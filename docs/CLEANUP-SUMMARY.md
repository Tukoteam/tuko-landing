# Landing cleanup — resumen

## Sprint 1 (`chore/landing-cleanup`) — historial

Ver commits en `main` (gitignore, GA4 consent, legales canónicos, `_to-migrate`, WebP/kebab, home CSS/JS externos, docs).

- **Antes:** ~51.85 MB media → **Después:** ~1.95 MB (~50 MB ahorro)

## Sprint 3 — PR A (SEO roto)

- Docs: `docs/SPRINT3-CTO-OPINION.md`, `docs/SPRINT3-LOVABLE-HANDOFF.md`.
- Natrue (ES/EN, limpia + `.html`) → **301 `/blog/`** / **`/en/blog/`** (ya no a URL 404).
- `blog/primer-articulo.html` **retirado**; URLs → 301 `/blog/`.
- Eliminados redirects zombi `/_versiones/*` y `/_originales-png/*`.
- Siguiente: PR B `publish = "site"` (ver handoff Lovable).

## Sprint 2 (`chore/landing-sprint2`) — mergeado a main

### Commits

1. `fix: document GA4 cookies in privacy pages`
2. `chore: remove tracked .DS_Store files`
3. `chore: normalize CLAUDE.md to UTF-8 and add .editorconfig`
4. `chore: remove unused og-image versions`
5. `perf: move inline home PNG to cached WebP asset`
6. `chore: finish kebab-case image and logo renames`
7. `chore: archive one-shot scripts and document recurring ones`
8. `feat: add cookie consent to legal and tuko-ai pages`
9. `fix: avoid broken en hreflang for ES-only blog posts`
10. (+ T10) link-check fixes + Lighthouse/docs

### Qué se hizo

| T | Resumen |
|---|---------|
| T1 | Privacidad ES/EN: § cookies/GA4 + `TukoOpenCookiePreferences` (`<!-- REVISAR LEGAL -->`) |
| T2 | `.DS_Store` untracked + 404 Netlify |
| T3 | Tokens en `AGENTS.md`; `CLAUDE.md` stub UTF-8; `.editorconfig` |
| T4 | Borrados `og-image-v2`…`v7`; `og-render.html` → `docs/`; quedan png + v8 |
| T5 | Base64 home → `assets/images/tuko-logo-nav.webp` |
| T6 | Showcase/icons/logos/banners kebab |
| T7 | One-shots → `scripts/_archive/`; `scripts/README.md`; `package.json` |
| T8 | Consent + GA4 en 6 páginas legales/`tuko-ai` |
| T9 | ES-only posts: hreflang es/x-default; EN selector → `/en/blog/` |
| T10 | Linkinator 0 rotos internos (local + `serve.json` cleanUrls); Lighthouse doc |

### Assets

- Media bajo `assets/`: ~**2.06 MB** / 62 ficheros (post sprint 2).
- OG restantes: `og-image.png` (~220 KB), `og-image-v8.png` (~142 KB) — **no unificados**.

### Link check (local)

- `npx serve` + `serve.json` (`cleanUrls`) + linkinator: **0 rotos internos**.
- Sitemap: 23 `<loc>`, sin Natrue, sin EN 404.
- Fixes en T10: `asset-08-1.svg` refs; Grand View URL absoluta; hrefs blog absolutas (`/blog/…`); related Natrue → `/blog/` (HTML Natrue no publicado).

### Lighthouse

Ver [`docs/LIGHTHOUSE-2026-10.md`](./LIGHTHOUSE-2026-10.md). Homes ~63–64 Perf; blog/artículo/tuko-ai ~80–84. No se optimizó Perf en este sprint.

### Decisiones para Joan

1. **OG definitiva:** ¿`og-image.png` o `og-image-v8.png`?
2. **PDF vs HTML privacidad:** HTML ya documenta GA4; PDF no editado — ¿actualizar PDF / validación legal?
3. **EN `compra-colectiva-ecommerce`:** ¿traducir o dejar ES-only?
4. **`primer-articulo`:** retirado (301 → `/blog/`). Reabrir solo si se quiere como post real.
5. **Banners huérfanos:** `tuko-banner-youtube-*`, `tuko-miniatura-es-*`, `chatgpt-image-*`, etc. — ¿borrar?
6. **Natrue:** default 301 → `/blog/`. ¿Republicar desde CMS?
7. **Validación legal** del bloque `<!-- REVISAR LEGAL -->` en privacidad.
8. **PR B:** OK para mover a `site/` + unificar redirects.
