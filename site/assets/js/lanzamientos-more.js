/**
 * Página Lanzamientos · «Lo que ve tu cliente» y el cálculo del precio.
 * - El móvil: el contador sube de 17 a 30 y van cayendo los avisos (asuntos reales de los emails de Tuko);
 *   la lista de la izquierda marca el aviso de cada momento. En bucle mientras se ve; se pausa fuera de pantalla.
 * - La calculadora: 1 € por comprador si se completa, los 5 primeros del ciclo gratis y como mucho 200 €.
 * Datos de ejemplo.
 */
(function () {
  'use strict';

  // Idioma: la página inglesa (/en/launches) es la misma con <html lang="en">
  var EN = document.documentElement.lang === 'en';

  /* ── El móvil: una tienda de verdad ──
     Historia en bucle: el dedo toca «Reservar mi plaza», sale el popup del widget (precio, faltan, cuenta atrás), se paga,
     la ficha queda «Ya estás dentro» y caen los avisos (asuntos reales de los emails de Tuko) mientras el contador
     sube hasta 30 y el lanzamiento se completa. La lista de la izquierda marca el aviso de cada momento. */
  var phone = document.querySelector('.lzp');
  var mails = document.querySelectorAll('.lz-mails li');
  if (phone) {
    var GOAL = 30;
    var notif = phone.querySelector('.lzp-notif');
    var msg = phone.querySelector('.lzp-msg');
    var nEls = phone.querySelectorAll('.lzp-n, .lzp-n2');
    var leftEls = phone.querySelectorAll('.lzp-left');
    var bars = phone.querySelectorAll('.lzp-l-bar, .lzp-s-prog > span');
    var dEls = phone.querySelectorAll('.lzw-d');
    var hEls = phone.querySelectorAll('.lzw-hh');
    var mEls = phone.querySelectorAll('.lzw-mm');
    var secEl = null;
    var touch = phone.querySelector('.lzp-touch');
    var btn = phone.querySelector('.lzp-btn');
    var payBtn = phone.querySelector('.lzp-s-btn');
    var screen = phone.querySelector('.lzp-screen');
    // Asuntos reales de los emails de Tuko (launchI18n en tuko-platform)
    var MSGS = EN ? [
      'Purchase confirmed. 12 more people needed',
      '12 hours left to complete the drop',
      '1 more person to fill the drop',
      'Drop complete',
    ] : [
      'Compra confirmada. Faltan 12 personas',
      'Quedan 12 horas para completar el drop',
      'Falta 1 persona para completar el drop',
      'Drop completado',
    ];
    var timers = [];
    var running = false;
    var sec = 48;
    var secTimer = null;
    var later = function (fn, ms) { timers.push(setTimeout(fn, ms)); };
    /* Gente uniéndose: fila de círculos (iniciales, sin nombres) con «Tú» delante al pagar; cada persona nueva entra
       con un rebote y el resto se recoloca; las que no caben se suman al «+N». */
    var facesEl = phone.querySelector('.lzp-faces');
    var INITIALS = ['LM', 'AR', 'JS', 'NP', 'CG', 'IV', 'MB', 'DR', 'SO', 'PT', 'EF', 'HG', 'AL', 'RC', 'MV', 'NT', 'BS', 'OP', 'GL', 'KA', 'TE', 'UR', 'ZM', 'FD', 'QS', 'WB', 'YC', 'VP', 'XN', 'IL'];
    var TONES = ['#f2c9b6', '#c9d6f6', '#d3ebcf', '#f4e2ad', '#e3cff2', '#cbe8ee', '#f6cdd8'];
    var joined = false;
    var lastN = 0;
    var avatar = function (i, cls) {
      return '<i class="lzp-av' + (cls ? ' ' + cls : '') + '" style="--c:' + TONES[i % TONES.length] + '">' + INITIALS[i % INITIALS.length] + '</i>';
    };
    // Como en el widget: personas en círculos de color (hasta 4) y un quinto con «+N»; la que entra, con un rebote
    var renderFaces = function (n) {
      if (!facesEl) return;
      var html = '';
      for (var k = Math.min(4, n) - 1; k >= 0; k--) {
        var idx = n - k;
        html += '<i class="t' + (idx % 4) + (k === 0 && n > lastN ? ' is-new' : '') + '"></i>';
      }
      if (n > 4) html += '<i class="lzw-more">+' + (n - 4) + '</i>';
      facesEl.innerHTML = html;
      lastN = n;
    };
    var setN = function (n) {
      Array.prototype.forEach.call(nEls, function (el) { el.textContent = n; });
      Array.prototype.forEach.call(leftEls, function (el) { el.textContent = Math.max(0, GOAL - n); });
      Array.prototype.forEach.call(bars, function (b) { b.style.setProperty('--f', (n / GOAL).toFixed(3)); });
      renderFaces(n);
      // El reloj corre a la vez que sube la gente: de 3 d 14 h (17 personas) a 12 h (26) y a 9 h al completarse
      timeTarget = n <= 26 ? 5182 - (n - 17) / 9 * (5182 - 720) : 720 - (n - 26) / 4 * 180;
    };
    /* Tiempo que queda, en minutos, corriendo de forma continua hacia su objetivo */
    var timeShown = 5182;
    var timeTarget = 5182;
    var timeTimer = null;
    var fmtLeft = function (m) {
      m = Math.max(0, Math.round(m));
      var d = Math.floor(m / 1440);
      var h = Math.floor((m % 1440) / 60);
      if (d > 0) return d + ' d ' + h + ' h';
      return h + ' h ' + (m % 60 < 10 ? '0' : '') + (m % 60) + ' min';
    };
    var tickTime = function () {
      timeShown += (timeTarget - timeShown) * 0.12;
      timeShown -= 0.6; // y nunca se para del todo, como un reloj
      if (timeShown < timeTarget - 30) timeShown = timeTarget - 30;
      var m = Math.max(0, Math.round(timeShown));
      var put = function (els, v) { Array.prototype.forEach.call(els, function (el) { el.textContent = v; }); };
      put(dEls, Math.floor(m / 1440));
      put(hEls, Math.floor((m % 1440) / 60));
      put(mEls, m % 60);
    };
    var mark = function (k) {
      Array.prototype.forEach.call(mails, function (li, i) {
        li.classList.toggle('is-on', i === k);
        li.classList.toggle('is-past', i < k);
        li.classList.toggle('is-ok', k === 3);
      });
    };
    var notify = function (k) {
      notif.classList.remove('is-in');
      later(function () {
        msg.textContent = MSGS[k];
        notif.classList.add('is-in');
        mark(k);
      }, 260);
      later(function () { notif.classList.remove('is-in'); }, 3000);
    };
    // El dedo toca un elemento de la pantalla
    var tap = function (el, cls) {
      var s = screen.getBoundingClientRect();
      var r = el.getBoundingClientRect();
      touch.style.setProperty('--tx', (r.left - s.left + r.width * 0.6) + 'px');
      touch.style.setProperty('--ty', (r.top - s.top + r.height / 2) + 'px');
      touch.classList.remove('is-on');
      void touch.offsetWidth;
      touch.classList.add('is-on');
      phone.classList.add(cls);
      later(function () { phone.classList.remove(cls); }, 180);
    };
    var climb = function (from, to, at, step) {
      var t = at;
      for (var v = from + 1; v <= to; v++) {
        (function (x) { later(function () { setN(x); }, t); })(v);
        t += step * (0.6 + Math.random() * 0.8);
      }
      return t;
    };
    var cycle = function () {
      timers.forEach(clearTimeout);
      timers = [];
      phone.classList.remove('is-done', 'is-joined', 'is-sheet', 'is-paid', 'is-final', 'is-tap-btn', 'is-tap-pay');
      joined = false;
      lastN = 0;
      setN(17);
      timeShown = timeTarget;
      mark(-1);
      // 1 · toca «Únete al lanzamiento» y sube la hoja
      later(function () { tap(btn, 'is-tap-btn'); }, 1000);
      later(function () { phone.classList.add('is-sheet'); }, 1300);
      // 2 · toca «Ir al pago» → pagado
      later(function () { tap(payBtn, 'is-tap-pay'); }, 3600);
      later(function () {
        phone.classList.add('is-paid', 'is-joined');
        joined = true;
        setN(18);
        notify(0);
      }, 3900);
      // 3 · se cierra la hoja y el lanzamiento sigue sumando
      later(function () { phone.classList.remove('is-sheet'); }, 6200);
      later(function () { phone.classList.remove('is-paid'); }, 6800);
      var t = climb(18, 26, 7200, 420);
      later(function () { notify(1); }, t + 300);
      t = climb(26, 29, t + 3800, 520);
      later(function () { notify(2); }, t + 200);
      later(function () {
        setN(30);
        phone.classList.add('is-done');
        notify(3);
      }, t + 3800);
      // 4 · toca «Ver detalles» y sale el popup «Drop completado»
      later(function () { tap(btn, 'is-tap-btn'); }, t + 6600);
      later(function () { phone.classList.add('is-final'); }, t + 6850);
      later(function () { phone.classList.add('is-sheet'); }, t + 6950);
      later(function () { phone.classList.remove('is-sheet'); }, t + 10600);
      later(function () { if (running) cycle(); }, t + 11600);
    };
    var tickSec = function () {
      sec = sec <= 0 ? 59 : sec - 1;
      if (secEl) secEl.textContent = (sec < 10 ? '0' : '') + sec;
    };
    var start = function () {
      if (running) return;
      running = true;
      secTimer = setInterval(tickSec, 1000);
      timeTimer = setInterval(function () { if (!phone.classList.contains('is-done')) tickTime(); }, 90);
      cycle();
    };
    var stop = function () {
      running = false;
      timers.forEach(clearTimeout);
      timers = [];
      clearInterval(secTimer);
      clearInterval(timeTimer);
      notif.classList.remove('is-in');
    };
    /* Sigue al cursor hacia los dos lados (solo con ratón): gira hacia donde está el puntero, con suavidad, y el
       canto que se ve cambia de lado con el giro. Sin ratón se queda mirando un poco hacia el texto. */
    if (window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var MAX_Y = 14;
      var MAX_X = 6;
      var tiltTgt = { y: -8, x: 3 };
      var tiltCur = { y: -8, x: 3 };
      var tiltRaf = 0;
      var tiltNear = false;
      var tiltPaint = function () {
        tiltCur.y += (tiltTgt.y - tiltCur.y) * 0.08;
        tiltCur.x += (tiltTgt.x - tiltCur.x) * 0.08;
        var s = tiltCur.y / 12;
        phone.style.setProperty('--ry', tiltCur.y.toFixed(2) + 'deg');
        phone.style.setProperty('--rx', tiltCur.x.toFixed(2) + 'deg');
        phone.style.setProperty('--s', s.toFixed(3));
        phone.style.setProperty('--sl', Math.max(0, s).toFixed(3));
        phone.style.setProperty('--sr', Math.max(0, -s).toFixed(3));
        if (Math.abs(tiltTgt.y - tiltCur.y) > 0.05 || Math.abs(tiltTgt.x - tiltCur.x) > 0.05) tiltRaf = requestAnimationFrame(tiltPaint);
        else tiltRaf = 0;
      };
      var tiltKick = function () { if (!tiltRaf) tiltRaf = requestAnimationFrame(tiltPaint); };
      window.addEventListener('pointermove', function (e) {
        if (!tiltNear) return;
        var r = phone.getBoundingClientRect();
        // Normalizado con la distancia al borde de ese lado: el giro llega al máximo hacia los dos lados
        var cx = r.left + r.width / 2;
        var dx = e.clientX < cx ? (e.clientX - cx) / Math.max(1, cx) : (e.clientX - cx) / Math.max(1, innerWidth - cx);
        var dy = (e.clientY - (r.top + r.height / 2)) / (innerHeight / 2);
        dx = Math.max(-1, Math.min(1, dx));
        dy = Math.max(-1, Math.min(1, dy));
        // Mira hacia el cursor: a la izquierda → se acerca el lado derecho (giro negativo)
        tiltTgt.y = dx * MAX_Y;
        tiltTgt.x = -dy * MAX_X;
        tiltKick();
      }, { passive: true });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (e) {
          tiltNear = e[0].isIntersecting;
          if (!tiltNear) { tiltTgt.y = -8; tiltTgt.x = 3; tiltKick(); }
        }).observe(phone);
      } else {
        tiltNear = true;
      }
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting && !document.hidden) start(); else stop();
      }, { threshold: 0.4 }).observe(phone);
      document.addEventListener('visibilitychange', function () {
        var r = phone.getBoundingClientRect();
        if (!document.hidden && r.top < innerHeight && r.bottom > 0) start(); else stop();
      });
    } else {
      start();
    }
  }

  /* ── Frente a una preventa ──
     Entrada: al llegar con el scroll, las filas aparecen una tras otra y la franja Tuko cae de arriba abajo
     (.is-ready la deja preparada solo si hay JS; .is-in la lanza). Luego, un latido en directo: cada pocos
     segundos entra una compra, sube el contador y crece la talla que se ha comprado, hasta llegar a 30.
     Se pausa fuera de pantalla. */
  var vs = document.querySelector('.lz-vs');
  if (vs) {
    var vsN = vs.querySelector('.mv-n');
    var vsBar = vs.querySelector('.mv-bar');
    var vsTime = vs.querySelector('.mv-t');
    var sizeEls = vs.querySelectorAll('.mv-sizes > span');
    var GOAL_VS = 30;
    var counts = [3, 6, 5, 4];          // S, M, L, XL (suman 18)
    var weights = [2, 4, 3, 2];
    var n = 12;
    var beat = null;
    var inView = false;
    var started = false;

    var paintSizes = function (bumpK) {
      var max = Math.max.apply(null, counts);
      Array.prototype.forEach.call(sizeEls, function (el, k) {
        el.style.setProperty('--h', (counts[k] / max).toFixed(3));
        if (k === bumpK) {
          el.classList.remove('is-bump');
          void el.offsetWidth;
          el.classList.add('is-bump');
        }
      });
    };
    var setCount = function (v) {
      n = v;
      if (vsN) vsN.textContent = v;
      if (vsBar) vsBar.style.setProperty('--f', (v / GOAL_VS).toFixed(3));
    };
    var pickSize = function () {
      var total = weights.reduce(function (s, w) { return s + w; }, 0);
      var r = Math.random() * total;
      for (var k = 0; k < weights.length; k++) { r -= weights[k]; if (r < 0) return k; }
      return 0;
    };
    var heartbeat = function () {
      clearTimeout(beat);
      if (!inView || n >= GOAL_VS) return;
      beat = setTimeout(function () {
        if (!inView) return;
        var k = pickSize();
        counts[k] += 1;
        setCount(n + 1);
        paintSizes(k);
        if (n >= GOAL_VS) {
          vs.classList.add('is-full');
          if (vsTime) vsTime.textContent = vs.getAttribute('data-done') || 'Completado';
          return;
        }
        heartbeat();
      }, 3800 + Math.random() * 1800);
    };
    var goVs = function () {
      started = true;
      vs.classList.add('is-in');
      // Arranque: el contador sube de 12 a 18 de un tirón; después, el latido
      var tick = function () {
        if (n >= 18) { vs.classList.add('is-live'); heartbeat(); return; }
        setCount(n + 1);
        setTimeout(tick, 260 + Math.random() * 380);
      };
      setTimeout(tick, 1100);
    };

    vs.classList.add('is-ready');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        inView = e[0].isIntersecting;
        if (inView && !started) goVs();
        else if (inView && started && n >= 18) heartbeat();
        else if (!inView) clearTimeout(beat);
      }, { threshold: 0.25 }).observe(vs.querySelector('.lz-vs-table'));
    } else {
      inView = true;
      goVs();
    }
  }

  /* ── Preguntas por momento ──
     La aguja de la regla baja al grupo que se está leyendo (el que cruza la mitad de la pantalla) y su parada se
     enciende. Las respuestas se abren y cierran con una transición de altura (el <details> de siempre por debajo). */
  var rail = document.querySelector('.lz-rail');
  var groups = document.querySelectorAll('.lz-faq-group');
  if (rail && groups.length) {
    var stops = rail.querySelectorAll('a');
    var setG = function (g) {
      rail.style.setProperty('--g', g);
      Array.prototype.forEach.call(stops, function (a, i) { a.classList.toggle('is-on', i === g); a.classList.toggle('is-past', i < g); });
    };
    setG(0);
    // Grupo activo: el último cuyo título ya ha pasado del 55 % de la pantalla (al final de la página, el último)
    var pickG = function () {
      var g = 0;
      var lim = innerHeight * 0.55;
      Array.prototype.forEach.call(groups, function (el, i) { if (el.getBoundingClientRect().top < lim) g = i; });
      var last = groups[groups.length - 1].getBoundingClientRect();
      if (last.bottom < innerHeight * 0.9) g = groups.length - 1;
      setG(g);
    };
    var gTick = false;
    window.addEventListener('scroll', function () {
      if (gTick) return;
      gTick = true;
      requestAnimationFrame(function () { gTick = false; pickG(); });
    }, { passive: true });
    pickG();
    Array.prototype.forEach.call(stops, function (a) {
      a.addEventListener('click', function (e) {
        var t = document.querySelector(a.getAttribute('href'));
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setG(+a.getAttribute('data-g'));
      });
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll('.lz-faq-group details'), function (d) {
    var sum = d.querySelector('summary');
    var body = d.querySelector('.lz-faq-a');
    if (!sum || !body || !body.animate) return;
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      if (d.dataset.busy) return;
      d.dataset.busy = '1';
      if (!d.open) {
        d.open = true;
        var hh = body.scrollHeight;
        var a = body.animate([{ height: '0px', opacity: 0 }, { height: hh + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
        a.onfinish = function () { delete d.dataset.busy; };
      } else {
        var h0 = body.scrollHeight;
        d.classList.add('is-closing');
        var b = body.animate([{ height: h0 + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 280, easing: 'cubic-bezier(0.4, 0, 1, 1)' });
        b.onfinish = function () { d.open = false; d.classList.remove('is-closing'); delete d.dataset.busy; };
      }
    });
  });

  /* ── Ahorro: las secciones que no se ven pausan sus animaciones CSS en bucle (clase .is-away) ── */
  if ('IntersectionObserver' in window) {
    var awayIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle('is-away', !en.isIntersecting); });
    }, { rootMargin: '300px 0px' });
    Array.prototype.forEach.call(document.querySelectorAll('.lz-hero, main > .lz-sec'), function (s) { awayIo.observe(s); });
  }

  /* ── Cierre: tu impresora ──
     Al verse, el ticket en blanco sale de la ranura a saltos. Con − / + se elige el objetivo (de 5 a 100, de 5 en 5):
     la pantalla y el ticket se «reimprimen» con el número nuevo. */
  var lzf = document.querySelector('.lzf');
  if (lzf) {
    var goal = 30;
    var goalEls = lzf.querySelectorAll('.lzf-goal');
    var btnsF = lzf.querySelectorAll('.lzf-btn');
    var setGoal = function (v) {
      goal = Math.max(5, Math.min(100, v));
      Array.prototype.forEach.call(goalEls, function (el) { el.textContent = goal; });
      btnsF[0].disabled = goal <= 5;
      btnsF[1].disabled = goal >= 100;
      lzf.classList.remove('is-bump');
      void lzf.offsetWidth;
      lzf.classList.add('is-bump');
    };
    Array.prototype.forEach.call(btnsF, function (b) {
      b.addEventListener('click', function () { setGoal(goal + Number(b.getAttribute('data-d'))); });
    });
    if ('IntersectionObserver' in window) {
      var fio = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { fio.disconnect(); lzf.classList.add('is-in'); }
      }, { threshold: 0.4 });
      fio.observe(lzf);
    } else {
      lzf.classList.add('is-in');
    }
  }

  /* ── Calculadora del precio ──
     1 € por comprador si se completa, los 5 primeros del ciclo gratis y como mucho 200 €. Las cifras ruedan hasta
     su valor, la barra muestra lo que es tuyo y la astilla de Tuko, y el interruptor «¿Y si no se completa?» lo
     pone todo a 0 € (se devuelve el dinero a todos). */
  var calc = document.querySelector('.lz-calc');
  if (calc) {
    var inN = calc.querySelector('[data-k="n"]');
    var inP = calc.querySelector('[data-k="p"]');
    var fail = calc.querySelector('.lz-calc-fail');
    var split = calc.querySelector('.lz-split');
    var fmt = function (v, dec) {
      return v.toLocaleString(EN ? 'en-GB' : 'es-ES', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0, useGrouping: 'always' });
    };
    var eur = function (v, dec) { return EN ? '€' + fmt(v, dec) : fmt(v, dec) + ' €'; };
    var paintRange = function (input) {
      var pct = (input.value - input.min) / (input.max - input.min) * 100;
      input.style.setProperty('--v', pct + '%');
    };
    // Cifras que ruedan: cada una va de su valor actual al nuevo en ~0,4 s
    var rolls = {};
    var roll = function (sel, to, dec, suffix) {
      var el = calc.querySelector(sel);
      if (!el) return;
      var st = rolls[sel] || (rolls[sel] = { v: to, raf: 0 });
      cancelAnimationFrame(st.raf);
      var from = st.v;
      var t0 = performance.now();
      var step = function (now) {
        var k = Math.min(1, (now - t0) / 420);
        var e = 1 - Math.pow(1 - k, 3);
        st.v = from + (to - from) * e;
        el.textContent = suffix ? fmt(st.v, dec) + suffix : eur(Math.round(st.v * Math.pow(10, dec || 0)) / Math.pow(10, dec || 0), dec);
        if (k < 1) st.raf = requestAnimationFrame(step);
      };
      st.raf = requestAnimationFrame(step);
    };
    var update = function () {
      var n = +inN.value;
      var p = +inP.value;
      var off = fail && fail.checked;
      var sales = n * p;
      var fee = off ? 0 : Math.min(200, Math.max(0, n - 5));
      var keep = off ? 0 : sales - fee;
      calc.querySelector('.lz-calc-n').textContent = n;
      calc.querySelector('.lz-calc-p').textContent = eur(p);
      roll('.lz-calc-sales', off ? 0 : sales, 0);
      roll('.lz-calc-fee', fee, 0);
      roll('.lz-calc-keep', keep, 0);
      var pct = sales ? fee / sales * 100 : 0;
      calc.querySelector('.lz-calc-pct').textContent = eur(Math.round(pct * 10) / 10, 1);
      calc.classList.toggle('is-fail', !!off);
      if (split) split.style.setProperty('--t', Math.max(pct, fee > 0 ? 0.8 : 0).toFixed(2) + '%');
      paintRange(inN);
      paintRange(inP);
    };
    inN.addEventListener('input', update);
    inP.addEventListener('input', update);
    if (fail) fail.addEventListener('change', update);
    update();
  }
})();
