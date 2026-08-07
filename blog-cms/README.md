# Tuko Blog CMS — conexión a `pre-landing`

Herramienta para publicar el blog de [tukoteam.com](https://tukoteam.com/) sin tocar HTML a mano.  
Publicar = **un commit atómico** en este mismo repositorio (`desarollotuko/pre-landing`).

## Estado

- SEO técnico de fase 1 ya aplicado en el repo (301, canonical limpio, sitemap, sin hreflang falso, GA4 events).
- Escaparate UI: abre `../` no — usa el archivo `VER EL CMS.html` del briefing, o integra en Tuko Hub (fase 4).
- Este directorio: **credenciales, contenido estructurado e import/publish scripts**.

## Credenciales (Documento 4) — ~25 min

### 1–3 · GitHub App

1. Org → Settings → Developer settings → GitHub Apps → **New GitHub App**
2. Nombre: `Tuko Blog CMS`. Webhook: desactivar.
3. Permissions → Repository → **Contents: Read and write** (Metadata read-only).
4. Install only on this account → instalar solo en **`desarollotuko/pre-landing`**.
5. Generar private key → guardar como `secrets/github-app.pem`
6. Anotar **App ID** y **Installation ID** (URL `.../installations/NNNN`)

### 4–5 · Google (opcional para dashboard)

- Habilitar: Search Console API, Analytics Data API, Web Search Indexing API
- Service account JSON → `secrets/google-service-account.json`
- Dar acceso Completo en Search Console + Lector en GA4
- `GA4_PROPERTY_ID` = ID numérico de propiedad (no `G-XXXX`)

### Arranque local

```bash
cd blog-cms
cp .env.example .env
# rellenar .env + colocar secrets/

npm install   # cuando exista package.json del motor CMS
node scripts/import-from-repo.mjs
node scripts/simulate-publish.mjs   # dry-run
node scripts/publish.mjs            # requiere GitHub App
```

Sin `.pem` / App ID, `simulate-publish` y `import` siguen funcionando sobre ficheros locales.

## Roles (integración Hub)

`owner` | `editor` | `viewer` — mapear a la sesión interna del Hub (`/api/internal`).

## Qué no va aquí

- Claves en git
- Token personal de GitHub (usar App)
- Generación de contenido con IA (fase posterior)
