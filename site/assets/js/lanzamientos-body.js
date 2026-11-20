/**
 * Página Lanzamientos · cuerpo.
 * - Cómo funciona: los tres pasos se encienden por turno; el contador y la barra suben con las caras de quien se
 *   apunta (rápido al principio, más lento en medio y un empujón al final) y al llegar a 30 todo se pone verde.
 *   Se reproduce al verse por primera vez; «Repetir» lo repite.
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
  var flow = document.querySelector('.lz-flow');
  if (flow) {
    var fSteps = flow.querySelectorAll('.lz-flow-step');
    var fCount = flow.querySelector('.lz-flow-c');
    var fDays = flow.querySelector('.lz-flow-d');
    var fRun = flow.querySelector('.lz-flow-run');
    var fSlotBox = flow.querySelector('.lz-flow-slots');
    var fToast = flow.querySelector('.lz-flow-toast');
    var fReplay = flow.querySelector('.lz-replay');
    var fStepsBox = flow.querySelector('.lz-flow-steps');
    var fStage = flow.parentNode.classList.contains('lz-flow-stage') ? flow.parentNode : null;
    var fCur = -1;
    var TONES = 5;
    var RUN = 7600;   // lo que tardan en apuntarse los 30
    var FALL = 720;   // lo que tarda cada cara en caer a su hueco
    var WAVE = 24;    // retraso de la ola verde entre hueco y hueco (igual que en el CSS)
    var fRaf = 0;
    var fTimers = [];
    var fFlying = [];
    var fLanded = 0;

    // Los 30 huecos
    var sh = '';
    for (var s = 0; s < GOAL; s++) sh += '<i style="--i:' + s + '"></i>';
    fSlotBox.innerHTML = sh;
    var fSlots = fSlotBox.children;

    // Personas apuntadas según el avance (0…1): buen arranque, algo más de calma en medio y empujón final, sin
    // ráfagas (si entran demasiadas a la vez, las caras se amontonan en el aire). De ahí sale cuándo entra cada una.
    var joined = function (t) { return Math.round(GOAL * (0.3 * (1 - Math.pow(1 - t, 2)) + 0.7 * Math.pow(t, 1.45))); };
    var at = [];
    for (var k = 1; k <= GOAL; k++) { var tt = 0; while (joined(tt) < k && tt < 1) tt += 0.002; at.push(tt); }

    var later = function (fn, ms) { fTimers.push(setTimeout(fn, ms)); };
    var who = function (n) { return NAMES[(n * 7) % NAMES.length]; };
    var tr = function (x, y, sc) { return 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(-50%,-50%) scale(' + sc + ')'; };

    // Línea de tiempo de los pasos: va del icono 1 al 3; llega al 2 al abrirse y de ahí al 3 según se apuntan
    var rail = function () {
      if (fSteps.length < 3) return;
      var c = function (i) { return fSteps[i].offsetLeft + 19; };
      var a = c(0), b = c(1), e = c(2);
      var p = a;
      if (fCur >= 1) p = b + (e - b) * (fLanded / GOAL);
      if (fCur >= 2) p = e;
      fStepsBox.style.setProperty('--r0', a + 'px');
      fStepsBox.style.setProperty('--rw', (e - a) + 'px');
      fStepsBox.style.setProperty('--rf', Math.max(0, p - a).toFixed(1) + 'px');
    };
    var setStep = function (i0) {
      fCur = i0;
      Array.prototype.forEach.call(fSteps, function (st, i) {
        st.classList.toggle('is-on', i === i0);
        st.classList.toggle('is-past', i < i0);
      });
      rail();
    };

    // Llega al hueco: se enciende con su color, sube el contador y crece el brillo
    var land = function (n) {
      var sl = fSlots[n - 1];
      sl.className = 't' + (n % TONES) + ' is-in';
      fLanded = Math.max(fLanded, n);
      fCount.textContent = fLanded;
      flow.style.setProperty('--j', (fLanded / GOAL).toFixed(3));
      rail();
      if (fLanded === GOAL) finish();
    };

    // Cae: aparece encima, un poco a la izquierda, y cae con gravedad hasta su hueco, donde se encoge
    var drop = function (n) {
      var rr = fRun.getBoundingClientRect();
      var sr = fSlots[n - 1].getBoundingClientRect();
      var x = sr.left - rr.left + sr.width / 2;
      var y = sr.top - rr.top + sr.height / 2;
      var y0 = y - 40;
      var f = document.createElement('i');
      f.className = 'lz-flow-drop t' + (n % TONES);
      f.textContent = who(n).charAt(0);
      fRun.appendChild(f);
      fFlying.push(f);

      // Globito al lado de la cara (a la derecha; si no cabe, a la izquierda)
      fToast.textContent = who(n) + (EN ? ' joined' : ' se ha unido');
      var tw = fToast.offsetWidth;
      var lx = x + 22;
      if (lx + tw > fRun.clientWidth) lx = x - 22 - tw;
      fToast.style.left = Math.max(0, lx).toFixed(1) + 'px';
      fToast.style.top = (y0 - 13).toFixed(1) + 'px';
      fToast.classList.remove('is-in');
      void fToast.offsetWidth;
      fToast.classList.add('is-in');

      if (!f.animate) { f.remove(); land(n); return; }
      var a = f.animate([
        { transform: tr(x - 14, y0 + 6, 0.5), opacity: 0, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' },
        { transform: tr(x - 8, y0, 1), opacity: 1, offset: 0.26, easing: 'cubic-bezier(0.55, 0, 0.9, 0.5)' },
        { transform: tr(x, y, 0.36), opacity: 1, offset: 0.88 },
        { transform: tr(x, y, 0.2), opacity: 0 }
      ], { duration: FALL, fill: 'forwards' });
      a.onfinish = function () {
        f.remove();
        var i = fFlying.indexOf(f);
        if (i > -1) fFlying.splice(i, 1);
        land(n);
      };
    };

    // Los 30: un instante para ver el último hueco con su color, ola verde hasta la meta (✓) y cae el sello
    var finish = function () {
      cancelAnimationFrame(fRaf);
      fDays.textContent = DAYS - Math.floor(DONE_DAY);
      later(function () { flow.classList.add('is-wave'); }, 420);
      later(function () {
        setStep(2);
        flow.classList.add('is-done');
      }, 420 + GOAL * WAVE + 250);
      // Tras el sello, la tarjeta imprime el ticket por debajo
      later(function () { if (fStage) fStage.classList.add('is-printed'); }, 420 + GOAL * WAVE + 1050);
      later(function () { fReplay.hidden = false; }, 420 + GOAL * WAVE + 2400);
    };

    var reset = function () {
      cancelAnimationFrame(fRaf);
      fTimers.forEach(clearTimeout);
      fTimers = [];
      fFlying.forEach(function (f) { f.getAnimations && f.getAnimations().forEach(function (an) { an.cancel(); }); f.remove(); });
      fFlying = [];
      fLanded = 0;
      Array.prototype.forEach.call(fSlots, function (sl) { sl.className = ''; });
      flow.classList.remove('is-wave', 'is-done');
      if (fStage) fStage.classList.remove('is-printed');
      fToast.classList.remove('is-in');
      fCount.textContent = 0;
      fDays.textContent = DAYS;
      flow.style.setProperty('--j', 0);
      setStep(-1);
      fReplay.hidden = true;
    };

    var play = function () {
      reset();
      setStep(0);
      later(function () {
        setStep(1);
        var t0 = performance.now();
        var next = 0;
        var frame = function (now) {
          var t = Math.min(1, (now - t0) / RUN);
          while (next < GOAL && at[next] <= t) { next++; drop(next); }
          if (fLanded < GOAL) fDays.textContent = Math.max(0, DAYS - Math.floor(DONE_DAY * t));
          if (next < GOAL) fRaf = requestAnimationFrame(frame);
        };
        fRaf = requestAnimationFrame(frame);
      }, 1300);
    };

    fReplay.addEventListener('click', play);
    if ('ResizeObserver' in window) new ResizeObserver(rail).observe(fStepsBox); else window.addEventListener('resize', rail);
    reset();
    onSeen(flow.querySelector('.lz-flow-meter'), play, 0.6);
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
