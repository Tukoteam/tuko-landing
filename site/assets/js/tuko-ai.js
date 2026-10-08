(function(){try{var t=localStorage.getItem("tuko_theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();

/* Entrada del hero: mismo fade-up que el home */
  setTimeout(function () {
    document.querySelectorAll('.ia-hero .fade-up').forEach(function (el) {
      el.classList.add('visible');
    });
  }, 80);

  /* Timeline zigzag: approach suave con lerp (sin tirones) */
  (function initIaFlowScroll() {
    var board = document.querySelector('.ia-flow-board');
    var flow = document.querySelector('.ia-flow');
    var steps = Array.prototype.slice.call(document.querySelectorAll('.ia-flow-step'));
    var soon = document.querySelector('.ia-soon');
    var spine = document.querySelector('.ia-flow-spine');
    var spineFill = document.querySelector('.ia-flow-spine i');
    if (!steps.length) return;

    document.documentElement.classList.add('ia-force-flow-motion');

    var cards = steps.map(function (step) { return step.querySelector('.ia-flow-card'); });
    var markers = steps.map(function (step) { return step.querySelector('.ia-flow-marker'); });
    var current = cards.map(function () { return 0; });
    var target = cards.map(function () { return 0; });
    var soonCurrent = 0;
    var soonTarget = 0;
    var spineCurrent = 0;
    var marked = [];
    var running = false;
    var isMobile = false;
    var LERP = 0.12;
    var SPINE_LERP = 0.075;
    var EPS = 0.0015;

    function refreshMobile() {
      isMobile = window.matchMedia('(max-width: 960px)').matches;
    }

    /* Línea solo entre el centro de 01 y el centro de 03 */
    function layoutSpine() {
      if (!spine || !flow || !markers[0] || !markers[markers.length - 1]) return;
      var flowRect = flow.getBoundingClientRect();
      var first = markers[0].getBoundingClientRect();
      var last = markers[markers.length - 1].getBoundingClientRect();
      var top = first.top + first.height / 2 - flowRect.top;
      var bottom = last.top + last.height / 2 - flowRect.top;
      var height = Math.max(0, bottom - top);
      spine.style.top = top.toFixed(2) + 'px';
      spine.style.height = height.toFixed(2) + 'px';
      spine.style.bottom = 'auto';
    }

    function readTarget(el) {
      var rect = el.getBoundingClientRect();
      var vh = window.innerHeight || 1;
      var start = vh * 1.02;
      var end = vh * 0.32;
      var raw = (start - rect.top) / (start - end);
      if (raw < 0) return 0;
      if (raw > 1) return 1;
      return raw;
    }

    /* Progreso de la línea según scroll real entre centros 01→02→03 */
    function readSpineProgress() {
      if (!markers.length) return 0;
      var n = markers.length;
      var vh = window.innerHeight || 1;
      var probe = vh * 0.38;
      var ys = [];
      for (var i = 0; i < n; i++) {
        if (!markers[i]) return 0;
        var r = markers[i].getBoundingClientRect();
        ys.push(r.top + r.height * 0.5);
      }
      if (probe <= ys[0]) return 0;
      if (probe >= ys[n - 1]) return 1;
      for (var j = 0; j < n - 1; j++) {
        if (probe <= ys[j + 1]) {
          var span = Math.max(1, ys[j + 1] - ys[j]);
          var t = (probe - ys[j]) / span;
          if (t < 0) t = 0;
          if (t > 1) t = 1;
          return (j + t) / (n - 1);
        }
      }
      return 1;
    }

    function applyCard(card, p, dir, step) {
      var x = dir * (1 - p) * 40;
      var y = (1 - p) * 36;
      var s = 0.88 + p * 0.12;
      /* En dark el suelo de opacidad sube: si no, las cards casi desaparecen */
      var oMin = document.documentElement.getAttribute('data-theme') === 'dark' ? 0.52 : 0.2;
      var o = oMin + p * (1 - oMin);
      card.style.opacity = o.toFixed(3);
      card.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + s.toFixed(4) + ')';
      card.style.setProperty('--approach', p.toFixed(4));
      if (step) step.style.setProperty('--approach', p.toFixed(4));
    }

    function sampleTargets() {
      steps.forEach(function (step, i) {
        target[i] = readTarget(step);
      });
      soonTarget = soon ? readTarget(soon) : 0;
    }

    function tick() {
      sampleTargets();
      var dirty = false;
      var n = cards.length;

      for (var i = 0; i < n; i++) {
        var card = cards[i];
        if (!card) continue;
        var next = current[i] + (target[i] - current[i]) * LERP;
        if (Math.abs(target[i] - next) < EPS) next = target[i];
        if (Math.abs(next - current[i]) > EPS) dirty = true;
        current[i] = next;
        var dir = isMobile ? 0 : (i % 2 === 0 ? -1 : 1);
        applyCard(card, next, dir, steps[i]);
        if (next > 0.55 && !marked[i]) {
          marked[i] = true;
          steps[i].classList.add('is-in');
        }
      }

      var spineTarget = readSpineProgress();
      spineCurrent += (spineTarget - spineCurrent) * SPINE_LERP;
      if (Math.abs(spineTarget - spineCurrent) > EPS) dirty = true;
      else spineCurrent = spineTarget;
      if (spineFill) spineFill.style.transform = 'scaleY(' + spineCurrent.toFixed(4) + ')';
      if (board) {
        var has = spineCurrent > 0.01 || (current[0] || 0) > 0.5;
        if (board.classList.contains('has-progress') !== has) {
          board.classList.toggle('has-progress', has);
        }
      }

      /* Activo solo cuando la línea / el probe llega a ese número */
      var vh = window.innerHeight || 1;
      var probeY = vh * 0.38;
      for (var m = 0; m < n; m++) {
        var nodePos = n <= 1 ? 0 : m / (n - 1);
        var on;
        if (m === 0) {
          var m0 = markers[0] ? markers[0].getBoundingClientRect() : null;
          var y0 = m0 ? m0.top + m0.height * 0.5 : Infinity;
          on = probeY >= y0 - 6 || spineCurrent > 0.01;
        } else {
          on = spineCurrent >= nodePos - 0.018;
        }
        var wasOn = steps[m].classList.contains('is-active');
        if (wasOn !== on) {
          steps[m].classList.toggle('is-active', on);
          if (on && markers[m]) {
            var span = markers[m].querySelector('span');
            var ring = markers[m].querySelector('.ia-flow-marker-ring');
            var cardEl = cards[m];
            if (span) {
              span.classList.remove('is-pop');
              void span.offsetWidth;
              span.classList.add('is-pop');
            }
            if (ring) {
              ring.classList.remove('is-pop-ring');
              void ring.offsetWidth;
              ring.classList.add('is-pop-ring');
            }
            if (cardEl) {
              cardEl.classList.remove('is-glow');
              void cardEl.offsetWidth;
              cardEl.classList.add('is-glow');
            }
          }
        }
      }

      if (soon) {
        soonCurrent += (soonTarget - soonCurrent) * LERP;
        if (Math.abs(soonTarget - soonCurrent) > EPS) dirty = true;
        else soonCurrent = soonTarget;
        var sp = soonCurrent;
        soon.style.opacity = Math.min(1, sp * 1.25).toFixed(3);
        soon.style.transform = 'translate3d(0,' + ((1 - sp) * 16).toFixed(2) + 'px,0) scale(' + (0.98 + sp * 0.02).toFixed(4) + ')';
        if (sp > 0.5) soon.classList.add('is-in');
      }

      if (dirty) {
        requestAnimationFrame(tick);
      } else {
        running = false;
      }
    }

    function kick() {
      if (running) return;
      running = true;
      requestAnimationFrame(tick);
    }

    refreshMobile();
    layoutSpine();
    sampleTargets();
    kick();
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', function () {
      refreshMobile();
      layoutSpine();
      kick();
    }, { passive: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { layoutSpine(); });
    }
  })();

  /* Hero CTA → baja fluido al formulario de lista de espera */
  (function () {
    var animFrame = 0;

    function stopAnim() {
      if (animFrame) cancelAnimationFrame(animFrame);
      animFrame = 0;
    }

    function headerOffset() {
      var nav = document.querySelector('nav');
      return Math.ceil((nav ? nav.getBoundingClientRect().height : 64) + 12);
    }

    function animateScrollTo(targetY) {
      stopAnim();
      var startY = window.scrollY;
      var dist = targetY - startY;
      if (Math.abs(dist) < 2) {
        window.scrollTo(0, targetY);
        return;
      }
      var ms = Math.min(900, Math.max(420, Math.abs(dist) * 0.45));
      var t0 = performance.now();
      var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
      var onUser = function () { stopAnim(); };
      window.addEventListener('wheel', onUser, { passive: true, once: true });
      window.addEventListener('touchstart', onUser, { passive: true, once: true });

      function step(now) {
        var t = Math.min(1, (now - t0) / ms);
        window.scrollTo(0, startY + dist * ease(t));
        if (t < 1) animFrame = requestAnimationFrame(step);
        else animFrame = 0;
      }
      animFrame = requestAnimationFrame(step);
    }

    function goToWaitlist(e) {
      if (e) e.preventDefault();
      var cta = document.getElementById('cta');
      var ctaEmail = document.getElementById('cta-web');
      if (!cta) return;
      var top = Math.max(0, window.scrollY + cta.getBoundingClientRect().top - headerOffset());
      var ms = Math.min(900, Math.max(420, Math.abs(top - window.scrollY) * 0.45));
      animateScrollTo(top);
      history.pushState(null, '', '#cta');
      setTimeout(function () {
        if (ctaEmail) ctaEmail.focus({ preventScroll: true });
      }, ms + 40);
    }

    document.getElementById('ia-hero-cta')?.addEventListener('click', goToWaitlist);
  })();

  /* Ciclo Analizando → checks → Propuesta lista */
  (function initIaPanelCycle() {
    var panel = document.getElementById('ia-panel');
    var liveTxt = document.getElementById('ia-panel-live-txt');
    var pctEl = document.getElementById('ia-panel-pct');
    var barEl = document.getElementById('ia-panel-bar');
    if (!panel) return;
    var rows = Array.prototype.slice.call(panel.querySelectorAll('.ia-sig-row'));
    /* Velocidad del ciclo: 0.4 = 40% del ritmo original (más lento) */
    var SPEED = 0.4;
    var STEP = Math.round(720 / SPEED);
    var START_DELAY = Math.round(380 / SPEED);
    /* Tras llegar al 100%: como máximo 1s y pasa a Listo (verde) */
    var READY_AFTER_100_MS = 1000;
    var timers = [];
    var rafId = null;
    var lastChecked = -1;
    var readyArmed = false;

    function tKey(key) {
      var lang = document.documentElement.lang || 'es';
      return (window.translations && translations[lang] && translations[lang][key]) || '';
    }

    function clearAll() {
      timers.forEach(clearTimeout);
      timers = [];
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    function setCheckedVisual(n) {
      if (n === lastChecked) return;
      lastChecked = n;
      rows.forEach(function (row, i) {
        row.classList.toggle('is-checked', i < n);
        row.classList.toggle('is-active', i === n && n < rows.length);
      });
    }

    function paintPct(pct) {
      var p = Math.max(0, Math.min(100, pct));
      if (barEl) barEl.style.width = p.toFixed(2) + '%';
      if (pctEl) pctEl.textContent = String(Math.round(p));
    }

    function setReady(ready) {
      panel.classList.toggle('is-ready', ready);
      if (ready) animateProposalMetrics();
      if (!liveTxt) return;
      liveTxt.textContent = ready
        ? (tKey('ia_panel_ready') || 'Listo')
        : (tKey('ia_panel_analyzing') || 'Analizando tu tienda…');
      liveTxt.setAttribute('data-i18n', ready ? 'ia_panel_ready' : 'ia_panel_analyzing');
    }

    function formatMetric(el, value) {
      var lang = document.documentElement.lang || 'es';
      var type = el.getAttribute('data-metric');
      if (type === 'price') {
        var n = value.toFixed(2);
        return lang === 'en' ? ('€' + n) : ('€' + n.replace('.', ','));
      }
      if (type === 'group') {
        return Math.round(value) + (lang === 'en' ? ' people' : ' pers.');
      }
      if (type === 'duration') return Math.round(value) + ' hrs';
      return String(Math.round(value));
    }

    function animateProposalMetrics() {
      var vals = panel.querySelectorAll('.ia-metric-val');
      var disc = panel.querySelector('.ia-discount-pct');
      var duration = Math.round(1100 / SPEED);

      function animateEl(el, to, formatter) {
        var t0 = performance.now();
        function ease(t) { return 1 - Math.pow(1 - t, 2.6); }
        function tick(now) {
          var p = Math.min(1, (now - t0) / duration);
          el.textContent = formatter(to * ease(p));
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = formatter(to);
        }
        requestAnimationFrame(tick);
      }

      vals.forEach(function (el) {
        var to = Number(el.getAttribute('data-target')) || 0;
        animateEl(el, to, function (v) { return formatMetric(el, v); });
      });
      if (disc) {
        var dTo = Number(disc.getAttribute('data-target')) || 15;
        animateEl(disc, dTo, function (v) { return Math.round(v) + '%'; });
      }
    }

    function run() {
      clearAll();
      lastChecked = -1;
      readyArmed = false;
      setReady(false);
      setCheckedVisual(0);
      paintPct(0);

      var analysisMs = START_DELAY + rows.length * STEP;
      var startAt = performance.now();

      function goReady() {
        if (readyArmed) return;
        readyArmed = true;
        paintPct(100);
        setCheckedVisual(rows.length);
        timers.push(setTimeout(function () {
          setReady(true);
          /* Una sola pasada: se queda en Listo, sin repetir ni empujar la página */
        }, READY_AFTER_100_MS));
      }

      function tick(now) {
        var elapsed = now - startAt;
        var t = Math.min(1, elapsed / analysisMs);
        /* ease-out suave: avanza continuo, sin saltos */
        var eased = 1 - Math.pow(1 - t, 2.2);
        var pct = eased * 100;
        paintPct(pct);

        var n = Math.min(rows.length, Math.floor((pct / 100) * rows.length + 0.001));
        if (t >= 1 || Math.round(pct) >= 100) n = rows.length;
        setCheckedVisual(n);

        /* En cuanto se ve 100%, espera ≤1s y efecto verde (no alargar con SPEED) */
        if (t >= 1 || Math.round(pct) >= 100) {
          goReady();
          return;
        }

        rafId = requestAnimationFrame(tick);
      }

      rafId = requestAnimationFrame(tick);
    }

    run();
  })();
