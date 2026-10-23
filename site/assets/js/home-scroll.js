/* Scroll suave con inercia (Lenis) en toda la home, movido por el reloj de GSAP para que ScrollTrigger
   vaya al mismo compás. Solo con ratón o trackpad; en táctil se queda el scroll nativo. Siempre activo. */
(function () {
  'use strict';

  var gsap = window.gsap, ST = window.ScrollTrigger;
  if (!window.Lenis || !gsap || !ST) return;
  gsap.registerPlugin(ST);

  var lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 0.95, anchors: true, allowNestedScroll: true });
  lenis.on('scroll', ST.update);
  gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);
  /* Para que otros scripts de la home (p. ej. «volver arriba» del footer) puedan mover el scroll suave */
  window.tukoLenis = lenis;
})();
