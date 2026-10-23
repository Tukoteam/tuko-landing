/* Nav de Inicio en las páginas que no son la home (Tuko AI, blog…): cápsula de cristal al bajar y píldora que se
   desliza entre enlaces (solo ratón). En la home lo hace home-hero.js. */
(function () {
  'use strict';
  var nav = document.querySelector('header > nav');
  /* Una sola vez aunque el script llegue por dos caminos (la página y main.js) */
  if (!nav || nav.hasAttribute('data-site-nav')) return;
  nav.setAttribute('data-site-nav', '');
  var sync = function () { nav.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', sync, { passive: true });
  sync();

  var links = nav.querySelector('.nav-links');
  if (!links || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var pill = document.createElement('li');
  pill.className = 'nav-hover-pill';
  pill.setAttribute('aria-hidden', 'true');
  pill.setAttribute('role', 'presentation');
  links.insertBefore(pill, links.firstChild);
  var pillOn = false;
  var hidePill = function () { pill.classList.remove('is-on'); pillOn = false; };
  var movePill = function (a) {
    var lr = links.getBoundingClientRect();
    var r = a.getBoundingClientRect();
    if (!pillOn) pill.classList.add('is-instant');
    pill.style.width = r.width + 'px';
    pill.style.transform = 'translateX(' + (r.left - lr.left) + 'px)';
    if (!pillOn) {
      void pill.offsetWidth;
      pill.classList.remove('is-instant');
    }
    pill.classList.add('is-on');
    pillOn = true;
  };
  Array.prototype.forEach.call(links.querySelectorAll('a'), function (a) {
    a.addEventListener('pointerenter', function () {
      if (a.classList.contains('nav-cta')) hidePill();
      else movePill(a);
    });
  });
  links.addEventListener('pointerleave', hidePill);
})();
