# Scripts — tuko-landing

Herramientas Node locales. **Netlify no ejecuta** estos scripts (`publish = "site"`, sin `command`). Leen/escriben bajo `site/`.

## Recurrentes (en `scripts/`)

| Script | Uso |
|--------|-----|
| `generate-en-home.mjs` | Regenera `site/en/index.html` desde ES + i18n |
| `generate-en-legal.mjs` | Regenera `site/en/privacidad.html` y `site/en/terminos.html` |
| `generate-en-tuko-ai.mjs` | Regenera `site/en/tuko-ai.html` |
| `generate-en-blog-complete.mjs` | Genera/actualiza posts EN del blog |
| `generate-en-pilot-posts.mjs` | Posts piloto EN (natrue, shiji, …) |
| `sync-en-blog-shell.mjs` | Sincroniza shell/nav/footer de `site/en/blog/*` |
| `sync-blog-article-shell.mjs` | Sincroniza shell de artículos ES |
| `optimize-images.mjs` | Comprime / genera WebP y variantes `-800w` |
| `export-shell-for-cms.mjs` | Exporta shell HTML para el CMS (`_to-migrate`) |
| `check-surface.mjs` | Inventario HEAD de URLs (publish hygiene) |
| `check-site.mjs` | CI: enlaces internos, sitemap, hreflang, paridad ES/EN |

```bash
npm run generate:en-home
npm run generate:en-legal
npm run optimize:images
```

## Archivo (`scripts/_archive/`)

One-shots ya aplicados (no correr salvo recuperación):

- `add-srcset.mjs` — añadió srcset a banners
- `extract-home-assets.mjs` — extrajo CSS/JS de home
- `fix-images-phase3.mjs` — kebab + compresión fase 3
- `fix-legal-root-pages.mjs` — legales en raíz
- `fix-skip-link.mjs` — skip link a11y
- `patch-article-back-meta.mjs` — meta “atrás” en artículos
- `reapply-cleanup-after-merge.mjs` — reaplicar cleanup tras merge redesign
- `restore-related-articles.mjs` — bloques “más artículos”
