/**
 * Página Lanzamientos.
 * Hero: la impresora de pedidos. Un lanzamiento tiene un número de personas (p. ej. 30). Cada compra imprime su
 * pedido (nº, comprador, importe y, debajo, variante · ciudad · fecha), sube la tira LCD y suma su variante.
 * Al llegar a las personas necesarias se imprime «30 de 30», los totales y el código de barras, cae el sello
 * «Completado» y el titular se cumple («ya tiene compradores» en verde). Ya no entra nadie más: el ticket se
 * arranca y la impresora empieza otro lanzamiento con otro producto. Bucle infinito; se pausa fuera de pantalla.
 * Todos los datos son de ejemplo.
 */
(function () {
  'use strict';

  var stage = document.querySelector('.lz-stage');
  var visual = document.querySelector('.lz-visual');
  var printer = document.querySelector('.lz-printer');
  var paper = document.querySelector('.lz-paper');
  if (!stage || !visual || !printer || !paper) return;

  // Safari (Mac e iPhone): el papel inclinado en 3D, con su textura mezclada y la tinta enmascarada, obliga a
  // repintarlo en cada fotograma y la impresión va a tirones. Allí el papel se mueve en 2D y los efectos más
  // caros se aligeran (lz-14-webkit.css). En el resto de navegadores no cambia nada.
  var ua = navigator.userAgent;
  var WEBKIT = /iPhone|iPad|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && /AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg|OPR|Firefox/.test(ua));
  if (WEBKIT) document.documentElement.classList.add('lz-webkit');
  function paperTilt(deg) { return WEBKIT ? '' : 'rotateX(' + deg + 'deg) '; }

  var headEl = paper.querySelector('.lz-p-head');
  var lines = paper.querySelector('.lz-lines');
  var countEl = printer.querySelector('.lz-n');
  var goalEl = printer.querySelector('.lz-goal');
  var ledEl = printer.querySelector('.lz-led');
  var leftEl = printer.querySelector('.lz-left');
  var closeAt = 0; // minuto en que cierra el lanzamiento (mismo reloj que las fechas del ticket)
  var sizesEl = printer.querySelector('.lz-sizes');
  var logoSvg = headEl ? headEl.querySelector('.lz-p-logo') : null;
  var logoHtml = logoSvg ? logoSvg.outerHTML : '';

  // Idioma: la página inglesa (/en/launches) es la misma con <html lang="en">
  var EN = document.documentElement.lang === 'en';

  /* ── Lanzamientos de ejemplo (rotan en bucle): personas necesarias, precio y variantes ── */
  var LAUNCHES = EN ? [
    { name: 'Hoodie Ed. 01', art: 'hoodie', start: [3, 10], goal: 30, price: 39, was: 49, days: 12, variants: ['S', 'M', 'L', 'XL'], weights: [2, 4, 3, 2] },
    { name: 'Vitamin C Serum', art: 'serum', start: [10, 9], goal: 20, price: 24, was: 32, days: 9, variants: ['15 ml', '30 ml', '50 ml', 'Pack'], weights: [2, 4, 3, 1] },
    { name: 'Autumn Ed. Mug', art: 'mug', start: [17, 11], goal: 40, price: 18, was: 24, days: 16, variants: ['Sand', 'Sage', 'Night', 'Coral'], weights: [3, 3, 2, 2] },
  ] : [
    { name: 'Sudadera Ed. 01', art: 'hoodie', start: [3, 10], goal: 30, price: 39, was: 49, days: 12, variants: ['S', 'M', 'L', 'XL'], weights: [2, 4, 3, 2] },
    { name: 'Sérum Vitamina C', art: 'serum', start: [10, 9], goal: 20, price: 24, was: 32, days: 9, variants: ['15 ml', '30 ml', '50 ml', 'Pack'], weights: [2, 4, 3, 1] },
    { name: 'Taza Ed. Otoño', art: 'mug', start: [17, 11], goal: 40, price: 18, was: 24, days: 16, variants: ['Arena', 'Salvia', 'Noche', 'Coral'], weights: [3, 3, 2, 2] },
  ];
  var NAMES = EN ? ['Emma W.', 'Liam K.', 'Olivia R.', 'Noah B.', 'Ava M.', 'Lucas D.', 'Mia S.', 'Ethan P.', 'Chloe T.',
    'Leo H.', 'Grace N.', 'Oscar L.', 'Ruby J.', 'Finn C.', 'Isla F.', 'Jack A.', 'Zoe G.', 'Theo V.', 'Ella Q.',
    'Sam O.', 'Lily E.', 'Max Z.', 'Freya U.', 'Ben Y.', 'Nora I.', 'Hugo X.', 'Ivy R.', 'Adam K.', 'Maya P.'] : ['Laura G.', 'Marc P.', 'Lucía R.', 'Javi M.', 'Nerea S.', 'Pablo C.', 'Irene V.', 'Hugo L.', 'Carla F.',
    'Dani R.', 'Aitana B.', 'Sergio N.', 'Marta O.', 'Álex T.', 'Noa E.', 'Raúl D.', 'Paula M.', 'Iker A.', 'Sara H.',
    'Adrián G.', 'Elena J.', 'Bruno Q.', 'Alba K.', 'Óscar Z.', 'Julia C.', 'Mario P.', 'Vega S.', 'Leo R.', 'Clara N.',
    'Rubén V.', 'Ainhoa L.', 'Pol M.', 'Inés T.', 'Gonzalo F.', 'Maialen U.', 'Teo B.', 'Olivia D.', 'Unai R.'];
  var CITIES = EN ? ['London', 'Dublin', 'Manchester', 'Berlin', 'Amsterdam', 'Lisbon', 'Paris', 'Austin', 'Toronto',
    'Bristol', 'Edinburgh', 'Copenhagen', 'Brooklyn', 'Leeds', 'Cork', 'Lyon', 'Munich', 'Porto', 'Vienna',
    'Glasgow', 'Rotterdam', 'Milan', 'Zurich', 'Oslo', 'Denver'] : ['Valencia', 'Madrid', 'Bilbao', 'Sevilla', 'Barcelona', 'Zaragoza', 'Málaga', 'Vigo', 'Granada',
    'Murcia', 'Gijón', 'Alicante', 'Palma', 'Córdoba', 'Valladolid', 'Pamplona', 'Santander', 'Girona', 'Cádiz',
    'Salamanca', 'Logroño', 'Oviedo', 'Burgos', 'Tarragona', 'León', 'Almería', 'Toledo', 'Huesca', 'Lugo', 'Cáceres'];
  var MONTHS = EN ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] : ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  var li = -1;          // índice del lanzamiento actual
  var launchNo = 0;     // nº que se imprime (01, 02, 03…)
  var L = null;
  var n = 0;
  var tally = [];
  var bag = [];
  var seed = 0;
  var minute = 0;       // minutos desde el inicio del lanzamiento (día 0, 00:00)
  var phase = 'idle';   // rush → hold → tear → next → rush…
  var visible = false;
  var timer = null;
  var bumpTimer = null;
  var feedAnim = null;

  function money(v) {
    var p = v.toFixed(2).split('.');
    if (EN) return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + p[1];
    return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + p[1];
  }
  // Importe con su símbolo: «39,00 €» / «€39.00»
  function eur(v) { return EN ? '€' + money(v) : money(v) + ' €'; }
  function dayLabel(d) { return EN ? MONTHS[10] + ' ' + d : d + ' ' + MONTHS[10]; }
  function pad(v, k) { return String(v).padStart(k || 2, '0'); }
  function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  function off() { return Math.round((1 - L.price / L.was) * 100); }

  /* ── Avance del papel, como un motor de verdad ──
     Lo nuevo empieza escondido bajo el labio (el papel baja lo que mide) y sube: arranca, coge velocidad
     y frena (curva en S), con pequeñas irregularidades entre pasos y una duración algo distinta cada vez;
     a veces el motor titubea un instante. Al parar, el papel se balancea un poco (rotateX amortiguado). */
  function feed(px, ms) {
    if (!paper.animate) return;
    if (feedAnim) feedAnim.cancel();
    var R = Math.random;
    var dur = ms * (0.8 + R() * 0.5);
    var steps = Math.max(6, Math.round(px / 2.5));
    var hold = R() < 0.3 ? dur * (0.08 + R() * 0.1) : 0;
    var holdAt = 0.3 + R() * 0.4;
    var sway = 520 + R() * 220;
    var tilt = 0.9 + R() * 0.6;
    var pts = [];
    var shift = 0;
    for (var k = 0; k <= steps; k++) {
      var t = k / steps;
      var p = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      if (k > 0 && k < steps) p = Math.min(1, Math.max(0, p + (R() - 0.5) * 0.035));
      if (hold && !shift && t > holdAt) {
        shift = hold;
        pts.push({ ms: pts[pts.length - 1].ms + hold, y: pts[pts.length - 1].y, r: 14 });
      }
      pts.push({ ms: t * dur + shift, y: Math.round(px * (1 - p) * 2) / 2, r: 14 });
    }
    var end = dur + shift;
    [[0.28, tilt], [0.55, -tilt * 0.55], [0.8, tilt * 0.22], [1, 0]].forEach(function (s) {
      pts.push({ ms: end + sway * s[0], y: 0, r: 14 + s[1] });
    });
    var total = end + sway;
    var last = 0;
    var frames = pts.map(function (q, i) {
      var o = i === 0 ? 0 : i === pts.length - 1 ? 1 : Math.max(last, Math.min(1, q.ms / total));
      last = o;
      return { offset: o, transform: paperTilt(q.r.toFixed(2)) + 'translateY(' + q.y + 'px)' };
    });
    feedAnim = paper.animate(frames, { duration: total, easing: 'linear' });
  }

  /* ── Preparar un lanzamiento: cabecera nueva, contador a cero, variantes ── */
  function setupLaunch() {
    li = (li + 1) % LAUNCHES.length;
    L = LAUNCHES[li];
    launchNo += 1;
    n = 0;
    seed = 17 + li * 31;
    minute = L.start[1] * 60 + Math.floor(rnd() * 40);
    closeAt = minute + L.days * 1440;
    tally = L.variants.map(function () { return 0; });
    bag = [];
    L.weights.forEach(function (w, i) { for (var k = 0; k < w; k++) bag.push(i); });

    visual.classList.remove('is-made');
    stage.classList.remove('is-made');
    paper.classList.remove('is-torn');

    var closeDay = L.start[0] + L.days;
    headEl.innerHTML =
      logoHtml +
      '<canvas class="lz-p-photo" aria-hidden="true"></canvas>' +
      '<span class="lz-p-title">' + (EN ? 'Launch No. ' : 'Lanzamiento Nº ') + pad(launchNo) + ' · ' + L.name + '</span>' +
      '<span class="lz-p-sub">' + L.goal + (EN ? ' units · Closes ' : ' unidades · Cierra el ') + dayLabel(closeDay) + '</span>' +
      '<span class="lz-p-price">' + (EN ? 'Launch price' : 'Precio de lanzamiento') + ' <b>' + eur(L.price) + '</b> <s>' + eur(L.was) + '</s> · −' + off() + (EN ? '%' : ' %') + '</span>' +
      '<span class="lz-p-note">' + (EN ? 'If it doesn’t fill up, 100% is refunded' : 'Si no se llega, se devuelve el 100 %') + '</span>';
    lines.innerHTML = '';
    if (window.TukoLzDither) window.TukoLzDither.render(headEl.querySelector('.lz-p-photo'), L.art);

    visual.style.setProperty('--goal', L.goal);
    visual.style.setProperty('--n', 0);
    countEl.textContent = pad(0);
    if (goalEl) goalEl.textContent = L.goal;
    updateLeft();
    sizesEl.innerHTML = L.variants.map(function (v, i) {
      return '<span data-k="' + i + '"><em>' + v + '</em><b>0</b></span>';
    }).join('');
  }

  /* ── Imprimir un pedido ── */
  function printOrder() {
    n += 1;
    var vi = bag[Math.floor(rnd() * bag.length)];
    var name = NAMES[Math.floor(rnd() * NAMES.length)];
    var city = CITIES[Math.floor(rnd() * CITIES.length)];
    // Fechas realistas: al principio entran seguidos; luego con horas de diferencia; de madrugada, nadie
    var gap = n < 7 ? 2 + rnd() * 16 : n < 16 ? 12 + rnd() * 110 : 50 + rnd() * 380;
    minute += Math.round(gap);
    var h = Math.floor(minute / 60) % 24;
    if (h >= 23 || h < 9) {
      var day = Math.floor(minute / 1440) + (h >= 23 ? 1 : 0);
      minute = day * 1440 + 9 * 60 + Math.floor(rnd() * 70);
    }
    var dayN = L.start[0] + Math.floor(minute / 1440);
    var time = dayLabel(dayN) + ' · ' + pad(Math.floor(minute / 60) % 24) + ':' + pad(minute % 60);

    var row = document.createElement('li');
    row.className = 'lz-line is-new';
    row.style.setProperty('--ink', (0.8 + rnd() * 0.2).toFixed(2));
    row.innerHTML =
      '<span class="num">#' + pad(n, 3) + '</span>' +
      '<span class="nm">' + name + '</span>' +
      '<span class="pr">' + money(L.price) + '</span>' +
      '<span class="mt"><span class="sz">' + L.variants[vi] + '</span>' + city + '<i></i>' + time + '<span class="ok">' + (EN ? 'Paid' : 'Pagado') + '</span></span>';
    lines.appendChild(row);
    feed(row.getBoundingClientRect().height || 36, 380);

    tally[vi] += 1;
    var cell = sizesEl.querySelector('[data-k="' + vi + '"]');
    if (cell) {
      cell.querySelector('b').textContent = tally[vi];
      cell.classList.add('is-bump');
      clearTimeout(bumpTimer);
      bumpTimer = setTimeout(function () {
        Array.prototype.forEach.call(sizesEl.children, function (c) { c.classList.remove('is-bump'); });
      }, 240);
    }
    countEl.textContent = pad(n);
    visual.style.setProperty('--n', n);
    updateLeft();
    if (ledEl) {
      ledEl.classList.remove('is-ping');
      void ledEl.offsetWidth; // reinicia la animación
      ledEl.classList.add('is-ping');
    }
  }

  /* Tiempo que queda, en la tira LCD: baja con las fechas de los pedidos impresos */
  function updateLeft() {
    if (!leftEl) return;
    var rem = Math.max(0, closeAt - minute);
    leftEl.textContent = Math.floor(rem / 1440) + ' d ' + pad(Math.floor((rem % 1440) / 60)) + ' h';
  }

  /* Cierre del ticket: objetivo alcanzado, totales, código de barras y el sello */
  function printDone() {
    var row = document.createElement('li');
    row.className = 'lz-p-made is-new';
    row.innerHTML =
      '<div class="lz-p-rule" style="width:100%"></div>' +
      '<strong>' + L.goal + (EN ? ' of ' : ' de ') + L.goal + (EN ? ' units' : ' unidades') + '</strong>' +
      '<span>' + (EN ? 'Launch complete · Everyone gets −' + off() + '%' : 'Lanzamiento completado · Todos con −' + off() + ' %') + '</span>' +
      '<div class="lz-p-rule" style="width:100%"></div>' +
      '<div class="lz-p-tot"><span>' + L.goal + ' × ' + eur(L.price) + '</span><b>Total ' + eur(L.goal * L.price) + '</b></div>' +
      '<div class="lz-bc" aria-hidden="true">' + barcode() + '</div>' +
      '<div class="lz-bc-n">TK ' + pad(launchNo) + ' ' + pad(L.goal, 3) + ' ' + String(L.goal * L.price).padStart(5, '0') + '</div>' +
      '<span class="lz-ink">' + (EN ? 'Complete' : 'Completado') + '<small>' + (EN ? 'Launch No. ' : 'Lanzamiento Nº ') + pad(launchNo) + '</small></span>';
    lines.appendChild(row);
    feed(row.getBoundingClientRect().height || 140, 1100);
    var ink = row.querySelector('.lz-ink');
    setTimeout(function () { ink.classList.add('is-on'); }, 700);
    visual.classList.add('is-made');
    stage.classList.add('is-made');
  }

  function barcode() {
    var out = '';
    for (var i = 0; i < 44; i++) {
      var w = 1 + Math.floor(rnd() * 3);
      out += '<i style="width:' + w + 'px"' + (i % 2 ? ' class="g"' : '') + '></i>';
    }
    return out;
  }

  /* ── El ticket se arranca y se va hacia arriba ── */
  function tear(done) {
    paper.classList.add('is-torn');
    visual.classList.add('is-swap');
    var finish = function () {
      visual.classList.remove('is-swap');
      done();
    };
    if (!paper.animate) { finish(); return; }
    if (feedAnim) feedAnim.cancel();
    var a = paper.animate(
      [
        { transform: paperTilt(14) + 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: paperTilt(14) + 'translateY(-14px) rotate(-1.5deg)', opacity: 1, offset: 0.25 },
        { transform: paperTilt(14) + 'translateY(-160px) rotate(-4deg)', opacity: 0 },
      ],
      { duration: 900, easing: 'cubic-bezier(0.55, 0, 0.75, 0.2)', fill: 'forwards' }
    );
    a.onfinish = function () {
      // Escondido mientras se prepara el siguiente; la cabecera nueva vuelve a salir de la ranura
      paper.style.visibility = 'hidden';
      a.cancel();
      finish();
    };
  }

  /* ── Ritmo ── */
  function schedule(ms) { clearTimeout(timer); timer = setTimeout(step, ms); }

  function step() {
    if (!visible) return;
    switch (phase) {
      case 'boot':
        // Entrada: la impresora se enciende (luz de encendido) y se queda lista, con el contador a 00
        visual.classList.remove('is-off');
        visual.classList.add('is-boot');
        countEl.textContent = pad(0);
        setTimeout(function () { visual.classList.remove('is-boot'); }, 700);
        phase = 'wake';
        schedule(1500);
        return;
      case 'wake':
        // …y saca la cabecera del primer lanzamiento por la ranura
        paper.style.visibility = '';
        feed(paper.getBoundingClientRect().height || 140, 1500);
        phase = 'rush';
        schedule(2100);
        return;
      case 'next':
        setupLaunch();
        paper.style.visibility = '';
        // La cabecera sale de la ranura
        feed(paper.getBoundingClientRect().height || 140, 1300);
        phase = 'rush';
        schedule(1900);
        return;
      case 'rush': {
        visual.classList.add('is-printing');
        printOrder();
        if (n >= L.goal) {
          // Objetivo cumplido: ya no entra nadie más. Se imprime el cierre del ticket.
          phase = 'done';
          schedule(900);
          return;
        }
        // Seguido al principio y frenando al acercarse al objetivo (unos 12-14 s en total)
        var base = Math.max(240, Math.min(420, 12000 / L.goal));
        var left = L.goal - n;
        schedule(left > 6 ? base : base + (7 - left) * 150);
        return;
      }
      case 'done':
        printDone();
        setTimeout(function () { visual.classList.remove('is-printing'); }, 1200);
        phase = 'hold';
        schedule(5600);
        return;
      case 'hold':
        phase = 'tear';
        tear(function () { phase = 'next'; schedule(500); });
        return;
      default:
        return;
    }
  }

  /* ── Pausa fuera de pantalla (un ticket a medio arrancar se completa al volver) ── */
  function setVisible(v) {
    if (v === visible) return;
    visible = v;
    if (v) {
      if (phase !== 'tear') schedule(600);
    } else {
      if (phase !== 'tear') clearTimeout(timer);
      visual.classList.remove('is-printing');
    }
  }

  // Estado inicial: la impresora apagada y sin papel; al verse se enciende y empieza el primer lanzamiento
  setupLaunch();
  paper.style.visibility = 'hidden';
  visual.classList.add('is-off');
  phase = 'boot';

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      setVisible(entries[0].isIntersecting && !document.hidden);
    }, { threshold: 0.25 }).observe(printer);
    document.addEventListener('visibilitychange', function () {
      var r = printer.getBoundingClientRect();
      setVisible(!document.hidden && r.bottom > 0 && r.top < window.innerHeight);
    });
  } else {
    setVisible(true);
  }
})();
