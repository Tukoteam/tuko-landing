# Handoff Lovable — Sprint 3

## Estado

- Natrue ES/EN en `main` y prod (**200**). Bloqueo A.1 **levantado**.
- CTO OK al **PR B**: ver [`SPRINT3-PR-B-CTO-OK.md`](./SPRINT3-PR-B-CTO-OK.md).

## Orden

```text
PR A (+ Natrue) done → PR B site/ (OK CTO) → PR C CI → D partials/?v= → E i18n JSON
```

## PR B — `chore/landing-sprint3-pr-b-site` (implementar ahora)

Un solo tema: Netlify publica solo la superficie pública. Sin frameworks, sin build step, sin i18n JSON, sin partials, sin borrar banners, sin cambiar el texto de la CSP.

1. **Inventario BEFORE:** `scripts/check-surface.sh` (o `.mjs` en Windows) con `BASE_URL`; curl `-sI` a todas las `<loc>` de `sitemap.xml`, todos los `from` de redirects en `netlify.toml` **y** `_redirects`, y rutas internas (`/AGENTS.md`, `/CLAUDE.md`, `/ARCHITECTURE.md`, `/README.md`, `/SEO_NOTES.md`, `/package.json`, `/serve.json`, `/docs/SPRINT3-*.md`, `/scripts/README.md`, `/_to-migrate/README.md`, `/google5360a4cde3647abe.html`). Registrar status, Location, CSP, Permissions-Policy, Cache-Control → `docs/PR-B-inventory-before.txt` (contra `https://tukoteam.com`).

2. **`git mv` → `site/`:** `index.html`, `privacidad.html`, `terminos.html`, `tuko-ai.html`, `en/`, `blog/`, `assets/`, `landing-demo/`, `robots.txt`, `sitemap.xml`, `google5360a4cde3647abe.html`.  
   **Fuera:** `docs/`, `scripts/`, `_to-migrate/`, `*.md`, `package.json`, `serve.json`, `.editorconfig`, `netlify.toml`.

3. **`netlify.toml`:** `publish = "site"`. **Diff** `_redirects` vs toml y fusionar lo que falte (hoy el toml ya tiene `/pages/privacidad|terminos`; `_redirects` puede tener más). Mantener precedencia efectiva actual. Borrar `_redirects` y `_headers`. Headers/CSP del toml **sin cambios byte a byte**.

4. Apuntar los scripts `*.mjs` y `serve.json` / comando local a `site/`.

5. Actualizar `AGENTS.md`, `CLAUDE.md`, `ARCHITECTURE.md`, `README.md`.

6. Orphans: crear `docs/ORPHAN-ASSETS.md` (lista), **no borrar**.

7. Inventario AFTER (Deploy Preview) → `docs/PR-B-inventory-after.txt` + diff en la descripción del PR.

**Aceptación:** URLs públicas idénticas; internos 200→404; Natrue ES/EN 200 y `.html`→301; formulario Netlify detectado; sin `_redirects`/`_headers` en el repo.

**Antes de abrir el PR:** mostrar inventario BEFORE + diff **excluyendo renames puros**.

**Checklist humano al merge:** Google verify dentro de `site/`; Publish directory de la UI Netlify no pisa el toml; Hub/`export-shell-for-cms` no escribe en la raíz antigua; rollback = revert del merge.

## Fuera de B (C/D/E)

- compra-colectiva solo ES; `?v=` desalineados; CI; partials; i18n JSON.

## Prompt corto (pegar)

> CTO OK al PR B (`docs/SPRINT3-PR-B-CTO-OK.md`). Natrue no tocar. Diff real `_redirects` vs toml. Inventario BEFORE + diff sin renames antes de abrir el PR. Orphans solo listados. Rama `chore/landing-sprint3-pr-b-site`.
