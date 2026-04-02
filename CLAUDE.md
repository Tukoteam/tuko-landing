# Tuko Landing Page — Contexto del proyecto

## Qué es Tuko
Plugin B2B de compra colectiva (group buying) para Shopify y WooCommerce. Permite a tiendas online activar descuentos escalonados que se desbloquean cuando un número mínimo de compradores se une a un grupo de compra. Genera viralidad orgánica porque cada comprador comparte el grupo para completarlo.

**Email de contacto:** team.tukoo@gmail.com
**Estado:** Sitio web de prelanzamiento (2026)

---

## Archivo principal
`tuko-landing-v3.html` — Single-file HTML autocontenido (HTML5 + CSS3 + JS vanilla). Todo en un solo archivo, sin dependencias externas salvo Google Fonts.

---

## Stack técnico
- **HTML/CSS/JS vanilla** — sin frameworks, sin build tools
- **Fuente:** Mona Sans (Google Fonts, variable font) — `font-family: 'Mona Sans', sans-serif`
- **Canvas API** — grid de perspectiva animado con `requestAnimationFrame`
- **Sin npm, sin Vite, sin React** — todo en el HTML

---

## Variables CSS (colores)
```css
--blue: #3D50F2;        /* Azul principal Tuko */
--blue-light: #E0E7FF;  /* Azul claro (fondos iconos) */
--blue-mid: #A4B3F2;    /* Azul medio */
--blue-dark: #141826;   /* Azul muy oscuro */
--green: #14C492;       /* Verde acento */
--white: #FFFFFF;
--gray-1: #F2F2F2;      /* Fondo secciones claras */
--gray-2: #D9D9D9;      /* Bordes */
--gray-3: #A0A0A0;      /* Texto secundario */
--gray-4: #4D4D4D;      /* Texto párrafos */
--black: #1a1a1a;       /* Negro principal */
```

---

## Tipografía — reglas importantes
- **Títulos (h1, h2, h3):** `font-weight: 800; font-stretch: semi-expanded`
- **Párrafos y texto de cuerpo:** `font-weight: 300; font-stretch: normal` ← MUY IMPORTANTE, si se pone semi-expanded en párrafos sale en negrita por bug de la fuente
- **Botones y nav:** `font-weight: 600-700; font-stretch: semi-expanded`
- **Labels de formulario:** `font-weight: 500; font-stretch: normal`

---

## Secciones de la landing (en orden)
1. **Nav** — fijo arriba, fondo blanco translúcido con blur
2. **Hero** — pantalla completa, grid animado en fondo gris claro, badge + h1 + párrafo + botón azul
3. **Logos** — carrusel animado de logos de tiendas (grayscale)
4. **Problem** — 3 cards con el problema que resuelve Tuko
5. **How it works** — 2 columnas: texto + pasos a la izquierda, mockup producto a la derecha
6. **Benefits** — grid 3x2 de beneficios con iconos
7. **CTA** — sección azul con grid animado blanco, formulario de registro
8. **Footer** — fondo #1c1c1c, logo SVG de marca de agua grande

---

## Grid animado (Canvas) — parámetros finales
La función `initGrid(canvas, opts)` usa proyección de perspectiva real con movimiento diagonal lateral suave.

**Hero (fondo gris):**
```js
initGrid(heroCanvas, {
  speed: 0.62, horizonY: 0.50, lineWidth: 1.3,
  cols: 22, spread: 3.8, zoom: 1.4, fadeLen: 0.42,
  maxAlpha: 0.17, baseColor: '90,90,90', vpX: 0.50, lateral: 0.04
});
```

**CTA (sección azul, líneas blancas):**
```js
initGrid(ctaCanvas, {
  speed: 0.62, horizonY: 0.50, lineWidth: 1.3,
  cols: 22, spread: 3.8, zoom: 1.4, fadeLen: 0.42,
  maxAlpha: 0.17, baseColor: '255,255,255', vpX: 0.50, lateral: 0.04
});
```

**Parámetros explicados:**
- `speed` — velocidad de avance (0.62 es suave)
- `lateral` — cuánto se mueve en diagonal (0.04 es sutil)
- `cols` — número de columnas verticales
- `spread` — apertura del campo visual
- `zoom` — zoom de perspectiva
- `fadeLen` — longitud del fade de entrada
- `maxAlpha` — opacidad máxima de las líneas
- `vpX` — posición horizontal del punto de fuga (0.5 = centrado)

---

## Footer — estructura
```html
<footer>
  <div class="footer-bg">
    <!-- SVG inline del logo Tuko en blanco, opacity 0.13, con mask degradado vertical -->
  </div>
  <div class="footer-cols">
    <div class="footer-col"><h4>Contacto</h4>...</div>
    <div class="footer-col"><h4>Legales</h4>...</div>
  </div>
  <div class="footer-bottom-inner">Sitio web de prelanzamiento — 2026</div>
</footer>
```
- Fondo: `#1c1c1c`
- Min-height: `580px`
- Logo SVG: `viewBox="0 0 840 321"`, fills `#FFFFFF`, opacity 0.13
- Mask: degradado de arriba (opaco) a abajo (transparente)

---

## Formulario CTA
Campos con fondo blanco (no transparente), labels encima de cada campo, placeholder fino.
```html
<div class="cta-field">
  <label>Email</label>
  <input type="email" class="cta-input" placeholder="Tu email">
</div>
```
- `.cta-input`: `background: white; color: #1a1a1a; border-radius: 10px; padding: 10px 16px`
- `::placeholder`: `color: rgba(0,0,0,0.25); font-weight: 300`

---

## Archivos adicionales (misma carpeta outputs)
- `privacidad.html` — política de privacidad (mismo footer y estilos)
- `terminos.html` — términos y condiciones (mismo footer y estilos)

---

## Cosas a NO cambiar sin avisar
- La función `initGrid` — tomó mucho tiempo ajustar, no tocar sin motivo
- `font-stretch: semi-expanded` en párrafos — NO ponerlo, sale en negrita
- El SVG del logo en el footer — inline, no como `<img>`
- El archivo es un único HTML autocontenido — no separar en múltiples archivos

---

## Idioma
Todo el contenido es en **español (España/neutro)**. Textos de UI, botones, secciones — todo en español.
