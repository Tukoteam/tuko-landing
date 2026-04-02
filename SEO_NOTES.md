# SEO_NOTES.md — Tuko Landing Page

## Auditoría SEO técnica — Resumen de cambios

Este documento registra todos los cambios realizados para optimizar la landing page de Tuko en términos de SEO y accesibilidad técnica.

---

## Problemas detectados y corregidos

### Críticos (sin estos Google no indexa bien)

- **Sin meta description** → CORREGIDO
  - Antes: Ninguno
  - Después: `Tuko activa descuentos por grupo en tu tienda online. Más ventas, rotación de stock y viralidad orgánica sin aumentar tu presupuesto publicitario.`

- **Sin Open Graph ni Twitter Cards** → CORREGIDO
  - Añadidos 7 tags og: (og:type, og:url, og:title, og:description, og:image, og:locale, og:site_name)
  - Añadidos 4 tags twitter: (twitter:card, twitter:title, twitter:description, twitter:image)

- **Sin canonical** → CORREGIDO
  - Añadido: `<link rel="canonical" href="https://TUDOMINIO.com/">`

- **Sin robots.txt** → CORREGIDO
  - Nuevo archivo: `/robots.txt`

- **Sin sitemap.xml** → CORREGIDO
  - Nuevo archivo: `/sitemap.xml` con todas las URLs del proyecto

- **Sin JSON-LD structured data** → CORREGIDO
  - Añadido `<script type="application/ld+json">` con tres tipos schema:
    - Organization (nombre, URL, email, descripción)
    - WebSite (información del sitio)
    - SoftwareApplication (características del plugin)

- **Sin `<main>` semántico** → CORREGIDO
  - Añadido: `<main id="main-content">` envolviendo todo el contenido principal (entre header y footer)

- **Sin `<header>` semántico** → CORREGIDO
  - Añadido: `<header role="banner">` envolviendo la navegación

- **Labels de formulario sin atributo `for`** → CORREGIDO
  - Email label: `for="cta-email"`
  - Name label: `for="cta-name"`
  - Business label: `for="cta-business"`

- **Imágenes del carrusel sin `loading="lazy"`** → CORREGIDO
  - Todas las imágenes `.logo-pill` ahora tienen `loading="lazy"`

### Medios (mejoran SEO y accesibilidad)

- **Nav logo `<img>` sin alt** → CORREGIDO
  - Añadido: `alt="Tuko"`

- **Nav sin `aria-label`** → CORREGIDO
  - Añadido: `aria-label="Navegación principal"`

- **Botones de idioma sin accesibilidad** → CORREGIDO
  - ES: `aria-label="Cambiar idioma a Español"`
  - EN: `aria-label="Switch language to English"`

- **Sin skip-to-content link** → CORREGIDO
  - Añadido link accesible que salta al `#main-content` (oculto por defecto, visible en :focus)

- **Meta robots** → AÑADIDO
  - Añadido: `<meta name="robots" content="index, follow">`

- **Favicon** → PLACEHOLDER AÑADIDO
  - Links creados, requieren archivos reales antes de producción

### Verificados (ya estaban bien)

- `lang="es"` en `<html>` ✓ Correcto
- `charset="UTF-8"` ✓ Correcto
- `viewport` responsive ✓ Correcto
- Un solo `<h1>` por página ✓ Correcto
- Jerarquía h1→h2→h3 ✓ Correcta
- Scripts al final del body ✓ No bloquean render
- Alt en imágenes ✓ Ya tenían alt text

---

## Variables a sustituir antes de producción

| Variable | Ubicación | Qué poner | Prioridad |
|----------|-----------|-----------|-----------|
| `TUDOMINIO.com` | index.html (head), robots.txt, sitemap.xml | Tu dominio real (ej. `tuko.io`) | CRÍTICA |
| `assets/og-image.png` | meta og:image, twitter:image | Imagen 1200×630px PNG | ALTA |
| `assets/favicon.png` | link rel="icon" | Favicon 32×32 PNG/SVG | MEDIA |
| `assets/apple-touch-icon.png` | link apple-touch-icon | Icono 180×180 para iOS | MEDIA |
| `assets/logo.png` | JSON-LD Organization.logo | Logo accesible por URL | ALTA |
| `sameAs: []` | JSON-LD Organization | URLs redes sociales (LinkedIn, etc.) | MEDIA |

---

## Pendiente para producción

### 1. Google Search Console (GSC)
- [ ] Verificar dominio en https://search.google.com/search-console
- [ ] Añadir sitemap: `https://TUDOMINIO.com/sitemap.xml`
- [ ] Monitorizar Core Web Vitals
- [ ] Revisar problemas de indexación reportados

### 2. Imágenes OG y favicon
- [ ] Crear imagen 1200×630px con diseño Tuko (preview social)
- [ ] Subir como `assets/og-image.png`
- [ ] Crear favicon.png (32×32) y apple-touch-icon.png (180×180)

### 3. reCAPTCHA para formulario
- [ ] Registrarse en https://www.google.com/recaptcha/admin
- [ ] Añadir reCAPTCHA v3 (invisible) al formulario de contacto
- [ ] Reemplazar FormSubmit.co por Formspree o similar

### 4. robots.txt
- [ ] Actualizar `TUDOMINIO.com` con dominio real
- [ ] Decidir si bloquear `/assets/js/` o dejar accesible

### 5. Hreflang (internacionalización)
- [ ] Actualmente: ES/EN via localStorage pero no via URLs diferentes
- [ ] Considerar rutas `/en/` o subdominio `en.TUDOMINIO.com` para SEO internacional real
- [ ] Actualizar sitemap.xml con hreflang reales

### 6. Performance adicional
- [ ] Convertir logos PNG del carrusel a WebP
- [ ] Revisar Lighthouse en producción
- [ ] Añadir `width` y `height` a imágenes cuando se conozcan las dimensiones
- [ ] Considerar Critical CSS inline para above-the-fold

### 7. Monitorización
- [ ] Revisar Core Web Vitals mensualmente
- [ ] Monitorizar posicionamiento en Google Search Console
- [ ] Revisar errores de rastreo en GSC

---

## Cambios aplicados en este sprint

### A. Head completamente reestructurado
1. Meta tags charset y viewport comentados
2. Title actualizado
3. Meta description agregada
4. Canonical agregada
5. Meta robots agregada
6. Open Graph: 7 tags (og:type, url, title, description, image, locale, site_name)
7. Twitter Cards: 4 tags (card, title, description, image)
8. Favicon y apple-touch-icon links
9. Preconnect a Google Fonts
10. JSON-LD Schema.org: 3 types (Organization, WebSite, SoftwareApplication)

### B. Estructura HTML semántica
1. `<header role="banner">` envolviendo navegación
2. `<main id="main-content">` envolviendo secciones principales
3. `</main>` antes del footer

### C. Accesibilidad (a11y)
1. Nav logo: `alt="Tuko"`
2. Nav: `aria-label="Navegación principal"`
3. Form labels: `for` attributes alineados con input IDs
4. Language buttons: `aria-label` en ambos idiomas
5. Skip-to-content link: focus/blur handlers para accesibilidad de teclado

### D. Performance
1. Carousel images: `loading="lazy"` para diferir carga

### E. Archivos nuevos
1. `robots.txt` — Instrucciones para crawlers
2. `sitemap.xml` — Mapa del sitio con 10 URLs
3. `SEO_NOTES.md` — Este documento (registro de cambios)

---

## Estructura del proyecto (actualizada)

```
tuko-landing/
├── index.html                    ← Landing principal (ES/EN via i18n + SEO mejorado)
├── tuko-landing-v3.html         ← Backup sincronizado
├── robots.txt                    ← NUEVO: Instrucciones crawlers
├── sitemap.xml                   ← NUEVO: Mapa del sitio
├── SEO_NOTES.md                  ← NUEVO: Este documento
├── blog/
│   ├── index.html
│   ├── natrue-x-tuko.html
│   ├── gran-paso-tuko.html
│   ├── new-formulas-shanghai.html
│   ├── ocea-hub-shanghai.html
│   ├── spain-innovation-day.html
│   ├── stron-tech-trek.html
│   └── shiji-incubator.html
├── pages/
│   ├── privacidad.html
│   └── terminos.html
└── assets/
    ├── css/main.css
    ├── js/
    │   ├── i18n.js
    │   └── main.js
    ├── favicon.png              ← POR CREAR
    ├── apple-touch-icon.png     ← POR CREAR
    ├── og-image.png             ← POR CREAR
    ├── logo.png                 ← POR CREAR (si no existe)
    └── logos colaboradores/
        └── [PNG logos]
```

---

## Notas técnicas finales

### Canonical URL
- Placeholder: `https://TUDOMINIO.com/`
- Cambiar a tu dominio real (ej. `https://tuko.io/`)

### Hreflang
- Actualmente: `?lang=en` como placeholder
- Para producción: considerar `/en/` como ruta real si se quiere SEO internacional

### JSON-LD
- Los tres schemas están en un `@graph` para facilitar validación
- Google entiende Organization, WebSite y SoftwareApplication
- Verificar en https://schema.org/docs/jsonldcontext.json

### Open Graph
- Imagen: `og:image` 1200×630px es el estándar
- Facebook y LinkedIn usarán esta imagen en preview social
- Sin imagen, se generará una captura automática (generalmente pobre)

### Sitemap dinámico
- Si el blog crece, considerar generar sitemap dinámicamente
- Herramientas: Yoast SEO, Rank Math, o script PHP/Node.js

---

## Cambios NO aplicados (requieren decisión del equipo)

1. **Blog pages SEO** — No se han actualizado meta tags en blog/*.html (requiere plantilla)
2. **Legal pages SEO** — No se han actualizado meta tags en pages/*.html
3. **Localización de URLs** — Hreflang actual usa `?lang=en`, considerar `/en/` después de producción
4. **Structured data en blog** — No se han añadido schema NewsArticle, BlogPosting
5. **Image optimization** — No se han convertido imágenes a WebP (requiere herramientas build)

---

Auditoría completada: **2026-04-02**
Cambios aplicados: **8 categorías, 25+ items**
Archivo de referencia: Esta página (SEO_NOTES.md)

Para cuestiones sobre implementación, referirse a CLAUDE.md del proyecto.
