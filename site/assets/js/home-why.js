/* «Por qué funciona» en tres capítulos, armados con el scroll.
   - GSAP ScrollTrigger: cada capítulo recibe --k (0 → 1) con un scrub suavizado; el CSS dibuja con él la línea,
     enciende la frase palabra a palabra y trae el widget.
   - La luz del borde (--sp) enciende cada capítulo al pasar (.is-lit, --hit, --rl); al final gira por la línea
     de abajo y el marco late (.is-done).
   - El título de la sección se enciende palabra a palabra (--p).
   El scroll suave (Lenis) lo pone home-scroll.js. Los widgets y sus animaciones no se tocan. Siempre animado.
   Sin las librerías, todo queda visible. */
(function () {
  'use strict';

  var section = document.querySelector('.why--chapters');
  if (!section) return;
  var list = section.querySelector('.wc-list');
  var title = section.querySelector('.why-intro .s-title');
  var chapters = Array.prototype.slice.call(section.querySelectorAll('.wc'));

  /* Parte un elemento en palabras (.w con --i) y devuelve cuántas hay; la traducción puede reescribirlo, así que se vigila */
  var splitWords = function (el, start) {
    var n = start || 0;
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
          w.style.setProperty('--i', n);
          w.style.setProperty('--wi', n);
          n++;
          w.textContent = part;
          frag.appendChild(w);
        });
        node.replaceChild(frag, c);
      });
    })(el);
    return n;
  };
  var watch = function (el, fn) {
    new MutationObserver(function () { if (!el.querySelector('.w')) fn(); }).observe(el, { childList: true, subtree: true });
  };

  /* Título de la sección */
  var splitTitle = function () {
    title.style.setProperty('--n', splitWords(title));
    title.classList.add('data-split');
  };
  if (title) { splitTitle(); watch(title, function () { splitTitle(); update(); }); }

  /* Frase a dos tonos de cada capítulo: la cuenta sigue del título a la continuación */
  chapters.forEach(function (ch) {
    var line = ch.querySelector('.wc-line');
    var rule = document.createElement('i');
    rule.className = 'wc-rule';
    rule.setAttribute('aria-hidden', 'true');
    ch.insertBefore(rule, ch.firstChild);
    if (!line) return;
    var splitLine = function () {
      var n = 0;
      Array.prototype.slice.call(line.children).forEach(function (part) { n = splitWords(part, n); });
      line.style.setProperty('--wn', n);
    };
    splitLine();
    watch(line, splitLine);
  });

  /* Línea de abajo (la luz gira la esquina) y el latido del marco */
  var end = null;
  if (list) {
    end = document.createElement('i');
    end.className = 'wc-rule wc-end';
    end.setAttribute('aria-hidden', 'true');
    list.appendChild(end);
    var pulse = document.createElement('i');
    pulse.className = 'wc-pulse';
    pulse.setAttribute('aria-hidden', 'true');
    list.appendChild(pulse);
  }

  /* Título y borde del marco, ligados a la posición */
  var update = function () {
    var vh = window.innerHeight;
    if (title) {
      var top = title.getBoundingClientRect().top;
      title.style.setProperty('--p', Math.max(0, Math.min(1, (vh * 0.92 - top) / (vh * 0.42))).toFixed(3));
    }
    if (list) {
      var r = list.getBoundingClientRect();
      list.style.setProperty('--sp', Math.max(0, Math.min(1, (vh * 0.62 - r.top) / r.height)).toFixed(4));
      /* Al llegar la punta a cada capítulo: se enciende su cruz y su número (--hit) y la luz corre por su línea (--rl) */
      chapters.forEach(function (ch) {
        var d = vh * 0.62 - ch.getBoundingClientRect().top;
        ch.style.setProperty('--hit', Math.max(0, Math.min(1, d / 50)).toFixed(3));
        ch.classList.toggle('is-lit', d >= 0);
        ch.style.setProperty('--rl', Math.max(0, Math.min(1, d / (vh * 0.32))).toFixed(4));
      });
      /* Al final, la luz gira por la línea de abajo; cuando la recorre entera, el marco late (.is-done) */
      if (end) {
        var e = vh * 0.62 - r.bottom;
        end.style.setProperty('--rl', Math.max(0, Math.min(1, e / (vh * 0.18))).toFixed(4));
        list.classList.toggle('is-end-l', e >= 0);
        list.classList.toggle('is-end-r', e >= vh * 0.17);
        if (e >= vh * 0.18) list.classList.add('is-done');
        else if (e < vh * 0.04) list.classList.remove('is-done');
      }
    }
  };

  var gsap = window.gsap, ST = window.ScrollTrigger;
  if (gsap && ST) {
    gsap.registerPlugin(ST);

    chapters.forEach(function (ch) {
      ch.style.setProperty('--k', 0);
      var st = { k: 0 };
      gsap.to(st, {
        k: 1,
        ease: 'none',
        onUpdate: function () { ch.style.setProperty('--k', st.k.toFixed(4)); },
        scrollTrigger: { trigger: ch, start: 'top 88%', end: 'center 58%', scrub: 0.9 }
      });
    });
    ST.create({ trigger: section, start: 'top bottom', end: 'bottom top', onUpdate: update });
    window.addEventListener('resize', update);
  } else {
    var q = false;
    window.addEventListener('scroll', function () { if (!q) { q = true; requestAnimationFrame(function () { q = false; update(); }); } }, { passive: true });
    window.addEventListener('resize', update);
  }
  update();
})();
