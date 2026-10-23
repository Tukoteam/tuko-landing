/* Cómo funciona (el ciclo): el scroll dentro de la sección elige el paso; el marco toma el tamaño real
   de su demo (escalado si no cabe) y solo la demo visible se reproduce. Siempre animado. */
(function () {
  'use strict';

  var hx = document.querySelector('.hx');
  if (!hx) return;
  var items = Array.prototype.slice.call(hx.querySelectorAll('.hx-item'));
  var demos = Array.prototype.slice.call(hx.querySelectorAll('.hx-demo'));
  var stage = hx.querySelector('.hx-stage');
  var frame = hx.querySelector('.hx-frame');
  var current = -1;
  var inView = false;

  var send = function (iframe, msg) {
    try { if (iframe.contentWindow) iframe.contentWindow.postMessage(msg, '*'); } catch (e) {}
  };
  var lang = function () {
    return document.documentElement.lang === 'en' ? 'en' : 'es';
  };

  /* Cada demo con su tamaño real */
  demos.forEach(function (d) {
    d.style.width = d.getAttribute('data-w') + 'px';
    d.style.height = d.getAttribute('data-h') + 'px';
    d.addEventListener('load', function () {
      send(d, { type: 'tuko-demo-lang', lang: lang() });
      sync();
    });
  });
  /* El paso 1 avisa de su alto real */
  window.addEventListener('message', function (ev) {
    var data = ev.data;
    if (!data || data.type !== 'tuko-demo-resize' || !data.height) return;
    demos.forEach(function (d) {
      if (d.contentWindow !== ev.source) return;
      var h = Math.round(Number(data.height));
      if (!isFinite(h) || h < 160) return;
      d.setAttribute('data-h', h);
      d.style.height = h + 'px';
      fit();
    });
  });

  /* Las demos se cargan al acercarse a la sección */
  var load = function () {
    demos.forEach(function (d) {
      if (d.getAttribute('src') === 'about:blank') d.setAttribute('src', d.getAttribute('data-src'));
    });
  };

  /* Medidas de cada demo dentro del marco: barra de ventana (si la lleva) y margen recortado */
  var BAR = 36;
  var box = function (d) {
    var crop = (d.getAttribute('data-crop') || '0 0').split(' ').map(Number);
    var bar = d.getAttribute('data-bar') === '1' ? BAR : 0;
    return {
      w: Number(d.getAttribute('data-w')) - 2 * crop[0],
      h: Number(d.getAttribute('data-h')) - 2 * crop[1] + bar,
      bar: bar
    };
  };
  /* La demo queda centrada bajo la barra (el recorte es simétrico) */
  demos.forEach(function (d) { d.style.setProperty('--off', box(d).bar / 2 + 'px'); });

  /* El marco mide lo que la demo activa; si no cabe, se escala entero.
     En escritorio el escenario se ajusta a su alto, con el mismo aire arriba y abajo */
  var mobile = window.matchMedia('(max-width: 900px)');
  var fit = function () {
    var d = demos[current < 0 ? 0 : current];
    if (!d) return;
    var b = box(d);
    var vh = window.innerHeight;
    /* En móvil, casi sin margen: la demo se ve lo más grande posible */
    var availW = stage.clientWidth - (mobile.matches ? 12 : 40);
    var availH = mobile.matches ? stage.clientHeight - 30 : Math.min(vh - 230, 660);
    var s = Math.min(1, availW / b.w, availH / b.h);
    stage.style.setProperty('--fw', b.w + 'px');
    stage.style.setProperty('--fh', b.h + 'px');
    stage.style.setProperty('--fit', s.toFixed(3));
    if (!mobile.matches) stage.style.height = Math.round(b.h * s + 96) + 'px';
    else stage.style.height = '';
  };

  /* Solo se reproduce la demo visible, y solo con la sección en pantalla */
  var sync = function () {
    demos.forEach(function (d, i) {
      send(d, { type: inView && i === current ? 'tuko-demo-play' : 'tuko-demo-pause' });
    });
  };

  var setStep = function (n) {
    if (n === current) return;
    current = n;
    hx.setAttribute('data-step', String(n));
    items.forEach(function (it, i) {
      it.classList.toggle('is-active', i === n);
      it.classList.toggle('is-done', i < n);
    });
    demos.forEach(function (d, i) { d.classList.toggle('is-on', i === n); });
    fit();
    sync();
  };

  var update = function () {
    var r = hx.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - vh)));
    hx.style.setProperty('--p', p.toFixed(4));
    hx.classList.toggle('is-looped', p > 0.97);
    setStep(Math.min(items.length - 1, Math.floor(p * items.length)));
  };

  var queued = false;
  window.addEventListener('scroll', function () {
    if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; update(); }); }
  }, { passive: true });
  window.addEventListener('resize', function () { fit(); update(); });

  /* Pulsar un paso lleva el scroll a su tramo */
  items.forEach(function (it, i) {
    it.querySelector('.hx-head').addEventListener('click', function () {
      var top = hx.getBoundingClientRect().top + window.scrollY;
      var run = hx.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + run * (i + 0.5) / items.length, behavior: 'smooth' });
    });
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { if (e[0].isIntersecting) load(); }, { rootMargin: '800px 0px' }).observe(hx);
    new IntersectionObserver(function (e) { inView = e[0].isIntersecting; sync(); }).observe(hx.querySelector('.hx-sticky'));
  } else {
    load();
    inView = true;
  }
  update();
})();

/* Anillo: nudos pulsables y títulos cortos según el idioma (el avance lo pone el bloque de arriba) */
(function () {
  'use strict';

  var hx = document.querySelector('.hx--ring');
  if (!hx) return;
  var nodes = Array.prototype.slice.call(hx.querySelectorAll('.hr-node'));
  var en = false;
  en = document.documentElement.lang === 'en';

  nodes.forEach(function (n, i) {
    var label = n.querySelector('.hr-label');
    if (en && label) label.textContent = label.getAttribute('data-en');
    n.setAttribute('aria-label', (en ? 'Step ' : 'Paso ') + (i + 1) + ': ' + (label ? label.textContent : ''));
    /* Pulsar un nudo lleva el scroll al tramo de su paso */
    n.addEventListener('click', function () {
      var top = hx.getBoundingClientRect().top + window.scrollY;
      var run = hx.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + run * (i + 0.5) / nodes.length, behavior: 'smooth' });
    });
  });
})();
