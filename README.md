# tuko-landing

Landing pública de **Tuko** ([tukoteam.com](https://tukoteam.com)): sitio estático HTML/CSS/JS en **Netlify**.

Repo: `Tukoteam/tuko-landing`. Equipo pequeño (2 personas). **v1.0** (`tag v1.0.0`).

## Estructura

| Ruta | Contenido |
|------|-----------|
| `site/` | **Única superficie publicada** (`publish = "site"`) |
| `site/index.html`, `site/en/` | Home ES / EN |
| `site/blog/`, `site/en/blog/` | Artículos |
| `site/privacidad.html`, `site/terminos.html` | Legales |
| `site/tuko-ai.html` | Página tuko AI |
| `site/assets/` | CSS, JS, media (editar parts; entries los genera el build) |
| `site/landing-demo/` | Iframes del home |
| `src/partials/` | HTML compartido (nav, footer, hero, FAQ…) — no publicado |
| `docs/`, `scripts/`, `*.md` | No publicados |
| `netlify.toml` | Redirects + headers (única fuente) |

- Flujo día a día (corto): [`docs/FLUJO-DIARIO.md`](docs/FLUJO-DIARIO.md)
- Guía de carpetas: [`docs/GUIA-REPO-SIMPLE.md`](docs/GUIA-REPO-SIMPLE.md)

## Probar en local

```bash
npx --yes serve -l 5173 .
```

`serve.json` apunta a `public: "site"`. Abre `http://localhost:5173/`.

Tras editar partials o parts de CSS/JS:

```bash
npm run build
npm run check:site
```

En PowerShell, si `npm`/`npx` fallan por política de scripts: `npm.cmd` / `npx.cmd` (detalle en `docs/FLUJO-DIARIO.md`).

## Despliegue

- Publish directory: **`site`** (vía `netlify.toml`).
- Sin build command en Netlify (el `build` se hace en local / lo exige CI).
- Push a `main` → GitHub Actions (`landing-checks`) → Netlify deploy.
- Comprobar que rutas internas (`/AGENTS.md`, `/docs/…`) dan **404**.

## Docs

- `docs/GUIA-REPO-SIMPLE.md` — explicación sencilla de carpetas y archivos
- `AGENTS.md` — convenciones para agentes/CTO (fuente de verdad técnica)
- `docs/LANDING-AUDIT-2026-10.md` — snapshot v1.0
- `docs/LIGHTHOUSE-2026-10.md` — baseline perf móvil
