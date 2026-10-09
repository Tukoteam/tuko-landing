# Flujo diario (landing)

Solo esto. El resto del repo está en [GUIA-REPO-SIMPLE.md](./GUIA-REPO-SIMPLE.md).

**Chuleta:** `rama → editar → build → localhost → PR → main`

1. `git pull origin main`
2. `git checkout -b chore/nombre-del-cambio`
3. Editas (footer/menú → `src/partials/…` · resto → `site/…`) y guardas
4. En la carpeta **tuko-landing**:
   ```powershell
   npm.cmd run build
   npx.cmd serve .
   ```
   (Si `npm` / `npx` te van sin error, úsalos sin `.cmd`.)
5. Miras la URL de localhost
6. `git add .` → `git commit -m "…"` → `git push -u origin HEAD` → PR a **main** en GitHub

`main` = producción. No subas cambios reales directo a `main`.
