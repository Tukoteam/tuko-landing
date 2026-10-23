/* CTA final con el logo de Tuko en 3D, de cristal esmerilado y sin contenedor.
   El logo tiene cuatro formas y el formulario, tres campos y el envío: cada campo bien rellenado enciende una
   forma (web, nombre, email) y, al enviarse, se enciende la cuarta y el sello da una vuelta entera.
   Mira al cursor con inercia; sin cursor, vaivén suave. El formulario no se toca (mismos campos y envío). */
(function () {
  'use strict';

  var card = document.querySelector('.final-cta');
  if (!card) return;
  var web = card.querySelector('#pilotWeb');
  var name = card.querySelector('#pilotName');
  var email = card.querySelector('#pilotEmail');
  var status = card.querySelector('#pilotFormStatus');

  /* Las cuatro formas del logo, de izquierda a derecha */
  var SHAPES = [
    '<ellipse class="fs-1" cx="80.0841" cy="160.497" rx="20.0833" ry="80.3333"/>',
    '<ellipse class="fs-2" cx="132.298" cy="160.5" rx="32.1333" ry="120.5"/>',
    '<path class="fs-3" d="M164.431 160.5C164.431 227.05 164.431 281 164.431 281C195.488 281 220.664 227.05 220.664 160.5C220.664 93.9497 195.488 40 164.431 40C164.431 40 164.431 93.9497 164.431 160.5Z"/>',
    '<path class="fs-4" d="M220.657 160.497C220.657 204.864 220.657 240.83 220.657 240.83C238.403 240.83 252.79 204.864 252.79 160.497C252.79 116.13 238.403 80.1636 220.657 80.1636C220.657 80.1636 220.657 116.13 220.657 160.497Z"/>'
  ].join('');

  /* ── Fondo: aurora de luces que derivan, puntos alrededor del logo, luz desde arriba y grano ── */
  var bg = document.createElement('span');
  bg.className = 'fc-bg';
  bg.setAttribute('aria-hidden', 'true');
  bg.innerHTML = '<i class="fc-blob fc-blob--a"></i><i class="fc-blob fc-blob--b"></i><i class="fc-blob fc-blob--c"></i><i class="fc-dots"></i><i class="fc-src"></i><i class="fc-beam fc-beam--wide"></i><i class="fc-beam"></i><i class="fc-dust"></i><i class="fc-grain"></i>';
  card.insertBefore(bg, card.firstChild);
  /* Motas de polvo que suben despacio dentro de la luz */
  var dust = bg.querySelector('.fc-dust');
  for (var d = 0; d < 16; d++) {
    var m = document.createElement('b');
    m.style.setProperty('--x', (20 + Math.random() * 60).toFixed(1) + '%');
    m.style.setProperty('--s', (1.2 + Math.random() * 2).toFixed(1) + 'px');
    m.style.setProperty('--t', (9 + Math.random() * 9).toFixed(1) + 's');
    m.style.setProperty('--d', (-Math.random() * 18).toFixed(1) + 's');
    m.style.setProperty('--o', (0.35 + Math.random() * 0.5).toFixed(2));
    dust.appendChild(m);
  }

  /* ── El logo: capas apiladas en profundidad (sin contenedor) ── */
  card.classList.add('fc');
  var col = document.createElement('div');
  col.className = 'fc-seal-col';
  col.setAttribute('aria-hidden', 'true');
  var html = '<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="fcSealG" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#8fa0ff"/><stop offset=".5" stop-color="#4257ff"/><stop offset="1" stop-color="#3a8fe0"/></linearGradient>' +
    '<linearGradient id="fcRim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity=".08"/></linearGradient></defs></svg>';
  var LAYERS = 14;
  for (var l = 0; l < LAYERS; l++) {
    html += '<svg class="' + (l === LAYERS - 1 ? 'fc-front' : l === 0 ? 'fc-back' : 'fc-side') + '" viewBox="44 36 213 249" style="--z:' + ((l - LAYERS / 2) * 1.8).toFixed(1) + 'px">' + SHAPES + '</svg>';
  }
  col.innerHTML = '<div class="fc-seal"><div class="fc-tile">' + html + '</div></div>';
  card.appendChild(col);
  var tile = col.querySelector('.fc-tile');

  /* La luz, los puntos y el polvo se centran con el logo (en % del ancho de la tarjeta) */
  var place = function () {
    var c = card.getBoundingClientRect(), k = col.getBoundingClientRect();
    if (!c.width) return;
    bg.style.setProperty('--bx', ((k.left + k.width / 2 - c.left) / c.width * 100).toFixed(2) + '%');
  };
  place();
  window.addEventListener('resize', place);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);

  /* ── Cada campo bien rellenado enciende una forma ── */
  var ok = {
    web: function (v) { return /\S+\.\S{2,}/.test(v.trim()); },
    name: function (v) { return v.trim().length >= 2; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
  };
  var lit = [false, false, false, false];
  var light = function (i, on) {
    if (lit[i] === on) return;
    lit[i] = on;
    tile.classList.toggle('is-s' + (i + 1), on);
    if (on) { tile.classList.remove('is-pop'); void tile.offsetWidth; tile.classList.add('is-pop'); }
  };
  var check = function () {
    light(0, !!web && ok.web(web.value));
    light(1, !!name && ok.name(name.value));
    light(2, !!email && ok.email(email.value));
  };
  [web, name, email].forEach(function (f) { if (f) f.addEventListener('input', check); });
  check();

  /* ── Mira al cursor con inercia; al enviarse, vuelta entera ── */
  var tx = 0, ty = 0, cx = 0, cy = 0, lastMove = -1e9, on = false, spinT0 = 0, SPIN_MS = 1300;
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('pointermove', function (ev) {
      var r = tile.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (ev.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.45)));
      ty = Math.max(-1, Math.min(1, (ev.clientY - (r.top + r.height / 2)) / (window.innerHeight * 0.45)));
      lastMove = performance.now();
    }, { passive: true });
  }
  var ease = function (k) { return 1 - Math.pow(1 - k, 4); };
  var frame = function (now) {
    if (!on) return;
    var idle = now - lastMove > 2600;
    var gx = idle ? Math.sin(now / 2400) * 0.3 : tx;
    var gy = idle ? -0.25 + Math.sin(now / 3100) * 0.12 : ty;
    cx += (gx - cx) * 0.07;
    cy += (gy - cy) * 0.07;
    tile.style.setProperty('--ry', (cx * 28).toFixed(2) + 'deg');
    tile.style.setProperty('--rx', (-cy * 22).toFixed(2) + 'deg');
    tile.style.setProperty('--sx', (50 - cx * 38).toFixed(1) + '%');
    tile.style.setProperty('--sy', (40 + cy * 34).toFixed(1) + '%');
    col.style.setProperty('--ty', cx.toFixed(3));
    var k = spinT0 ? Math.min(1, (now - spinT0) / SPIN_MS) : 1;
    tile.style.setProperty('--spin', (ease(k) * 360 % 360).toFixed(2) + 'deg');
    if (k >= 1) spinT0 = 0;
    requestAnimationFrame(frame);
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      var vis = en[0].isIntersecting;
      if (vis) card.classList.add('is-in');
      if (vis && !on) { on = true; requestAnimationFrame(frame); }
      else if (!vis) on = false;
    }, { threshold: 0.2 }).observe(col);
  } else { card.classList.add('is-in'); }

  /* Enviado: se enciende la cuarta forma y el sello da la vuelta */
  if (status) {
    new MutationObserver(function () {
      if (status.getAttribute('data-state') === 'ok' && !status.hidden && !lit[3]) {
        light(3, true);
        card.classList.add('is-claimed');
        spinT0 = performance.now();
      }
    }).observe(status, { attributes: true, attributeFilter: ['data-state', 'hidden'] });
  }
})();
