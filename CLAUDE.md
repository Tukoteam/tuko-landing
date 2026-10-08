# Tuko Landing — notas para asistentes

Este archivo está **actualizado (2026-10)**. La guía operativa completa está en [`AGENTS.md`](./AGENTS.md) y la estructura en [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Qué es

Landing estática de Tuko (Shopify group-buy / “dos compran con descuento”), publicada en Netlify: [tukoteam.com](https://tukoteam.com). Repo: `Tukoteam/tuko-landing`.

**No** es un monolito WooCommerce ni el archivo legacy `tuko-landing-v3.html` como fuente de verdad. La home actual es `index.html` + `assets/css/home.css` + `assets/js/home-*.js`.

## Tokens de diseño (sigue vigente)

```css
--blue: #3D50F2;
--blue-light: #E0E7FF;
--green: #14C492;
--gray-1: #F2F2F2;
--black: #1a1a1a;
```

Fuente: Mona Sans. Títulos con peso alto; párrafos ligeros (`font-weight: 300`).

## Reglas rápidas

- No cambiar diseño/copy salvo que la tarea lo pida.
- No commitear `.env`, `*.pem`, `.claude/settings.local.json`, `node_modules/`.
- GA4 detrás del banner de cookies.
- Prefiere kebab-case en assets.
