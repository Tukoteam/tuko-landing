# Scripts — tuko-landing

Herramientas Node locales. **Netlify no ejecuta** estos scripts (`publish = "site"`, sin `command`). Leen/escriben bajo `site/`.

## Recurrentes

| Script | Uso |
|--------|-----|
| `build-site.mjs` | Concat CSS/JS parts + partials + `?v=` hash |
| `check-site.mjs` | CI: enlaces, sitemap, hreflang, paridad ES/EN, `?v=` |
| `check-surface.mjs` | Inventario HEAD de URLs |
| `generate-en-home.mjs` | Regenera `site/en/index.html` |
| `generate-en-legal.mjs` | Regenera legales EN |
| `generate-en-tuko-ai.mjs` | Regenera `site/en/tuko-ai.html` |
| `generate-en-blog-complete.mjs` | Posts EN del blog |
| `sync-en-blog-shell.mjs` / `sync-en-blog-articles.mjs` | Shell EN blog |
| `sync-blog-article-shell.mjs` | Shell artículos ES |
| `optimize-images.mjs` | WebP / `-800w` |
| `export-shell-for-cms.mjs` | Shell HTML para Blog CMS (Hub) |

```bash
npm run build
npm run check:site
npm run generate:en-home
```

`scripts/tools/og-render.html` — utilidad OG local (no es publish).
