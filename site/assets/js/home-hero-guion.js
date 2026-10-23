/* Guion del hero. El titular y el móvil avanzan juntos, en bucle.
   Flujo real de Tuko en la tienda (tuko-platform/apps/shopify/js/shopify-widget):
   1 «Un cliente entra.»  → «Precio grupal 68,00 €» → popup (0 de 2) → «Tus datos» se rellena → «Abriendo el pago…»
                            → pago completado → popup en modo «Dentro» (1 de 2, el reloj corre)
   2 «Trae a otro.»       → «Compartir y cerrar el grupo» → popup de compartir → WhatsApp y le contestan
   3 «Los dos compran.»   → «Grupo cerrado» (2 de 2) y onda de difusión
   Siempre animado, también con «menos movimiento» (decisión de producto). */
(function () {
  'use strict';

  var hero = document.querySelector('.hero--guion');
  if (!hero) return;
  var stage = hero.querySelector('.hg-stage');
  var tilt = hero.querySelector('.hg-tilt');
  var phone = hero.querySelector('.hg-phone');
  var screen = hero.querySelector('.hg-screen');
  var finger = hero.querySelector('.hg-touch');
  var fields = Array.prototype.slice.call(hero.querySelectorAll('.hg-in'));
  fields.forEach(function (el) { el.setAttribute('data-ph', el.textContent); });

  /* Números que ruedan: reloj (horas, minutos, segundos) y personas dentro */
  var odo = {};
  hero.querySelectorAll('[data-odo]').forEach(function (el) { odo[el.getAttribute('data-odo')] = buildOdo(el); });

  /* Guion en milisegundos desde el inicio de cada vuelta (las barras 1·2·3 del CSS usan los mismos) */
  var SCRIPT = [
    [0, function () { reset(); }],
    [300, function () { flash('is-call', 2100); }],
    [1100, function () { touch('.hg-btn--tuko'); }],
    [1600, function () { flash('is-tap', 640); }],
    [1800, function () { hero.classList.add('is-fsp'); }],
    [2700, function () { touch('.hg-cta'); }],
    [3200, function () { flash('is-cta', 220); }],
    /* «Tus datos»: se escribe nombre, apellido y email, y se acepta la casilla */
    [3350, function () { hero.classList.add('is-modal', 'is-join'); }],
    [3750, function () { type(0); }],
    [4350, function () { type(1); }],
    [4950, function () { type(2); }],
    [5900, function () { touch('.hg-chk--req i'); }],
    [6400, function () { blur(); hero.classList.add('is-checked'); }],
    [6650, function () { touch('.hg-pay'); }],
    [7150, function () { flash('is-paytap', 220); hero.classList.add('is-preparing'); }],
    [7500, function () { hero.classList.remove('is-join'); hero.classList.add('is-redirect'); }],
    [8500, function () { hero.classList.remove('is-redirect'); hero.classList.add('is-ok'); }],
    /* De vuelta en la tienda: el popup ya está en modo «Dentro» y el reloj corre */
    [9600, function () {
      hero.classList.remove('is-ok', 'is-modal');
      hero.classList.add('is-joined');
      setOdo('n', '1');
      startClock();
    }],
    [9800, function () { setStep(2); setLine(2); }],
    [10300, function () { touch('.hg-cta'); }],
    [10800, function () { flash('is-share', 220); }],
    [10950, function () { hero.classList.add('is-ss'); }],
    [11800, function () { touch('.hg-net--wa i'); }],
    [12300, function () { flash('is-app', 260); }],
    /* WhatsApp: se envía el enlace, llega, ella escribe y contesta (y se marca como leído) */
    [12550, function () { hero.classList.remove('is-ss'); hero.classList.add('is-chat', 'is-m1'); }],
    [12950, function () { hero.classList.add('is-delivered'); }],
    [13500, function () { hero.classList.add('is-typing'); }],
    [14400, function () { hero.classList.remove('is-typing'); hero.classList.add('is-m2', 'is-read'); }],
    /* Grupo cerrado: 2 de 2 */
    [15000, function () {
      setStep(3);
      setLine(3);
      stopClock();
      setOdo('n', '2');
      document.dispatchEvent(new CustomEvent('tuko:hero-pair'));
    }],
    /* El chat se aparta para que se vea el cierre del grupo */
    [15800, function () { hero.classList.remove('is-chat'); }],
    /* Final tranquilo: el popup se desvanece y vuelve la tienda (el inicio de la vuelta siguiente);
       el titular se vacía mientras tanto y la vuelta nueva lo escribe desde la línea 1 */
    [17700, function () { hero.classList.add('is-ending'); hero.classList.remove('is-fsp'); }],
    [18100, function () { setLine(0); }],
    [19200, null]
  ];

  var timers = [];
  var playing = false;
  var clockEnd = 0;
  var clockTimer = 0;
  var DAY = 24 * 3600;

  function setStep(n) { hero.setAttribute('data-step', String(n)); }
  function setLine(n) { hero.setAttribute('data-line', String(n)); }
  function flash(cls, ms) {
    hero.classList.remove(cls);
    void hero.offsetWidth;
    hero.classList.add(cls);
    timers.push(setTimeout(function () { hero.classList.remove(cls); }, ms));
  }
  /* El dedo se coloca encima de lo que va a pulsar (coordenadas dentro de la pantalla) */
  function touch(sel) {
    var el = hero.querySelector(sel);
    if (!el || !finger || !screen) return;
    var x = el.offsetWidth / 2, y = el.offsetHeight / 2;
    for (var n = el; n && n !== screen; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
    finger.style.left = x + 'px';
    finger.style.top = y + 'px';
    flash('is-touch', 950);
  }
  /* Escribe un campo letra a letra, con el cursor y el foco azul del formulario real */
  function type(i) {
    blur();
    var el = fields[i];
    if (!el) return;
    var txt = el.getAttribute('data-fill');
    var n = 0;
    el.classList.add('is-typing', 'is-filled');
    el.textContent = '';
    var step = function () {
      el.textContent = txt.slice(0, ++n);
      if (n < txt.length) timers.push(setTimeout(step, Math.max(28, 420 / txt.length)));
    };
    step();
  }
  function blur() { fields.forEach(function (el) { el.classList.remove('is-typing'); }); }
  function reset() {
    hero.classList.remove('is-fsp', 'is-modal', 'is-join', 'is-checked', 'is-preparing', 'is-redirect', 'is-ok', 'is-joined',
      'is-ss', 'is-chat', 'is-m1', 'is-delivered', 'is-typing', 'is-m2', 'is-read',
      'is-tap', 'is-cta', 'is-paytap', 'is-share', 'is-app', 'is-call', 'is-touch');
    fields.forEach(function (el) { el.classList.remove('is-typing', 'is-filled'); el.textContent = el.getAttribute('data-ph'); });
    setStep(1);
    setLine(1);
    stopClock();
    setOdo('n', '0', true);
    setClock(DAY, true);
    void hero.offsetWidth;
    hero.classList.remove('is-ending');
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  /* Horas totales : minutos : segundos, como el reloj del widget */
  function setClock(s, instant) {
    setOdo('h', pad(Math.floor(s / 3600)), instant);
    setOdo('m', pad(Math.floor((s % 3600) / 60)), instant);
    setOdo('s', pad(s % 60), instant);
  }
  function tick() { setClock(Math.max(0, Math.round((clockEnd - Date.now()) / 1000))); }
  function startClock() {
    clockEnd = Date.now() + DAY * 1000;
    clearInterval(clockTimer);
    clockTimer = setInterval(tick, 1000);
  }
  function stopClock() { clearInterval(clockTimer); clockTimer = 0; }

  /* Marcador: una columna 0…9 por dígito; al cambiar, la columna se desliza hasta el número */
  function buildOdo(el) {
    var txt = el.textContent.trim();
    var cols = [];
    el.textContent = '';
    el.classList.add('hg-odo');
    for (var c = 0; c < txt.length; c++) {
      var wrap = document.createElement('span');
      var col = document.createElement('span');
      wrap.className = 'hg-odo-d';
      col.className = 'hg-odo-col';
      for (var k = 0; k <= 9; k++) {
        var i = document.createElement('i');
        i.textContent = k;
        col.appendChild(i);
      }
      wrap.appendChild(col);
      el.appendChild(wrap);
      cols.push(col);
    }
    return cols;
  }
  function setOdo(key, digits, instant) {
    var cols = odo[key];
    if (!cols) return;
    cols.forEach(function (col, i) {
      col.classList.toggle('is-instant', !!instant);
      col.style.transform = 'translateY(' + (-Number(digits[i] || 0) * 1.2) + 'em)';
    });
    if (instant) {
      void hero.offsetWidth;
      cols.forEach(function (col) { col.classList.remove('is-instant'); });
    }
  }

  function play(delay) {
    stop();
    playing = true;
    SCRIPT.forEach(function (beat) {
      timers.push(setTimeout(function () {
        if (beat[1]) beat[1]();
        else play(0);
      }, beat[0] + delay));
    });
  }
  function stop() {
    timers.forEach(clearTimeout);
    timers = [];
    playing = false;
  }

  /* Solo corre mientras se ve; al volver, la historia empieza desde el principio */
  var visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !document.hidden) { if (!playing) play(400); }
      else { stop(); reset(); }
    }, { threshold: 0.25 }).observe(stage);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { stop(); reset(); }
    else if (visible) play(400);
  });
  play(900);

  /* ── Ondas de difusión: al completarse el grupo, una onda sale del móvil y enciende la rejilla ── */
  var dots = hero.querySelector('.hg-dots');
  if (dots && dots.getContext && phone) initDots(dots);

  function initDots(cv) {
    var ctx = cv.getContext('2d');
    var title = hero.querySelector('.hero-title');
    var GAP = 22;
    var WAVE_MS = 1900;
    var W = 0, H = 0, cx = 0, cy = 0, edge = 0, reach = 0, near = 0;
    var pts = [];
    var waveStart = 0;
    var raf = 0;

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function smooth(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

    function measure() {
      var r = cv.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var pr = phone.getBoundingClientRect();
      cx = pr.left + pr.width / 2 - r.left;
      cy = pr.top + pr.height * 0.45 - r.top;
      var stacked = window.innerWidth <= 900;
      /* Borde real del texto: la línea más larga, no la caja del h1 */
      edge = -1e4;
      if (title && !stacked) {
        title.querySelectorAll('.hero-line').forEach(function (l) { edge = Math.max(edge, l.getBoundingClientRect().right - r.left); });
      }
      near = pr.width * 1.75;
      reach = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy));
      pts = [];
      var ox = cx % GAP, oy = cy % GAP;
      for (var y = oy; y < H; y += GAP) {
        for (var x = ox; x < W; x += GAP) {
          var d = Math.hypot(x - cx, y - cy);
          /* Sin puntos detrás del texto: se apagan antes de llegar al titular */
          var side = smooth(edge - 60, edge + 120, x);
          pts.push([x, y, d, side]);
        }
      }
      draw(-1);
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      var ink = dark ? '255,255,255' : '20,24,38';
      var baseA = dark ? 0.13 : 0.16;
      var r = t >= 0 ? easeOut(t) * reach : -1;
      var fade = t >= 0 ? Math.pow(1 - t, 1.25) : 0;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var base = baseA * (1 - smooth(near * 0.25, near, p[2])) * p[3];
        var ring = 0;
        if (r >= 0) {
          var k = (p[2] - r) / 58;
          ring = Math.exp(-k * k) * fade * (0.3 + 0.7 * p[3]);
        }
        if (base < 0.004 && ring < 0.004) continue;
        if (ring > 0.02) {
          var m = Math.min(1, p[2] / (reach * 0.8));
          var c = Math.round(20 + (66 - 20) * m) + ',' + Math.round(196 + (87 - 196) * m) + ',' + Math.round(146 + (255 - 146) * m);
          ctx.fillStyle = 'rgba(' + c + ',' + Math.min(1, base + ring * 0.95).toFixed(3) + ')';
        } else {
          ctx.fillStyle = 'rgba(' + ink + ',' + base.toFixed(3) + ')';
        }
        ctx.beginPath();
        ctx.arc(p[0], p[1], 1.15 + ring * 1.8, 0, 6.2832);
        ctx.fill();
      }
    }

    function frame(now) {
      var t = (now - waveStart) / WAVE_MS;
      if (t >= 1) { raf = 0; draw(-1); return; }
      draw(t);
      raf = requestAnimationFrame(frame);
    }

    document.addEventListener('tuko:hero-pair', function () {
      if (!W) return;
      waveStart = performance.now();
      if (!raf) raf = requestAnimationFrame(frame);
    });

    measure();
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(hero);
    else window.addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    new MutationObserver(function () { if (!raf) draw(-1); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  /* ── Giro 3D del móvil con muelle: recto en reposo, sigue al ratón y vuelve al salir ── */
  if (tilt && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var rx = 0, ry = 0, vx = 0, vy = 0, tx = 0, ty = 0, raf = 0, last = 0;
    var K = 48, C = 2 * Math.sqrt(K);
    var step = function (now) {
      var dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      vx += ((tx - rx) * K - vx * C) * dt;
      vy += ((ty - ry) * K - vy * C) * dt;
      rx += vx * dt;
      ry += vy * dt;
      tilt.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
      if (Math.abs(tx - rx) + Math.abs(ty - ry) + Math.abs(vx) + Math.abs(vy) > 0.02) raf = requestAnimationFrame(step);
      else { raf = 0; last = 0; }
    };
    var aim = function (x, y) {
      tx = x;
      ty = y;
      if (!raf) raf = requestAnimationFrame(step);
    };
    hero.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      var px = (e.clientX - (r.left + r.width / 2)) / (r.width * 1.1);
      var py = (e.clientY - (r.top + r.height / 2)) / (r.height * 0.9);
      aim(Math.max(-1, Math.min(1, py)) * -7, Math.max(-1, Math.min(1, px)) * 12);
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { aim(0, 0); });
  }
})();
