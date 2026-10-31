/* Blog (índice): cabecera «galería flotante» y lista con algo más de vida.
   Hero: 8 portadas en desktop / 5 en móvil (tope fijo; si hay más posts, no crece).
   Orden: 1.ª más reciente → grande izq; 2.ª → grande der; el resto de huecos al azar. */

/* Cabecera: las portadas flotantes */
(function () {
  'use strict';
  var stage = document.querySelector('.bx-stage');
  var box = stage && stage.querySelector('.bx-floats');
  var grid = document.getElementById('bp-grid');
  if (!box || !grid) return;
  var mobile = window.matchMedia('(max-width: 760px)').matches;
  var fitW = mobile ? 1 : Math.max(0.62, Math.min(1, window.innerWidth / 1280));

  /* Huecos 0 y 1 = protagonistas (cerca). El resto = profundidad 2–3. */
  var SLOTS = mobile ? [
    { x: 17, y: 19, w: 118, d: 1, r: -7 },
    { x: 85, y: 22, w: 106, d: 1, r: 6 },
    { x: 52, y: 12, w: 78, d: 3, r: -3 },
    { x: 16, y: 91, w: 104, d: 2, r: 5 },
    { x: 84, y: 90, w: 118, d: 2, r: -5 }
  ] : [
    { x: 12, y: 32, w: 230, d: 1, r: -6 },
    { x: 86, y: 30, w: 220, d: 1, r: 5 },
    { x: 19, y: 82, w: 170, d: 2, r: 4 },
    { x: 92, y: 74, w: 160, d: 2, r: -5 },
    { x: 30, y: 18, w: 118, d: 3, r: 5 },
    { x: 70, y: 16, w: 112, d: 3, r: -6 },
    { x: 5, y: 82, w: 120, d: 3, r: -3 },
    { x: 77, y: 88, w: 130, d: 3, r: -2 }
  ];

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }

  var byDate = Array.prototype.slice.call(grid.querySelectorAll('.bp-card')).sort(function (a, b) {
    return (b.dataset.date || '').localeCompare(a.dataset.date || '');
  });
  /* Cupo del hero (top N por fecha); 2 fijos + el resto de ese cupo barajado */
  var pool = byDate.slice(0, SLOTS.length);
  var featured = pool.slice(0, 2);
  var rest = shuffle(pool.slice(2));
  var picked = featured.concat(rest);

  picked.forEach(function (c, i) {
    var sl = SLOTS[i];
    if (!c || !sl) return;
    var img = c.querySelector('.bp-media img');
    var link = c.querySelector('.bp-title a');
    if (!img || !link) return;
    var a = document.createElement('a');
    a.className = 'bx-card';
    a.href = link.getAttribute('href');
    a.tabIndex = -1;
    a.setAttribute('aria-hidden', 'true');
    a.dataset.d = sl.d;
    if (sl.y > 55) a.dataset.tip = 'up';
    if (sl.x < 22) a.dataset.align = 'start';
    else if (sl.x > 78) a.dataset.align = 'end';
    a.style.cssText = '--x:' + sl.x + '%;--y:' + sl.y + '%;--w:' + Math.round(sl.w * fitW) + 'px;--r:' + sl.r + 'deg;--i:' + i +
      ';--f:' + (8 + (i % 4) * 1.3).toFixed(1) + 's;--fd:' + (-i * 1.1).toFixed(1) + 's';
    var src = img.currentSrc || img.getAttribute('src');
    a.innerHTML = '<span class="bx-card-in"><img alt="" decoding="async"></span><span class="bx-tip"></span>';
    a.querySelector('img').src = src;
    a.querySelector('.bx-tip').textContent = link.textContent.trim();
    box.appendChild(a);
  });

  if (mobile || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  var loop = function () {
    raf = 0;
    cx += (tx - cx) * 0.07;
    cy += (ty - cy) * 0.07;
    box.style.setProperty('--px', cx.toFixed(4));
    box.style.setProperty('--py', cy.toFixed(4));
    if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001) raf = requestAnimationFrame(loop);
  };
  stage.addEventListener('pointermove', function (e) {
    var r = stage.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  stage.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
})();

/* Lista: las tarjetas entran en cascada al aparecer y una luz sigue al cursor por su borde */
(function () {
  'use strict';
  var grid = document.getElementById('bp-grid');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.bp-card'));
  if ('IntersectionObserver' in window) {
    cards.forEach(function (c) { c.classList.add('bx-pre'); });
    var n = 0;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        e.target.style.setProperty('--d', (n++ % 3) * 90 + 'ms');
        e.target.classList.add('bx-show');
        e.target.classList.remove('bx-pre');
      });
    }, { threshold: 0.12 });
    cards.forEach(function (c) { io.observe(c); });
  }
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  cards.forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();
