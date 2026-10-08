# CTO OK — PR B (`publish = "site"`)

Fecha: 2026-10-08. Tras revisión Lovable (nota 6/10) y verificación en prod/`main`.

## Veredicto

**6/10 es justo.** La superficie pública se ve profesional; con `publish = "."` el repo no.

**PR B aprobado.** Orden confirmado: B → C (CI) → D (partials/`?v=`) → E (i18n JSON). Sin framework.

## Evidencia comprobada

- Natrue ES/EN → 200; AGENTS.md → 200 (fuga).
- Redirects dobles; `_headers` sin CSP alineada.
- `?v=` desalineados (Natrue vs home) → **PR D**, no B.
- compra-colectiva: en sitemap; deuda = **solo ES** → C/E, no B.

## Condiciones al implementar B

1. Diff real `_redirects` vs `netlify.toml` antes de borrar (el toml ya tiene `/pages/privacidad|terminos`; no asumir que solo `_redirects` tiene `/pages/*`).
2. CSP del toml **byte a byte**.
3. Orphans → solo `docs/ORPHAN-ASSETS.md`, **sin borrar**.
4. Natrue: no tocar (ya OK).
5. Inventario BEFORE (prod) + AFTER (preview) en la descripción del PR; diff humano **sin renames puros**.
6. Checklist humano: Netlify UI Publish directory no fijado a `.` pisando el toml.

## Smoke post-preview (CTO)

Home, blog, Natrue ES/EN, privacidad, formulario piloto; `/AGENTS.md` y `/docs/...` → **404**.

## Mensaje a Lovable

> OK al PR B. Natrue ya está bien; no lo toques. Fusiona redirects con diff real `_redirects` vs toml (no asumir que `/pages/*` solo está en un lado). Muéstrame inventario BEFORE + diff sin renames antes de abrir el PR. Orphans solo en `docs/ORPHAN-ASSETS.md`, sin borrar.
