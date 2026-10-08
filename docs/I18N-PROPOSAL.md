# Propuesta i18n (sin implementar)

## Cómo está hoy

1. **Home ES/EN**: dos HTML casi espejo (`index.html`, `en/index.html`) + JS compartido `assets/js/home-ui.js` (~100 KB) con diccionario `translations.es|en` embebido y navegación a `/en/` al cambiar idioma.
2. **Resto del sitio** (legales, blog, tuko-ai): árbol paralelo bajo `en/` + `assets/js/i18n.js` (~960 líneas) que hace swap in-place con `data-i18n` y `localStorage tuko_lang`.
3. **Resultado**: tres fuentes de verdad (HTML ES, HTML EN, diccionarios JS). Los textos de home viven en el JS; los del blog viven en el HTML de cada post.

## Forma más simple (recomendada)

**Una sola fuente JSON/YAML por locale** (`locales/es.json`, `locales/en.json`) generada o editada a mano, y:

- En build local / Netlify plugin opcional, o un script `npm run i18n:build`, rellenar `data-i18n` o generar las dos carpetas HTML.
- Corto plazo (piloto): **mantener el árbol `en/`** pero **eliminar el diccionario duplicado de `home-ui.js`** y reutilizar `i18n.js` + JSON compartido para home y resto.
- No meter framework (Astro/Next) ahora: el sitio es estático y el equipo es de 2.

## Qué no hacer ahora

- No fusionar ES/EN en un solo HTML con swap total hasta que el home deje de depender de markup distinto por idioma.
- No tocar el CMS del blog (vive en el Hub / `plugin-tuko`, no en esta landing).
