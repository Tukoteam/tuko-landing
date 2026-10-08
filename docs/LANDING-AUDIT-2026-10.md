# Landing audit — 2026-10

CTO snapshot after Sprint 3 (PR B + hotfixes + CI + hygiene).

## Score

~8.5/10 for a static marketing site (team of 2).

## Keep

- `.github/workflows/` — CI (`landing-checks`)
- `site/` — only Netlify publish surface
- `site/landing-demo/` — used by home iframes (not migration junk)
- `docs/`, `scripts/` — private tooling/docs

## Removed

- `_to-migrate/blog-cms` — legacy in-repo CMS; Hub owns blog CMS now.
  Netlify still 404s `/_to-migrate/*` for old URLs.

## Branches / PRs

One theme per branch/PR; delete branch after merge. `main` stays deployable.

## Next (not in this PR)

1. PR D — partials + automatic `?v=` cache-bust
2. Joan — orphans list + legal footer PDF vs HTML
3. PR E — i18n JSON
