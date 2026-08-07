/**
 * Optional GA4 bootstrap. Set window.TUKO_GA4_ID = 'G-XXXXXXXX' before this script,
 * or edit MEASUREMENT_ID below after connecting Analytics (Documento 4).
 */
(function () {
  var MEASUREMENT_ID = window.TUKO_GA4_ID || '';
  if (!MEASUREMENT_ID || MEASUREMENT_ID.indexOf('G-') !== 0) return;
  if (typeof window.gtag === 'function') return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID);
})();
