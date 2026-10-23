/* «Lo que no te pedimos»: lista de comprobación con un sello 3D.
   - Cada fila se marca y se enciende cuando cruza la parte baja de la pantalla (.is-on) y se apaga si vuelves a subir.
   - Sello: pieza de cristal con el logo en relieve. Mira al cursor con inercia; sin cursor, vaivén suave.
     El reflejo y la sombra siguen la inclinación; al marcarse las cinco filas da una vuelta entera.
   - El título se enciende palabra a palabra con el scroll. Siempre animado. */
(function () {
  'use strict';

  var section = document.querySelector('.nk');
  if (!section) return;
  var rows = Array.prototype.slice.call(section.querySelectorAll('.nk-row'));
  var title = section.querySelector('.nk-title');
  var seal = section.querySelector('[data-nk-seal]');

  var split = function () {
    var n = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 1) return walk(c);
        if (c.nodeType !== 3 || !c.nodeValue.trim()) return;
        var frag = document.createDocumentFragment();
        c.nodeValue.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var w = document.createElement('span');
          w.className = 'w';
          w.style.setProperty('--i', n++);
          w.textContent = part;
          frag.appendChild(w);
        });
        node.replaceChild(frag, c);
      });
    })(title);
    title.style.setProperty('--n', n);
    title.classList.add('data-split');
  };

  /* ── Sello: canto (capas detrás de la cara), cara, logo en relieve y brillo ── */
  if (seal) {
    var SHAPES = '<ellipse cx="132.298" cy="160.5" rx="32.1333" ry="120.5"/>' +
      '<path d="M164.431 160.5C164.431 227.05 164.431 281 164.431 281C195.488 281 220.664 227.05 220.664 160.5C220.664 93.9497 195.488 40 164.431 40C164.431 40 164.431 93.9497 164.431 160.5Z"/>' +
      '<path d="M220.657 160.497C220.657 204.864 220.657 240.83 220.657 240.83C238.403 240.83 252.79 204.864 252.79 160.497C252.79 116.13 238.403 80.1636 220.657 80.1636C220.657 80.1636 220.657 116.13 220.657 160.497Z"/>' +
      '<ellipse cx="80.0841" cy="160.497" rx="20.0833" ry="80.3333"/>';
    var html = '<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="nkSealG" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#8fa0ff"/><stop offset=".5" stop-color="#4257ff"/><stop offset="1" stop-color="#3a8fe0"/></linearGradient></defs></svg>';
    for (var e = 7; e >= 1; e--) html += '<span class="nk-seal-edge" style="--z:' + (-e * 1.4).toFixed(1) + 'px"></span>';
    html += '<span class="nk-seal-face"></span>';
    var MARK = 6;
    for (var l = 0; l < MARK; l++) {
      html += '<svg class="' + (l === MARK - 1 ? 'nks-front' : 'nks-l') + '" viewBox="44 36 213 249" style="--z:' + (2 + l * 1.1).toFixed(1) + 'px">' + SHAPES + '</svg>';
    }
    html += '<span class="nk-seal-shine"></span>';
    seal.innerHTML = html;
  }

  var done = false, spinT0 = 0, SPIN_MS = 1100;
  var update = function () {
    var vh = window.innerHeight;
    if (title) {
      var top = title.getBoundingClientRect().top;
      title.style.setProperty('--p', Math.max(0, Math.min(1, (vh * 0.9 - top) / (vh * 0.4))).toFixed(3));
    }
    /* Cada fila se marca cuando su centro pasa del 78 % de la altura de la ventana */
    rows.forEach(function (r) {
      var b = r.getBoundingClientRect();
      r.classList.toggle('is-on', b.top + b.height / 2 < vh * 0.78);
    });
    /* Las cinco marcadas: el sello da una vuelta entera (una vez; se rearma si se desmarca alguna) */
    var all = rows.length && rows.every(function (r) { return r.classList.contains('is-on'); });
    if (all && !done) { done = true; spinT0 = performance.now(); }
    else if (!all) done = false;
  };

  /* ── Sello que mira al cursor ──
     Objetivo: hacia el cursor (±26° en horizontal, ±20° en vertical). Sin cursor (o en táctil), reposo casi de frente
     con un vaivén lento. El valor real se acerca al objetivo poco a poco (inercia). */
  var tx = 0, ty = 0, cx = 0, cy = 0, lastMove = -1e9, sealOn = false;
  if (seal && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('pointermove', function (e) {
      var r = seal.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.45)));
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight * 0.45)));
      lastMove = performance.now();
    }, { passive: true });
    document.addEventListener('pointerleave', function () { lastMove = -1e9; });
  }
  var ease = function (k) { return 1 - Math.pow(1 - k, 4); };
  var frame = function (now) {
    if (!sealOn) return;
    var idle = now - lastMove > 2600;
    var gx = idle ? Math.sin(now / 2400) * 0.28 : tx;
    var gy = idle ? -0.3 + Math.sin(now / 3100) * 0.12 : ty;
    cx += (gx - cx) * 0.07;
    cy += (gy - cy) * 0.07;
    seal.style.setProperty('--ry', (cx * 26).toFixed(2) + 'deg');
    seal.style.setProperty('--rx', (-cy * 20).toFixed(2) + 'deg');
    /* El reflejo va al lado contrario de hacia donde mira; la sombra de debajo, también */
    seal.style.setProperty('--sx', (50 - cx * 38).toFixed(1) + '%');
    seal.style.setProperty('--sy', (40 + cy * 34).toFixed(1) + '%');
    seal.parentNode.style.setProperty('--ty', cx.toFixed(3));
    var k = spinT0 ? Math.min(1, (now - spinT0) / SPIN_MS) : 1;
    seal.style.setProperty('--spin', (ease(k) * 360 % 360).toFixed(2) + 'deg');
    if (k >= 1) spinT0 = 0;
    requestAnimationFrame(frame);
  };
  if (seal) {
    var startSeal = function (on) { var was = sealOn; sealOn = on; if (on && !was) requestAnimationFrame(frame); };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { startSeal(en[0].isIntersecting); }).observe(seal);
    } else startSeal(true);
  }

  if (title) {
    split();
    new MutationObserver(function () { if (!title.querySelector('.w')) { split(); update(); } }).observe(title, { childList: true });
  }
  var q = false;
  var onScroll = function () { if (!q) { q = true; requestAnimationFrame(function () { q = false; update(); }); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
