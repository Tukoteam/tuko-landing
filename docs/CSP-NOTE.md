# CSP / unsafe-inline

After extracting home CSS/JS to external files, Netlify CSP still uses `script-src ... 'unsafe-inline'` and `style-src ... 'unsafe-inline'` because:

- A few residual `style=""` attributes remain (progress bars, SVG stroke helpers).
- JSON-LD and historic pages may still rely on inline styles.

Removing `unsafe-inline` fully needs a follow-up pass (nonce or purge remaining inline attrs). Not done in this cleanup to avoid visual regressions.
