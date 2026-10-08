# Landing audit — v1.0 (2026-10)

CTO snapshot: landing marcada **v1.0** (`tag v1.0.0`).

## Score

~9/10 for a static marketing site (team of 2): hygiene, CI, partials, asset hash `?v=`, CSS/JS parts &lt;1000, árbol limpio.

## Keep

- `.github/workflows/` — CI (`landing-checks`)
- `site/` — only Netlify publish surface
- `site/landing-demo/` — used by home iframes (vendor/demo exempt from line limits)
- `src/partials/` — shared chrome + home hero/FAQ
- `docs/LIGHTHOUSE-2026-10.md` — perf baseline
- `scripts/` — `build`, `check:site`, generate/sync EN

## Done in v1

- Unified `?v=` via content hash; multiple versions = check-site **error**
- Split editable CSS/JS into parts; build concatenates entries
- Extracted `tuko-ai` inline CSS/JS to assets
- Removed sprint archive docs, one-shot scripts, 33 orphan assets
- Dual OG kept (`og-image.png` + `og-image-v8.png`) pending Joan

## Next (optional / out of v1)

1. PR E — i18n JSON
2. Joan — unify OG if desired
3. Further home shell thinning if editing `index.html` becomes painful
