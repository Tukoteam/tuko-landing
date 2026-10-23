/* Preguntas frecuentes como conversación.
   «Objeciones reales de las llamadas»: las preguntas son pastillas; al pulsar una, se escribe letra a letra en la
   barra de abajo, se envía como tu mensaje, Tuko escribe un momento y llega la respuesta (con su avatar).
   Las preguntas ya hechas se marcan con un check. La conversación guarda los últimos intercambios.
   Se monta sobre el acordeón de siempre (que sigue en el HTML para Google y por si el JS no carga):
   lee preguntas y respuestas de ahí, también tras las traducciones. Al aparecer, la primera se envía sola. */
(function () {
  'use strict';

  var section = document.querySelector('.faq');
  var list = section && section.querySelector('#faqList');
  if (!list) return;
  var en = (document.documentElement.lang || 'es').slice(0, 2) === 'en';
  var T = en ? { you: 'You', typing: 'Tuko is typing…', ph: 'Type your question…', send: 'Send' }
             : { you: 'Tú', typing: 'Tuko está escribiendo…', ph: 'Escribe tu pregunta…', send: 'Enviar' };
  var MARK = '<svg viewBox="44 36 213 249"><ellipse cx="132.298" cy="160.5" rx="32.1333" ry="120.5"/><path d="M164.431 160.5C164.431 227.05 164.431 281 164.431 281C195.488 281 220.664 227.05 220.664 160.5C220.664 93.9497 195.488 40 164.431 40C164.431 40 164.431 93.9497 164.431 160.5Z"/><path d="M220.657 160.497C220.657 204.864 220.657 240.83 220.657 240.83C238.403 240.83 252.79 204.864 252.79 160.497C252.79 116.13 238.403 80.1636 220.657 80.1636C220.657 80.1636 220.657 116.13 220.657 160.497Z"/><ellipse cx="80.0841" cy="160.497" rx="20.0833" ry="80.3333"/></svg>';

  var read = function () {
    return Array.prototype.map.call(list.querySelectorAll('.faq-item'), function (it) {
      return {
        q: (it.querySelector('.faq-q') || {}).textContent || '',
        a: (it.querySelector('.faq-a') || {}).innerHTML || ''
      };
    });
  };

  /* ── Montaje: columna de preguntas + panel de conversación con barra de escribir ── */
  section.classList.add('fq');
  var wrap = document.createElement('div');
  wrap.className = 'fq-grid';
  var asks = document.createElement('div');
  asks.className = 'fq-asks';
  asks.setAttribute('role', 'list');
  var panel = document.createElement('div');
  panel.className = 'fq-chat';
  panel.innerHTML =
    '<div class="fq-chat-head"><span class="fq-av" aria-hidden="true">' + MARK + '</span><b>Tuko</b><i class="fq-live" aria-hidden="true"></i></div>' +
    '<div class="fq-thread" aria-live="polite"></div>' +
    '<div class="fq-compose" aria-hidden="true"><span class="fq-input"><span class="fq-ph">' + T.ph + '</span><span class="fq-typed"></span></span>' +
    '<span class="fq-send" title="' + T.send + '"><svg viewBox="0 0 24 24"><path d="M5 12h13M13 6.5 18.5 12 13 17.5"/></svg></span></div>';
  var thread = panel.querySelector('.fq-thread');
  var compose = panel.querySelector('.fq-compose');
  var typed = panel.querySelector('.fq-typed');
  wrap.appendChild(asks);
  wrap.appendChild(panel);
  list.parentNode.insertBefore(wrap, list);

  var items = [], busy = false, active = -1, done = {}, timers = [];
  var drawAsks = function () {
    items = read();
    asks.innerHTML = items.map(function (it, i) {
      return '<button type="button" class="fq-ask' + (i === active ? ' is-on' : '') + (done[i] ? ' is-done' : '') + '" data-i="' + i + '" role="listitem">' +
        '<span class="fq-n">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
        '<span class="fq-ck" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M4 8.4l2.6 2.6L12 5.6"/></svg></span>' +
        '<span class="fq-t"></span><span class="fq-go" aria-hidden="true">→</span></button>';
    }).join('');
    Array.prototype.forEach.call(asks.querySelectorAll('.fq-ask'), function (b, i) { b.querySelector('.fq-t').textContent = items[i].q; });
  };

  /* Añade una fila a la conversación; las de Tuko llevan su avatar. Solo se quedan las últimas. */
  var row = function (who, html) {
    var r = document.createElement('div');
    r.className = 'fq-row fq-row--' + who;
    r.innerHTML = (who === 'tuko' ? '<span class="fq-mini" aria-hidden="true">' + MARK + '</span>' : '') + '<div class="fq-msg fq-msg--' + who + '">' + html + '</div>';
    thread.appendChild(r);
    var all = thread.querySelectorAll('.fq-row:not(.is-gone)');
    /* En pantalla: la respuesta anterior y el intercambio actual (así no queda ninguna burbuja cortada a medias) */
    for (var k = 0; k < all.length - 3; k++) {
      (function (old) { old.classList.add('is-gone'); setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 420); })(all[k]);
    }
    return r;
  };

  var ask = function (i) {
    if (busy || !items[i]) return;
    busy = true;
    active = i;
    Array.prototype.forEach.call(asks.querySelectorAll('.fq-ask'), function (b, k) { b.classList.toggle('is-on', k === i); });
    /* 1 · La pregunta se escribe en la barra */
    var q = items[i].q, n = 0, step = Math.max(12, Math.min(28, 650 / q.length));
    compose.classList.add('is-typing');
    typed.textContent = '';
    var type = function () {
      typed.textContent = q.slice(0, ++n);
      if (n < q.length) timers.push(setTimeout(type, step));
      else timers.push(setTimeout(send, 220));
    };
    /* 2 · Se envía: el botón late y el mensaje sube a la conversación */
    var send = function () {
      compose.classList.add('is-send');
      timers.push(setTimeout(function () { compose.classList.remove('is-send'); }, 380));
      compose.classList.remove('is-typing');
      typed.textContent = '';
      var s = document.createElement('span');
      s.textContent = q;
      row('you', '<span class="fq-who">' + T.you + '</span>' + s.outerHTML);
      /* 3 · Tuko escribe y responde */
      timers.push(setTimeout(function () {
        var r = row('tuko', '<span class="fq-dots" aria-label="' + T.typing + '"><i></i><i></i><i></i></span>');
        r.classList.add('is-typing');
        timers.push(setTimeout(function () {
          r.classList.remove('is-typing');
          r.querySelector('.fq-msg').innerHTML = '<span class="fq-a">' + items[i].a + '</span>';
          r.classList.add('is-in');
          done[i] = true;
          var b = asks.querySelector('.fq-ask[data-i="' + i + '"]');
          if (b) b.classList.add('is-done');
          busy = false;
        }, 900));
      }, 360));
    };
    type();
  };

  /* Móvil: sin panel aparte. Cada pregunta despliega debajo la respuesta de Tuko (escribe un momento y responde);
     solo queda una abierta. */
  var mobile = window.matchMedia('(max-width: 860px)');
  var inline = document.createElement('div');
  inline.className = 'fq-inline';
  inline.innerHTML = '<div class="fq-inline-in"><div class="fq-row fq-row--tuko"><span class="fq-mini" aria-hidden="true">' + MARK + '</span><div class="fq-msg fq-msg--tuko" aria-live="polite"></div></div></div>';
  var inlineMsg = inline.querySelector('.fq-msg');
  var mTimer = 0;
  var mAsk = function (i) {
    var b = asks.querySelector('.fq-ask[data-i="' + i + '"]');
    if (!b || !items[i]) return;
    clearTimeout(mTimer);
    var closing = active === i && inline.classList.contains('is-open');
    Array.prototype.forEach.call(asks.querySelectorAll('.fq-ask'), function (x) { x.classList.remove('is-on'); x.setAttribute('aria-expanded', 'false'); });
    inline.classList.remove('is-open', 'is-in');
    if (closing) { active = -1; return; }
    active = i;
    b.classList.add('is-on');
    b.setAttribute('aria-expanded', 'true');
    b.parentNode.insertBefore(inline, b.nextSibling);
    inlineMsg.innerHTML = '<span class="fq-dots" aria-label="' + T.typing + '"><i></i><i></i><i></i></span>';
    void inline.offsetHeight;
    inline.classList.add('is-open');
    mTimer = setTimeout(function () {
      inlineMsg.innerHTML = '<span class="fq-a">' + items[i].a + '</span>';
      inline.classList.add('is-in');
      done[i] = true;
      b.classList.add('is-done');
    }, 650);
  };

  asks.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.fq-ask');
    if (!b) return;
    if (mobile.matches) mAsk(Number(b.getAttribute('data-i')));
    else ask(Number(b.getAttribute('data-i')));
  });

  drawAsks();
  /* Las traducciones reescriben el acordeón: se vuelven a leer las preguntas */
  var t = 0;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(drawAsks, 40); }).observe(list, { childList: true, subtree: true, characterData: true });

  /* Al aparecer, la primera pregunta se envía sola */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) {
        io.disconnect();
        section.classList.add('is-in');
        timers.push(setTimeout(function () { if (active < 0) (mobile.matches ? mAsk : ask)(0); }, 700));
      }
    }, { threshold: 0.35 });
    io.observe(wrap);
  } else { section.classList.add('is-in'); (mobile.matches ? mAsk : ask)(0); }
})();
