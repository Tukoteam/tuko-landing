# Tuko Blog CMS — conexión a `tuko-landing`

Herramienta para publicar el blog de [tukoteam.com](https://tukoteam.com/) sin tocar HTML a mano.  
Publicar = **un commit atómico** en [`Tukoteam/tuko-landing`](https://github.com/Tukoteam/tuko-landing) (Netlify → tukoteam.com).

## Estado

- SEO técnico de fase 1 ya aplicado en el repo (301, canonical limpio, sitemap, sin hreflang falso, GA4).
- Este directorio: **credenciales, contenido estructurado e import/publish scripts**.

## Credenciales (Documento 4) — ~25 min

### 1–3 · GitHub App

1. En GitHub (cuenta/org **Tukoteam**): Settings → Developer settings → GitHub Apps → **New GitHub App**
2. Nombre: `Tuko Blog CMS`. Webhook: **desactivar**.
3. Permissions → Repository → **Contents: Read and write** (Metadata read-only).
4. Where can this GitHub App be installed? → **Only on this account** → instalar solo en **`Tukoteam/tuko-landing`**.
5. Generar private key → guardar como `blog-cms/secrets/github-app.pem`
6. Anotar **App ID** y **Installation ID** (en la URL tras instalar: `.../installations/NNNN`)

### 4–5 · Google (dashboard del Hub CMS)

El Hub (`api.tukoteam.com/tuko-blog-cms`) lee métricas con la misma cuenta de servicio.

1. Google Cloud → habilitar **Search Console API** + **Analytics Data API**
2. Crear service account → bajar JSON → en el servidor:  
   `/opt/tuko-backend/backend/secrets/google-service-account.json`  
   (local opcional: `blog-cms/secrets/google-service-account.json`)
3. Search Console (`sc-domain:tukoteam.com` o URL-prefix): añadir el email de la SA (acceso Completo o Restringido)
4. GA4 → Admin → Property access → **Lector** para esa SA
5. Env en el servidor (`/opt/tuko-backend/.env` y `backend/.env`):
   - `GSC_SITE_URL=sc-domain:tukoteam.com`
   - `GA4_PROPERTY_ID=` ID numérico de propiedad (no `G-XXXX`)
   - `GOOGLE_SERVICE_ACCOUNT_PATH=/app/secrets/google-service-account.json`
6. Recrear contenedor + en el CMS pulsar **Sincronizar**

### Arranque local

```bash
cd blog-cms
cp .env.example .env
# rellenar .env + colocar secrets/github-app.pem

npm run import
npm run simulate   # dry-run
npm run publish    # requiere GitHub App
```

Sin `.pem` / App ID, `simulate` e `import` siguen funcionando sobre ficheros locales.

## Roles (integración Hub)

`owner` | `editor` | `viewer` — mapear a la sesión interna del Hub (`/api/internal`).

## Qué no va aquí

- Claves en git
- Token personal de GitHub (usar App)
- Generación de contenido con IA (fase posterior)
