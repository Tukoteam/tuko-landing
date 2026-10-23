/* Secciones rediseñadas de la home (ES y EN). Siempre animado, también con «menos movimiento». */
(function () {
  'use strict';

  /* 68 %: 100 puntos que se tiñen al ritmo del contador (lo anima home-ui-03.js) */
  document.querySelectorAll('.data-dots').forEach(function (grid) {
    var num = grid.parentNode && grid.parentNode.querySelector('.data-num');
    if (!num) return;
    var frag = document.createDocumentFragment();
    var dots = [];
    for (var i = 0; i < 100; i++) {
      var d = document.createElement('i');
      dots.push(d);
      frag.appendChild(d);
    }
    grid.appendChild(frag);

    var lit = 0;
    function sync() {
      var n = Math.max(0, Math.min(100, parseInt(num.textContent, 10) || 0));
      if (n === lit) return;
      var from = Math.min(n, lit);
      var to = Math.max(n, lit);
      for (var j = from; j < to; j++) dots[j].classList.toggle('on', j < n);
      lit = n;
    }
    new MutationObserver(sync).observe(num, { childList: true, characterData: true, subtree: true });
    sync();
  });

  /* Logos «Con el apoyo de»: cinta en bucle con inercia.
     Al hacer scroll acelera un momento; con el ratón encima frena suave (no se para en seco);
     el logo que pasa por el centro se enciende en color, y el que señalas muestra su nombre. */
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
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
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

  /* ── Problema: la sección avanza con el scroll ──
     El titular y el cierre se encienden palabra a palabra (--p), y las dos tarjetas llegan desde los lados
     mientras la luz pasa del rojo (camino caro) al verde (el que se multiplica) (--q). */
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
    var compare = data.querySelector('.data-compare');
    var howTitle = document.querySelector('.how-intro .s-title');
    /* Las traducciones (home-ui.js) reescriben estos textos al cargar o al cambiar de idioma: se vuelven a partir */
    [headline, foot, howTitle].forEach(function (el) {
      if (!el) return;
      split(el);
      new MutationObserver(function () {
        if (!el.querySelector('.w')) { split(el); update(); }
      }).observe(el, { childList: true });
    });
    /* Entre las dos tarjetas: una flecha que lleva del camino caro al que se multiplica */
    if (compare) {
      var bridge = document.createElement('span');
      bridge.className = 'data-bridge';
      bridge.setAttribute('aria-hidden', 'true');
      bridge.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12h13M13 6.5 18.5 12 13 17.5"/></svg>';
      compare.appendChild(bridge);
    }

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
      if (compare) compare.style.setProperty('--q', prog(compare, 1, 0.2).toFixed(3));
      /* En móvil van una debajo de otra: cada tarjeta entra por su lado cuando le toca (--ec) */
      if (compare) Array.prototype.forEach.call(compare.querySelectorAll('.data-card'), function (c) { c.style.setProperty('--ec', prog(c, 1, 0.62).toFixed(3)); });
    };
    var onScroll = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    /* Tarjetas: una luz sigue al ratón por dentro y por el borde */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      data.querySelectorAll('.data-card').forEach(function (card) {
        var rim = document.createElement('span');
        rim.className = 'data-rim';
        rim.setAttribute('aria-hidden', 'true');
        card.appendChild(rim);
        card.addEventListener('pointermove', function (e) {
          var r = card.getBoundingClientRect();
          card.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
          card.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
        }, { passive: true });
      });
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
      ['.hx', '#4257ff', '#14c492'],
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
