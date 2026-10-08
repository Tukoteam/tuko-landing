      row.addEventListener('tuko:visible', function () {
        var r = stage.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        if (r.bottom > vh * 0.08 && r.top < vh * 0.92 && !onScreen) {
          onScreen = true;
          enter('walk');
          sync();
        } else if (onScreen) {
          sync();
        }
      });
    }
  }
  sync();

  var rz = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rz);
    rz = setTimeout(function () {
      measure();
      for (var j = 0; j < actors.length; j++) apply(actors[j]);
    }, 160);
  });

  if (mq.addEventListener) mq.addEventListener('change', sync);
  else if (mq.addListener) mq.addListener(sync);
})();


/* Arco del título: SVG que se dibuja (stroke), no se estira */
(function () {
  const ARC =
    '<svg class="hero-em-arc" viewBox="0 0 120 18" preserveAspectRatio="none" aria-hidden="true">' +
    '<path pathLength="1" d="M3 13 Q60 8 117 13" style="stroke-dasharray:1;stroke-dashoffset:1;opacity:0"/></svg>';

  window.tukoEnsureHeroEmArc = () => {
    document.querySelectorAll('.hero h1 em').forEach((em) => {
      if (em.querySelector('.hero-em-arc')) return;
      em.insertAdjacentHTML('beforeend', ARC);
    });
  };

  window.tukoEnsureHeroEmArc();
})();

(function () {
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  window.tukoHeroTitleRender = function (opts) {
    var h1 = document.querySelector('.hero-title');
    if (!h1 || typeof translations === 'undefined') return;
    var lang = document.documentElement.lang || 'es';
    var t = translations[lang] || translations.es;
    if (!t) return;
    if (h1.getAttribute('data-lang') === lang) return;

    var l1 = String(t.hero_title_l1 || '').split(/\s+/).filter(Boolean);
    var l2 = String(t.hero_title_l2 || '').split(/\s+/).filter(Boolean);
    var l3b = String(t.hero_title_l3_before || '').split(/\s+/).filter(Boolean);
    var accent = String(t.hero_title_accent || '');
    var l3a = String(t.hero_title_l3_after || '').split(/\s+/).filter(Boolean);
    var html = '';

    function word(text) {
      return '<span class="hero-word">' + esc(text) + '</span>';
    }

    function line(parts) {
      return '<span class="hero-line">' + parts.join('') + '</span>';
    }

    html += line(l1.map(word));
    html += line(l2.map(word));

    var third = l3b.map(word);
    var acc = '<span class="hero-accent">' + esc(accent);
    acc += '<span class="hero-accent-line" aria-hidden="true"><svg viewBox="0 0 120 14" preserveAspectRatio="none"><defs><linearGradient id="tukoHeroShineGrad" gradientUnits="userSpaceOnUse" x1="-120" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset="0.28" stop-color="#e8eeff" stop-opacity="0.05"/><stop offset="0.45" stop-color="#ffffff" stop-opacity="0.22"/><stop offset="0.5" stop-color="#ffffff" stop-opacity="0.42"/><stop offset="0.55" stop-color="#ffffff" stop-opacity="0.22"/><stop offset="0.72" stop-color="#e8eeff" stop-opacity="0.05"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient></defs><path class="hero-accent-base" d="M4 10.5 Q60 3.2 116 10.5"/><path class="hero-accent-glow" d="M4 10.5 Q60 3.2 116 10.5"/></svg></span>';
    acc += '</span>';
    third.push(acc);
    third = third.concat(l3a.map(word));
    html += line(third);

    h1.innerHTML = html;
    h1.setAttribute('data-lang', lang);
    if (typeof window.tukoHeroAccentShine === 'function') window.tukoHeroAccentShine();
  };
})();

(function () {
  var raf = 0;
  var glow = null;
  var grad = null;
  var start = 0;
  var SWEEP = 2800;
  var PAUSE = 2200;
  var BAND = 110;

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function bind() {
    var line = document.querySelector('.hero-accent-line');
    if (!line) return false;
    glow = line.querySelector('.hero-accent-glow');
    grad = line.querySelector('#tukoHeroShineGrad') || line.querySelector('linearGradient');
    return !!(glow && grad);
  }

  function frame(now) {
    if (!glow || !glow.isConnected || !grad || !grad.isConnected) {
      if (!bind()) { raf = 0; return; }
      start = now;
    }
    if (!start) start = now;
    var t = (now - start) % (SWEEP + PAUSE);
    if (t > SWEEP) {
      glow.style.opacity = '0';
      grad.setAttribute('x1', String(-BAND));
      grad.setAttribute('x2', '0');
    } else {
      var p = easeInOut(t / SWEEP);
      var x = -BAND + p * (120 + BAND * 2);
      var op = p < 0.2 ? p / 0.2 : p > 0.8 ? (1 - p) / 0.2 : 1;
      glow.style.opacity = String(0.72 * Math.max(0, Math.min(1, op)));
      grad.setAttribute('x1', String(x));
      grad.setAttribute('x2', String(x + BAND));
    }
    raf = window.requestAnimationFrame(frame);
  }

  window.tukoHeroAccentShine = function () {
    if (!bind()) return;
    glow.style.opacity = '0';
    grad.setAttribute('x1', String(-BAND));
    grad.setAttribute('x2', '0');
    start = 0;
    if (!raf) raf = window.requestAnimationFrame(frame);
  };

  /* Arranque + reintento por si el título se re-renderiza después */
  function boot() {
    window.tukoHeroAccentShine();
    window.setTimeout(window.tukoHeroAccentShine, 400);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

(function () {
  var GOAL = 10;
  var DISCOUNT = 20;
  var START = 2;
  var MAX_SHOW = 10;
  var VISIBLE = 6;
  var faces = [];
  document.querySelectorAll('[data-why-face]').forEach(function (el) {
    var idx = Number(el.getAttribute('data-why-face'));
    if (!isNaN(idx)) faces[idx] = el.innerHTML;
  });
  faces = faces.filter(Boolean).concat([
    '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#C4B5FD"/><path fill="#A78BFA" d="M9 18L7 1.5 18 13z"/><path fill="#A78BFA" d="M31 18L33 1.5 22 13z"/><path fill="#F5D0FE" d="M11 16L10 5 17 13z"/><path fill="#F5D0FE" d="M29 16L30 5 23 13z"/><circle cx="14.2" cy="21.2" r="1.85" fill="#3A2418"/><circle cx="25.8" cy="21.2" r="1.85" fill="#3A2418"/><circle cx="14.7" cy="20.7" r=".45" fill="#fff"/><circle cx="26.3" cy="20.7" r=".45" fill="#fff"/><ellipse cx="20" cy="25.4" rx="1.4" ry="1" fill="#FF9EC8"/><path d="M15 28c2.4 2.2 7.6 2.2 10 0" fill="none" stroke="#7C3AED" stroke-width="1.35" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#EDEDED"/><circle cx="10" cy="11" r="6.1" fill="#1A1A1A"/><circle cx="30" cy="11" r="6.1" fill="#1A1A1A"/><ellipse cx="13.4" cy="20.6" rx="4.1" ry="3.5" fill="#1A1A1A"/><ellipse cx="26.6" cy="20.6" rx="4.1" ry="3.5" fill="#1A1A1A"/><circle cx="13.4" cy="20.6" r="1.45" fill="#fff"/><circle cx="26.6" cy="20.6" r="1.45" fill="#fff"/><circle cx="13.7" cy="20.3" r=".7" fill="#1A1A1A"/><circle cx="26.9" cy="20.3" r=".7" fill="#1A1A1A"/><ellipse cx="20" cy="27.4" rx="5.4" ry="3.8" fill="#fff"/><ellipse cx="20" cy="25.8" rx="1.25" ry=".95" fill="#1A1A1A"/><path d="M16 29.2c1.8 1.35 6.2 1.35 8 0" fill="none" stroke="#1A1A1A" stroke-width="1.3" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#C68642"/><ellipse cx="7.2" cy="20" rx="5.3" ry="6.4" fill="#A96D33"/><ellipse cx="32.8" cy="20" rx="5.3" ry="6.4" fill="#A96D33"/><ellipse cx="7.2" cy="20" rx="3.1" ry="3.9" fill="#E8C4A0"/><ellipse cx="32.8" cy="20" rx="3.1" ry="3.9" fill="#E8C4A0"/><ellipse cx="20" cy="25.8" rx="8" ry="6.8" fill="#F2D2B0"/><circle cx="14.2" cy="20.2" r="1.85" fill="#3A2418"/><circle cx="25.8" cy="20.2" r="1.85" fill="#3A2418"/><circle cx="14.7" cy="19.7" r=".45" fill="#fff"/><circle cx="26.3" cy="19.7" r=".45" fill="#fff"/><ellipse cx="20" cy="24.7" rx="1.45" ry="1.1" fill="#3A2418"/><path d="M16 29.1c1.8 1.5 6.2 1.5 8 0" fill="none" stroke="#A96D33" stroke-width="1.3" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#5EC8B4"/><path fill="#3D50F2" d="M11.5 9L14.5 1.2 18.5 9.2z"/><path fill="#14C492" d="M17.6 7.2L20 0.6 23.2 7.4z"/><path fill="#3D50F2" d="M24.2 9L27.4 2 31 9.2z"/><circle cx="14" cy="20.2" r="1.85" fill="#1A2418"/><circle cx="26" cy="20.2" r="1.85" fill="#1A2418"/><circle cx="14.5" cy="19.7" r=".45" fill="#fff"/><circle cx="26.5" cy="19.7" r=".45" fill="#fff"/><path fill="#E8A54B" d="M16.6 24.4L20 30.6 23.4 24.4z"/><path d="M15 27.6c2.4 2.1 7.6 2.1 10 0" fill="none" stroke="#0E8A68" stroke-width="1.35" stroke-linecap="round"/></svg>'
  ]);
  var joined = 3;
  var wrap = document.getElementById('heroLiveAvatars');
  var line = document.getElementById('heroLiveLine');
  if (!wrap || !line) return;

  function faceCount(n) {
    return Math.max(START, Math.min(n, Math.min(MAX_SHOW, faces.length || MAX_SHOW)));
  }

  function popEl(el) {
    if (!el) return;
    el.classList.remove('is-pop');
    void el.offsetWidth;
    el.classList.add('is-pop');
  }

  function setLine(n, animate) {
    var t = (typeof translations !== 'undefined' && (translations[document.documentElement.lang] || translations.es)) || {};
    var left = GOAL - n;
    var next;
    if (left === 0) {
      next = String(t.hero_live_full || 'Grupo completo · −{discount} % para todos').replace('{discount}', String(DISCOUNT));
    } else {
      next = String(t.hero_live_tpl || '{n} de {goal} ya en el grupo')
        .replace('{n}', String(n))
        .replace('{goal}', String(GOAL));
    }
    if (line.textContent !== next) {
      line.textContent = next;
      if (animate) popEl(line);
    }
    line.classList.toggle('is-full', left === 0);
  }

  function addAvatar(i, animate) {
    var el = document.createElement('span');
    el.className = 'hero-live-avat';
    el.innerHTML = faces[i % (faces.length || 1)] || '';
    wrap.appendChild(el);
    if (animate) popEl(el);
  }

  function render(opts) {
    var instant = !!(opts && opts.instant);
    var n = Math.min(joined, GOAL);
    var count = faceCount(n);
    var current = wrap.querySelectorAll('.hero-live-avat').length;
    var resetting = count < current;
    var i;

    if (resetting) {
      wrap.textContent = '';
      wrap.classList.remove('is-full');
      wrap.classList.remove('is-clipped');
      current = 0;
    }

    for (i = current; i < count; i++) addAvatar(i, !instant && !resetting);
    wrap.classList.toggle('is-clipped', wrap.querySelectorAll('.hero-live-avat').length > VISIBLE);

    if (n >= GOAL && !instant) {
      wrap.classList.remove('is-full');
      void wrap.offsetWidth;
      wrap.classList.add('is-full');
    } else if (n < GOAL) {
      wrap.classList.remove('is-full');
      if (!instant && !resetting && current === count) {
        popEl(wrap.querySelector('.hero-live-avat:last-child'));
      }
    }

    setLine(n, !instant);
  }

  window.tukoHeroLiveRender = function () {
    setLine(Math.min(joined, GOAL), false);
  };
  render({ instant: true });

  /* Siempre activo: en Windows “preferir menos movimiento” lo dejaba congelado en 3/10 */
  setInterval(function () {
    joined = joined >= GOAL ? START : joined + 1;
    render();
  }, 2600);
})();

/* ── SMOOTH SCROLL for nav (rAF: fluido aunque Windows reduzca animaciones) ── */
(function () {
  let animFrame = 0;
  let cancelUser = null;

  const getHeaderOffset = () => {
    const nav = document.querySelector('nav');
    const h = nav ? nav.getBoundingClientRect().height : 64;
    return Math.ceil(h + 12);
  };

  const jumpTo = (y) => {
    try {
      window.scrollTo({ top: y, left: 0, behavior: 'instant' });
    } catch (e) {
      window.scrollTo(0, y);
    }
  };

  const stopAnim = () => {
    if (animFrame) cancelAnimationFrame(animFrame);
    animFrame = 0;
    if (cancelUser) {
      cancelUser();
      cancelUser = null;
    }
  };

  /* Scroll propio: no usa behavior:'smooth' (Chrome lo anula con reduced-motion) */
  const animateScrollTo = (targetY, duration) => {
    stopAnim();
    const startY = window.scrollY;
    const dist = targetY - startY;
    if (Math.abs(dist) < 2) {
      jumpTo(targetY);
      return;
    }
    const ms = duration || Math.min(1150, Math.max(480, Math.abs(dist) * 0.45));
    const t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const onUserScroll = () => stopAnim();
    window.addEventListener('wheel', onUserScroll, { passive: true, once: true });
    window.addEventListener('touchstart', onUserScroll, { passive: true, once: true });
    window.addEventListener('keydown', onUserScroll, { once: true });
    cancelUser = () => {
      window.removeEventListener('wheel', onUserScroll);
      window.removeEventListener('touchstart', onUserScroll);
      window.removeEventListener('keydown', onUserScroll);
    };

    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      jumpTo(startY + dist * ease(t));
      if (t < 1) {
        animFrame = requestAnimationFrame(step);
      } else {
        animFrame = 0;
        if (cancelUser) {
          cancelUser();
          cancelUser = null;
        }
      }
    };
    animFrame = requestAnimationFrame(step);
  };

  const scrollToId = (hash, smooth) => {
    if (!hash || hash === '#') return false;
    const target = document.querySelector(hash);
    if (!target) return false;
    const top = Math.max(
      0,
      window.scrollY + target.getBoundingClientRect().top - getHeaderOffset()
    );
    if (smooth) animateScrollTo(top);
    else {
      stopAnim();
      jumpTo(top);
    }
    return true;
  };

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const hash = a.getAttribute('href');
      if (!hash || hash === '#' || hash === '#main-content') {
        if (hash === '#main-content' && scrollToId(hash, true)) e.preventDefault();
        return;
      }
      if (scrollToId(hash, true)) {
        e.preventDefault();
        if (location.hash) history.replaceState(null, '', location.pathname + location.search);
        const menu = document.getElementById('mobileMenu');
        const burger = document.getElementById('navHamburger');
        const scrim = document.getElementById('mobileMenuScrim');
        if (menu) menu.classList.remove('open');
        if (scrim) {
          scrim.classList.remove('open');
          scrim.setAttribute('aria-hidden', 'true');
        }
        if (burger) {
          burger.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
      }
    });
  });

  /* Restauración manual: recargar vuelve arriba, atrás/adelante recupera la posición, #ancla desde fuera baja a su sección */
  const scrollKey = 'tukoScroll:' + location.pathname;
  window.addEventListener('pagehide', () => {
    try { sessionStorage.setItem(scrollKey, String(Math.round(window.scrollY))); } catch (e) {}
  });
  const navType = window.__tukoNavType;
  if (navType === 'reload') jumpTo(0);
  window.addEventListener('load', () => {
    if (navType === 'reload') {
      stopAnim();
      jumpTo(0);
      return;
    }
    if (navType === 'back_forward') {
      let saved = null;
      try { saved = sessionStorage.getItem(scrollKey); } catch (e) {}
      if (saved !== null) {
        requestAnimationFrame(() => jumpTo(+saved || 0));
        return;
      }
    }
    if (location.hash) {
      requestAnimationFrame(() => scrollToId(location.hash, false));
    }
  });
})();
