/**
 * GA4 events for Tuko blog (Documento 2 · Acción 4)
 * Requires gtag already loaded on the page (or window.dataLayer).
 * Events: blog_scroll_50, blog_scroll_90, shopify_outbound_click,
 *         blog_cta_click, blog_internal_link_click, lang_switch
 */
(function () {
  'use strict';

  function slugFromPath() {
    try {
      var parts = location.pathname.replace(/\/+$/, '').split('/');
      return parts[parts.length - 1] || 'blog';
    } catch (e) {
      return 'blog';
    }
  }

  function track(name, params) {
    var payload = Object.assign({ page_slug: slugFromPath() }, params || {});
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, payload);
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, payload));
  }

  // Scroll depth
  var hit50 = false;
  var hit90 = false;
  function onScroll() {
    var doc = document.documentElement;
    var body = document.body;
    var scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
    var height = Math.max(doc.scrollHeight, body.scrollHeight) - window.innerHeight;
    if (height <= 0) return;
    var pct = scrollTop / height;
    if (!hit50 && pct >= 0.5) {
      hit50 = true;
      track('blog_scroll_50');
    }
    if (!hit90 && pct >= 0.9) {
      hit90 = true;
      track('blog_scroll_90');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  function isShopifyUrl(href) {
    return /apps\.shopify\.com|shopify\.com\/.*apps/i.test(href || '');
  }

  function isInternalBlog(href) {
    if (!href) return false;
    try {
      var u = new URL(href, location.origin);
      return u.origin === location.origin && /\/blog(\/|$)/.test(u.pathname);
    } catch (e) {
      return false;
    }
  }

  function withUtm(href, slug) {
    try {
      var u = new URL(href, location.href);
      if (!u.searchParams.has('utm_source')) u.searchParams.set('utm_source', 'blog');
      if (!u.searchParams.has('utm_medium')) u.searchParams.set('utm_medium', 'organic');
      if (!u.searchParams.has('utm_campaign')) u.searchParams.set('utm_campaign', slug);
      return u.toString();
    } catch (e) {
      return href;
    }
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a || !a.href) return;
    var href = a.href;
    var slug = slugFromPath();

    if (isShopifyUrl(href)) {
      var next = withUtm(href, slug);
      if (next !== a.getAttribute('href') && next !== href) {
        a.href = next;
        href = next;
      }
      track('shopify_outbound_click', { link_url: href });
      return;
    }

    if (a.hasAttribute('data-blog-cta') || (a.className && String(a.className).indexOf('blog-cta') !== -1)) {
      track('blog_cta_click', { link_url: href, cta_label: (a.textContent || '').trim().slice(0, 80) });
      return;
    }

    if (isInternalBlog(href) && a.pathname !== location.pathname) {
      track('blog_internal_link_click', { link_url: href });
    }
  }, true);

  // Language switcher (data-lang buttons / links)
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-lang], .lang-opt') : null;
    if (!el) return;
    var lang = el.getAttribute('data-lang') || (el.textContent || '').trim().toLowerCase();
    if (lang === 'es' || lang === 'en') {
      track('lang_switch', { language: lang });
    }
  }, true);

  // Snippet export for CMS / docs
  window.GA4_BLOG_SNIPPET_READY = true;
})();
