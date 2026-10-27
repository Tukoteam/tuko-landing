/* «Precios»: se paga por uso. Nadie elige plan: según los grupos que cierras al mes, se te cobra uno u otro.
   Lee las cuatro tarjetas de siempre (ocultas; las traducciones las rellenan) y monta la pieza: los cuatro planes
   iguales, en el mismo azul y sin destacar ninguno, cada uno con su precio y su número de grupos; debajo, lo que
   incluyen todos (es lo mismo en los cuatro) y un solo botón, a la Shopify App Store.
   Los precios cuentan al aparecer y la luz sigue al cursor en cada plan. Siempre animado. */
(function () {
  'use strict';

  var section = document.querySelector('.pr');
  if (!section) return;
  var table = section.querySelector('[data-pr-table]');
  var src = section.querySelector('.pr-src');
  var ctaSrc = section.querySelector('.pr-cta-src');
  if (!table || !src) return;

  var YES = /^(sí|si|yes)$/i;
  var esc = function (t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; };
  var CK = '<span class="pr-yes" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M4 8.4l2.6 2.6L12 5.6"/></svg></span>';
  var GROUPS = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.7-3.2 2.9-5 5.5-5s4.8 1.8 5.5 5"/><circle cx="17" cy="9" r="2.6"/><path d="M16.2 14.2c2.2.2 3.8 1.8 4.4 4.8"/></svg>';

  var build = function () {
    var cards = Array.prototype.slice.call(src.querySelectorAll('.pricing-card'));
    if (!cards.length) return;
    /* Cada fila «Etiqueta: valor»; la primera es la de los grupos al mes, la única que cambia entre planes */
    var plans = cards.map(function (c) {
      var rows = [];
      Array.prototype.forEach.call(c.querySelectorAll('.pricing-features li'), function (li) {
        var t = li.textContent.trim(), i = t.lastIndexOf(':');
        if (i > 0) rows.push({ k: t.slice(0, i).trim(), v: t.slice(i + 1).trim() });
      });
      return {
        name: (c.querySelector('.pricing-name') || {}).textContent || '',
        price: (c.querySelector('.pricing-amount') || {}).textContent || '',
        per: (c.querySelector('.pricing-period') || {}).textContent || '',
        rows: rows
      };
    });
    var en = (document.documentElement.lang || 'es').slice(0, 2) === 'en';
    var groups = function (v) {
      var n = parseInt(v, 10);
      if (isNaN(n)) return en ? 'Unlimited closed groups' : 'Grupos cerrados ilimitados';
      return en ? 'Up to <b>' + n + '</b> closed groups a month' : 'Hasta <b>' + n + '</b> grupos cerrados al mes';
    };

    var html = '<div class="pr-grid is-usage">';
    plans.forEach(function (p, i) {
      html += '<div class="pr-col" style="--i:' + i + '">' +
        '<div class="pr-head">' +
          '<span class="pr-name">' + esc(p.name) + '</span>' +
          '<span class="pr-price"><b data-pr-price="' + esc(p.price) + '">' + esc(p.price) + '</b><i>' + esc(p.per) + '</i></span>' +
        '</div>' +
        '<p class="pr-groups">' + GROUPS + '<span>' + groups(p.rows[0] ? p.rows[0].v : '') + '</span></p>' +
      '</div>';
    });
    html += '</div>';

    /* Lo que incluyen todos: las filas del primer plan menos la de los grupos */
    var all = plans[0].rows.slice(1).map(function (r) {
      return '<li>' + CK + '<span>' + esc(r.k) + (YES.test(r.v) ? '' : ': <b>' + esc(r.v) + '</b>') + '</span></li>';
    }).join('');
    html += '<div class="pr-all"><p class="pr-all-t">' + (en ? 'Every plan includes' : 'Todos los planes incluyen') + '</p><ul class="pr-chips">' + all + '</ul></div>';
    if (ctaSrc) {
      html += '<div class="pr-ctas"><a href="' + esc(ctaSrc.getAttribute('href')) + '" class="pr-cta" target="_blank" rel="noopener">' +
        esc(ctaSrc.textContent.trim()) + '<span aria-hidden="true">→</span></a></div>';
    }
    table.innerHTML = html;
    counted = false;
    if (seen) countUp();
  };

  /* ── Precios que cuentan al aparecer ── */
  var counted = false, seen = false;
  var countUp = function () {
    if (counted) return;
    counted = true;
    Array.prototype.forEach.call(table.querySelectorAll('[data-pr-price]'), function (el, i) {
      var full = el.getAttribute('data-pr-price'), m = full.match(/\d+/);
      if (!m) return;
      var to = parseInt(m[0], 10), t0 = 0, D = 900 + i * 120;
      var step = function (now) {
        if (!t0) t0 = now;
        var k = Math.min(1, (now - t0) / D);
        el.textContent = full.replace(m[0], String(Math.round(to * (1 - Math.pow(1 - k, 3)))));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { seen = true; section.classList.add('is-in'); countUp(); }
    }, { threshold: 0.08 }).observe(table);
  } else { seen = true; section.classList.add('is-in'); }

  /* ── Luz que sigue al cursor en cada plan ── */
  table.addEventListener('pointermove', function (e) {
    var g = e.target.closest && e.target.closest('.pr-col');
    if (!g) return;
    var r = g.getBoundingClientRect();
    g.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    g.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  });

  /* Las traducciones reescriben las tarjetas: se vuelve a montar la tabla */
  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(build, 30); }).observe(src, { childList: true, subtree: true, characterData: true });
  if (ctaSrc) new MutationObserver(function () { clearTimeout(t); t = setTimeout(build, 30); }).observe(ctaSrc, { childList: true, characterData: true, subtree: true });
  build();
})();
