/* Built from ./home-animations-en/ — edit parts, not this file */
/* ── ANIMATED PERSPECTIVE GRID ── */
function initGrid(canvas, opts) {
  const ctx = canvas.getContext('2d');
  let W, H, raf;
  let offset = 0, sideOff = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const speed   = opts.speed   !== undefined ? opts.speed   : 0.62;
    const cols    = opts.cols    !== undefined ? opts.cols    : 22;
    const spread  = opts.spread  !== undefined ? opts.spread  : 3.8;
    const zoom    = opts.zoom    !== undefined ? opts.zoom    : 1.4;
    const fadeLen = opts.fadeLen !== undefined ? opts.fadeLen : 0.42;
    const maxAlpha= opts.maxAlpha!== undefined ? opts.maxAlpha: 0.17;
    const base    = opts.baseColor || '90,90,90';
    const lateral = opts.lateral !== undefined ? opts.lateral : 0;
    const vpX     = opts.vpX    !== undefined ? opts.vpX * W : W / 2;
    const horizonY= opts.horizonY!== undefined ? opts.horizonY: 0.50;

    const horizonPx = horizonY * H;
    const floorH    = H - horizonPx;
    const lw        = opts.lineWidth !== undefined ? opts.lineWidth : 1.3;
    const halfW     = W * (1 + spread) / 2;

    // Advance offsets
    offset  = (offset  + speed * 0.004) % 1.0;
    sideOff = ((sideOff + lateral * speed * 0.004) % 1 + 1) % 1;

    const tileW = W * (1 + spread) / cols;

    // ── HORIZONTAL LINES ──
    const rowCount = Math.ceil(1 / Math.max(0.01, 1 - fadeLen)) + 2;
    for (let r = 0; r < rowCount; r++) {
      const frac = (r + offset) / rowCount;
      if (frac < 0 || frac > 1) continue;

      const depth  = zoom / Math.max(0.001, frac);
      const screenY = horizonPx + (floorH * zoom) / depth;
      if (screenY < horizonPx || screenY > H + 10) continue;

      const t       = (screenY - horizonPx) / Math.max(1, floorH);
      const alpha   = t < fadeLen ? (t / fadeLen) * maxAlpha : maxAlpha * (1 - (t - fadeLen) / (1 - fadeLen + 0.001));
      if (alpha <= 0) continue;

      const xShift = sideOff * tileW * t;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${base},${alpha.toFixed(3)})`;
      ctx.lineWidth = lw;
      ctx.moveTo(vpX - halfW + xShift, screenY);
      ctx.lineTo(vpX + halfW + xShift, screenY);
      ctx.stroke();
    }

    // ── VERTICAL LINES ──
    const cStart = Math.floor(-sideOff * cols) - 1;
    for (let c = cStart; c <= cStart + cols + 2; c++) {
      const p       = c / cols + sideOff;
      const xBottom = vpX + (p - 0.5) * W * (1 + spread);

      const grad = ctx.createLinearGradient(vpX, horizonPx, xBottom, H + 40);
      grad.addColorStop(0,          `rgba(${base},0)`);
      grad.addColorStop(fadeLen,    `rgba(${base},${maxAlpha})`);
      grad.addColorStop(1,          `rgba(${base},0)`);

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth   = lw;
      ctx.moveTo(vpX, horizonPx);
      ctx.lineTo(xBottom, H + 40);
      ctx.stroke();
    }

    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); });
  resize();
  draw();

  return {
    stop: () => cancelAnimationFrame(raf),
    setOpts: (patch) => { Object.assign(opts, patch || {}); }
  };
}

window.__tukoGrids = window.__tukoGrids || [];
var __tukoDark = document.documentElement.getAttribute('data-theme') === 'dark';

// Hero grid
const heroCanvas = document.getElementById('heroCanvas');
if (heroCanvas) {
  const heroGrid = initGrid(heroCanvas, {
    speed: 0.62, horizonY: 0.50, lineWidth: 1.3,
    cols: 22, spread: 3.8, zoom: 1.4, fadeLen: 0.42,
    maxAlpha: __tukoDark ? 0.21 : 0.17,
    baseColor: __tukoDark ? '110,128,210' : '90,90,90',
    vpX: 0.50, lateral: 0.04
  });
  heroGrid.role = 'hero';
  window.__tukoGrids.push(heroGrid);
}

// CTA grid
const ctaCanvas = document.getElementById('ctaCanvas');
if (ctaCanvas) {
  const ctaGrid = initGrid(ctaCanvas, {
    speed: 0.62, horizonY: 0.50, lineWidth: 1.3,
    cols: 22, spread: 3.8, zoom: 1.4, fadeLen: 0.42,
    maxAlpha: __tukoDark ? 0.28 : 0.17,
    baseColor: __tukoDark ? '160,175,255' : '255,255,255',
    vpX: 0.50, lateral: 0.04
  });
  ctaGrid.role = 'cta';
  window.__tukoGrids.push(ctaGrid);
}

/* ── SCROLL FADE-UP (siempre con JS; no se salta por “reducir movimiento”) ── */
(function () {
  var nodes = Array.prototype.slice.call(document.querySelectorAll('.fade-up'));
  if (!nodes.length) return;

  function reveal(el) {
    if (el.classList.contains('visible')) return;
    el.classList.add('visible');
    el.dispatchEvent(new CustomEvent('tuko:visible', { bubbles: true }));
  }

  if (!('IntersectionObserver' in window)) {
    nodes.forEach(reveal);
  } else {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        reveal(e.target);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach(function (el) { obs.observe(el); });
  }

  setTimeout(function () {
    document.querySelectorAll('.hero .fade-up').forEach(reveal);
  }, 80);
})();


/* ── Relojes de los mockups (hero y "Por qué compran"): cuentan hacia atrás de verdad ── */
(function () {
  const pad = (n) => String(n).padStart(2, '0');
  const clocks = document.querySelectorAll('[data-countdown]');
  if (!clocks.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DURS = [23 * 3600 + 59 * 60 + 59, 14 * 3600 + 49 * 60 + 25];
  const ends = Array.from(clocks).map((_, i) => Date.now() + (DURS[i] || DURS[0]) * 1000);
  function setClock(root, total) {
    let d = Math.max(0, total);
    const hrs = Math.floor(d / 3600); d -= hrs * 3600;
    const min = Math.floor(d / 60); const sec = d - min * 60;
    [['h', hrs], ['m', min], ['s', sec]].forEach(([k, v]) => {
      const el = root.querySelector('[data-cd="' + k + '"]');
      if (!el) return;
      const next = pad(v);
      if (el.textContent === next) return;
      el.textContent = next;
      if (k === 's' && !reduce) {
        el.classList.remove('is-tick');
        void el.offsetWidth;
        el.classList.add('is-tick');
      }
    });
  }
  function tick() {
    const now = Date.now();
    clocks.forEach((clock, i) => {
      setClock(clock, Math.max(0, Math.floor((ends[i] - now) / 1000)));
    });
  }
  tick();
  setInterval(tick, 1000);
})();

/* ── Widget del grupo: caras + aviso de gente nueva ── */
(function () {
  const widget = document.querySelector('.why-widget--group');
  if (!widget) return;
  const chip = widget.querySelector('.why-group-chip');
  const chipTxt = chip && chip.querySelector('[data-i18n="why3_w_chip"]');
  const chipFace = chip && chip.querySelector('[data-why-chip-face]');
  if (!chip || !chipTxt || !chipFace) return;

  const NAMES = ['Marta', 'Carlos', 'Lucía', 'Sofía', 'Diego', 'Luna'];
  let i = 0, timer = 0;

  function render() {
    if (typeof translations === 'undefined') return;
    const t = translations[document.documentElement.lang] || translations.es || {};
    const tpl = t.why3_w_chip_tpl || '{name} <em>acaba de unirse</em>';
    chipTxt.innerHTML = tpl.split('{name}').join(NAMES[i]);
    const src = widget.querySelector('[data-why-face="' + i + '"]');
    if (src) chipFace.innerHTML = src.innerHTML;
  }
  window.tukoWhyGroupRender = render;

  function pop() {
    chip.classList.remove('is-pop');
    void chip.offsetWidth;
    chip.classList.add('is-pop');
  }

  function tick() {
    i = (i + 1) % NAMES.length;
    render();
    pop();
    timer = setTimeout(tick, 3200);
  }

  function play(on) {
    clearTimeout(timer);
    timer = 0;
    if (on) {
      pop();
      timer = setTimeout(tick, 1800);
    }
  }

  const row = widget.closest('.why-row');
  function syncPlay() {
    if (row) row.classList.add('visible');
    const r = widget.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    play(r.bottom > vh * 0.05 && r.top < vh * 0.95);
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && row) row.classList.add('visible');
        play(e.isIntersecting);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    io.observe(widget);
  } else {
    play(true);
  }
  if (row) row.addEventListener('tuko:visible', syncPlay);
  /* No llamar render() aquí: `translations` se define más abajo en el mismo script */
})();

/* «La meta»: el grupo camina, llega a la bandera y desbloquea el −20 %.
   Marcha procedural: la zancada fija el pie en el suelo y de ahí sale el avance. */
(function () {
  var stage = document.querySelector('[data-why-race]');
  if (!stage) return;
  var pack = stage.querySelector('[data-why-pack]');
  var chip = stage.querySelector('[data-why-count]');
  var confBox = stage.querySelector('[data-why-conf]');
  var label = document.querySelector('.why-race-label');
  var nodes = pack ? pack.querySelectorAll('.why-runner') : [];
  if (!pack || !chip || !label || !nodes.length) return;

  var GOAL = 2, START = 1;

  var PALETTE = {
    lead: { skin:'#F2C6A0', skinB:'#DAAC85', shirt:'#3D50F2', pants:'#2B3247', pantsB:'#20263A', hair:'#3B2A1E', shoe:'#1B2030', hairKind:'short', bag:'#14C492' },
    teal: { skin:'#8D5524', skinB:'#76441B', shirt:'#14C492', pants:'#49516A', pantsB:'#3A4156', hair:'#1A120C', shoe:'#241A12', hairKind:'bun',   bag:'' },
    navy: { skin:'#C68642', skinB:'#A96D33', shirt:'#EDF0F8', pants:'#1F2537', pantsB:'#161B29', hair:'#1A120C', shoe:'#12161F', hairKind:'cap',   bag:'#3D50F2' },
    sand: { skin:'#5C3A21', skinB:'#492D19', shirt:'#A4B3F2', pants:'#3A4053', pantsB:'#2D3243', hair:'#140F0A', shoe:'#1A1410', hairKind:'long',  bag:'' },
    rose: { skin:'#F8D7C4', skinB:'#E0B9A3', shirt:'#3A4050', pants:'#5A6480', pantsB:'#48516A', hair:'#E2B657', shoe:'#252A38', hairKind:'curly', bag:'' }
  };

  /* x = arranque (fracción del ancho) · d = profundidad (0 cerca, 1 lejos)
     ph = fase inicial de la marcha · join = con qué número del contador entra */
  var CAST = {
    sand: { x: -0.075, d: 1.00, ph: 5.30, join: 7 },
    teal: { x: -0.010, d: 0.78, ph: 2.35, join: 1 },
    rose: { x:  0.055, d: 0.34, ph: 1.10, join: 10 },
    navy: { x:  0.120, d: 0.16, ph: 4.05, join: 4 },
    lead: { x:  0.185, d: 0.50, ph: 0.20, join: 0 }
  };

  var HIP_Y = 46, THIGH = 14, SHIN = 13, GROUND = 74.2;
  var VIEW_W = 52, ELEM_W = 54;
  var SOLE = 1.7, HEEL_X = -1.6, TOE_X = 7.6;

  /* Poses a las que se mezcla la marcha al pararse y al celebrar */
  /* foot va sumado al muslo y la tibia, así que 'plano en el suelo' es -(thigh + shin) */
  var STAND_F = { thigh: -4.5, shin: 3, foot: 1.5, arm: 7, fore: 13, lean: -2, head: 2, sway: 0 };
  var STAND_B = { thigh: 5.5,  shin: 3, foot: -8.5, arm: -7, fore: 13, lean: -2, head: 2, sway: 0 };
  var CHEER_F = { thigh: -5, shin: 4, foot: 1, arm: 166, fore: 16, lean: -7, head: -5, sway: 0 };
  var CHEER_B = { thigh: 6,  shin: 4, foot: -10, arm: -170, fore: 16, lean: -7, head: -5, sway: 0 };

  function arm(c, side, hand) {
    var x = side === 'b' ? 25 : 27.2;
    var skin = side === 'b' ? c.skinB : c.skin;
    return (
      '<g transform="translate(' + x + ' 26.5)">' +
        '<g class="wr-arm-' + side + '">' +
          '<path d="M0 0 V11" fill="none" stroke="' + skin + '" stroke-width="3.25" stroke-linecap="round"/>' +
          '<g transform="translate(0 11)">' +
            '<g class="wr-fore-' + side + '">' +
              '<path d="M0 0 V9.6" fill="none" stroke="' + skin + '" stroke-width="2.8" stroke-linecap="round"/>' +
              '<circle cx="0.2" cy="10.4" r="1.8" fill="' + skin + '"/>' +
              (hand || '') +
            '</g>' +
          '</g>' +
        '</g>' +
      '</g>'
    );
  }

  function leg(c, side) {
    var x = side === 'b' ? 25.5 : 26.5;
    var pant = side === 'b' ? c.pantsB : c.pants;
    return (
      '<g transform="translate(' + x + ' 46)">' +
        '<g class="wr-leg-' + side + '">' +
          '<path d="M0 0 V14" fill="none" stroke="' + pant + '" stroke-width="3.9" stroke-linecap="round"/>' +
          '<g transform="translate(0 14)">' +
            '<g class="wr-shin-' + side + '">' +
              '<path d="M0 0 V13" fill="none" stroke="' + pant + '" stroke-width="3.55" stroke-linecap="round"/>' +
              '<g transform="translate(0 13)">' +
                '<g class="wr-foot-' + side + '">' +
                  '<path d="M-2.4-.2c.1 2.6 4.2 4.1 10.4 2.3 1.1-.3 1.2-1.6.2-2.1C5.2 1.4.4.9-2.4-.2Z" fill="' + c.shoe + '"/>' +
                '</g>' +
              '</g>' +
            '</g>' +
          '</g>' +
        '</g>' +
      '</g>'
    );
  }

  function hairFor(c) {
    var base = '<path fill="' + c.hair + '" d="M19.15 11.15c1.2-5.4 13.55-5.25 13.95 1.1-3.4-2.75-9.15-3-13.95-1.1z"/>';
    if (c.hairKind === 'bun') {
      return base + '<circle cx="19.5" cy="8.1" r="3.15" fill="' + c.hair + '"/>';
    }
    if (c.hairKind === 'long') {
      return base +
        '<path fill="' + c.hair + '" d="M19.5 12.4c-1.6 3.6-1.5 8.3 0 11.9l3.5-1.1c-1.1-3-1.2-6.6-.5-9.5z"/>';
    }
    if (c.hairKind === 'cap') {
      return '<path fill="' + c.hair + '" d="M19.3 10.6c.6-5.9 13.2-5.9 13.8.3-3.4-2.1-10.4-2.2-13.8-.3z"/>' +
        '<path fill="' + c.hair + '" d="M32.3 9.7h5.2c.95 0 1.15 1.25.3 1.6l-5.5 1.4z"/>';
    }
    if (c.hairKind === 'curly') {
      return '<circle cx="20.6" cy="8.2" r="3.1" fill="' + c.hair + '"/>' +
        '<circle cx="25.6" cy="6.3" r="3.5" fill="' + c.hair + '"/>' +
        '<circle cx="30.6" cy="8.4" r="3" fill="' + c.hair + '"/>' + base;
    }
    return base;
  }

  function svgFor(c) {
    var hand = c.bag
      ? '<g transform="translate(0 11.4)">' +
          '<path d="M-1.5 1.1V0a1.5 1.5 0 0 1 3 0v1.1" fill="none" stroke="' + c.bag + '" stroke-width=".85"/>' +
          '<rect x="-3.1" y="0.7" width="6.2" height="7.3" rx="1.2" fill="' + c.bag + '"/>' +
          '<rect x="-3.1" y="0.7" width="6.2" height="1.9" rx=".9" fill="#fff" opacity=".2"/>' +
        '</g>'
      : '';
    return (
      '<svg viewBox="0 0 52 76" aria-hidden="true">' +
        '<ellipse class="wr-shadow" cx="27" cy="73.5" rx="12.6" ry="2.15" fill="rgba(20,24,38,.2)"/>' +
        '<g class="wr-bob">' +
          '<g class="wr-root">' +
            arm(c, 'b') +
            leg(c, 'b') +
            '<g class="wr-torso">' +
              '<rect x="20.15" y="41.3" width="11.7" height="8.9" rx="3.7" fill="' + c.pants + '"/>' +
              '<path fill="' + c.shirt + '" d="M20.55 25.4c.3-3.55 10.4-3.55 10.7 0l.5 15.2c.12 1.95-1.4 3.3-3.08 3.3h-5.54c-1.68 0-3.2-1.35-3.08-3.3z"/>' +
              '<path fill="#000" opacity=".07" d="M20.55 25.4c.15-1.8 2.7-2.67 5.35-2.67v20.87h-2.23c-1.68 0-3.2-1.35-3.08-3.3z"/>' +
              '<rect x="23.85" y="18.35" width="4.4" height="5.3" rx="1.5" fill="' + c.skinB + '"/>' +
            '</g>' +
            leg(c, 'f') +
            arm(c, 'f', hand) +
            '<g class="wr-head">' +
              '<circle cx="26" cy="12.1" r="6.75" fill="' + c.skin + '"/>' +
              hairFor(c) +
              '<ellipse cx="21.15" cy="13.4" rx="1.22" ry="1.68" fill="' + c.skinB + '"/>' +
              '<circle cx="28.65" cy="10.65" r="1.42" fill="#fff" opacity=".28"/>' +
            '</g>' +
          '</g>' +
        '</g>' +
      '</svg>'
    );
  }

  /* Marcha: el pie manda. Apoya talón → planta → puntera sin patinar,
     y la cinemática inversa saca muslo y rodilla. */
  var DUTY = 0.60;   /* parte del ciclo que el pie pasa apoyado */
  var STRIDE = 38;   /* unidades que avanza el cuerpo en un ciclo (dos pasos) */
  var LIFT = 2.2;    /* holgura del pie en vuelo */
  var REACH = 26.7;  /* alcance máximo cadera→tobillo (el hueso da 27) */
  var CROUCH = 0.15; /* la pierna de apoyo nunca se estira del todo */

  function ease(x) {
    var u = x < 0 ? 0 : x > 1 ? 1 : x;
    return u * u * (3 - 2 * u);
  }

  function softMin(a, b) {
    var d = a - b;
    return 0.5 * (a + b - Math.sqrt(d * d + 0.3));
  }

  /* Ángulo absoluto del pie: entra de talón, apoya plano, empuja de puntera y despeja */
  var PITCH = [[0, -13], [0.14, 0], [0.46, 2], [DUTY, 21], [0.74, 3], [0.88, -11], [1, -13]];
  function pitchAt(u) {
    var i = 1;
    while (i < PITCH.length - 1 && u > PITCH[i][0]) i++;
    var a = PITCH[i - 1], b = PITCH[i];
    return a[1] + (b[1] - a[1]) * ease((u - a[0]) / (b[0] - a[0]));
  }

  /* Compensa la rodadura: el contacto (talón o puntera) se queda quieto en el suelo */
  function rollAt(pitch) {
    var a = pitch * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    var px = pitch > 0 ? TOE_X : HEEL_X;
    return { x: px * (1 - c) + SOLE * s, y: px * s + SOLE * c - SOLE };
  }

  /* Alcance de una pierna: arco de compás mientras apoya; 99 en vuelo (no limita) */
  function arcAt(u) {
    if (u >= DUTY) return 99;
    var x = STRIDE * (DUTY / 2 - u);
    return Math.sqrt(Math.max(1, REACH * REACH - x * x));
  }

  /* En doble apoyo manda la pierna más corta, para que las dos suelas pisen a la vez */
  function reachAt(u) {
    return softMin(arcAt(u), arcAt((u + 0.5) % 1)) - CROUCH;
  }

  /* Tobillo respecto a la cadera. En apoyo no se mueve en el mundo. */
  function ankleAt(u) {
    var r = rollAt(pitchAt(u));
    var x = STRIDE * (DUTY / 2 - u);
    if (u < DUTY) return { x: x + r.x, y: reachAt(u) - r.y };
    var w = (u - DUTY) / (1 - DUTY);
    var e = ease(w);
    var y0 = reachAt(DUTY - 1e-6);
    var y1 = reachAt(0);
    return {
      x: x + STRIDE * e + r.x,
      y: y0 + (y1 - y0) * e - r.y - LIFT * Math.sin(Math.PI * w)
    };
  }

  /* Cinemática inversa de la pierna: del tobillo a los dos ángulos */
  function legAngles(x, y) {
    var d = Math.sqrt(x * x + y * y);
    var top = THIGH + SHIN - 0.25;
    if (d > top) { var k = top / d; x *= k; y *= k; d = top; }
    var cs = (d * d - THIGH * THIGH - SHIN * SHIN) / (2 * THIGH * SHIN);
    var knee = Math.acos(cs < -1 ? -1 : cs > 1 ? 1 : cs);
    var off = Math.asin(Math.min(1, SHIN * Math.sin(knee) / d));
    return { thigh: (Math.atan2(-x, y) - off) * 180 / Math.PI, shin: knee * 180 / Math.PI };
  }

  function gait(p) {
    var u = ((p / (Math.PI * 2)) % 1 + 1) % 1;
    var t = ankleAt(u);
    var L = legAngles(t.x, t.y);
    var arm = 26 * Math.cos(p) - 5;
    return {
      thigh: L.thigh,
      shin: L.shin,
      foot: pitchAt(u) - L.thigh - L.shin,
      arm: arm,
      fore: 18 - arm * 0.32,
      lean: 5.2 + Math.sin(p * 2) * 1.05,
      head: 2.4 - Math.cos(p * 2) * 1.4,
      sway: Math.sin(p) * 0.55
    };
  }

  function mix(a, b, w) {
    var o = {}, k;
    for (k in a) { if (Object.prototype.hasOwnProperty.call(a, k)) o[k] = a[k] + (b[k] - a[k]) * w; }
    return o;
  }

  /* Punto más bajo de la suela (talón o puntera), para clavar el cuerpo al suelo */
  function soleY(thigh, shin, foot) {
    var t = thigh * Math.PI / 180;
    var k = t + shin * Math.PI / 180;
    var f = k + foot * Math.PI / 180;
    var ay = HIP_Y + Math.cos(t) * THIGH + Math.cos(k) * SHIN;
    var s = Math.sin(f), c = Math.cos(f);
    var hy = ay + HEEL_X * s + SOLE * c;
    var ty = ay + TOE_X * s + SOLE * c;
    return hy > ty ? hy : ty;
  }

  /* El cuerpo avanza a ritmo constante: el vaivén lo pone la pierna, no el tronco */
  function stride(a, dp) {
    a.p += dp;
    a.hip += STRIDE * dp / (Math.PI * 2);
  }

  function setRot(el, deg) {
    if (el) el.setAttribute('transform', 'rotate(' + deg.toFixed(2) + ')');
  }

  /* Salto de celebración: agacharse, volar y amortiguar */
  function hop(tc) {
    var T = 0.68;
    if (tc < 0 || tc >= T * 2) return { y: 0, knee: 0 };
    var u = (tc % T) / T;
    if (u < 0.2) { var q = ease(u / 0.2); return { y: 2.2 * q, knee: 24 * q }; }
    if (u < 0.74) {
      var f = (u - 0.2) / 0.54;
      return { y: -13 * Math.sin(Math.PI * f), knee: 16 * Math.sin(Math.PI * f) };
    }
    var l = (u - 0.74) / 0.26;
    return { y: 2 * Math.sin(Math.PI * l), knee: 20 * Math.sin(Math.PI * l) };
  }

  var CYCLE = STRIDE;
  var actors = [];
  var ref = null;
  for (var i = 0; i < nodes.length; i++) {
    var el = nodes[i];
    var key = el.getAttribute('data-run') || 'lead';
    var pal = PALETTE[key] || PALETTE.lead;
    var def = CAST[key] || CAST.lead;
    el.innerHTML = svgFor(pal) +
      '<span class="wr-fx"><i class="wr-ring"></i><i class="wr-plus">+1</i></span>';
    var svg = el.querySelector('svg');
    var a = {
      el: el,
      def: def,
      join: def.join,
      p: def.ph,
      hip: 0, adv: 0,
      x0: 0, s: 1, unit: 1, rate: 1,
      stand: 0, cheer: 0, jumpY: 0, knee: 0,
      hopAt: 0.14 + i * 0.09,
      bob: svg.querySelector('.wr-bob'),
      root: svg.querySelector('.wr-root'),
      head: svg.querySelector('.wr-head'),
      shadow: svg.querySelector('.wr-shadow'),
      armB: svg.querySelector('.wr-arm-b'),
      foreB: svg.querySelector('.wr-fore-b'),
      legB: svg.querySelector('.wr-leg-b'),
      shinB: svg.querySelector('.wr-shin-b'),
      footB: svg.querySelector('.wr-foot-b'),
      armF: svg.querySelector('.wr-arm-f'),
      foreF: svg.querySelector('.wr-fore-f'),
      legF: svg.querySelector('.wr-leg-f'),
      shinF: svg.querySelector('.wr-shin-f'),
      footF: svg.querySelector('.wr-foot-f')
    };
    actors.push(a);
    if (!ref || def.x > ref.def.x) ref = a;
  }

  function apply(a) {
    var A = gait(a.p);
    var B = gait(a.p + Math.PI);
    if (a.stand > 0) { var ws = ease(a.stand); A = mix(A, STAND_F, ws); B = mix(B, STAND_B, ws); }
    if (a.cheer > 0) { var wc = ease(a.cheer); A = mix(A, CHEER_F, wc); B = mix(B, CHEER_B, wc); }
    var shF = A.shin + a.knee;
    var shB = B.shin + a.knee;
    var floor = Math.max(soleY(A.thigh, shF, A.foot), soleY(B.thigh, shB, B.foot)) - GROUND;
    var y = a.jumpY - floor;
    a.bob.setAttribute('transform', 'translate(' + A.sway.toFixed(2) + ' ' + y.toFixed(2) + ')');
    a.root.setAttribute('transform', 'rotate(' + A.lean.toFixed(2) + ' 26 46)');
    a.head.setAttribute('transform', 'rotate(' + A.head.toFixed(2) + ' 26 18)');
    setRot(a.armF, A.arm); setRot(a.foreF, A.fore);
    setRot(a.legF, A.thigh); setRot(a.shinF, shF); setRot(a.footF, A.foot);
    setRot(a.armB, B.arm); setRot(a.foreB, B.fore);
    setRot(a.legB, B.thigh); setRot(a.shinB, shB); setRot(a.footB, B.foot);
    var air = Math.max(0, -a.jumpY);
    var grounded = Math.max(0.3, 1 - air * 0.055);
    a.shadow.setAttribute('rx', (12.6 * (0.66 + 0.34 * grounded)).toFixed(2));
    a.shadow.setAttribute('opacity', (0.06 + 0.16 * grounded).toFixed(3));
    a.el.style.transform =
      'translate3d(' + (a.x0 + a.adv).toFixed(1) + 'px,0,0) scale(' + a.s.toFixed(3) + ')';
  }

  /* ── Escena: medidas, contador y guion del bucle ── */
  var W = 404, H = 190, hK = 1, V = 54, ADV = 220;

  var pole = stage.querySelector('.why-goal-pole');
  var goalLine = stage.querySelector('.why-goal-line');

  function measure() {
    W = stage.clientWidth || 404;
    H = stage.clientHeight || 190;
    hK = H / 190;
    /* ~120 pasos/min: zancada de 38 u a esta velocidad de escena */
    V = W * 0.11;
    for (var j = 0; j < actors.length; j++) {
      var a = actors[j];
      a.x0 = a.def.x * W;
      a.s = (1.1 - 0.28 * a.def.d) * hK;
      a.unit = (ELEM_W / VIEW_W) * a.s;
      a.rate = (V / (CYCLE * a.unit)) * Math.PI * 2;
      a.el.style.bottom = ((16 + a.def.d * 20) * hK).toFixed(1) + 'px';
      a.el.style.setProperty('--z', String(Math.round(20 - a.def.d * 10)));
    }
    /* La bandera cuelga a la derecha del mástil, así que la meta se mide
       desde el mástil real y no desde el borde del escenario. */
    var poleX = W - 92;
    if (pole) {
      var pr = pole.getBoundingClientRect();
      var sr = stage.getBoundingClientRect();
      if (pr.width) poleX = pr.left - sr.left;
    }
    var lineX = poleX - 14;
    if (goalLine) {
      goalLine.style.right = 'auto';
      goalLine.style.left = lineX.toFixed(1) + 'px';
    }
    ADV = Math.max(70, lineX - (ref.x0 + 27));
    /* Cada uno se para en la bandera; el que llega después, justo a su lado */
    for (var q = 0; q < actors.length; q++) {
      var b = actors[q];
      var gap = b === ref ? 0 : 22 * hK;
      b.target = Math.max(70, lineX - gap - (b.x0 + 27));
    }
  }

  var STEPS = [0.12, 0.25, 0.37, 0.49, 0.61, 0.73, 0.85];
  var state = 'walk', tState = 0, shown = -1, shownWon = false;

  function dict() {
    try {
      if (typeof translations === 'undefined') return null;
      return translations[document.documentElement.lang] || translations.es || null;
    } catch (e) { return null; }
  }

  function renderLabel() {
    var t = dict();
    if (!t) return;
    if (shownWon) {
      label.innerHTML = t.why2_w_unlocked || t.why2_w_missing || label.innerHTML;
      return;
    }
    var left = GOAL - shown;
    var tpl = left === 1 ? t.why2_w_missing_one : t.why2_w_missing_tpl;
    label.innerHTML = tpl ? tpl.split('{n}').join(left) : (t.why2_w_missing || label.innerHTML);
  }
  window.tukoWhyRaceRender = renderLabel;

  function setCount(n, isWon) {
    if (n === shown && isWon === shownWon) return;
    shown = n;
    shownWon = isWon;
    chip.textContent = n + '/' + GOAL;
    chip.classList.remove('is-pop');
    void chip.offsetWidth;
    chip.classList.add('is-pop');
    renderLabel();
    for (var j = 0; j < actors.length; j++) {
      var a = actors[j];
      if (a.join && a.join <= n && a.el.classList.contains('is-ghost')) {
        a.el.classList.remove('is-ghost');
        a.el.classList.add('is-join');
      }
    }
  }

  function reset() {
    stage.classList.remove('is-win');
    pack.classList.remove('is-out');
    pack.classList.add('is-snap');
    stage.style.setProperty('--fill', '0');
    shown = -1;
    shownWon = false;
    for (var j = 0; j < actors.length; j++) {
      var a = actors[j];
      a.p = a.def.ph;
      a.hip = 0; a.adv = 0;
      a.arrived = false;
      a.stand = 0; a.cheer = 0; a.jumpY = 0; a.knee = 0;
      a.el.classList.remove('is-join');
      if (a.join > START) a.el.classList.add('is-ghost');
      else a.el.classList.remove('is-ghost');
    }
    setCount(START, false);
    requestAnimationFrame(function () { pack.classList.remove('is-snap'); });
  }

  function enter(next) {
    state = next;
    tState = 0;
    if (next === 'win') {
      stage.style.setProperty('--fill', '1');
      setCount(GOAL, true);
      stage.classList.add('is-win');
    } else if (next === 'leave') {
      pack.classList.add('is-out');
    } else if (next === 'walk') {
      reset();
    }
  }

  function step(dt) {
    var j, a;
    tState += dt;

    if (state === 'walk') {
      var allIn = true;
      var prog = 1;
      for (j = 0; j < actors.length; j++) {
        a = actors[j];
        var rem = a.target - a.adv;
        if (!a.arrived && rem <= 1.2) a.arrived = true;
        if (a.arrived) {
          a.stand = Math.min(1, a.stand + dt / 0.42);
        } else {
          allIn = false;
          var slow = rem < 56 ? 0.18 + 0.82 * ease(rem / 56) : 1;
          stride(a, a.rate * dt * slow);
          a.adv = a.hip * a.unit;
          a.stand = Math.max(0, a.stand - dt * 3);
        }
        prog = Math.min(prog, Math.max(0, a.adv / a.target));
      }
      stage.style.setProperty('--fill', prog.toFixed(3));
      var n = START;
      for (j = 0; j < STEPS.length; j++) if (prog >= STEPS[j]) n++;
      setCount(Math.min(n, GOAL - 1), false);
      if (allIn || tState > 20) enter('win');

    } else if (state === 'win') {
      for (j = 0; j < actors.length; j++) {
        a = actors[j];
        a.stand = Math.min(1, a.stand + dt / 0.42);
        var tc = tState - a.hopAt;
        if (tc > 0) {
          a.cheer = Math.min(1, a.cheer + dt / 0.22);
          var h = hop(tc);
          a.jumpY = h.y;
          a.knee = h.knee;
        }
      }
      if (tState > 2.95) enter('leave');

    } else if (state === 'leave') {
      for (j = 0; j < actors.length; j++) {
        a = actors[j];
        a.cheer = Math.max(0, a.cheer - dt / 0.3);
        a.stand = Math.max(0, a.stand - dt / 0.3);
        a.jumpY = 0;
        a.knee = 0;
        stride(a, a.rate * dt);
        a.adv = a.hip * a.unit;
      }
      if (tState > 0.82) enter('walk');
    }

    for (j = 0; j < actors.length; j++) apply(actors[j]);
  }

  function frozenEnd() {
    stage.style.setProperty('--fill', '1');
    stage.classList.add('is-win');
    setCount(GOAL, true);
    for (var j = 0; j < actors.length; j++) {
      var a = actors[j];
      a.el.classList.remove('is-ghost');
      a.stand = 1; a.cheer = 0; a.jumpY = 0; a.knee = 0;
      a.adv = a.target;
      a.hip = a.target / a.unit;
      apply(a);
    }
  }

  function buildConfetti() {
    if (!confBox) return;
    var cols = ['#3D50F2', '#14C492', '#A4B3F2', '#FFFFFF', '#F5C451'];
    var html = '';
    for (var j = 0; j < 16; j++) {
      var ang = (j / 16) * Math.PI * 2;
      var cx = Math.round(Math.cos(ang) * (26 + (j % 4) * 13));
      var cy = -Math.round(28 + Math.abs(Math.sin(ang)) * 42 + (j % 3) * 8);
      html +=
        '<i style="--cl:' + (71 + (j % 5) * 2) + '%;--cb:' + (84 + (j % 4) * 6) + 'px;' +
        '--cx:' + cx + 'px;--cy:' + cy + 'px;' +
        '--cr:' + ((j % 2 ? 1 : -1) * (170 + j * 22)) + 'deg;' +
        '--cc:' + cols[j % 5] + ';' +
        '--cw:' + (j % 3 ? 6 : 4) + 'px;--ch:' + (j % 3 ? 9 : 4) + 'px;' +
        '--cd:' + (1.5 + (j % 5) * 0.14).toFixed(2) + 's;' +
        '--cdl:' + (j * 0.035).toFixed(2) + 's"></i>';
    }
    confBox.innerHTML = html;
  }

  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var onScreen = true;
  var raf = 0;
  var last = 0;

  function playing() {
    /* No bloquear por prefers-reduced-motion: en Windows suele estar activo
       y dejaba la demo congelada en 10/10. Solo pausamos fuera de pantalla. */
    return onScreen;
  }

  function tick(now) {
    if (!playing()) { raf = 0; last = 0; return; }
    if (!last) last = now;
    step(Math.min(0.05, (now - last) / 1000));
    last = now;
    raf = requestAnimationFrame(tick);
  }

  function sync() {
    last = 0;
    var on = playing();
    stage.classList.toggle('is-live', on);
    if (on) {
      if (!raf) raf = requestAnimationFrame(tick);
    } else {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      for (var j = 0; j < actors.length; j++) apply(actors[j]);
    }
  }

  buildConfetti();
  measure();
  reset();
  for (i = 0; i < actors.length; i++) apply(actors[i]);

  if ('IntersectionObserver' in window) {
    onScreen = false;
    var row = stage.closest('.why-row');
    var io = new IntersectionObserver(function (entries) {
      var nowOn = entries.some(function (e) { return e.isIntersecting; });
      if (nowOn && !onScreen) {
        if (row) row.classList.add('visible');
        /* Reinicia al entrar en pantalla para que en desktop siempre se vea la marcha */
        enter('walk');
      }
      onScreen = nowOn;
      sync();
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    io.observe(stage);
    if (row) {

      row.addEventListener('tuko:visible', function () {
        var r = stage.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        if (r.bottom > vh * 0.08 && r.top < vh * 0.92 && !onScreen) {
          onScreen = true;
          enter('walk');
          sync();
        } else if (onScreen) {
          sync();
        }
      });
    }
  }
  sync();

  var rz = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rz);
    rz = setTimeout(function () {
      measure();
      for (var j = 0; j < actors.length; j++) apply(actors[j]);
    }, 160);
  });

  if (mq.addEventListener) mq.addEventListener('change', sync);
  else if (mq.addListener) mq.addListener(sync);
})();


/* Arco del título: SVG que se dibuja (stroke), no se estira */
(function () {
  const ARC =
    '<svg class="hero-em-arc" viewBox="0 0 120 18" preserveAspectRatio="none" aria-hidden="true">' +
    '<path pathLength="1" d="M3 13 Q60 8 117 13" style="stroke-dasharray:1;stroke-dashoffset:1;opacity:0"/></svg>';

  window.tukoEnsureHeroEmArc = () => {
    document.querySelectorAll('.hero h1 em').forEach((em) => {
      if (em.querySelector('.hero-em-arc')) return;
      em.insertAdjacentHTML('beforeend', ARC);
    });
  };

  window.tukoEnsureHeroEmArc();
})();

(function () {
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  window.tukoHeroTitleRender = function (opts) {
    var h1 = document.querySelector('.hero-title');
    if (!h1 || typeof translations === 'undefined') return;
    var lang = document.documentElement.lang || 'es';
    var t = translations[lang] || translations.es;
    if (!t) return;
    if (h1.getAttribute('data-lang') === lang) return;

    var l1 = String(t.hero_title_l1 || '').split(/\s+/).filter(Boolean);
    var l2 = String(t.hero_title_l2 || '').split(/\s+/).filter(Boolean);
    var l3b = String(t.hero_title_l3_before || '').split(/\s+/).filter(Boolean);
    var accent = String(t.hero_title_accent || '');
    var l3a = String(t.hero_title_l3_after || '').split(/\s+/).filter(Boolean);
    var html = '';

    function word(text) {
      return '<span class="hero-word">' + esc(text) + '</span>';
    }

    function line(parts) {
      return '<span class="hero-line">' + parts.join('') + '</span>';
    }

    html += line(l1.map(word));
    html += line(l2.map(word));

    var third = l3b.map(word);
    var acc = '<span class="hero-accent">' + esc(accent);
    acc += '<span class="hero-accent-line" aria-hidden="true"><svg viewBox="0 0 120 14" preserveAspectRatio="none"><defs><linearGradient id="tukoHeroShineGrad" gradientUnits="userSpaceOnUse" x1="-120" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset="0.28" stop-color="#e8eeff" stop-opacity="0.05"/><stop offset="0.45" stop-color="#ffffff" stop-opacity="0.22"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0.42"/><stop offset="0.55" stop-color="#ffffff" stop-opacity="0.22"/><stop offset="0.72" stop-color="#e8eeff" stop-opacity="0.05"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient></defs><path class="hero-accent-base" d="M4 10.5 Q60 3.2 116 10.5"/><path class="hero-accent-glow" d="M4 10.5 Q60 3.2 116 10.5"/></svg></span>';
    acc += '</span>';
    third.push(acc);
    third = third.concat(l3a.map(word));
    html += line(third);

    h1.innerHTML = html;
    h1.setAttribute('data-lang', lang);
    if (typeof window.tukoHeroAccentShine === 'function') window.tukoHeroAccentShine();
  };
})();

(function () {
  var raf = 0;
  var glow = null;
  var grad = null;
  var start = 0;
  var SWEEP = 2800;
  var PAUSE = 2200;
  var BAND = 110;

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function bind() {
    var line = document.querySelector('.hero-accent-line');
    if (!line) return false;
    glow = line.querySelector('.hero-accent-glow');
    grad = line.querySelector('#tukoHeroShineGrad') || line.querySelector('linearGradient');
    return !!(glow && grad);
  }

  function frame(now) {
    if (!glow || !glow.isConnected || !grad || !grad.isConnected) {
      if (!bind()) { raf = 0; return; }
      start = now;
    }
    if (!start) start = now;
    var t = (now - start) % (SWEEP + PAUSE);
    if (t > SWEEP) {
      glow.style.opacity = '0';
      grad.setAttribute('x1', String(-BAND));
      grad.setAttribute('x2', '0');
    } else {
      var p = easeInOut(t / SWEEP);
      var x = -BAND + p * (120 + BAND * 2);
      var op = p < 0.2 ? p / 0.2 : p > 0.8 ? (1 - p) / 0.2 : 1;
      glow.style.opacity = String(0.72 * Math.max(0, Math.min(1, op)));
      grad.setAttribute('x1', String(x));
      grad.setAttribute('x2', String(x + BAND));
    }
    raf = window.requestAnimationFrame(frame);
  }

  window.tukoHeroAccentShine = function () {
    if (!bind()) return;
    glow.style.opacity = '0';
    grad.setAttribute('x1', String(-BAND));
    grad.setAttribute('x2', '0');
    start = 0;
    if (!raf) raf = window.requestAnimationFrame(frame);
  };

  /* Arranque + reintento por si el título se re-renderiza después */
  function boot() {
    window.tukoHeroAccentShine();
    window.setTimeout(window.tukoHeroAccentShine, 400);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

(function () {
  var GOAL = 10;
  var DISCOUNT = 20;
  var START = 2;
  var MAX_SHOW = 10;
  var VISIBLE = 6;
  var faces = [];
  document.querySelectorAll('[data-why-face]').forEach(function (el) {
    var idx = Number(el.getAttribute('data-why-face'));
    if (!isNaN(idx)) faces[idx] = el.innerHTML;
  });
  faces = faces.filter(Boolean).concat([
    '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#C4B5FD"/><path fill="#A78BFA" d="M9 18L7 1.5 18 13z"/><path fill="#A78BFA" d="M31 18L33 1.5 22 13z"/><path fill="#F5D0FE" d="M11 16L10 5 17 13z"/><path fill="#F5D0FE" d="M29 16L30 5 23 13z"/><circle cx="14.2" cy="21.2" r="1.85" fill="#3A2418"/><circle cx="25.8" cy="21.2" r="1.85" fill="#3A2418"/><circle cx="14.7" cy="20.7" r=".45" fill="#fff"/><circle cx="26.3" cy="20.7" r=".45" fill="#fff"/><ellipse cx="20" cy="25.4" rx="1.4" ry="1" fill="#FF9EC8"/><path d="M15 28c2.4 2.2 7.6 2.2 10 0" fill="none" stroke="#7C3AED" stroke-width="1.35" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#EDEDED"/><circle cx="10" cy="11" r="6.1" fill="#1A1A1A"/><circle cx="30" cy="11" r="6.1" fill="#1A1A1A"/><ellipse cx="13.4" cy="20.6" rx="4.1" ry="3.5" fill="#1A1A1A"/><ellipse cx="26.6" cy="20.6" rx="4.1" ry="3.5" fill="#1A1A1A"/><circle cx="13.4" cy="20.6" r="1.45" fill="#fff"/><circle cx="26.6" cy="20.6" r="1.45" fill="#fff"/><circle cx="13.7" cy="20.3" r=".7" fill="#1A1A1A"/><circle cx="26.9" cy="20.3" r=".7" fill="#1A1A1A"/><ellipse cx="20" cy="27.4" rx="5.4" ry="3.8" fill="#fff"/><ellipse cx="20" cy="25.8" rx="1.25" ry=".95" fill="#1A1A1A"/><path d="M16 29.2c1.8 1.35 6.2 1.35 8 0" fill="none" stroke="#1A1A1A" stroke-width="1.3" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#C68642"/><ellipse cx="7.2" cy="20" rx="5.3" ry="6.4" fill="#A96D33"/><ellipse cx="32.8" cy="20" rx="5.3" ry="6.4" fill="#A96D33"/><ellipse cx="7.2" cy="20" rx="3.1" ry="3.9" fill="#E8C4A0"/><ellipse cx="32.8" cy="20" rx="3.1" ry="3.9" fill="#E8C4A0"/><ellipse cx="20" cy="25.8" rx="8" ry="6.8" fill="#F2D2B0"/><circle cx="14.2" cy="20.2" r="1.85" fill="#3A2418"/><circle cx="25.8" cy="20.2" r="1.85" fill="#3A2418"/><circle cx="14.7" cy="19.7" r=".45" fill="#fff"/><circle cx="26.3" cy="19.7" r=".45" fill="#fff"/><ellipse cx="20" cy="24.7" rx="1.45" ry="1.1" fill="#3A2418"/><path d="M16 29.1c1.8 1.5 6.2 1.5 8 0" fill="none" stroke="#A96D33" stroke-width="1.3" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#5EC8B4"/><path fill="#3D50F2" d="M11.5 9L14.5 1.2 18.5 9.2z"/><path fill="#14C492" d="M17.6 7.2L20 0.6 23.2 7.4z"/><path fill="#3D50F2" d="M24.2 9L27.4 2 31 9.2z"/><circle cx="14" cy="20.2" r="1.85" fill="#1A2418"/><circle cx="26" cy="20.2" r="1.85" fill="#1A2418"/><circle cx="14.5" cy="19.7" r=".45" fill="#fff"/><circle cx="26.5" cy="19.7" r=".45" fill="#fff"/><path fill="#E8A54B" d="M16.6 24.4L20 30.6 23.4 24.4z"/><path d="M15 27.6c2.4 2.1 7.6 2.1 10 0" fill="none" stroke="#0E8A68" stroke-width="1.35" stroke-linecap="round"/></svg>'
  ]);
  var joined = 3;
  var wrap = document.getElementById('heroLiveAvatars');
  var line = document.getElementById('heroLiveLine');
  if (!wrap || !line) return;

  function faceCount(n) {
    return Math.max(START, Math.min(n, Math.min(MAX_SHOW, faces.length || MAX_SHOW)));
  }

  function popEl(el) {
    if (!el) return;
    el.classList.remove('is-pop');
    void el.offsetWidth;
    el.classList.add('is-pop');
  }

  function setLine(n, animate) {
    var t = (typeof translations !== 'undefined' && (translations[document.documentElement.lang] || translations.es)) || {};
    var left = GOAL - n;
    var next;
    if (left === 0) {
      next = String(t.hero_live_full || 'Grupo completo · −{discount} % para todos').replace('{discount}', String(DISCOUNT));
    } else {
      next = String(t.hero_live_tpl || '{n} de {goal} ya en el grupo')
        .replace('{n}', String(n))
        .replace('{goal}', String(GOAL));
    }
    if (line.textContent !== next) {
      line.textContent = next;
      if (animate) popEl(line);
    }
    line.classList.toggle('is-full', left === 0);
  }

  function addAvatar(i, animate) {
    var el = document.createElement('span');
    el.className = 'hero-live-avat';
    el.innerHTML = faces[i % (faces.length || 1)] || '';
    wrap.appendChild(el);
    if (animate) popEl(el);
  }

  function render(opts) {
    var instant = !!(opts && opts.instant);
    var n = Math.min(joined, GOAL);
    var count = faceCount(n);
    var current = wrap.querySelectorAll('.hero-live-avat').length;
    var resetting = count < current;
    var i;

    if (resetting) {
      wrap.textContent = '';
      wrap.classList.remove('is-full');
      wrap.classList.remove('is-clipped');
      current = 0;
    }

    for (i = current; i < count; i++) addAvatar(i, !instant && !resetting);
    wrap.classList.toggle('is-clipped', wrap.querySelectorAll('.hero-live-avat').length > VISIBLE);

    if (n >= GOAL && !instant) {
      wrap.classList.remove('is-full');
      void wrap.offsetWidth;
      wrap.classList.add('is-full');
    } else if (n < GOAL) {
      wrap.classList.remove('is-full');
      if (!instant && !resetting && current === count) {
        popEl(wrap.querySelector('.hero-live-avat:last-child'));
      }
    }

    setLine(n, !instant);
  }

  window.tukoHeroLiveRender = function () {
    setLine(Math.min(joined, GOAL), false);
  };
  render({ instant: true });

  /* Siempre activo: en Windows “preferir menos movimiento” lo dejaba congelado en 3/10 */
  setInterval(function () {
    joined = joined >= GOAL ? START : joined + 1;
    render();
  }, 2600);
})();

/* ── SMOOTH SCROLL for nav (rAF: fluido aunque Windows reduzca animaciones) ── */
(function () {
  let animFrame = 0;
  let cancelUser = null;

  const getHeaderOffset = () => {
    const nav = document.querySelector('nav');
    const h = nav ? nav.getBoundingClientRect().height : 64;
    return Math.ceil(h + 12);
  };

  const jumpTo = (y) => {
    try {
      window.scrollTo({ top: y, left: 0, behavior: 'instant' });
    } catch (e) {
      window.scrollTo(0, y);
    }
  };

  const stopAnim = () => {
    if (animFrame) cancelAnimationFrame(animFrame);
    animFrame = 0;
    if (cancelUser) {
      cancelUser();
      cancelUser = null;
    }
  };

  /* Scroll propio: no usa behavior:'smooth' (Chrome lo anula con reduced-motion) */
  const animateScrollTo = (targetY, duration) => {
    stopAnim();
    const startY = window.scrollY;
    const dist = targetY - startY;
    if (Math.abs(dist) < 2) {
      jumpTo(targetY);
      return;
    }
    const ms = duration || Math.min(1150, Math.max(480, Math.abs(dist) * 0.45));
    const t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const onUserScroll = () => stopAnim();
    window.addEventListener('wheel', onUserScroll, { passive: true, once: true });
    window.addEventListener('touchstart', onUserScroll, { passive: true, once: true });
    window.addEventListener('keydown', onUserScroll, { once: true });
    cancelUser = () => {
      window.removeEventListener('wheel', onUserScroll);
      window.removeEventListener('touchstart', onUserScroll);
      window.removeEventListener('keydown', onUserScroll);
    };

    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      jumpTo(startY + dist * ease(t));
      if (t < 1) {
        animFrame = requestAnimationFrame(step);
      } else {
        animFrame = 0;
        if (cancelUser) {
          cancelUser();
          cancelUser = null;
        }
      }
    };
    animFrame = requestAnimationFrame(step);
  };

  const scrollToId = (hash, smooth) => {
    if (!hash || hash === '#') return false;
    const target = document.querySelector(hash);
    if (!target) return false;
    const top = Math.max(
      0,
      window.scrollY + target.getBoundingClientRect().top - getHeaderOffset()
    );
    if (smooth) animateScrollTo(top);
    else {
      stopAnim();
      jumpTo(top);
    }
    return true;
  };

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const hash = a.getAttribute('href');
      if (!hash || hash === '#' || hash === '#main-content') {
        if (hash === '#main-content' && scrollToId(hash, true)) e.preventDefault();
        return;
      }
      if (scrollToId(hash, true)) {
        e.preventDefault();
        if (location.hash) history.replaceState(null, '', location.pathname + location.search);
        const menu = document.getElementById('mobileMenu');
        const burger = document.getElementById('navHamburger');
        const scrim = document.getElementById('mobileMenuScrim');
        if (menu) menu.classList.remove('open');
        if (scrim) {
          scrim.classList.remove('open');
          scrim.setAttribute('aria-hidden', 'true');
        }
        if (burger) {
          burger.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
      }
    });
  });

  /* Restauración manual: recargar vuelve arriba, atrás/adelante recupera la posición, #ancla desde fuera baja a su sección */
  const scrollKey = 'tukoScroll:' + location.pathname;
  window.addEventListener('pagehide', () => {
    try { sessionStorage.setItem(scrollKey, String(Math.round(window.scrollY))); } catch (e) {}
  });
  const navType = window.__tukoNavType;
  if (navType === 'reload') jumpTo(0);
  window.addEventListener('load', () => {
    if (navType === 'reload') {
      stopAnim();
      jumpTo(0);
      return;
    }
    if (navType === 'back_forward') {
      let saved = null;
      try { saved = sessionStorage.getItem(scrollKey); } catch (e) {}
      if (saved !== null) {
        requestAnimationFrame(() => jumpTo(+saved || 0));
        return;
      }
    }
    if (location.hash) {
      requestAnimationFrame(() => scrollToId(location.hash, false));
    }
  });
})();
