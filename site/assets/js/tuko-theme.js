/* Tuko theme toggle: light ↔ dark (localStorage: tuko_theme) */
(function () {
  'use strict';

  var KEY = 'tuko_theme';
  var META = 'meta[name="theme-color"]';

  function lang() {
    return /^en/i.test(document.documentElement.lang || '') ? 'en' : 'es';
  }

  function label(theme) {
    if (lang() === 'en') {
      return theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    }
    return theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro';
  }

  function current() {
    var t = document.documentElement.getAttribute('data-theme');
    return t === 'dark' ? 'dark' : 'light';
  }

  function syncGrids(theme) {
    var grids = window.__tukoGrids || [];
    var i;
    for (i = 0; i < grids.length; i++) {
      var g = grids[i];
      if (!g || typeof g.setOpts !== 'function') continue;
      if (g.role === 'hero') {
        /* Noche: líneas más apagadas (no blancas) */
        g.setOpts(theme === 'dark'
          ? { baseColor: '110,128,210', maxAlpha: 0.21 }
          : { baseColor: '90,90,90', maxAlpha: 0.17 });
      } else if (g.role === 'cta') {
        g.setOpts(theme === 'dark'
          ? { baseColor: '160,175,255', maxAlpha: 0.28 }
          : { baseColor: '255,255,255', maxAlpha: 0.17 });
      }
    }
  }

  function syncIframes(theme) {
    var frames = document.querySelectorAll('iframe.how-step-iframe, iframe[src*="landing-demo"]');
    var msg = { type: 'tuko-theme', theme: theme };
    var i;
    for (i = 0; i < frames.length; i++) {
      try {
        frames[i].contentWindow.postMessage(msg, '*');
      } catch (e) { /* ignore */ }
    }
  }

  function wireIframeLoads() {
    var frames = document.querySelectorAll('iframe.how-step-iframe, iframe[src*="landing-demo"]');
    var i;
    for (i = 0; i < frames.length; i++) {
      (function (frame) {
        frame.addEventListener('load', function () {
          try {
            frame.contentWindow.postMessage({ type: 'tuko-theme', theme: current() }, '*');
          } catch (e) { /* ignore */ }
        });
      })(frames[i]);
    }
  }

  window.addEventListener('message', function (e) {
    var d = e && e.data;
    if (!d || d.type !== 'tuko-theme-request') return;
    syncIframes(current());
  });

  function apply(theme, persist) {
    var next = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    if (persist !== false) {
      try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
    }
    var meta = document.querySelector(META);
    if (meta) meta.setAttribute('content', next === 'dark' ? '#0b0d14' : '#3D50F2');
    var btns = document.querySelectorAll('#themeToggle, .theme-toggle');
    var i;
    for (i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-label', label(next));
      btns[i].setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
    }
    syncGrids(next);
    syncIframes(next);
    try {
      document.dispatchEvent(new CustomEvent('tuko:theme', { detail: { theme: next } }));
    } catch (e2) { /* ignore */ }
  }

  function boot() {
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) { /* ignore */ }
    if (stored === 'dark' || stored === 'light') apply(stored, false);
    else apply(current() || 'light', false);

    wireIframeLoads();
    /* Grids / iframes may boot after this script; resync a few times. */
    setTimeout(function () { syncGrids(current()); syncIframes(current()); }, 0);
    setTimeout(function () { syncIframes(current()); }, 400);
    setTimeout(function () { syncIframes(current()); }, 1200);

    var btns = document.querySelectorAll('#themeToggle, .theme-toggle');
    if (!btns.length) return;
    var i;
    for (i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        apply(current() === 'dark' ? 'light' : 'dark', true);
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
