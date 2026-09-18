(function () {
  var host = location.hostname;
  if (host !== '127.0.0.1' && host !== 'localhost' && host !== '::1') return;

  var path = (location.pathname || '/').replace(/\/index\.html$/, '/') || '/';
  var file = (location.pathname || '/').split('/').pop() || 'index.html';
  var text = 'LOCAL · ' + file;

  if (path === '/' || location.pathname === '/index.html') {
    text = 'ACTUAL · index.html';
  } else if (path === '/en' || path === '/en/' || location.pathname.indexOf('/en/') === 0) {
    text = 'INGLÉS · en/index.html';
  } else if (file === 'tuko-landing-v3.html') {
    text = 'ANTIGUA · tuko-landing-v3.html';
  } else if (file === 'tuko-ai.html') {
    text = 'tuko AI · tuko-ai.html';
  } else if (file === 'index_aprobada_20260918.html') {
    text = 'COPIA · _versiones/index_aprobada_20260918.html';
  } else if (file === 'index_hero_oscuro_20260918.html') {
    text = 'OSCURO · _versiones/index_hero_oscuro_20260918.html';
  } else if (file === 'index_hero_claro_20260918.html') {
    text = 'CLARO · _versiones/index_hero_claro_20260918.html';
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var raw = a.getAttribute('href');
    if (!raw || raw.charAt(0) === '#') return;
    try {
      var url = new URL(raw, location.href);
      if (url.origin !== location.origin) return;
      var path = url.pathname.replace(/\/$/, '') || '/';
      if (path === '/tuko-ai') url.pathname = '/tuko-ai.html';
      else if (path === '/en/tuko-ai') url.pathname = '/en/tuko-ai.html';
      else return;
      e.preventDefault();
      location.href = url.pathname + url.search + url.hash;
    } catch (err) {}
  }, true);

  var el = document.createElement('div');
  el.setAttribute('data-local-landing-label', '1');
  el.textContent = text;
  el.style.cssText = [
    'position:fixed',
    'left:12px',
    'bottom:12px',
    'z-index:2147483647',
    'background:#1a1a1a',
    'color:#fff',
    'font:600 12px/1.3 "Mona Sans",system-ui,sans-serif',
    'font-stretch:semi-expanded',
    'letter-spacing:.02em',
    'padding:8px 12px',
    'border-radius:8px',
    'box-shadow:0 8px 24px rgba(0,0,0,.28)',
    'pointer-events:none'
  ].join(';');
  document.documentElement.appendChild(el);
})();
