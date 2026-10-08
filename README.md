# tuko-landing

Landing pública de **Tuko** ([tukoteam.com](https://tukoteam.com)): sitio estático HTML/CSS/JS en **Netlify**.

Repo: `Tukoteam/tuko-landing`. Equipo pequeño (2 personas).

## Estructura

| Ruta | Contenido |
|------|-----------|
| `site/` | **Única superficie publicada** (`publish = "site"`) |
| `site/index.html`, `site/en/` | Home ES / EN |
| `site/blog/`, `site/en/blog/` | Artículos |
| `site/privacidad.html`, `site/terminos.html` | Legales |
| `site/tuko-ai.html` | Página tuko AI |
| `site/assets/` | CSS, JS, media |
| `site/landing-demo/` | Iframes del home |
| `docs/`, `scripts/`, `*.md` | No publicados |
| `_to-migrate/` | Fuera de la landing (404) |
| `netlify.toml` | Redirects + headers (única fuente) |

## Probar en local

```bash
npx --yes serve -l 5173 .
```

`serve.json` apunta a `public: "site"`. Abre `http://localhost:5173/`.

## Despliegue

- Publish directory: **`site`** (vía `netlify.toml`).
- Sin build command.
- PR → merge → deploy. Comprobar que rutas internas (`/AGENTS.md`, `/docs/…`) dan **404**.

## Docs

- `AGENTS.md` — convenciones para agentes/CTO
- `ARCHITECTURE.md` — decisiones
- `docs/SPRINT3-PR-B-CTO-OK.md` — OK del move a `site/`
- `docs/ORPHAN-ASSETS.md` — assets sin refs (no borrar sin OK)
