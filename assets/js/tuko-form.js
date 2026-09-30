/* Formularios de Tuko (plan piloto y lista de espera de tuko AI) → Netlify Forms (AJAX) */
(function () {
  'use strict';

  /* Netlify solo acepta el POST en su hosting; /index.html y /tuko-ai.html redirigen, así que siempre a "/" */
  var ENDPOINT = '/';
  /* En local no existe Netlify: se simula el envío. Nunca en un dominio real. */
  var IS_LOCAL = location.protocol === 'file:' ||
    /^(localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0|\[::1\]|::1)$/.test(location.hostname) ||
    /\.(?:localhost|local)$/.test(location.hostname);

  var MSG = {
    es: {
      web: 'Escribe la web de tu tienda, por ejemplo tutienda.com',
      name: 'Escribe tu nombre y apellidos',
      emailEmpty: 'Escribe tu email',
      email: 'Revisa el email: debe tener el formato nombre@dominio.com',
      ok: '¡Mensaje enviado! Te contactaremos pronto.',
      error: 'Ha ocurrido un error. Por favor escríbenos a team.tukoo@gmail.com',
      lang: 'Español'
    },
    en: {
      web: 'Enter your store’s website, e.g. yourstore.com',
      name: 'Enter your full name',
      emailEmpty: 'Enter your email',
      email: 'Check your email: it should look like name@domain.com',
      ok: 'Message sent! We’ll be in touch soon.',
      error: 'Something went wrong. Please write to us at team.tukoo@gmail.com',
      lang: 'English'
    }
  };

  function lang() {
    return /^en/i.test(document.documentElement.lang || '') ? 'en' : 'es';
  }
  function t(key) { return MSG[lang()][key]; }

  /* Dominio con al menos un punto; TLD de letras (o punycode). Acepta http(s)://, www., subdominios, puerto y ruta. */
  var LABEL = '[\\p{L}\\p{N}](?:[\\p{L}\\p{N}-]{0,61}[\\p{L}\\p{N}])?';
  var TLD = '(?:\\p{L}{2,63}|xn--[a-z0-9-]{1,59})';
  var WEB_RE = new RegExp('^(?:https?:\\/\\/)?(?:' + LABEL + '\\.)+' + TLD + '\\.?(?::\\d{1,5})?(?:[\\/?#]\\S*)?$', 'iu');
  var EMAIL_RE = new RegExp('^[^\\s@"(),:;<>\\[\\]\\\\]+@(?:' + LABEL + '\\.)+' + TLD + '$', 'iu');

  function isWeb(v) { return WEB_RE.test(v); }
  function isEmail(v) { return EMAIL_RE.test(v) && v.indexOf('..') === -1; }
  function normalizeWeb(v) { return /^https?:\/\//i.test(v) ? v : 'https://' + v; }

  function fieldError(input) {
    var field = input.closest('.cta-field') || input.parentNode;
    var el = field.querySelector('.cta-field-error');
    if (!el) {
      el = document.createElement('p');
      el.className = 'cta-field-error';
      el.id = input.id + '-error';
      el.hidden = true;
      field.appendChild(el);
    }
    return el;
  }
  function setError(input, text) {
    var el = fieldError(input);
    if (text) {
      el.textContent = text;
      el.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', el.id);
    } else {
      el.hidden = true;
      el.textContent = '';
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  }

  function check(input) {
    var v = input.value.trim();
    var kind = input.getAttribute('data-validate');
    if (kind === 'web') return v && isWeb(v) ? '' : t('web');
    if (kind === 'email') return !v ? t('emailEmpty') : isEmail(v) ? '' : t('email');
    if (kind === 'required') return v ? '' : t('name');
    return '';
  }

  function init(form) {
    var status = form.querySelector('[data-form-status]');
    var btn = form.querySelector('[type="submit"]');
    var inputs = Array.prototype.slice.call(form.querySelectorAll('[data-validate]'));

    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') setError(input, check(input));
      });
      input.addEventListener('blur', function () {
        if (input.value.trim()) setError(input, check(input));
      });
    });

    function showStatus(state, text) {
      if (!status) return;
      status.textContent = text;
      status.setAttribute('data-state', state);
      status.hidden = false;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (status) status.hidden = true;

      var firstBad = null;
      inputs.forEach(function (input) {
        var err = check(input);
        setError(input, err);
        if (err && !firstBad) firstBad = input;
      });
      if (firstBad) {
        firstBad.focus();
        return;
      }

      var data = {};
      new FormData(form).forEach(function (v, k) {
        if (!(k in data)) data[k] = typeof v === 'string' ? v.trim() : v;
      });
      data['form-name'] = form.getAttribute('name');
      if (data.web) data.web = normalizeWeb(data.web);
      data['Pagina'] = location.origin + location.pathname;
      data['Idioma'] = t('lang');
      var body = new URLSearchParams(data).toString();

      if (btn) btn.disabled = true;
      var send = IS_LOCAL
        ? new Promise(function (resolve) {
            if (window.console) console.info('[Tuko · solo en local] Netlify Forms no existe en ' + location.host + '; envío simulado, no se ha mandado nada. Payload:', body);
            setTimeout(function () { resolve({ ok: true, status: 200 }); }, 400);
          })
        : fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
          });
      send
        .then(function (res) {
          if (!res.ok) {
            if (window.console) console.warn('Netlify Forms', res.status);
            throw new Error('netlify-forms');
          }
          form.reset();
          inputs.forEach(function (input) { setError(input, ''); });
          showStatus('ok', t('ok'));
        })
        .catch(function () { showStatus('error', t('error')); })
        .then(function () { if (btn) btn.disabled = false; });
    });
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('form[data-tuko-form]'), init);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
