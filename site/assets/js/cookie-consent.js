/**
 * Cookie consent banner (RGPD). Persists choice in localStorage
 * and only then allows GA4 via window.TukoLoadGA4().
 */
(function () {
  var STORAGE_KEY = 'tuko_cookie_consent';
  var COPY = {
    es: {
      text: 'Usamos cookies de análisis (Google Analytics) para entender el uso del sitio. Puedes aceptar o rechazar.',
      accept: 'Aceptar',
      reject: 'Rechazar',
      privacy: 'Política de privacidad',
      manage: 'Cookies'
    },
    en: {
      text: 'We use analytics cookies (Google Analytics) to understand how the site is used. You can accept or reject.',
      accept: 'Accept',
      reject: 'Reject',
      privacy: 'Privacy policy',
      manage: 'Cookies'
    }
  };

  function getLang() {
    try {
      var stored = localStorage.getItem('tuko_lang');
      if (stored === 'en' || stored === 'es') return stored;
    } catch (e) { /* noop */ }
    var htmlLang = (document.documentElement.lang || 'es').toLowerCase();
    if (htmlLang.indexOf('en') === 0) return 'en';
    if (location.pathname.indexOf('/en/') === 0 || location.pathname === '/en') return 'en';
    return 'es';
  }

  function getChoice() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setChoice(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) { /* noop */ }
  }

  function privacyHref() {
    return getLang() === 'en' ? '/en/privacidad' : '/privacidad';
  }

  function applyI18n(root) {
    var t = COPY[getLang()] || COPY.es;
    var textEl = root.querySelector('[data-cookie-i18n="text"]');
    var acceptEl = root.querySelector('[data-cookie-i18n="accept"]');
    var rejectEl = root.querySelector('[data-cookie-i18n="reject"]');
    var privacyEl = root.querySelector('[data-cookie-i18n="privacy"]');
    if (textEl) textEl.textContent = t.text;
    if (acceptEl) acceptEl.textContent = t.accept;
    if (rejectEl) rejectEl.textContent = t.reject;
    if (privacyEl) {
      privacyEl.textContent = t.privacy;
      privacyEl.setAttribute('href', privacyHref());
    }
  }

  function hideBanner() {
    var el = document.getElementById('tuko-cookie-banner');
    if (el) el.hidden = true;
  }

  function showBanner() {
    var el = document.getElementById('tuko-cookie-banner');
    if (!el) return;
    applyI18n(el);
    el.hidden = false;
    var focusBtn = el.querySelector('.tuko-cookie-banner__btn--accept');
    if (focusBtn) focusBtn.focus();
  }

  function onAccept() {
    setChoice('accepted');
    hideBanner();
    if (typeof window.TukoLoadGA4 === 'function') window.TukoLoadGA4();
  }

  function onReject() {
    setChoice('rejected');
    hideBanner();
  }

  function ensureBanner() {
    if (document.getElementById('tuko-cookie-banner')) return;
    var t = COPY[getLang()] || COPY.es;
    var wrap = document.createElement('div');
    wrap.id = 'tuko-cookie-banner';
    wrap.className = 'tuko-cookie-banner';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-live', 'polite');
    wrap.setAttribute('aria-label', t.manage);
    wrap.hidden = true;
    wrap.innerHTML =
      '<p class="tuko-cookie-banner__text">' +
        '<span data-cookie-i18n="text"></span> ' +
        '<a data-cookie-i18n="privacy" href="' + privacyHref() + '"></a>.' +
      '</p>' +
      '<div class="tuko-cookie-banner__actions">' +
        '<button type="button" class="tuko-cookie-banner__btn tuko-cookie-banner__btn--reject" data-cookie-i18n="reject"></button>' +
        '<button type="button" class="tuko-cookie-banner__btn tuko-cookie-banner__btn--accept" data-cookie-i18n="accept"></button>' +
      '</div>';
    document.body.appendChild(wrap);
    wrap.querySelector('[data-cookie-i18n="accept"]').addEventListener('click', onAccept);
    wrap.querySelector('[data-cookie-i18n="reject"]').addEventListener('click', onReject);
    applyI18n(wrap);
  }

  function injectFooterManageLink() {
    if (document.getElementById('tuko-cookie-manage')) return;
    var t = COPY[getLang()] || COPY.es;
    var terms = document.querySelector('footer a[data-i18n="footer_terms"]');
    var parent = terms && terms.parentElement;
    if (!parent) {
      parent = document.querySelector('footer .footer-col:last-child') || document.querySelector('footer');
    }
    if (!parent) return;
    var a = document.createElement('a');
    a.href = '#';
    a.id = 'tuko-cookie-manage';
    a.setAttribute('data-i18n', 'footer_cookies');
    a.textContent = t.manage;
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) { /* noop */ }
      ensureBanner();
      showBanner();
    });
    if (terms && terms.nextSibling) {
      parent.insertBefore(a, terms.nextSibling);
    } else {
      parent.appendChild(a);
    }
  }

  window.TukoOpenCookiePreferences = function () {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* noop */ }
    ensureBanner();
    showBanner();
  };

  function init() {
    ensureBanner();
    injectFooterManageLink();
    var choice = getChoice();
    if (choice === 'accepted') {
      if (typeof window.TukoLoadGA4 === 'function') window.TukoLoadGA4();
      return;
    }
    if (choice === 'rejected') return;
    showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
