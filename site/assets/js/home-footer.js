/* Footer de la home, tranquilo: cierra la página sin robarle protagonismo al CTA.
   El footer es compartido por todas las páginas, así que aquí solo se añade lo de la home (clase .ft):
   el degradado del «tuko» gigante (estático, como un grabado) y un botón redondo para volver arriba.
   El HTML compartido no se toca. */
(function () {
  'use strict';

  var footer = document.querySelector('footer');
  if (!footer) return;
  var en = (document.documentElement.lang || 'es').slice(0, 2) === 'en';
  var T = en ? { top: 'Back to top' } : { top: 'Volver arriba' };
  footer.classList.add('ft');

  /* Degradado para el «tuko» gigante */
  var svg = footer.querySelector('.footer-svg-logo');
  if (svg) {
    var ns = 'http://www.w3.org/2000/svg';
    var defs = document.createElementNS(ns, 'defs');
    defs.innerHTML = '<linearGradient id="ftGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fa0ff" stop-opacity=".09"/><stop offset=".7" stop-color="#8fa0ff" stop-opacity=".03"/><stop offset="1" stop-color="#8fa0ff" stop-opacity="0"/></linearGradient>';
    svg.insertBefore(defs, svg.firstChild);
  }

  /* Volver arriba, junto al copyright. La traducción reescribe la línea del copyright, así que la envolvemos
     y el botón va al lado, fuera del texto traducido. */
  var bottom = footer.querySelector('.footer-bottom-inner');
  if (bottom && !footer.querySelector('.ft-top')) {
    var row = document.createElement('div');
    row.className = 'ft-bottom';
    bottom.parentNode.insertBefore(row, bottom);
    row.appendChild(bottom);
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ft-top';
    b.setAttribute('aria-label', T.top);
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
    b.addEventListener('click', function () {
      if (window.tukoLenis) window.tukoLenis.scrollTo(0, { duration: 1.6 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    row.appendChild(b);
  }

})();
