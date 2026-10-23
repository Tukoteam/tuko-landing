/* Tuko AI · hero «el núcleo».
   El logo de Tuko es una nube de puntos en 3D (las cuatro formas con volumen) que gira despacio y sigue al cursor.
   Guion: las seis señales se analizan una tras otra; cada una lanza sus puntos, que vuelan en curva hasta su sitio
   en el logo. Al 100 % el núcleo late con un anillo de luz. Después, chispas de datos
   siguen llegando desde las señales y una línea de luz recorre el logo. Siempre animado. */
(function () {
  'use strict';

  var stage = document.querySelector('.ax-stage');
  if (!stage) return;
  var canvas = stage.querySelector('.ax-canvas');
  var ctx = canvas.getContext('2d');
  var coreEl = stage.querySelector('.ax-core');
  var sigs = Array.prototype.slice.call(stage.querySelectorAll('.ax-sig'));
  var pctEl = stage.querySelector('.ax-pct');
  var hud = stage.querySelector('.ax-hud');
  var mobile = window.matchMedia('(max-width: 960px)');

  /* Las cuatro formas del logo (viewBox 44 36 213 249); las dos de la derecha son medias elipses (forma de D) */
  var SHAPES = [
    { cx: 132.298, cy: 160.5, rx: 32.133, ry: 120.5, half: false },
    { cx: 164.431, cy: 160.5, rx: 56.233, ry: 120.5, half: true },
    { cx: 220.657, cy: 160.497, rx: 32.133, ry: 80.333, half: true },
    { cx: 80.084, cy: 160.497, rx: 20.083, ry: 80.333, half: false }
  ];
  var LX = 156.4, LY = 160.5, LH = 241;

  /* Guion (ms desde que empieza) */
  var T0 = 900, STEP = 620, SCAN = 700;
  var PREP = T0 + 5 * STEP + SCAN + 120;
  var READY = T0 + 5 * STEP + 2300;

  var pts = [];
  var rand = Math.random;
  /* A qué señal pertenece cada punto: por su sitio en el logo (izquierda/derecha × arriba/medio/abajo);
     en móvil las señales están arriba en dos filas de tres */
  var signalOf = function (x, y) {
    if (mobile.matches) {
      var col = x < -0.12 ? 0 : x > 0.12 ? 2 : 1;
      return (y < 0 ? 0 : 3) + col;
    }
    var row = y < -0.17 ? 0 : y > 0.17 ? 2 : 1;
    return row * 2 + (x < 0 ? 0 : 1);
  };
  var add = function (x, y, z, rim) {
    var p = { x: (x - LX) / LH, y: (y - LY) / LH, z: z / LH, rim: rim, flash: 0, sx: 0, sy: 0 };
    p.k = signalOf(p.x, p.y);
    p.launch = T0 + p.k * STEP + rand() * 520;
    p.dur = 1000 + rand() * 650;
    p.bend = (rand() < 0.5 ? -1 : 1) * (0.18 + rand() * 0.32);
    p.jx = (rand() - 0.5) * 22;
    p.jy = (rand() - 0.5) * 22;
    pts.push(p);
  };
  /* Superficie delantera y trasera de cada forma (una rejilla con algo de azar) + el contorno, más denso */
  var build = function () {
    pts = [];
    var g = mobile.matches ? 5.6 : 4.5;
    SHAPES.forEach(function (s) {
      var x0 = s.half ? s.cx : s.cx - s.rx;
      for (var x = x0 + g / 2; x < s.cx + s.rx; x += g) {
        for (var y = s.cy - s.ry + g / 2; y < s.cy + s.ry; y += g) {
          var nx = (x - s.cx) / s.rx, ny = (y - s.cy) / s.ry;
          var q = 1 - nx * nx - ny * ny;
          if (q <= 0.02) continue;
          var jx = (rand() - 0.5) * g * 0.4, jy = (rand() - 0.5) * g * 0.4;
          var z = 0.55 * s.rx * Math.sqrt(q);
          add(x + jx, y + jy, z, false);
          add(x + jx, y + jy, -z, false);
        }
      }
      var per = (s.half ? Math.PI : 2 * Math.PI) * (s.rx + s.ry) / 2;
      var n = Math.round(per / (mobile.matches ? 2.8 : 2.2));
      for (var i = 0; i < n; i++) {
        var a = s.half ? -Math.PI / 2 + Math.PI * i / n : 2 * Math.PI * i / n;
        add(s.cx + Math.cos(a) * s.rx, s.cy + Math.sin(a) * s.ry, 0, true);
      }
      if (s.half) for (var yy = s.cy - s.ry; yy <= s.cy + s.ry; yy += 3) add(s.cx, yy, 0, true);
    });
  };

  /* ── Medidas ── */
  var W = 0, H = 0, dpr = 1, cx = 0, cy = 0, scale = 1, chips = [];
  var layout = function () {
    var r = stage.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width;
    H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    var c = coreEl.getBoundingClientRect();
    cx = c.left - r.left + c.width / 2;
    cy = c.top - r.top + c.height / 2;
    scale = c.height;
    measureChips(r);
  };
  var measureChips = function (r) {
    r = r || stage.getBoundingClientRect();
    chips = sigs.map(function (s) {
      var b = s.querySelector('.ax-sig-ico').getBoundingClientRect();
      return { x: b.left - r.left + b.width / 2, y: b.top - r.top + b.height / 2 };
    });
  };

  /* ── Cursor: el núcleo se gira hacia él con inercia ── */
  var mx = 0, my = 0, rotY = 0, rotX = 0;
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var r = stage.getBoundingClientRect();
    mx = Math.max(-1, Math.min(1, (e.clientX - (r.left + cx)) / (W / 2)));
    my = Math.max(-1, Math.min(1, (e.clientY - (r.top + cy)) / (H / 2)));
  }, { passive: true });
  document.addEventListener('pointerleave', function () { mx = 0; my = 0; });

  /* ── Inclinación 3D del lado del núcleo (como el móvil de Inicio): muelle, recto en reposo, sigue al ratón ──
     Las etiquetas flotan a distintas alturas (translateZ), así que al inclinarse se separan del logo. */
  var tiltEl = stage.querySelector('.ax-tilt');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var trx = 0, try_ = 0, vrx = 0, vry = 0, aimX = 0, aimY = 0, tLast = 0;
  var K = 48, C = 2 * Math.sqrt(K);
  stage.addEventListener('pointermove', function (e) {
    if (!fine.matches || e.pointerType !== 'mouse') return;
    var r = stage.getBoundingClientRect();
    var px = (e.clientX - (r.left + cx)) / (r.width * 0.6);
    var py = (e.clientY - (r.top + cy)) / (r.height * 0.8);
    aimX = Math.max(-1, Math.min(1, py)) * -6;
    aimY = Math.max(-1, Math.min(1, px)) * 9;
  }, { passive: true });
  stage.addEventListener('pointerleave', function () { aimX = 0; aimY = 0; });
  var stepTilt = function (now) {
    if (!tiltEl || !fine.matches) return false;
    var dt = Math.min(0.05, tLast ? (now - tLast) / 1000 : 0.016);
    tLast = now;
    vrx += ((aimX - trx) * K - vrx * C) * dt;
    vry += ((aimY - try_) * K - vry * C) * dt;
    trx += vrx * dt;
    try_ += vry * dt;
    if (Math.abs(trx) + Math.abs(try_) + Math.abs(vrx) + Math.abs(vry) < 0.01) { tiltEl.style.transform = ''; return false; }
    tiltEl.style.transform = 'rotateX(' + trx.toFixed(2) + 'deg) rotateY(' + try_.toFixed(2) + 'deg)';
    return true;
  };

  /* ── Estado del guion en la página ── */
  var phase = -1;
  var setChip = function (k, cls) { if (sigs[k]) sigs[k].classList.add(cls); };
  var ease = function (u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
  var script = function (t) {
    for (var k = 0; k < 6; k++) {
      if (t >= T0 + k * STEP) setChip(k, 'is-scan');
      if (t >= T0 + k * STEP + SCAN) { sigs[k].classList.remove('is-scan'); setChip(k, 'is-done'); }
    }
    var p = Math.max(0, Math.min(1, (t - T0) / (6 * STEP + 900)));
    var shown = Math.round(ease(p) * 100);
    if (pctEl && pctEl.textContent !== String(shown)) pctEl.textContent = shown;
    if (hud) hud.style.setProperty('--ax-p', ease(p).toFixed(3));
    if (t >= PREP && phase < 1) { phase = 1; stage.classList.add('is-preparing'); }
    if (t >= READY && phase < 2) { phase = 2; readyAt = performance.now(); stage.classList.remove('is-preparing'); stage.classList.add('is-ready'); }
  };

  /* ── Dibujo ── */
  var BUCKETS = [
    { c: '#3446d8', a: 0.32 },
    { c: '#5b6eff', a: 0.55 },
    { c: '#9aa8ff', a: 0.8 },
    { c: '#e6ebff', a: 0.95 },
    { c: '#c9fff0', a: 1 }
  ];
  var bx = [[], [], [], [], []];
  var sparks = [], lastSpark = 0, readyAt = 0;
  var dust = [];
  /* Estrellitas: muchas pequeñas que suben despacio y titilan, y unas pocas más grandes con brillo */
  for (var d = 0; d < 110; d++) dust.push({ x: rand(), y: rand(), v: 0.004 + rand() * 0.012, s: 0.6 + rand() * 1.2, a: 0.12 + rand() * 0.3, tw: rand() * 6.28, big: rand() < 0.09 });

  var bez = function (a, c, b, e) {
    var i = 1 - e;
    return [i * i * a[0] + 2 * i * e * c[0] + e * e * b[0], i * i * a[1] + 2 * i * e * c[1] + e * e * b[1]];
  };
  var ctrlOf = function (fx, fy, tx, ty, bend) {
    var dx = tx - fx, dy = ty - fy;
    return [(fx + tx) / 2 - dy * bend, (fy + ty) / 2 + dx * bend];
  };

  var t0 = 0, running = false, visible = true, armed = false;
  var frame = function (now) {
    if (!running) return;
    /* El guion espera a que el núcleo esté a la vista (en móvil queda debajo del texto) */
    if (!t0 || !armed) t0 = now;
    var t = now - t0;
    script(t);
    /* Si el lado se inclina, las etiquetas se mueven: los datos salen de donde están ahora */
    if (stepTilt(now)) measureChips();

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    /* Polvo muy suave por todo el escenario */
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#aab6ff';
    for (var i = 0; i < dust.length; i++) {
      var du = dust[i];
      du.y -= du.v / 60;
      if (du.y < -0.02) { du.y = 1.02; du.x = rand(); }
      var al = du.a * (0.55 + 0.45 * Math.sin(now * 0.002 + du.tw));
      ctx.globalAlpha = al;
      ctx.fillRect(du.x * W, du.y * H, du.s, du.s);
      if (du.big) {
        ctx.globalAlpha = al * 0.35;
        ctx.fillRect(du.x * W - 2, du.y * H + du.s / 2 - 0.5, 4 + du.s, 1);
        ctx.fillRect(du.x * W + du.s / 2 - 0.5, du.y * H - 2, 1, 4 + du.s);
      }
    }

    ctx.globalCompositeOperation = 'lighter';
    var readyK = phase >= 2 ? Math.min(1, (now - readyAt) / 900) : 0;
    var built = Math.max(0, Math.min(1, (t - T0) / (READY - T0)));

    /* Halo detrás del núcleo: crece con lo que se ha formado y late al terminar */
    var pulse = phase >= 2 ? Math.max(0, 1 - (now - readyAt) / 1400) : 0;
    var hr = scale * (0.55 + 0.1 * Math.sin(now * 0.0012));
    var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, hr);
    grd.addColorStop(0, 'rgba(80, 100, 255,' + (0.1 + built * 0.16 + pulse * 0.25) + ')');
    grd.addColorStop(1, 'rgba(80, 100, 255, 0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = grd;
    ctx.fillRect(cx - hr, cy - hr, hr * 2, hr * 2);

    /* Giro: vaivén lento + cursor */
    rotY += (Math.sin(now * 0.00042) * 0.36 + mx * 0.4 - rotY) * 0.05;
    rotX += (my * -0.26 + Math.sin(now * 0.00031) * 0.06 - rotX) * 0.05;
    var cY = Math.cos(rotY), sY = Math.sin(rotY), cX = Math.cos(rotX), sX = Math.sin(rotX);
    var sc = scale * (1 + Math.sin(now * 0.0016) * 0.012 * readyK + pulse * 0.03);
    var bandY = phase >= 2 ? -0.62 + ((now - readyAt) * 0.00032) % 1.9 : -9;

    for (var b = 0; b < 5; b++) bx[b].length = 0;
    ctx.beginPath();
    var flying = 0;
    for (var j = 0; j < pts.length; j++) {
      var p = pts[j];
      var x1 = p.x * cY + p.z * sY;
      var z1 = -p.x * sY + p.z * cY;
      var y1 = p.y * cX - z1 * sX;
      var z2 = p.y * sX + z1 * cX;
      var per = 1 / (1 - z2 * 0.9);
      var tx = cx + x1 * sc * per, ty = cy + y1 * sc * per;
      p.sx = tx; p.sy = ty;
      var dpt = Math.max(0, Math.min(1, (z2 / 0.15 + 1) / 2));
      if (t < p.launch) {
        /* Aún no ha llegado: no se dibuja (el logo solo aparece con los datos) */
        continue;
      }
      var u = (t - p.launch) / p.dur;
      if (u < 1) {
        var ch = chips[p.k] || { x: cx, y: cy };
        var fx = ch.x + p.jx, fy = ch.y + p.jy;
        var c = ctrlOf(fx, fy, tx, ty, p.bend);
        var e = 1 - Math.pow(1 - u, 3);
        var a = bez([fx, fy], c, [tx, ty], e);
        var a0 = bez([fx, fy], c, [tx, ty], Math.max(0, e - 0.07));
        ctx.moveTo(a0[0], a0[1]);
        ctx.lineTo(a[0], a[1]);
        flying++;
        continue;
      }
      var bucket = dpt < 0.3 ? 0 : dpt < 0.55 ? 1 : dpt < 0.8 ? 2 : 3;
      var size = (0.9 + dpt * 1.5) * (p.rim ? 1.15 : 1);
      if ((p.flash && now - p.flash < 480) || Math.abs(p.y - bandY) < 0.022) { bucket = 4; size += 0.6; }
      bx[bucket].push(tx, ty, size);
    }
    if (flying) {
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = '#9fb0ff';
      ctx.lineWidth = 1.1;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    for (var q = 0; q < 5; q++) {
      var arr = bx[q];
      if (!arr.length) continue;
      ctx.fillStyle = BUCKETS[q].c;
      ctx.globalAlpha = BUCKETS[q].a;
      for (var n = 0; n < arr.length; n += 3) {
        var s2 = arr[n + 2];
        ctx.fillRect(arr[n] - s2 / 2, arr[n + 1] - s2 / 2, s2, s2);
      }
    }

    /* Anillo al completarse */
    if (pulse > 0) {
      var rr = scale * (0.35 + (1 - pulse) * 0.7);
      ctx.globalAlpha = pulse * 0.7;
      ctx.strokeStyle = '#a9b6ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rr * 0.9, rr, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    /* Chispas: después del análisis, los datos siguen llegando desde las señales y encienden su punto */
    if (phase >= 1 && now - lastSpark > 120 && sparks.length < 26) {
      lastSpark = now;
      var target = pts[(rand() * pts.length) | 0];
      if (target && !target.rim) sparks.push({ p: target, k: target.k, s: now, dur: 900 + rand() * 600, bend: (rand() - 0.5) * 0.8 });
    }
    if (sparks.length) {
      ctx.strokeStyle = '#c9d3ff';
      ctx.lineWidth = 1.3;
      for (var m = sparks.length - 1; m >= 0; m--) {
        var sp = sparks[m];
        var v = (now - sp.s) / sp.dur;
        if (v >= 1) { sp.p.flash = now; sparks.splice(m, 1); continue; }
        var ch2 = chips[sp.k] || { x: cx, y: cy };
        var c2 = ctrlOf(ch2.x, ch2.y, sp.p.sx, sp.p.sy, sp.bend);
        var e2 = ease(v);
        var h1 = bez([ch2.x, ch2.y], c2, [sp.p.sx, sp.p.sy], e2);
        var h0 = bez([ch2.x, ch2.y], c2, [sp.p.sx, sp.p.sy], Math.max(0, e2 - 0.12));
        ctx.globalAlpha = Math.sin(v * Math.PI) * 0.8;
        ctx.beginPath();
        ctx.moveTo(h0[0], h0[1]);
        ctx.lineTo(h1[0], h1[1]);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(frame);
  };

  var start = function () {
    if (running || !visible) return;
    running = true;
    requestAnimationFrame(frame);
  };
  /* Fuera de pantalla se para (el guion sigue donde lo dejó) */
  var pausedAt = 0;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      visible = e[0].isIntersecting;
      if (!visible && running) { running = false; pausedAt = performance.now(); }
      else if (visible && !running) { if (t0 && pausedAt) t0 += performance.now() - pausedAt; start(); }
    }).observe(stage);
  }

  var visual = stage.querySelector('.ax-visual');
  if ('IntersectionObserver' in window && visual) {
    var armIo = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { armIo.disconnect(); setTimeout(function () { armed = true; }, 150); }
    }, { rootMargin: '0px 0px -55% 0px' });
    armIo.observe(visual);
  } else armed = true;

  var wasMobile = mobile.matches;
  window.addEventListener('resize', function () {
    layout();
    if (mobile.matches !== wasMobile) {
      wasMobile = mobile.matches;
      build();
      if (phase >= 2) pts.forEach(function (p) { p.launch = -1e9; });
    }
  });

  build();
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  stage.classList.add('is-on');
  setTimeout(layout, 700);
  start();
})();

/* Tuko AI · Qué analiza: monta el mes del calendario y las barras de ventas, enciende cada tarjeta al entrar en
   pantalla (.is-in) y mueve la luz que sigue al cursor (--mx, --my). */
(function () {
  'use strict';

  var sec = document.querySelector('.sx');
  if (!sec) return;

  /* Calendario: 35 días; el calor sube hacia la segunda mitad y hay un día pico (un viernes) */
  var cal = sec.querySelector('.sx-cal');
  if (cal) {
    var HEAT = '0010100' + '0101210' + '1012320' + '1223331' + '0120100';
    var html = '';
    for (var d = 0; d < 35; d++) html += '<i style="--d:' + d + '" data-h="' + HEAT[d] + '"' + (d === 25 ? ' class="is-peak"' : '') + '></i>';
    cal.innerHTML = html;
  }

  /* Ventas: 16 semanas que van creciendo; las últimas, en azul */
  var bars = sec.querySelector('.sx-bars');
  if (bars) {
    var H = [22, 30, 26, 38, 34, 44, 40, 52, 48, 58, 62, 56, 70, 78, 74, 92];
    bars.innerHTML = H.map(function (h, i) {
      return '<i style="--d:' + i + ';--h:' + h + '%"' + (i >= 12 ? ' class="is-hot"' : '') + '></i>';
    }).join('');
  }

  /* Cada tarjeta se enciende al entrar en pantalla */
  var cards = Array.prototype.slice.call(sec.querySelectorAll('.sx-card'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.25 });
    cards.forEach(function (c) { io.observe(c); });
  } else {
    cards.forEach(function (c) { c.classList.add('is-in'); });
  }

  /* Luz que sigue al cursor por dentro y por el borde de la tarjeta */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    cards.forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }
})();

/* Tuko AI · Cómo funcionará («la campaña se construye ante tus ojos»): la escena se mueve con el scroll (avance 0…1, suavizado) y se puede rebobinar.
   Conecta 0–0,33: el catálogo aparece y una luz lo escanea (deja nota verde o gris en cada producto).
   Propone 0,33–0,66: los demás se apagan, el elegido vuela a la tarjeta y las cuatro piezas encajan en su hueco.
   Aprende 0,66–1: el grupo se llena, la tarjeta se pone en verde, se apila con las siguientes y suben las barras. */
(function () {
  'use strict';

  var sec = document.querySelector('.fz');
  if (!sec) return;
  var track = sec.querySelector('.fz-track');
  var stage = sec.querySelector('.fz-stage');
  var scene = sec.querySelector('.fz-scene');
  var steps = Array.prototype.slice.call(sec.querySelectorAll('.fz-step'));
  var tilesBox = scene.querySelector('.fz-tiles');
  var scan = scene.querySelector('.fz-scan');
  var hero = scene.querySelector('.fz-hero-tile');
  var card = scene.querySelector('.fz-card');
  var cardHead = card.querySelector('.ax-card-head');
  var cardName = card.querySelector('.fz-prod > div');
  var prodSlot = card.querySelector('.fz-prod-slot');
  var slots = Array.prototype.slice.call(card.querySelectorAll('.fz-slot'));
  var pieces = Array.prototype.slice.call(scene.querySelectorAll('.fz-piece'));
  var groupBox = card.querySelector('.fz-group');
  var ghosts = [scene.querySelector('.fz-ghost--1'), scene.querySelector('.fz-ghost--2')];
  var learn = scene.querySelector('.fz-learn');
  var bars = Array.prototype.slice.call(learn.querySelectorAll('.fz-spark i'));

  /* Catálogo: 4 × 3 productos */
  /* Productos de tienda reconocibles; el 5 es el elegido (un sérum: lo tapa el producto que vuela) */
  var ICONS = [
    '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>', /* bolso */
    '<path d="M8 3 3.5 6l2 4L8 9v12h8V9l2.5 1 2-4L16 3a4 4 0 0 1-8 0Z"/>', /* camiseta */
    '<path d="M5 8h11v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8.5 3v2.5M12 3v2.5"/>', /* taza */
    '<circle cx="12" cy="12" r="5"/><path d="M9 7.5 9.5 3h5l.5 4.5M9 16.5l.5 4.5h5l.5-4.5"/><path d="M12 10v2l1.5 1"/>', /* reloj de pulsera */
    '<path d="M2.5 17V9.5L8 8.5l1.5 1.8L12.5 8l3 3.5 4 1.2a2.8 2.8 0 0 1 2 2.7V17Z"/><path d="M2.5 17v2h19.5v-2"/><path d="M10 11.5l1.4-.9M11.8 13.2l1.5-1M13.6 14.6l1.4-1"/>', /* zapatilla */
    '',
    '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><path d="M4 15h3v5H5a1 1 0 0 1-1-1ZM20 15h-3v5h2a1 1 0 0 0 1-1Z"/>', /* auriculares */
    '<path d="M10 3h4v4h-4z"/><path d="M8 7h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="14" r="2.5"/>', /* perfume */
    '<path d="M8 10h8v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z"/><path d="M12 10V7.5"/><path d="M12 3c1.2 1.3 1.4 2.4 0 3.5-1.4-1.1-1.2-2.2 0-3.5Z"/>', /* vela */
    '<path d="M6 10a6 6 0 0 1 12 0v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z"/><path d="M9.5 4.5V3h5v1.5"/><path d="M9 14h6v4H9z"/>', /* mochila */
    '<circle cx="7" cy="14" r="3.5"/><circle cx="17" cy="14" r="3.5"/><path d="M10.5 14h3M3.5 14 5 7.5M20.5 14 19 7.5"/>', /* gafas */
    '<path d="M7 14h10l-1.5 7h-7Z"/><path d="M12 14V9"/><path d="M12 10c0-3.2 2-5.5 5.5-5.5 0 3.2-2 5.5-5.5 5.5Z"/><path d="M12 12c0-2.6-1.8-4.5-4.8-4.5 0 2.6 1.8 4.5 4.8 4.5Z"/>' /* planta */
  ];
  var GOOD = { 5: 1, 1: 1, 10: 1 };
  var X0 = 67, Y0 = 72, T = 96, G = 14;
  var tiles = ICONS.map(function (ic, i) {
    var t = document.createElement('span');
    t.className = 'fz-tile' + (GOOD[i] ? ' is-good' : '');
    t.innerHTML = ic ? '<svg viewBox="0 0 24 24">' + ic + '</svg>' : '';
    t.style.left = (X0 + (i % 4) * (T + G)) + 'px';
    t.style.top = (Y0 + Math.floor(i / 4) * (T + G)) + 'px';
    if (i === 5) t.style.visibility = 'hidden';
    tilesBox.appendChild(t);
    return t;
  });
  /* Grupo de 2 personas: dos plazas que se llenan */
  var dots = [];
  for (var d = 0; d < 2; d++) { var dt = document.createElement('i'); dt.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/></svg>'; groupBox.appendChild(dt); dots.push(dt); }

  /* Tramo local 0…1 de [a, b], con curva suave */
  var seg = function (p, a, b) { return Math.max(0, Math.min(1, (p - a) / (b - a))); };
  var ease = function (u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
  var lerp = function (a, b, u) { return a + (b - a) * u; };

  /* Dónde empieza y dónde acaba cada cosa (en px de la escena) */
  var HERO_FROM = { x: X0 + (T + G), y: Y0 + (T + G), s: 1 };
  var HERO_TO = { x: 108, y: 104 + 18 + 22 + 14, s: 56 / 96 };
  var PIECE_FROM = [{ x: -60, y: 20 }, { x: 560, y: 40 }, { x: -60, y: 430 }, { x: 560, y: 410 }];
  var slotPos = function (i) { return { x: 108 + i * (86 + 0), y: 104 + 18 + 22 + 14 + 56 + 14 }; };

  var render = function (p) {
    /* ── Conecta ── */
    tiles.forEach(function (t, i) {
      var inU = ease(seg(p, 0.01 + i * 0.006, 0.07 + i * 0.006));
      /* Propone: los que no son el elegido se apagan y caen, en cascada */
      var outU = ease(seg(p, 0.34 + (i % 4) * 0.01, 0.42 + (i % 4) * 0.01));
      t.style.opacity = (inU * (1 - outU)).toFixed(3);
      t.style.transform = 'translateY(' + ((1 - inU) * 14 + outU * 24).toFixed(1) + 'px) scale(' + (0.9 + inU * 0.1 - outU * 0.12).toFixed(3) + ')';
    });
    var scanU = seg(p, 0.08, 0.29);
    var scanY = Y0 - 6 + scanU * (3 * T + 2 * G + 12);
    scan.style.opacity = (scanU > 0 && scanU < 1 ? Math.min(1, Math.sin(scanU * Math.PI) * 2.5) : 0).toFixed(3);
    scan.style.transform = 'translateY(' + scanY.toFixed(1) + 'px)';
    tiles.forEach(function (t, i) { t.classList.toggle('is-scored', scanY > Y0 + Math.floor(i / 4) * (T + G) + T * 0.6 || p > 0.3); });

    /* ── Propone ── */
    var heroIn = ease(seg(p, 0.01 + 5 * 0.006, 0.07 + 5 * 0.006));
    var fly = ease(seg(p, 0.38, 0.48));
    var hx = lerp(HERO_FROM.x, HERO_TO.x, fly), hy = lerp(HERO_FROM.y, HERO_TO.y, fly), hs = lerp(1, HERO_TO.s, fly);
    /* Al llegar, el producto pasa a ser parte de la tarjeta (se mueve con ella al apilarse) */
    hero.style.opacity = (fly >= 1 ? 0 : heroIn).toFixed(3);
    prodSlot.classList.toggle('is-filled', fly >= 1);
    hero.style.transform = 'translate(' + hx.toFixed(1) + 'px,' + (hy + (1 - heroIn) * 14).toFixed(1) + 'px) scale(' + hs.toFixed(4) + ')';
    var cardU = ease(seg(p, 0.4, 0.48));
    /* Aprende: la tarjeta sube un poco y se encoge al apilarse */
    var stack = ease(seg(p, 0.82, 0.93));
    card.style.opacity = cardU.toFixed(3);
    card.style.transform = 'translateY(' + ((1 - cardU) * 18 - stack * 34).toFixed(1) + 'px) scale(' + (0.96 + cardU * 0.04 - stack * 0.06).toFixed(4) + ')';
    var headU = seg(p, 0.46, 0.52);
    cardHead.style.opacity = headU.toFixed(3);
    cardName.style.opacity = headU.toFixed(3);
    pieces.forEach(function (pc, i) {
      var a = 0.49 + i * 0.03;
      var u = ease(seg(p, a, a + 0.07));
      var to = slotPos(i);
      var fr = PIECE_FROM[i];
      /* Un pequeño arco en el viaje */
      var x = lerp(fr.x, to.x, u), y = lerp(fr.y, to.y, u) - Math.sin(u * Math.PI) * 40;
      /* Al encajar, la pieza desaparece y su valor queda dentro de la tarjeta */
      pc.style.opacity = (u > 0 && u < 1 ? Math.min(1, u * 4) : 0).toFixed(3);
      pc.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      slots[i].classList.toggle('is-filled', u >= 1);
    });

    /* ── Aprende ── */
    var fill = seg(p, 0.67, 0.8);
    dots.forEach(function (dt, i) { dt.classList.toggle('is-in', fill * 2 > i + 0.5); });
    card.classList.toggle('is-done', fill >= 1);
    ghosts.forEach(function (g, i) {
      var u = ease(seg(p, 0.84 + i * 0.03, 0.93 + i * 0.03));
      /* Asoman por encima de la tarjeta, cada una un poco más atrás */
      g.style.height = card.offsetHeight + 'px';
      g.style.opacity = (u * (0.6 - i * 0.25)).toFixed(3);
      g.style.transform = 'translateY(' + (-34 - u * 16 * (i + 1)).toFixed(1) + 'px) scale(' + (0.94 - (i + 1) * 0.05).toFixed(3) + ')';
    });
    var lU = ease(seg(p, 0.86, 0.95));
    learn.style.opacity = lU.toFixed(3);
    learn.style.transform = 'translateY(' + ((1 - lU) * 14).toFixed(1) + 'px)';
    bars.forEach(function (b, i) { b.style.transform = 'scaleY(' + ease(seg(p, 0.88 + i * 0.02, 0.94 + i * 0.02)).toFixed(3) + ')'; });

    /* Pasos de la izquierda */
    var active = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
    steps.forEach(function (s, i) {
      s.classList.toggle('is-on', i === active);
      s.style.setProperty('--sp', seg(p, i / 3, (i + 1) / 3).toFixed(3));
    });
  };

  /* La escena se escala para caber en el escenario */
  var fit = function () {
    /* En móvil se encuadra lo importante (el catálogo y la tarjeta, ~450 px de ancho): los bordes de la escena
       solo tienen piezas que entran volando */
    var w = window.matchMedia('(max-width: 900px)').matches ? 450 : 560;
    var k = Math.min(stage.clientWidth / w, stage.clientHeight / 460) * 0.96;
    scene.style.setProperty('--k', k.toFixed(4));
  };

  /* Avance del scroll, suavizado (sin tirones) */
  var target = 0, cur = -1, raf = 0;
  var read = function () {
    var r = track.getBoundingClientRect();
    target = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - window.innerHeight)));
  };
  var loop = function () {
    raf = 0;
    if (cur < 0) cur = target;
    cur += (target - cur) * 0.14;
    if (Math.abs(target - cur) < 0.0005) cur = target;
    render(cur);
    if (cur !== target) raf = requestAnimationFrame(loop);
  };
  var kick = function () { read(); if (!raf) raf = requestAnimationFrame(loop); };
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', function () { fit(); kick(); });
  fit();
  kick();
})();

/* Tuko AI · Lista de espera: el logo de Tuko (puntos en 3D) se enciende con tus datos.
   Al llegar a la sección el logo se forma entero (sus puntos vuelan a su sitio). Cada campo válido lanza datos
   desde detrás del formulario hacia el logo y lo enciende un poco más. Al enviarse (status «ok»), se ilumina
   del todo, late con un anillo verde y una línea de luz lo recorre. Siempre animado. */
(function () {
  'use strict';

  var sec = document.querySelector('.wx');
  if (!sec) return;
  var stage = sec.querySelector('.wx-stage');
  var canvas = sec.querySelector('.wx-canvas');
  var ctx = canvas.getContext('2d');
  var core = sec.querySelector('.wx-core');
  var form = sec.querySelector('.wx-form');
  var status = sec.querySelector('[data-form-status]');
  var fields = ['web', 'nombre', 'email'].map(function (n) { return form.querySelector('[name="' + n + '"]'); });

  /* Las cuatro formas del logo, con volumen (igual que el núcleo del hero) */
  var SHAPES = [
    { cx: 132.298, cy: 160.5, rx: 32.133, ry: 120.5, half: false },
    { cx: 164.431, cy: 160.5, rx: 56.233, ry: 120.5, half: true },
    { cx: 220.657, cy: 160.497, rx: 32.133, ry: 80.333, half: true },
    { cx: 80.084, cy: 160.497, rx: 20.083, ry: 80.333, half: false }
  ];
  var LX = 156.4, LY = 160.5, LH = 241;
  var rand = Math.random;
  var pts = [];
  var add = function (x, y, z, rim) {
    pts.push({ x: (x - LX) / LH, y: (y - LY) / LH, z: z / LH, rim: rim, t0: -1, r: rand(), bend: (rand() - 0.5) * 0.7, flash: 0, sx: 0, sy: 0 });
  };
  var build = function (g) {
    pts = [];
    SHAPES.forEach(function (s) {
      var x0 = s.half ? s.cx : s.cx - s.rx;
      for (var x = x0 + g / 2; x < s.cx + s.rx; x += g) {
        for (var y = s.cy - s.ry + g / 2; y < s.cy + s.ry; y += g) {
          var nx = (x - s.cx) / s.rx, ny = (y - s.cy) / s.ry, q = 1 - nx * nx - ny * ny;
          if (q <= 0.02) continue;
          var jx = (rand() - 0.5) * g * 0.4, jy = (rand() - 0.5) * g * 0.4, z = 0.55 * s.rx * Math.sqrt(q);
          add(x + jx, y + jy, z, false);
          add(x + jx, y + jy, -z, false);
        }
      }
      var n = Math.round((s.half ? Math.PI : 2 * Math.PI) * (s.rx + s.ry) / 2 / 2.6);
      for (var i = 0; i < n; i++) {
        var a = s.half ? -Math.PI / 2 + Math.PI * i / n : 2 * Math.PI * i / n;
        add(s.cx + Math.cos(a) * s.rx, s.cy + Math.sin(a) * s.ry, 0, true);
      }
    });
  };
  var mobile = window.matchMedia('(max-width: 900px)');
  build(mobile.matches ? 6.2 : 5);

  /* Medidas */
  var W = 0, H = 0, dpr = 1, cx = 0, cy = 0, scale = 1, src = { x: 0, y: 0, w: 0, h: 0 };
  var layout = function () {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    var r = stage.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    var c = core.getBoundingClientRect();
    cx = c.left - r.left;
    cy = c.top - r.top + c.height / 2;
    scale = c.height;
    /* Los datos nacen detrás del formulario de cristal (asoman por su borde, sin cortes) */
    var f = form.getBoundingClientRect();
    src = { x: f.left - r.left, y: f.top - r.top, w: f.width, h: f.height };
  };

  /* Qué campos valen ahora */
  var ok = [false, false, false], done = false, doneAt = 0;
  var valid = function (i, v) {
    v = (v || '').trim();
    if (i === 0) return /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/.*)?$/i.test(v);
    if (i === 1) return v.length >= 2;
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  };
  /* Datos que viajan del formulario al logo cuando un campo pasa a ser válido */
  var sparks = [];
  var launch = function (count) {
    var now = performance.now();
    for (var k = 0; k < count; k++) {
      var p = pts[(rand() * pts.length) | 0];
      if (p && !p.rim) sparks.push({ p: p, s: now + rand() * 450, dur: 800 + rand() * 500, bend: (rand() - 0.5) * 0.8, fx: rand(), fy: rand() });
    }
  };
  var level = 0;
  var sync = function () {
    fields.forEach(function (f, i) {
      var v = done || valid(i, f.value);
      f.closest('.cta-field').classList.toggle('is-valid', !done && v);
      if (v && !ok[i] && !done) launch(46);
      ok[i] = v;
    });
  };
  fields.forEach(function (f) { f.addEventListener('input', sync); });
  /* Enviado: se queda completo y late */
  if (status) new MutationObserver(function () {
    if (status.getAttribute('data-state') === 'ok' && !done) { launch(80); done = true; doneAt = performance.now(); sec.classList.add('is-done'); sync(); }
  }).observe(status, { attributes: true, attributeFilter: ['data-state'] });

  /* Cursor */
  var mx = 0, my = 0, rotY = 0, rotX = 0;
  stage.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var r = stage.getBoundingClientRect();
    mx = Math.max(-1, Math.min(1, (e.clientX - r.left - cx) / (W / 2)));
    my = Math.max(-1, Math.min(1, (e.clientY - r.top - cy) / (H / 2)));
  }, { passive: true });
  stage.addEventListener('pointerleave', function () { mx = 0; my = 0; });

  /* Más blancos que en el hero: aquí el logo tiene que leerse bien desde el principio */
  var BUCKETS = [{ c: '#7d8cff', a: 0.45 }, { c: '#a9b6ff', a: 0.7 }, { c: '#dbe1ff', a: 0.9 }, { c: '#ffffff', a: 1 }, { c: '#c9fff0', a: 1 }];
  var bx = [[], [], [], [], []];
  var dust = [];
  /* Estrellitas: muchas pequeñas que titilan y unas pocas más grandes con destello en cruz */
  for (var d = 0; d < 150; d++) dust.push({ x: rand(), y: rand(), v: 0.004 + rand() * 0.012, s: 0.6 + rand() * 1.2, a: 0.14 + rand() * 0.32, tw: rand() * 6.28, big: rand() < 0.1 });
  var bez = function (a, c, b, e) { var i = 1 - e; return [i * i * a[0] + 2 * i * e * c[0] + e * e * b[0], i * i * a[1] + 2 * i * e * c[1] + e * e * b[1]]; };

  var running = false;
  var frame = function (now) {
    if (!running) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#aab6ff';
    dust.forEach(function (du) {
      du.y -= du.v / 60;
      if (du.y < -0.02) { du.y = 1.02; du.x = rand(); }
      var al = du.a * (0.55 + 0.45 * Math.sin(now * 0.002 + du.tw));
      ctx.globalAlpha = al;
      ctx.fillRect(du.x * W, du.y * H, du.s, du.s);
      if (du.big) {
        ctx.globalAlpha = al * 0.35;
        ctx.fillRect(du.x * W - 2, du.y * H + du.s / 2 - 0.5, 4 + du.s, 1);
        ctx.fillRect(du.x * W + du.s / 2 - 0.5, du.y * H - 2, 1, 4 + du.s);
      }
    });
    ctx.globalCompositeOperation = 'lighter';

    var n = ok.filter(Boolean).length;
    /* Cuánto se enciende el logo: un poco con cada campo válido y del todo al enviar */
    level += ((done ? 1 : 0.72 + n * 0.09) - level) * 0.06;
    var pulse = done ? Math.max(0, 1 - (now - doneAt) / 1400) : 0;
    /* Halo: crece con lo que hay formado */
    var hr = scale * (0.5 + 0.08 * Math.sin(now * 0.0012));
    var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, hr);
    grd.addColorStop(0, 'rgba(80, 100, 255,' + (0.06 + n * 0.06 + pulse * 0.25) + ')');
    grd.addColorStop(1, 'rgba(80, 100, 255, 0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = grd;
    ctx.fillRect(cx - hr, cy - hr, hr * 2, hr * 2);

    rotY += (Math.sin(now * 0.0004) * 0.4 + mx * 0.4 - rotY) * 0.05;
    rotX += (my * -0.24 - rotX) * 0.05;
    var cY = Math.cos(rotY), sY = Math.sin(rotY), cX = Math.cos(rotX), sX = Math.sin(rotX);
    var sc = scale * (1 + pulse * 0.04);
    var bandY = done ? -0.62 + ((now - doneAt) * 0.00032) % 1.9 : -9;

    for (var b = 0; b < 5; b++) bx[b].length = 0;
    ctx.beginPath();
    var flying = 0;
    for (var j = 0; j < pts.length; j++) {
      var p = pts[j];
      if (p.t0 < 0 || now < p.t0) continue;
      var x1 = p.x * cY + p.z * sY, z1 = -p.x * sY + p.z * cY;
      var y1 = p.y * cX - z1 * sX, z2 = p.y * sX + z1 * cX;
      var per = 1 / (1 - z2 * 0.9);
      var tx = cx + x1 * sc * per, ty = cy + y1 * sc * per;
      p.sx = tx;
      p.sy = ty;
      /* Al llegar a la sección, el logo se forma entero con dos corrientes que se encuentran: la mitad izquierda
         llega desde las esquinas de la izquierda y la derecha desde las de la derecha */
      var left = p.x < 0, top = (p.r * 3) % 1 < 0.5;
      var fx = left ? ((p.r * 7) % 1) * W * 0.14 - 30 : W + 30 - ((p.r * 7) % 1) * W * 0.14;
      var fy = top ? ((p.r * 13) % 1) * H * 0.2 - 30 : H + 30 - ((p.r * 13) % 1) * H * 0.2;
      var u = Math.min(1, (now - p.t0) / 1300);
      var e = 1 - Math.pow(1 - u, 3);
      if (u < 1) {
        var dx = tx - fx, dy = ty - fy;
        var c = [(fx + tx) / 2 - dy * p.bend, (fy + ty) / 2 + dx * p.bend];
        var k = e;
        var a1 = bez([fx, fy], c, [tx, ty], k), a0 = bez([fx, fy], c, [tx, ty], Math.max(0, k - 0.07));
        ctx.moveTo(a0[0], a0[1]);
        ctx.lineTo(a1[0], a1[1]);
        flying++;
        continue;
      }
      var dpt = Math.max(0, Math.min(1, (z2 / 0.15 + 1) / 2));
      var bucket = dpt < 0.3 ? 0 : dpt < 0.55 ? 1 : dpt < 0.8 ? 2 : 3;
      var size = (0.9 + dpt * 1.5) * (p.rim ? 1.15 : 1);
      if ((p.flash && now - p.flash < 500) || Math.abs(p.y - bandY) < 0.022) { bucket = 4; size += 0.6; }
      bx[bucket].push(tx, ty, size);
    }
    if (flying) { ctx.globalAlpha = 0.55; ctx.strokeStyle = '#9fb0ff'; ctx.lineWidth = 1.1; ctx.lineCap = 'round'; ctx.stroke(); }
    for (var q = 0; q < 5; q++) {
      var arr = bx[q];
      if (!arr.length) continue;
      ctx.fillStyle = BUCKETS[q].c;
      ctx.globalAlpha = q === 4 ? 1 : BUCKETS[q].a * level;
      for (var m = 0; m < arr.length; m += 3) ctx.fillRect(arr[m] - arr[m + 2] / 2, arr[m + 1] - arr[m + 2] / 2, arr[m + 2], arr[m + 2]);
    }
    /* Los datos que llegan desde el formulario y encienden su punto */
    if (sparks.length) {
      ctx.strokeStyle = '#c9d3ff';
      ctx.lineWidth = 1.3;
      for (var si = sparks.length - 1; si >= 0; si--) {
        var sp = sparks[si];
        if (now < sp.s) continue;
        var v = (now - sp.s) / sp.dur;
        if (v >= 1) { sp.p.flash = now; sparks.splice(si, 1); continue; }
        var ax = src.x + src.w * (0.25 + sp.fx * 0.6), ay = src.y + src.h * (0.15 + sp.fy * 0.7);
        var ddx = sp.p.sx - ax, ddy = sp.p.sy - ay;
        var cc = [(ax + sp.p.sx) / 2 - ddy * sp.bend, (ay + sp.p.sy) / 2 + ddx * sp.bend];
        var ev = v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
        var h1 = bez([ax, ay], cc, [sp.p.sx, sp.p.sy], ev), h0 = bez([ax, ay], cc, [sp.p.sx, sp.p.sy], Math.max(0, ev - 0.1));
        ctx.globalAlpha = Math.sin(v * Math.PI) * 0.85;
        ctx.beginPath();
        ctx.moveTo(h0[0], h0[1]);
        ctx.lineTo(h1[0], h1[1]);
        ctx.stroke();
      }
    }
    if (pulse > 0) {
      var rr = scale * (0.35 + (1 - pulse) * 0.7);
      ctx.globalAlpha = pulse * 0.7;
      ctx.strokeStyle = '#3fe0b0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rr * 0.9, rr, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(frame);
  };

  /* Solo se dibuja con la sección en pantalla */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      if (e[0].isIntersecting && !running) {
        running = true;
        layout();
        /* La primera vez, el logo se forma entero */
        /* Todos los puntos salen casi a la vez y llegan juntos: ninguno rezagado cuando el logo ya está formado */
        if (pts[0].t0 < 0) { var t = performance.now() + 200; pts.forEach(function (p) { p.t0 = t + rand() * 220; }); }
        requestAnimationFrame(frame);
      }
      else if (!e[0].isIntersecting) running = false;
    }).observe(stage);
  } else { running = true; requestAnimationFrame(frame); }
  window.addEventListener('resize', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  layout();
  sync();
})();
