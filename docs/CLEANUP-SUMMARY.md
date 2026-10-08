# Landing cleanup — resumen final (`chore/landing-cleanup`)

## Commits (rama)

1. `chore: add .gitignore`
2. `chore: remove local Claude settings and empty .gitmodules`
3. `feat: gate GA4 behind cookie consent banner`
4. `chore: canonicalize legal pages and redirect /pages/*`
5. `chore: move blog-cms out of publish surface to _to-migrate`
6. `chore: point footers to canonical legal URLs and block _to-migrate`
7. `perf: compress images, kebab-case assets, banner srcset (~52MB to ~2MB)`
8. `docs: note image size before/after for landing cleanup`
9. `refactor: extract home CSS/JS from index into assets/`
10. `docs: i18n proposal and CSP unsafe-inline status`
11. (+ docs README / AGENTS / ARCHITECTURE / summary + netlify logos path)

## MB ahorrados (assets)

- **Antes:** ~51.85 MB (89 ficheros media bajo `assets/`)
- **Después:** ~1.95 MB (~63 ficheros)
- **Ahorro:** ~50 MB

## Lighthouse

No se pudo obtener score móvil fiable en esta sesión (Chrome headless). Recomendación: correr Lighthouse en la **preview de Netlify** de esta rama (Performance + Best Practices) y anotar before/after de producción.

## Informes (Fase 2)

- **`landing-demo/`**: **sí está enlazada y publicada** (iframes “Cómo funciona” en home). No mover.
- **`natrue-x-tuko`**: post vivo + redirects + JSON en CMS migrado. **Mantener.**
- **Privacidad vs GA4**: el copy legal aún puede decir que no hay cookies de terceros; el banner ya informa de Analytics. **Alinear legales solo con tu OK.**

## Secretos (Fase 1)

- Tracked eliminado: `.claude/settings.local.json` (rutas locales de otra máquina).
- **No tracked** pero presentes en disco bajo `_to-migrate/blog-cms/`: `.env`, posible `secrets/*.pem` — gitignored; no publicar; rotar si alguna vez se subieron al remoto.
- Emails en HTML (`team.tukoo@gmail.com`, etc.): no son secretos; migración a `joan@tukoteam.com` en copy es decisión tuya.

## Decisiones que te tocan

1. ¿Alinear texto de privacidad/cookies con GA4?
2. ¿Merge PR `chore/landing-cleanup` → `main` (Netlify prod)?
3. ¿Rotar PEM/.env del CMS si existieron en GitHub alguna vez?
4. ¿Aprobar propuesta i18n (`docs/I18N-PROPOSAL.md`) para un siguiente sprint?
5. CSP: ¿seguir con unsafe-inline por ahora? (recomendado sí)
