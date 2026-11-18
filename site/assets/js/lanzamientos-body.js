/**
 * Página Lanzamientos · cuerpo.
 * - Cómo funciona: la aguja recorre la regla de 12 días. Primero se rellena la ficha (01), luego se apuntan
 *   personas (02; al principio rápido, en medio más lento y al final otro empujón) y al llegar a 30, el día 9,
 *   se completa (03) aunque sobren días. Se reproduce al verse por primera vez; «Verlo otra vez» lo repite.
 * - Dos finales: los tickets salen al verse (.is-in).
 * - Para quién: dibuja las fotos tramadas.
 * Todos los datos son de ejemplo.
 */
(function () {
  'use strict';

  var EN = document.documentElement.lang === 'en';
  var GOAL = 30;
  var DAYS = 12;
  var DONE_DAY = 9.2;
  var NAMES = EN ? ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Lucas', 'Mia', 'Ethan', 'Chloe', 'Leo', 'Grace', 'Oscar', 'Ruby', 'Finn', 'Isla'] : ['Lucía', 'Marc', 'Irene', 'Javi', 'Nora', 'Pablo', 'Aitana', 'Raúl', 'Carla', 'Hugo', 'Sara', 'Dani', 'Elena', 'Iker', 'Marta'];
  var CITIES = EN ? ['London', 'Dublin', 'Berlin', 'Austin', 'Lisbon', 'Paris', 'Toronto', 'Leeds', 'Munich', 'Porto'] : ['Valencia', 'Bilbao', 'Sevilla', 'Madrid', 'Girona', 'Vigo', 'Murcia', 'Zaragoza', 'Lugo', 'Málaga'];
  var SIZES = ['S', 'M', 'M', 'L', 'L', 'XL', 'M'];

  function onSeen(el, cb, threshold) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { cb(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); cb(); }
    }, { threshold: threshold || 0.35 });
    io.observe(el);
  }

  /* ── Cómo funciona ── */
  var run = document.querySelector('.lz-run');
  if (run) {
    var steps = run.querySelectorAll('.lz-step');
    var cfgRows = run.querySelectorAll('.lz-cfg span');
    var dayEl = run.querySelector('.lz-needle-day');
    var nEl = run.querySelector('.lz-needle-n');
    var joinC = run.querySelector('.lz-join-c');
    var joinBar = run.querySelector('.lz-join-bar');
    var last = run.querySelector('.lz-join-last');
    var av = run.querySelector('.lz-join-av');
    var who = run.querySelector('.lz-join-who');
    var replay = run.querySelector('.lz-replay');
    var raf = 0;
    var current = -1;
    var ruler = run.querySelector('.lz-ruler');
    var linksSvg = run.querySelector('.lz-links svg');
    var timers = [];

    // Personas apuntadas según el avance (0…1): arranque fuerte, valle en medio y empujón final
    var joined = function (t) { return Math.round(GOAL * (0.55 * (1 - Math.pow(1 - t, 2.2)) + 0.45 * t * t * t)); };

    var setStep = function (k) {
      current = k;
      Array.prototype.forEach.call(steps, function (s, i) {
        s.classList.toggle('is-on', i === k);
        s.classList.toggle('is-past', i < k);
      });
      if (linksSvg) Array.prototype.forEach.call(linksSvg.querySelectorAll('[data-k]'), function (el) {
        var i = +el.getAttribute('data-k');
        el.classList.toggle('is-on', i === k);
        el.classList.toggle('is-past', i < k);
      });
    };
    var setP = function (day, n) {
      run.style.setProperty('--p', (day / DAYS).toFixed(4));
      dayEl.textContent = (EN ? 'Day ' : 'Día ') + Math.floor(day);
      nEl.textContent = n;
      joinC.textContent = n;
      joinBar.style.setProperty('--j', (n / GOAL).toFixed(3));
    };
    var later = function (fn, ms) { timers.push(setTimeout(fn, ms)); };

    var reset = function () {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      timers = [];
      run.classList.remove('is-done');
      Array.prototype.forEach.call(cfgRows, function (r) { r.classList.remove('is-set'); });
      av.textContent = '·';
      who.textContent = EN ? 'Waiting for the first person' : 'Esperando a la primera persona';
      setP(0, 0);
      setStep(-1);
      replay.hidden = true;
    };

    var play = function () {
      reset();
      // 01 · se rellena la ficha
      setStep(0);
      Array.prototype.forEach.call(cfgRows, function (r, i) { later(function () { r.classList.add('is-set'); }, 300 + i * 380); });
      // 02 · avanza la aguja y se apuntan
      later(function () {
        setStep(1);
        var t0 = performance.now();
        var dur = 7000;
        var shown = 0;
        var seed = 0;
        var frame = function (now) {
          var t = Math.min(1, (now - t0) / dur);
          var n = joined(t);
          setP(DONE_DAY * t, n);
          if (n > shown) {
            shown = n;
            seed = (seed * 7 + n * 13) % 997;
            var name = NAMES[seed % NAMES.length];
            av.textContent = name.charAt(0);
            who.textContent = name + ' · ' + CITIES[seed % CITIES.length] + (EN ? ' · size ' : ' · talla ') + SIZES[seed % SIZES.length];
            last.classList.remove('is-new');
            void last.offsetWidth;
            last.classList.add('is-new');
          }
          if (t < 1) { raf = requestAnimationFrame(frame); return; }
          // 03 · se completa el día 9
          setP(DONE_DAY, GOAL);
          dayEl.textContent = EN ? 'Complete · day 9' : 'Completado · día 9';
          setStep(2);
          run.classList.add('is-done');
          later(function () { replay.hidden = false; }, 1200);
        };
        raf = requestAnimationFrame(frame);
      }, 300 + cfgRows.length * 380 + 500);
    };

    // Marcas de la regla: una por cuarto de día (las de día entero, más largas)
    var ticks = run.querySelector('.lz-ruler-ticks');
    if (ticks) {
      var html = '';
      for (var q = 0; q <= DAYS * 4; q++) {
        var cls = (q % 4 === 0 ? 'is-day' : '') + (q / 4 > DONE_DAY ? ' is-spare' : '');
        html += '<i class="' + cls + '" style="left:' + (q / (DAYS * 4) * 100).toFixed(4) + '%"></i>';
      }
      ticks.innerHTML = html;
    }

    /* Conectores: del Día 0 a «Lo abres», un corchete del día 1 al 9 a «Se apuntan» y del día 9 a «Se cierra».
       Se dibujan con las medidas reales (la regla tiene márgenes y las columnas, relleno) y se rehacen al cambiar el ancho. */
    function drawLinks() {
      if (!linksSvg) return;
      var W = run.clientWidth;
      var H = linksSvg.parentNode.clientHeight;
      if (!W || !H) return;
      // Posición real de las marcas (el margen de la regla es un clamp() y no se puede leer como número)
      var tk = ruler.querySelector('.lz-ruler-ticks');
      var r0 = run.getBoundingClientRect().left;
      var tr = tk.getBoundingClientRect();
      var pad = parseFloat(getComputedStyle(steps[0]).paddingLeft) || 0;
      var x = function (d) { return tr.left - r0 + d / DAYS * tr.width; };
      // Cada línea llega al centro del número de su columna (medido, no supuesto)
      var col = function (i) {
        var nr = steps[i].querySelector('.lz-step-n').getBoundingClientRect();
        return Math.round(nr.left - r0 + nr.width / 2) + 0.5;
      };
      var y0 = 4;
      var yb = 14;
      // Codos en ángulo recto (como en un plano), no curvas
      var curve = function (xa, ya, xb) {
        var m = Math.round(ya + (H - ya) * 0.55) + 0.5;
        if (Math.abs(xa - xb) < 14) return 'M' + xb + ' ' + ya + ' V' + H; // casi alineados: recta, sin escalón
        return 'M' + xa + ' ' + ya + ' V' + m + ' H' + xb + ' V' + H;
      };
      var paths = [
        curve(x(0), y0, col(0)),
        'M' + x(1) + ' ' + y0 + ' V' + yb + ' H' + x(DONE_DAY - 0.2) + ' V' + y0 + ' M' + col(1) + ' ' + yb + ' V' + H,
        curve(x(DONE_DAY), y0, col(2)),
      ];
      var dots = [[x(0), y0], [col(0), H], [col(1), yb], [col(1), H], [x(DONE_DAY), y0], [col(2), H]];
      var dk = [0, 0, 1, 1, 2, 2];
      var html = '';
      paths.forEach(function (d, i) {
        html += '<path class="lz-ln" d="' + d + '"/>';
        html += '<path class="lz-ln-on" data-k="' + i + '" pathLength="1" d="' + d + '"/>';
      });
      dots.forEach(function (p, i) {
        html += '<circle class="lz-ln-dot" data-k="' + dk[i] + '" cx="' + p[0].toFixed(1) + '" cy="' + p[1] + '" r="2.5"/>';
      });
      linksSvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      linksSvg.innerHTML = html;
      setStep(current);
    }
    if ('ResizeObserver' in window) new ResizeObserver(drawLinks).observe(run); else window.addEventListener('resize', drawLinks);
    drawLinks();

    replay.addEventListener('click', play);
    reset();
    onSeen(run.querySelector('.lz-ruler'), play, 0.9);
  }

  /* ── Dos finales ── */
  var ends = document.querySelector('.lz-ends');
  /* Imprimir un ticket: como en una impresora de verdad, el papel sale por la ranura con la cabecera por delante
     (lo primero que se imprime es lo primero que sale) y sube a saltos de motor paso a paso (como un motor paso a paso, con pausas algo distintas y a veces una más
     larga), corte con un tirón, balanceo colgando de la rendija (en 3D, sin girar en el plano: los bordes no se
     dentan) y el sello, que hunde el papel un instante. */
  function printTicket(fig, done) {
    var tk = fig.querySelector('.lz-tk');
    if (!tk.animate) { fig.classList.add('is-printed', 'is-stamped'); return; }
    var H = tk.offsetHeight;
    var y = 0; // alto que ya ha salido de la ranura
    var t = 0;
    var frames = [{ t: 0, y: y }];
    while (y < H) {
      var stepPx = 6 + Math.random() * 4;
      y = Math.min(H, y + stepPx);
      t += 26 + Math.random() * 10;
      frames.push({ t: t, y: y });
      t += Math.random() < 0.12 ? 120 + Math.random() * 120 : 22 + Math.random() * 18;
      frames.push({ t: t, y: y });
    }
    fig.classList.add('is-feeding');
    var feed = tk.animate(frames.map(function (f) {
      return { offset: f.t / t, transform: 'translateY(' + (H - f.y).toFixed(1) + 'px)' };
    }), { duration: t, easing: 'linear', fill: 'forwards' });
    feed.onfinish = function () {
      fig.classList.remove('is-feeding');
      fig.classList.add('is-printed');
      feed.cancel();
      // Corte: la cuchilla da un tirón hacia abajo y el papel, ya suelto, se balancea sobre la ranura
      setTimeout(function () {
        tk.animate([
          { transform: 'perspective(700px) translateY(0) rotateX(0deg)' },
          { transform: 'perspective(900px) translateY(1.5px) rotateX(0deg)', offset: 0.1 },
          { transform: 'perspective(900px) translateY(0) rotateX(3.5deg)', offset: 0.32 },
          { transform: 'perspective(900px) translateY(0) rotateX(-1.6deg)', offset: 0.58 },
          { transform: 'perspective(900px) translateY(0) rotateX(0.6deg)', offset: 0.8 },
          { transform: 'perspective(900px) translateY(0) rotateX(0deg)' },
        ], { duration: 1800, easing: 'cubic-bezier(0.37, 0, 0.25, 1)' });
        // Sello: cae cuando el papel ya está quieto y lo hunde un poco
        setTimeout(function () {
          fig.classList.add('is-stamped');
          setTimeout(function () {
            tk.animate([
              { transform: 'translateY(0) scale(1)' },
              { transform: 'translateY(1px) scale(0.998)', offset: 0.35 },
              { transform: 'translateY(0) scale(1)' },
            ], { duration: 380, easing: 'ease-out' });
          }, 240);
          if (done) setTimeout(done, 400);
        }, 1300);
      }, 260);
    };
  }
  // Cada ticket se imprime al verse (en escritorio, el segundo algo después; en móvil, cuando se llega a él)
  if (ends) {
    ends.classList.add('is-in');
    var lastStart = 0;
    Array.prototype.forEach.call(ends.querySelectorAll('.lz-end'), function (fig) {
      onSeen(fig.querySelector('.lz-tk-slot'), function () {
        var wait = Math.max(0, lastStart + 900 - Date.now());
        lastStart = Date.now() + wait;
        setTimeout(function () { printTicket(fig); }, wait);
      }, 0.9);
    });
  }

  /* ── Para quién: «Te sirve si…» aparece y marca sus casillas al verse ── */
  var fitEl = document.querySelector('.lz-fit');
  onSeen(fitEl, function () { fitEl.classList.add('is-in'); }, 0.6);

  /* ── Para quién: fotos tramadas ── */
  var draw = function () {
    if (!window.TukoLzDither) return;
    Array.prototype.forEach.call(document.querySelectorAll('.lz-use-art'), function (c) {
      window.TukoLzDither.render(c, c.getAttribute('data-art'));
    });
  };
  if (window.TukoLzDither) draw(); else window.addEventListener('load', draw);
})();
