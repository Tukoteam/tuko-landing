/**
 * GA4 bootstrap — loads ONLY after cookie consent is accepted
 * (localStorage key: tuko_cookie_consent === 'accepted').
 * Set window.TUKO_GA4_ID = 'G-XXXXXXXX' before this script to override.
 */
(function () {
  var STORAGE_KEY = 'tuko_cookie_consent';
  var MEASUREMENT_ID = window.TUKO_GA4_ID || 'G-W751M44D2X';
  var loaded = false;

  function hasAcceptedConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'accepted';
    } catch (e) {
      return false;
    }
  }

  function loadGA4() {
    if (loaded) return;
    if (!MEASUREMENT_ID || MEASUREMENT_ID.indexOf('G-') !== 0) return;
    if (typeof window.gtag === 'function') {
      loaded = true;
      return;
    }

    loaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', MEASUREMENT_ID);
  }

  window.TukoLoadGA4 = loadGA4;
  window.TukoHasCookieConsent = hasAcceptedConsent;

  if (hasAcceptedConsent()) {
    loadGA4();
  }
})();
