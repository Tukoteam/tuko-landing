# Guía simple del repo tuko-landing

Explicación en lenguaje claro de carpetas y archivos.  
La web pública es solo **`site/`**. Lo demás es cocina / normas / herramientas.

---

## Carpetas principales

### `site/`
La landing de verdad: lo que ve la gente en tukoteam.com.  
Netlify solo publica esta carpeta.

Dentro, a grandes rasgos:
- `index.html` — home en español  
- `tuko-ai.html`, `privacidad.html`, `terminos.html` — otras páginas  
- `blog/` — blog en español (listado + artículos)  
- `en/` — versión en inglés (home, blog, legales, tuko-ai)  
- `assets/` — CSS, JS, imágenes, logos, OG  
- `landing-demo/` — demos/iframes del home  

### `src/partials/`
Trozos de **HTML** reutilizables (menú, footer, hero, FAQ, theme-head…).  
No son páginas sueltas: el `build` los mete dentro de las páginas de `site/`.  
**Solo HTML.** El CSS y el JS no van aquí.

### `scripts/`
Herramientas (no se ven en la web). Ejemplos:
- `npm run build` — junta CSS/JS, inyecta partials, pone `?v=`  
- `npm run check:site` — comprueba que la web no esté rota  
- `generate:en-*` — generan/actualizan inglés  
- `sync:blog-shell` — actualiza el marco (menú/footer) de posts ya en la landing  
- `export:cms-shell` — pasa ese marco al Hub/CMS para posts nuevos  

### `docs/`
Notas internas (esta guía, audit, Lighthouse). No salen en la web.

### `.github/workflows/`
Inspector automático de GitHub. Tras un push, corre el check de la landing  
(`build` + tree limpio + `check:site`). Verde = OK; rojo = hay que arreglar.

---

## Archivos sueltos de la raíz

### `README.md`
Portada del proyecto en GitHub: qué es y cómo empezar.

### `AGENTS.md`
Manual de cómo funciona el repo y cómo tocarlo sin romper nada  
(partials, build, blog/CMS, qué no editar…).  
Está en GitHub; **no** se publica en tukoteam.com.

### `package.json`
Ficha del proyecto (nombre, descripción) + lista de comandos npm.

### `netlify.toml`
Instrucciones para Netlify: publicar `site/`, redirecciones, seguridad.  
(`.toml` = formato de configuración; no es el deploy en sí. El deploy lo hace Netlify al conectar el repo.)

### `serve.json`
Para ver la web en tu PC con `npx serve .` (enseña la carpeta `site/`). No publica nada.

### `.gitignore`
Qué **no** subir a GitHub: `node_modules/`, secretos `.env`, basura del sistema, logs, ajustes locales del editor…

### `.editorconfig`
Cómo se escribe el código en este proyecto (UTF-8, 2 espacios, etc.).  
No afecta a lo que ve el visitante.

**UTF-8** = forma de guardar texto para que salgan bien ñ, acentos, €, etc.

---

## Partial vs site (muy importante)

| Quieres cambiar… | Dónde |
|------------------|--------|
| Menú, footer, hero, FAQ (HTML) | `src/partials/` → luego `npm run build` |
| Textos/secciones de una página que no son partial | `site/…` (ej. `site/index.html`) |
| Estilos (CSS) | `site/assets/css/` (mejor las **parts** en carpetas `home/`, `main/`, etc.) |
| Comportamiento (JS) | `site/assets/js/` (también hay **parts**) |

Los archivos gordos `home.css`, `home-ui.js`, etc. con el aviso `Built from` **no se editan a mano**: los genera el build.

---

## Blog y CMS (resumen)

- Posts se publican desde el **Hub / CMS**, no inventando un CMS dentro de este repo.  
- `sync:blog-shell` = actualizar marco en posts **ya** en la landing.  
- `export:cms-shell` = dar el marco al CMS para posts **nuevos**.  

---

## Flujo típico al cambiar algo

1. Editas partials / parts / página en `site/`  
2. `npm run build` (y a veces sync/generate)  
3. `npm run check:site`  
4. Commit + push → GitHub Actions checkea → Netlify publica `site/`  

---

## Los 2 docs de estado

- `LANDING-AUDIT-2026-10.md` — foto de cómo está el proyecto en v1  
- `LIGHTHOUSE-2026-10.md` — notas de velocidad en móvil (~84/82 en home)  
