# Handoff Lovable — Sprint 3

## Orden (bloqueante)

```text
PR A (mergeado) → PR A.1 Natrue → PR B site/ → PR C CI → D/E después
```

### PR A.1 — Natrue republicado (ahora)

Rama: `chore/landing-sprint3-pr-a1-natrue`.

Los commits de republicación se pushearon **después** del merge del PR #4; no entraron en `main`. Este PR los cherry-pickea:

- `blog/natrue-x-tuko.html` + `en/blog/natrue-x-tuko.html`
- Cards en índices + sitemap
- Redirects `.html` → URL limpia (ya no 301 a `/blog/`)

**No empieces PR B hasta que A.1 esté mergeado y preview dé 200** en `/blog/natrue-x-tuko` y `/en/blog/natrue-x-tuko`.

### PR B — superficie `site/` (después de A.1)

1. Inventario curl BEFORE (prod) → `docs/PR-B-INVENTORY-before.txt`.
2. `git mv` a `site/`: HTML públicos, `en/`, `blog/`, `assets/`, `landing-demo/`, `robots.txt`, `sitemap.xml`, `google5360…html`.
3. `publish = "site"`; unificar redirects/headers en `netlify.toml`; borrar `_redirects` y `_headers`. CSP del toml sin cambiar el texto.
4. Actualizar scripts + `serve` para `site/`.
5. Actualizar `AGENTS.md` / `ARCHITECTURE.md` / `README.md`.
6. Inventario AFTER (preview) + diff en el PR.

**Fuera de alcance B:** i18n JSON, partials/build, borrar banners, cambiar CSP.

**Nota:** `compra-colectiva-ecommerce` **sí está** en `sitemap.xml` en main; revalidar en inventario, no asumir huérfana.

### PR C — CI (después)

Links internos, sitemap vs ficheros, hreflang, drift EN.

---

## Prompt listo para Lovable (tras merge A.1)

> A.1 Natrue ya en main y 200 en preview. Implementa **solo PR B** (`chore/landing-sprint3-pr-b-site`) según `docs/SPRINT3-LOVABLE-HANDOFF.md`. Inventario before/after. Un PR = un tema. Muéstrame inventario BEFORE y el diff excluyendo renames puros antes de abrir el PR.
