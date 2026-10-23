/* «Precios»: cuatro tarjetas unidas con lo que añade cada plan.
   Lee las cuatro tarjetas de siempre (ocultas; las traducciones las rellenan) y monta la pieza: cada plan con su
   precio y solo lo que añade al anterior. La comisión no se repite: el subtítulo ya dice que ningún plan tiene.
   Escala va como el pase fundador, con la nota del piloto en una matriz de ticket y el botón del piloto.
   Los precios cuentan al aparecer y la luz sigue al cursor en cada tarjeta. Siempre animado. */
(function () {
  'use strict';

  var section = document.querySelector('.pr');
  if (!section) return;
  var table = section.querySelector('[data-pr-table]');
  var src = section.querySelector('.pr-src');
  var ctaSrc = section.querySelector('.pr-cta-src');
  if (!table || !src) return;

  var YES = /^(sí|si|yes)$/i, NO = /^no$/i;
  var esc = function (t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; };

  var build = function () {
    var cards = Array.prototype.slice.call(src.querySelectorAll('.pricing-card'));
    if (!cards.length) return;
    /* Cada fila «Etiqueta: valor»; el orden de las filas, el del plan más completo */
    var plans = cards.map(function (c) {
      var rows = {}, order = [];
      Array.prototype.forEach.call(c.querySelectorAll('.pricing-features li'), function (li) {
        var t = li.textContent.trim(), i = t.lastIndexOf(':');
        if (i < 0) return;
        var k = t.slice(0, i).trim();
        rows[k] = t.slice(i + 1).trim();
        order.push(k);
      });
      var rib = c.querySelector('.pricing-ribbon');
      return {
        name: (c.querySelector('.pricing-name') || {}).textContent || '',
        price: (c.querySelector('.pricing-amount') || {}).textContent || '',
        per: (c.querySelector('.pricing-period') || {}).textContent || '',
        gift: c.classList.contains('is-gift'),
        /* La nota lleva «45 días» en negrita: solo se conservan las <b> */
        ribbon: rib ? rib.innerHTML.replace(/<(?!\/?b>)[^>]*>/g, '').trim() : '',
        rows: rows,
        order: order
      };
    });
    var labels = plans[plans.length - 1].order.filter(function (k, i) { return i > 0; }); // sin «Comisión»
    /* Lo que tiene cada plan: los números siempre; el resto, solo si es «Sí» */
    var has = function (p, k) { var v = p.rows[k] || ''; return !!v && !NO.test(v); };
    var CK = '<span class="pr-yes" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M4 8.4l2.6 2.6L12 5.6"/></svg></span>';
    var item = function (p, k) {
      var v = p.rows[k];
      return '<li>' + CK + '<span>' + esc(k) + (YES.test(v) ? '' : ': <b>' + esc(v) + '</b>') + '</span></li>';
    };
    var en = (document.documentElement.lang || 'es').slice(0, 2) === 'en';
    var plus = function (name) { return en ? 'Everything in ' + name + ', plus:' : 'Todo lo de ' + name + ', más:'; };

    /* Cuatro tarjetas unidas; cada una enseña solo lo que añade al plan anterior */
    var html = '<div class="pr-grid">';
    plans.forEach(function (p, i) {
      var prev = plans[i - 1];
      var list = labels.filter(function (k) { return has(p, k) && (!prev || p.rows[k] !== prev.rows[k]); });
      html += '<div class="pr-col' + (p.gift ? ' is-gift' : '') + '" style="--i:' + i + '">';
      /* La nota del piloto va en una pestaña encima de la tarjeta */
      if (p.gift && p.ribbon) html += '<span class="pr-stub"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5l1.6 4.2 4.4.3-3.4 2.8 1.1 4.3L8 10.7 4.3 13.1l1.1-4.3L2 6l4.4-.3z"/></svg><span>' + p.ribbon + '</span></span>';
      if (p.gift) html += '<span class="pr-holo" aria-hidden="true"></span>';
      html += '<div class="pr-head">' +
        '<span class="pr-name">' + esc(p.name) + '</span>' +
        '<span class="pr-price"><b data-pr-price="' + esc(p.price) + '">' + esc(p.price) + '</b><i>' + esc(p.per) + '</i></span>' +
        '</div>';
      html += '<div class="pr-body">' + (prev ? '<p class="pr-plus">' + esc(plus(prev.name)) + '</p>' : '') +
        '<ul class="pr-list">' + list.map(function (k) { return item(p, k); }).join('') + '</ul></div>';
      html += '<div class="pr-foot">' + (p.gift && ctaSrc ? '<a href="#solicitud" class="pr-cta">' + esc(ctaSrc.textContent.trim()) + '<span aria-hidden="true">→</span></a>' : '') + '</div>';
      html += '</div>';
    });
    html += '</div>';
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

  /* ── Luz que sigue al cursor: el brillo del pase en Escala y el foco de luz en los demás planes ── */
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
