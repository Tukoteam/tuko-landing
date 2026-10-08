# Lighthouse móvil — 2026-10

## Sprint pro + LCP (post-fix)

Fecha: 2026-10-08. Local: `npx serve site -l 5188` + Lighthouse CLI (Chrome headless, form-factor mobile).

| URL | Perf | FCP | LCP | Notas |
|-----|------|-----|-----|--------|
| `/` | **84** | 3.0 s | 3.5 s | Antes 64. Demos how-step lazy + fonts más ligeras + preload `home.css` |
| `/en/` | **82** | 3.2 s | 3.5 s | Antes 63 |

Cambios LCP: iframes `landing-demo` con `data-src` + IntersectionObserver; Mona Sans sin Roboto Serif en critical path; preload `home.css`; cookie-consent diferido; logo nav `fetchpriority="high"`.

## Sprint 2 (baseline histórico)

Fecha: 2026-10-08. Local: `npx serve .` + Lighthouse CLI.

| URL | Perf | A11y | Best Practices | SEO | Top causas Perf &lt;90 |
|-----|------|------|----------------|-----|------------------------|
| `/` | 64 | 97 | 100 | 100 | LCP (9), Speed Index (60), FCP (8) |
| `/en/` | 63 | 97 | 100 | 100 | LCP (8), Speed Index (55), FCP (6) |
| `/blog/` | 84 | 97 | 100 | 100 | LCP (63), FCP (45) |
| `/blog/gran-paso-tuko` | 80 | 96 | 96 | 100 | CLS (67), LCP (77), FCP (51) |
| `/tuko-ai.html` | 82 | 96 | 100 | 100 | LCP (31) |

## Notas

- Repetir en **preview Netlify** (CDN vs `serve` local puede variar 5–15 pts).
- Objetivo home ≥80 móvil: **cumplido** en medición local post-LCP.
