# Lighthouse móvil — Sprint 2 (`chore/landing-sprint2`)

Fecha: 2026-10-08. Local: `npx serve .` + Lighthouse CLI (Chrome headless, form-factor mobile). **Solo documentar; no se arreglaron scores en este sprint.**

| URL | Perf | A11y | Best Practices | SEO | Top causas Perf &lt;90 |
|-----|------|------|----------------|-----|------------------------|
| `/` | 64 | 97 | 100 | 100 | LCP (9), Speed Index (60), FCP (8) |
| `/en/` | 63 | 97 | 100 | 100 | LCP (8), Speed Index (55), FCP (6) |
| `/blog/` | 84 | 97 | 100 | 100 | LCP (63), FCP (45) |
| `/blog/gran-paso-tuko` | 80 | 96 | 96 | 100 | CLS (67), LCP (77), FCP (51) |
| `/tuko-ai.html` | 82 | 96 | 100 | 100 | LCP (31) |

## Notas

- Homes ES/EN: el cuello de botella es **LCP/FCP** (hero + CSS/fuentes). Best Practices y SEO ya en 100.
- Blog list/artículo y tuko-ai: Perf ~80–84; prioridad menor que el home.
- Repetir en **preview Netlify** antes de prod (CDN vs `serve` local puede variar 5–15 pts).
