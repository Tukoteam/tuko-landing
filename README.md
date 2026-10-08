# tuko-landing

Landing pública de **Tuko** ([tukoteam.com](https://tukoteam.com)): sitio estático HTML/CSS/JS servido por **Netlify** desde la raíz del repo.

Repo: `Tukoteam/tuko-landing` (org GitHub Tukoteam). Equipo pequeño (2 personas).

## Qué hay aquí

| Ruta | Contenido |
|------|-----------|
| `index.html` / `en/index.html` | Home ES / EN |
| `blog/`, `en/blog/` | Artículos estáticos |
| `privacidad.html`, `terminos.html` (+ `en/`) | Legales canónicos |
| `tuko-ai.html` / `en/tuko-ai.html` | Página tuko AI |
| `assets/css`, `assets/js`, `assets/images` | Estilos, scripts, media |
| `landing-demo/` | Iframes de demos del home (sí se publica) |
| `_to-migrate/` | Material fuera de la landing (p. ej. blog-cms). No usar en producción |
| `netlify.toml`, `_redirects`, `_headers` | Hosting Netlify |

## Probar en local

```bash
# Desde la raíz del repo
npx --yes serve -l 5173 .
# o: python -m http.server 5173
```

Abre `http://localhost:5173/`. Las rutas limpias (`/privacidad`) solo aplican en Netlify; en local usa `privacidad.html`.

## Despliegue

- Provider: **Netlify** (equipo de Joan).
- Publish directory: raíz (`.`).
- Sin build command.
- Push a la rama conectada (normalmente `main`) dispara el deploy.
- Trabaja en ramas (`chore/…`, `feat/…`) y abre PR; no empujar limpiezas directas a `main` sin revisión.

## Editar contenido

- **Home ES/EN**: markup en `index.html` / `en/index.html`; estilos `assets/css/home.css`; lógica `assets/js/home-animations.js`, `home-ui.js` (incl. textos i18n del home).
- **Resto ES/EN**: `assets/js/i18n.js` (`data-i18n`) + páginas bajo `en/`.
- **Imágenes**: kebab-case, preferir WebP; banners del blog en `assets/images/banners-blog/` con variantes `-800w.webp`.
- **Cookies / GA4**: `assets/js/cookie-consent.js` + `ga4-loader.js` (GA4 solo tras aceptar).

## Convención de ramas

- `main` — producción.
- Feature/chore en ramas cortas; 1 commit pequeño por tarea cuando sea limpieza.
