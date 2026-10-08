# Handoff Lovable — siguientes PRs (tras PR A)

Copia esto en Lovable cuando PR A esté mergeado:

---

Eres el asistente de ingeniería del equipo **Tuko**. Repo: `tuko-landing` (landing estática Netlify, tukeros.com/tukoteam.com). Yo soy el CTO. **Solo landing.** Sin frameworks nuevos ni reescrituras grandes. Sin tocar Shopify/plugin.

**Ya hecho (PR A):** Natrue y `primer-articulo` → 301 a `/blog/`; eliminados redirects zombi `/_versiones/*` y `/_originales-png/*`. Opinión CTO en `docs/SPRINT3-CTO-OPINION.md`.

**Implementa en PRs separados, en este orden:**

### PR B — superficie `site/` (prioridad)
1. Mover lo publicable a `site/` y `publish = "site"`.
2. Unificar redirects + headers en `netlify.toml`; borrar `_redirects` y `_headers`.
3. Quitar reglas zombi restantes si quedan. Inventario curl before/after en preview Netlify.
4. No tocar CSP salvo unificar la fuente (mismo texto que hoy en `netlify.toml`).

### PR C — CI
5. GitHub Action: enlaces internos, sitemap vs ficheros, hreflang → destino existente.
6. Comprobar que `en/` regenerado no deriva (o fallar CI).

### PR D / E — después
7. Partials header/footer + `npm run build` (cache-bust `?v=` por hash).
8. i18n: `src/locales/*.json` como única fuente; EN generado con cabecera GENERATED.

**Restricciones:** un PR = un tema; diffs pequeños; no borrar banners/assets sin listarlos y esperar OK; no cambiar copy legal sin marcarlo.

Empieza por **PR B**. No implementes D/E en el mismo PR.

---
