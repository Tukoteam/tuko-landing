/* Secciones rediseñadas de la home (ES y EN). Siempre animado, también con «menos movimiento». */
(function () {
  'use strict';

  /* Logos «Con el apoyo de»: cinta en bucle con inercia.
     Al hacer scroll acelera un momento; con el ratón encima frena suave (no se para en seco);
     el logo que pasa por el centro se enciende en color, y el que señalas muestra su nombre. */
  /* En claro, el fondo oscuro de la tira de logos lo pone la cabecera (un fondo que baja por detrás de la tira):
     así el brillo del móvil se difumina encima en vez de cortarse. Aquí se mide cuánto tiene que bajar */
  (function () {
    var hero = document.getElementById('inicio'), strip = document.querySelector('.logos-section');
    if (!hero || !strip) return;
    var size = function () { hero.style.setProperty('--logos-h', strip.offsetHeight + 'px'); };
    size();
    window.addEventListener('resize', size);
    window.addEventListener('load', size);
  })();

  document.querySelectorAll('.logos-overflow').forEach(function (box) {
    var track = box.querySelector('.logos-track');
    var pills = Array.prototype.slice.call(box.querySelectorAll('.logo-pill'));
    if (!track || !pills.length) return;
    track.classList.add('is-js');

    /* En oscuro, cada logo usa su versión blanca con fondo transparente (assets/logos-colaboradores/dark/): todos con el mismo blanco */
    var imgs = Array.prototype.slice.call(track.querySelectorAll('img'));
    function darkSrc(src) {
      return src.replace(/logos-colaboradores\/([\w-]+)\.(png|svg)$/, function (m, name, ext) {
        return 'logos-colaboradores/dark/' + (ext === 'svg' ? name.replace('-color', '') : name) + '-white.' + ext;
      });
    }
    function syncLogos() {
      /* La tira de logos va siempre sobre el escenario oscuro de la cabecera: siempre las versiones blancas */
      var dark = true;
      imgs.forEach(function (img) {
        if (!img.dataset.light) img.dataset.light = img.getAttribute('src');
        var want = dark ? darkSrc(img.dataset.light) : img.dataset.light;
        if (img.getAttribute('src') !== want) img.setAttribute('src', want);
      });
    }
    new MutationObserver(syncLogos).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    syncLogos();

    var tip = document.createElement('span');
    tip.className = 'logos-tip';
    tip.setAttribute('aria-hidden', 'true');
    box.parentNode.appendChild(tip);

    var BASE = 38;           // px por segundo
    var x = 0, speed = BASE, boost = 0, hover = false, hovered = null;
    var half = 0, last = 0, raf = 0, visible = false, lastY = window.scrollY;
    var focus = pills.map(function () { return -1; });

    function measure() { half = track.scrollWidth / 2; }
    function frame(now) {
      var dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      var target = (hover ? BASE * 0.18 : BASE) + boost;
      speed += (target - speed) * Math.min(1, dt * (hover ? 5 : 3));
      boost *= Math.pow(0.04, dt);
      x -= speed * dt;
      if (half && -x >= half) x += half;
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';

      /* Foco en el centro: 1 justo en medio, 0 a partir de un 22 % del ancho */
      var b = box.getBoundingClientRect();
      var mid = b.left + b.width / 2;
      var reach = b.width * 0.22;
      for (var i = 0; i < pills.length; i++) {
        var r = pills[i].getBoundingClientRect();
        var d = Math.abs(r.left + r.width / 2 - mid);
        var f = d >= reach ? 0 : Math.round((1 - d / reach) * 20) / 20;
        if (f !== focus[i]) { focus[i] = f; pills[i].style.setProperty('--f', f); }
      }
      if (hovered) {
        var hr = hovered.getBoundingClientRect();
        var pr = box.parentNode.getBoundingClientRect();
        tip.style.transform = 'translate3d(' + (hr.left + hr.width / 2 - pr.left).toFixed(1) + 'px,' + (hr.bottom - pr.top).toFixed(1) + 'px,0)';
      }
      raf = visible ? requestAnimationFrame(frame) : 0;
    }
    function start() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }

    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      /* El scroll solo le da un empujón suave: como mucho unas 3 veces su velocidad normal */
      boost = Math.min(boost + Math.abs(y - lastY) * 0.35, 80);
      lastY = y;
    }, { passive: true });
    window.addEventListener('resize', measure);
    pills.forEach(function (p) {
      var img = p.querySelector('img');
      if (img && !img.complete) img.addEventListener('load', measure);
    });
    measure();

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      box.addEventListener('pointerenter', function () { hover = true; });
      box.addEventListener('pointerleave', function () { hover = false; hovered = null; tip.classList.remove('is-on'); });
      pills.forEach(function (p) {
        p.addEventListener('pointerenter', function () {
          var img = p.querySelector('img');
          hovered = p;
          tip.textContent = img ? img.alt : '';
          tip.classList.add('is-on');
        });
      });
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        visible = e[0].isIntersecting;
        if (visible) start();
      }).observe(box);
    } else {
      visible = true;
      start();
    }
  });

  /* ── Problema: el titular y el cierre se encienden palabra a palabra con el scroll (--p) ── */
  var data = document.getElementById('problema');
  if (data) {
    /* Cada palabra en su <span class="w">, sin tocar los <span>/<b> que ya trae el texto */
    var split = function (root) {
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
      })(root);
      root.style.setProperty('--n', n);
      root.classList.add('data-split');
    };
    var headline = data.querySelector('.data-headline');
    var foot = data.querySelector('.data-foot');
    var howTitle = document.querySelector('.how-intro .s-title');
    /* Las traducciones (home-ui.js) reescriben estos textos al cargar o al cambiar de idioma: se vuelven a partir */
    [headline, foot, howTitle].forEach(function (el) {
      if (!el) return;
      split(el);
      new MutationObserver(function () {
        if (!el.querySelector('.w')) { split(el); update(); }
      }).observe(el, { childList: true });
    });
    /* Progreso 0…1 mientras el borde superior va de «from» a «to» (fracciones de la altura de la ventana) */
    var prog = function (el, from, to) {
      var vh = window.innerHeight;
      var top = el.getBoundingClientRect().top;
      return Math.max(0, Math.min(1, (vh * from - top) / (vh * (from - to))));
    };
    var ticking = false;
    var update = function () {
      ticking = false;
      if (headline) headline.style.setProperty('--p', prog(headline, 0.9, 0.38).toFixed(3));
      if (foot) foot.style.setProperty('--p', prog(foot, 0.94, 0.6).toFixed(3));
      if (howTitle) howTitle.style.setProperty('--p', prog(howTitle, 0.92, 0.5).toFixed(3));
    };
    var onScroll = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    var dx = data.querySelector('.dx');
    if (dx) dxScene(dx);
  }

  /* ── «El mismo descuento, dos resultados» ──
     100 puntos: en el camino caro, una cuadrícula donde 68 se tiñen de rojo al ritmo del contador (home-ui-03.js);
     en el que se multiplica, esos mismos puntos vuelan a un árbol 1 → 2 → 4 → 8 (15 nodos y el resto, en las ramas).
     Al entrar en pantalla, espera un momento y pasa sola al camino que se multiplica (una vez; si tocas, manda el usuario). */
  function dxScene(dx) {
    var SVG = 'http://www.w3.org/2000/svg';
    var AUTO = 4200;
    var svg = dx.querySelector('.dx-svg');
    var tabs = Array.prototype.slice.call(dx.querySelectorAll('.dx-tab'));
    var sw = dx.querySelector('.dx-switch');
    var num = dx.querySelector('.data-num');
    var panels = { bad: dx.querySelector('.dx-panel--bad'), good: dx.querySelector('.dx-panel--good') };
    if (!svg || !sw || tabs.length < 2) return;
    var el = function (tag, attrs) {
      var n = document.createElementNS(SVG, tag);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      return n;
    };

    /* El árbol: nodos por generación y sus ramas (curvas entre padre e hijo) */
    var X = [44, 150, 256, 356];
    var leaves = [20, 57, 94, 131, 169, 206, 243, 280];
    var levels = [leaves];
    while (levels[0].length > 1) {
      var up = [];
      for (var p = 0; p < levels[0].length; p += 2) up.push((levels[0][p] + levels[0][p + 1]) / 2);
      levels.unshift(up);
    }
    var SIZE = [10, 8, 7, 6];
    var targets = [];
    var links = [];
    levels.forEach(function (ys, lv) {
      ys.forEach(function (y, i) {
        targets.push({ x: X[lv], y: y, s: SIZE[lv], o: 1, lv: lv, node: true });
        if (lv) links.push({ lv: lv - 1, a: [X[lv - 1], levels[lv - 1][i >> 1]], b: [X[lv], y] });
      });
    });
    /* Los otros 85 puntos, repartidos por las ramas como un trazo punteado */
    var per = [8, 7, 5];
    links.forEach(function (l, li) {
      var n = per[l.lv] + (li === 0 ? 1 : 0);
      var mx = (l.a[0] + l.b[0]) / 2;
      for (var k = 1; k <= n; k++) {
        var t = k / (n + 1), u = 1 - t;
        targets.push({
          x: u * u * u * l.a[0] + 3 * u * u * t * mx + 3 * u * t * t * mx + t * t * t * l.b[0],
          y: u * u * u * l.a[1] + 3 * u * u * t * l.a[1] + 3 * u * t * t * l.b[1] + t * t * t * l.b[1],
          s: 2.1, o: 0.6, lv: l.lv, node: false
        });
      }
      svg.querySelector('.dx-links').appendChild(el('path', {
        class: 'dx-link', pathLength: 1, style: '--lv:' + l.lv,
        d: 'M' + l.a[0] + ' ' + l.a[1] + 'C' + mx + ' ' + l.a[1] + ' ' + mx + ' ' + l.b[1] + ' ' + l.b[0] + ' ' + l.b[1]
      }));
    });
    targets.forEach(function (t) {
      if (!t.node) return;
      svg.querySelector('.dx-halos').appendChild(el('circle', {
        class: 'dx-halo' + (t.lv ? '' : ' is-root'), cx: t.x, cy: t.y, r: t.s, style: '--lv:' + t.lv
      }));
    });

    /* Cada punto de la cuadrícula va al destino que le toca por posición: de izquierda a derecha, sin cruzarse */
    var byPos = function (a, b) { return a.x - b.x || a.y - b.y; };
    targets.sort(byPos);
    var grid = [];
    for (var i = 0; i < 100; i++) grid.push({ i: i, x: 92 + (i % 10) * 24, y: 42 + Math.floor(i / 10) * 24 });
    var order = grid.slice().sort(byPos);
    var dots = [];
    var frag = document.createDocumentFragment();
    order.forEach(function (g, k) {
      var t = targets[k];
      var c = el('circle', { class: 'dx-dot' + (t.node && !t.lv ? ' is-root' : ''), r: 1 });
      var delay = Math.round((t.x - 44) / 312 * 520 + ((g.i * 37) % 9) * 10);
      c.setAttribute('style', '--gx:' + g.x + ';--gy:' + g.y + ';--tx:' + t.x.toFixed(1) + ';--ty:' + t.y.toFixed(1) +
        ';--ts:' + t.s + ';--to:' + t.o + ';--dl:' + delay + 'ms');
      dots[g.i] = c;
      frag.appendChild(c);
    });
    svg.querySelector('.dx-dots').appendChild(frag);

    /* 68 %: se tiñen tantos puntos como marque el contador, en orden de lectura */
    var lit = 0;
    var sync = function () {
      var n = num ? Math.max(0, Math.min(100, parseInt(num.textContent, 10) || 0)) : 68;
      if (n === lit) return;
      for (var j = Math.min(n, lit); j < Math.max(n, lit); j++) dots[j].classList.toggle('on', j < n);
      lit = n;
    };
    if (num) new MutationObserver(sync).observe(num, { childList: true, characterData: true, subtree: true });
    sync();

    /* Interruptor: la pastilla se coloca bajo la pestaña activa.
       En móvil, además, la caja del texto toma el alto del camino activo (--ph) */
    var box = dx.querySelector('.dx-panels');
    var narrow = window.matchMedia('(max-width: 860px)');
    var place = function () {
      var on = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
      sw.style.setProperty('--tl', on.offsetLeft + 'px');
      sw.style.setProperty('--tw', on.offsetWidth + 'px');
      var active = panels[dx.getAttribute('data-mode')];
      if (!box || !active) return;
      if (!narrow.matches) { box.style.removeProperty('--ph'); return; }
      var cs = getComputedStyle(box);
      box.style.setProperty('--ph', active.offsetHeight + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + 'px');
    };
    var touched = false, timer = 0;
    var stopAuto = function () {
      clearTimeout(timer);
      timer = 0;
      dx.classList.remove('is-auto');
    };
    var setMode = function (mode, byUser) {
      if (byUser) { touched = true; stopAuto(); }
      dx.setAttribute('data-mode', mode);
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-mode') === mode;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      for (var m in panels) if (panels[m]) panels[m].inert = m !== mode;
      place();
    };
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { setMode(t.getAttribute('data-mode'), true); });
      t.addEventListener('keydown', function (e) {
        var to = { ArrowRight: k + 1, ArrowLeft: k - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (to === undefined) return;
        e.preventDefault();
        var next = tabs[(to + tabs.length) % tabs.length];
        setMode(next.getAttribute('data-mode'), true);
        next.focus();
      });
    });
    place();
    window.addEventListener('resize', place);
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(place);
      ro.observe(sw);
      for (var pm in panels) if (panels[pm]) ro.observe(panels[pm]);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);

    /* Paso automático al camino que se multiplica: la línea bajo su pestaña marca cuánto falta */
    if ('IntersectionObserver' in window) {
      dx.style.setProperty('--auto', AUTO + 'ms');
      new IntersectionObserver(function (e) {
        if (touched || dx.getAttribute('data-mode') !== 'bad') return;
        if (e[0].isIntersecting && !timer) {
          requestAnimationFrame(function () { dx.classList.add('is-auto'); });
          timer = setTimeout(function () { stopAuto(); setMode('good'); }, AUTO);
        } else if (!e[0].isIntersecting) stopAuto();
      }, { threshold: 0.5 }).observe(dx);
    }

    /* Con el ratón, una luz sigue al cursor por el escenario */
    var viz = dx.querySelector('.dx-viz');
    if (viz && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      viz.addEventListener('pointermove', function (e) {
        var r = viz.getBoundingClientRect();
        viz.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
        viz.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
      }, { passive: true });
    }
  }

  /* ── ¿Y si nadie más entra?: el reloj cuenta de 24:00:00 a 00:00:00 (el anillo se vacía) ──
     Al llegar a cero, .is-zero dispara en CSS la luz por las líneas, la retícula y los resultados. */
  var re = document.querySelector('.re');
  var reClock = re && re.querySelector('.re-clock');
  if (reClock) {
    var reTime = re.querySelector('.re-time');
    var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
    var reCount = function () {
      var t0 = 0, DUR = 1000, TOTAL = 24 * 3600;
      var step = function (now) {
        if (!t0) t0 = now;
        var k = Math.min(1, (now - t0) / DUR);
        var left = Math.round(TOTAL * Math.pow(1 - k, 2.2));
        if (reTime) reTime.textContent = pad2(Math.floor(left / 3600)) + ':' + pad2(Math.floor(left % 3600 / 60)) + ':' + pad2(left % 60);
        reClock.style.setProperty('--re-left', (left / TOTAL).toFixed(4));
        if (k < 1) requestAnimationFrame(step);
        else re.classList.add('is-zero');
      };
      requestAnimationFrame(step);
    };
    /* En móvil la línea baja por las opciones y termina justo en la marca de la última (--re-end) */
    var reCols = re.querySelector('.re-cols');
    var reEnd = function () {
      var last = reCols && reCols.lastElementChild;
      if (!last) return;
      var end = last.offsetTop + 31;
      reCols.style.setProperty('--re-end', end + 'px');
      /* Cada opción se enciende cuando la cabeza de la luz (lineal, 120 ms + 1900 ms) pasa por su marca */
      Array.prototype.forEach.call(reCols.children, function (c) {
        c.style.setProperty('--rd', Math.round(120 + 1900 * (c.offsetTop + 31) / end) + 'ms');
      });
    };
    reEnd();
    window.addEventListener('resize', reEnd);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(reEnd);
    if ('IntersectionObserver' in window) {
      var reIo = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { reIo.disconnect(); setTimeout(reCount, 200); }
      }, { threshold: 0.35 });
      reIo.observe(re.querySelector('.re-fork'));
    } else {
      re.classList.add('is-zero');
    }
  }

  /* ── Luz ambiental: dos luces difusas fijas detrás de la lectura que acompañan el scroll ──
     Toman el color de la sección que ocupa el centro de la pantalla; en el hero no se ven (ya tiene su aurora). */
  var hero = document.getElementById('inicio');
  if (hero) {
    var SECTIONS = [
      ['.logos-section', '#4257ff', '#14c492'],
      ['#problema', '#e54848', '#14c492'],
      ['#como-funciona', '#4257ff', '#8b5cf6'],
      ['.cs', '#4257ff', '#14c492'],
      ['#si-no-se-llena', '#14c492', '#38bdf8'],
      ['#beneficios', '#14c492', '#4257ff'],
      ['#sin-requisitos', '#38bdf8', '#4257ff'],
      ['#piloto', '#8b5cf6', '#4257ff'],
      ['#precios', '#4257ff', '#14c492'],
      ['#faq', '#38bdf8', '#8b5cf6'],
      ['#solicitud', '#4257ff', '#14c492']
    ].map(function (s) { return { el: document.querySelector(s[0]), a: s[1], b: s[2] }; })
      .filter(function (s) { return s.el; });

    var amb = document.createElement('div');
    amb.className = 'amb';
    amb.setAttribute('aria-hidden', 'true');
    amb.innerHTML = '<i></i><i></i>';
    document.body.appendChild(amb);
    var lights = amb.children;
    var current = null;
    var queued = false;

    var paint = function () {
      queued = false;
      var vh = window.innerHeight;
      /* Aparece cuando el hero se va: 0 con el hero entero en pantalla, 1 cuando solo queda un 25 % */
      var hb = hero.getBoundingClientRect().bottom;
      amb.style.opacity = Math.max(0, Math.min(1, (vh - hb) / (vh * 0.75))).toFixed(3);

      var pick = null;
      for (var i = 0; i < SECTIONS.length; i++) {
        var r = SECTIONS[i].el.getBoundingClientRect();
        if (r.top <= vh * 0.5 && r.bottom > vh * 0.5) { pick = SECTIONS[i]; break; }
      }
      if (pick && pick !== current) {
        current = pick;
        amb.style.setProperty('--amb-a', pick.a);
        amb.style.setProperty('--amb-b', pick.b);
      }
      /* Deriva lenta: las luces se cruzan de lado a lado mientras bajas */
      var t = window.scrollY / 1600;
      lights[0].style.transform = 'translate3d(' + (Math.sin(t) * 14).toFixed(2) + 'vw,' + (Math.cos(t * 0.8) * 10).toFixed(2) + 'vh,0)';
      lights[1].style.transform = 'translate3d(' + (Math.sin(t + 2.4) * -14).toFixed(2) + 'vw,' + (Math.cos(t * 0.8 + 1.6) * 12).toFixed(2) + 'vh,0)';
    };
    var queue = function () { if (!queued) { queued = true; requestAnimationFrame(paint); } };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    paint();
  }
})();
