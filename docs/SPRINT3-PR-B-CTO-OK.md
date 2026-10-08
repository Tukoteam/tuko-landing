# Sprint 3 — PR B OK (CTO)

Aprobado implementar **PR B** (`publish = "site"`):

1. Mover HTML/assets/blog/en/demo a `site/`; `publish = "site"`.
2. Unificar redirects + headers en `netlify.toml`; quitar `_redirects` / `_headers`.
3. Scripts + `serve.json` → `site/`.
4. Inventario before/after; listar orphans **sin borrar** (OK de Joan).
5. No tocar texto CSP; no frameworks; OG/legales huérfanos para Joan.

Tras merge: en Netlify UI confirmar Publish directory = `site` (o confiar en `netlify.toml`).
