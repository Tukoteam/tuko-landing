/* «Piloto»: pase de tienda fundadora y recorrido de 45 días.
   - El pase entra al verse la sección (.is-in), gira hacia el cursor con inercia (sin cursor, vaivén suave)
     y su número recorre las cinco plazas (01 → 05).
   - La regla de 45 días se llena con el scroll (--tp); paradas y peticiones se encienden cuando la luz llega.
   Siempre animado. */
(function () {
  'use strict';

  var section = document.querySelector('.pl');
  if (!section) return;
  var pass = section.querySelector('[data-pl-pass]');
  var track = section.querySelector('.pl-track');
  var stops = Array.prototype.slice.call(section.querySelectorAll('.pl-stop'));
  var asks = Array.prototype.slice.call(section.querySelectorAll('.pl-ask'));
  var en = (document.documentElement.lang || 'es').slice(0, 2) === 'en';

  /* Textos del pase y de la regla (ES / EN) */
  var T = en ? { kicker: 'Founding store', days: 'days', d1: 'Day 1', d45: 'Day 45' }
             : { kicker: 'Tienda fundadora', days: 'días', d1: 'Día 1', d45: 'Día 45' };
  Array.prototype.forEach.call(section.querySelectorAll('[data-pl-t]'), function (el) {
    var k = el.getAttribute('data-pl-t');
    if (T[k]) el.textContent = T[k];
  });

  /* ── Entrada del pase y número de plaza ── */
  var odo = section.querySelector('[data-pl-odo]');
  var pips = Array.prototype.slice.call(section.querySelectorAll('.pl-pips i'));
  var slot = 0, odoTimer = 0;
  var setSlot = function (n) {
    slot = n;
    if (odo) odo.style.setProperty('--n', n);
    pips.forEach(function (p, i) { p.classList.toggle('is-on', i === n); });
  };
  setSlot(0);

  /* ── Giro hacia el cursor (muelle suave) ── */
  var tx = 0, ty = 0, cx = 0, cy = 0, lastMove = -1e9, on = false;
  if (pass && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('pointermove', function (e) {
      var r = pass.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.4)));
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight * 0.45)));
      lastMove = performance.now();
    }, { passive: true });
  }
  var frame = function (now) {
    if (!on) return;
    var idle = now - lastMove > 2600;
    var gx = idle ? Math.sin(now / 2600) * 0.35 : tx;
    var gy = idle ? Math.sin(now / 3400) * 0.25 : ty;
    cx += (gx - cx) * 0.07;
    cy += (gy - cy) * 0.07;
    pass.style.setProperty('--ry', (cx * 16).toFixed(2) + 'deg');
    pass.style.setProperty('--rx', (-cy * 12).toFixed(2) + 'deg');
    pass.style.setProperty('--gx', (50 + cx * 40).toFixed(1) + '%');
    pass.style.setProperty('--gy', (40 + cy * 40).toFixed(1) + '%');
    pass.style.setProperty('--hx', (50 - cx * 50).toFixed(1) + '%');
    requestAnimationFrame(frame);
  };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      var vis = en[0].isIntersecting;
      if (vis) section.classList.add('is-in');
      if (vis && !on) {
        on = true;
        requestAnimationFrame(frame);
        odoTimer = setInterval(function () { setSlot((slot + 1) % 5); }, 2200);
      } else if (!vis && on) {
        on = false;
        clearInterval(odoTimer);
      }
    }, { threshold: 0.2 }).observe(pass || section);
  } else {
    section.classList.add('is-in');
  }

  /* ── Recorrido de 45 días ligado al scroll ── */
  var mobile = window.matchMedia('(max-width: 700px)');
  var update = function () {
    var vh = window.innerHeight;
    if (mobile.matches) {
      asks.forEach(function (a) {
        var b = a.getBoundingClientRect();
        a.classList.toggle('is-on', b.top + b.height / 2 < vh * 0.78);
      });
      return;
    }
    if (!track) return;
    var r = track.getBoundingClientRect();
    var tp = Math.max(0, Math.min(1, (vh * 0.86 - r.top) / (vh * 0.5)));
    track.style.setProperty('--tp', tp.toFixed(4));
    stops.forEach(function (s) { s.classList.toggle('is-on', tp >= parseFloat(s.style.getPropertyValue('--x')) - 0.001); });
    asks.forEach(function (a) { a.classList.toggle('is-on', tp >= parseFloat(a.getAttribute('data-at')) - 0.001); });
  };
  var q = false;
  var onScroll = function () { if (!q) { q = true; requestAnimationFrame(function () { q = false; update(); }); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
