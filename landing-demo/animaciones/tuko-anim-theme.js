/* Sync dark/light with parent landing (tuko_theme / postMessage) */
(function () {
  'use strict';

  function apply(theme) {
    var next = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.classList.toggle('theme-dark', next === 'dark');
  }

  function readTheme() {
    var t = null;
    try {
      if (window.parent && window.parent !== window && window.parent.document) {
        t = window.parent.document.documentElement.getAttribute('data-theme');
      }
    } catch (e) { /* cross-origin */ }
    if (t === 'dark' || t === 'light') return t;
    try {
      t = localStorage.getItem('tuko_theme');
    } catch (e2) {
      t = null;
    }
    if (t === 'dark' || t === 'light') return t;
    return 'light';
  }

  apply(readTheme());

  window.addEventListener('message', function (e) {
    var d = e && e.data;
    if (!d || d.type !== 'tuko-theme') return;
    apply(d.theme);
  });

  window.addEventListener('storage', function (e) {
    if (e.key === 'tuko_theme') apply(e.newValue);
  });

  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'tuko-theme-request' }, '*');
    }
  } catch (e3) { /* ignore */ }

  setTimeout(function () { apply(readTheme()); }, 0);
  setTimeout(function () { apply(readTheme()); }, 100);
  setTimeout(function () { apply(readTheme()); }, 500);
  setTimeout(function () { apply(readTheme()); }, 1500);
})();
