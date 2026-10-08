/* ── ANIMATED PERSPECTIVE GRID ── */
function initGrid(canvas, opts) {
  const ctx = canvas.getContext('2d');
  let W, H, raf;
  let offset = 0, sideOff = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const speed   = opts.speed   !== undefined ? opts.speed   : 0.62;
    const cols    = opts.cols    !== undefined ? opts.cols    : 22;
    const spread  = opts.spread  !== undefined ? opts.spread  : 3.8;
    const zoom    = opts.zoom    !== undefined ? opts.zoom    : 1.4;
    const fadeLen = opts.fadeLen !== undefined ? opts.fadeLen : 0.42;
    const maxAlpha= opts.maxAlpha!== undefined ? opts.maxAlpha: 0.17;
    const base    = opts.baseColor || '90,90,90';
    const lateral = opts.lateral !== undefined ? opts.lateral : 0;
    const vpX     = opts.vpX    !== undefined ? opts.vpX * W : W / 2;
    const horizonY= opts.horizonY!== undefined ? opts.horizonY: 0.50;

    const horizonPx = horizonY * H;
    const floorH    = H - horizonPx;
    const lw        = opts.lineWidth !== undefined ? opts.lineWidth : 1.3;
    const halfW     = W * (1 + spread) / 2;

    // Advance offsets
    offset  = (offset  + speed * 0.004) % 1.0;
    sideOff = ((sideOff + lateral * speed * 0.004) % 1 + 1) % 1;

    const tileW = W * (1 + spread) / cols;

    // ── HORIZONTAL LINES ──
    const rowCount = Math.ceil(1 / Math.max(0.01, 1 - fadeLen)) + 2;
    for (let r = 0; r < rowCount; r++) {
      const frac = (r + offset) / rowCount;
      if (frac < 0 || frac > 1) continue;

      const depth  = zoom / Math.max(0.001, frac);
      const screenY = horizonPx + (floorH * zoom) / depth;
      if (screenY < horizonPx || screenY > H + 10) continue;

      const t       = (screenY - horizonPx) / Math.max(1, floorH);
      const alpha   = t < fadeLen ? (t / fadeLen) * maxAlpha : maxAlpha * (1 - (t - fadeLen) / (1 - fadeLen + 0.001));
      if (alpha <= 0) continue;

      const xShift = sideOff * tileW * t;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${base},${alpha.toFixed(3)})`;
      ctx.lineWidth = lw;
      ctx.moveTo(vpX - halfW + xShift, screenY);
      ctx.lineTo(vpX + halfW + xShift, screenY);
      ctx.stroke();
    }

    // ── VERTICAL LINES ──
    const cStart = Math.floor(-sideOff * cols) - 1;
    for (let c = cStart; c <= cStart + cols + 2; c++) {
      const p       = c / cols + sideOff;
      const xBottom = vpX + (p - 0.5) * W * (1 + spread);

      const grad = ctx.createLinearGradient(vpX, horizonPx, xBottom, H + 40);
      grad.addColorStop(0,          `rgba(${base},0)`);
      grad.addColorStop(fadeLen,    `rgba(${base},${maxAlpha})`);
      grad.addColorStop(1,          `rgba(${base},0)`);

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth   = lw;
      ctx.moveTo(vpX, horizonPx);
      ctx.lineTo(xBottom, H + 40);
      ctx.stroke();
    }

    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); });
  resize();
  draw();

  return { stop: () => cancelAnimationFrame(raf) };
}

// Hero grid
const heroCanvas = document.getElementById('heroCanvas');
initGrid(heroCanvas, {
  speed: 0.72, horizonY: 0.50, lineWidth: 1.3,
  cols: 22, spread: 3.8, zoom: 1.4, fadeLen: 0.42,
  maxAlpha: 0.17, baseColor: '90,90,90', vpX: 0.50, lateral: 0.04
});

// CTA grid (el formulario vive ahora en tuko-ai: aquí puede no existir)
const ctaCanvas = document.getElementById('ctaCanvas');
if (ctaCanvas) initGrid(ctaCanvas, {
  speed: 0.62, horizonY: 0.50, lineWidth: 1.3,
  cols: 22, spread: 3.8, zoom: 1.4, fadeLen: 0.42,
  maxAlpha: 0.17, baseColor: '255,255,255', vpX: 0.50, lateral: 0.04
});

/* ── SCROLL FADE-UP ── */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08 });

document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));

/* Tarjeta del hero: volteo con squash, sombra y rebote corto */
(function () {
  const flip = document.getElementById('tkFlip');
  if (!flip) return;
  const stack = flip.querySelector('.tk-flip-stack') || flip.querySelector('.tk-flip-inner');
  const inner = flip.querySelector('.tk-flip-inner');
  if (!stack || !inner) return;

  flip.setAttribute('role', 'button');
  flip.setAttribute('tabindex', '0');
  flip.setAttribute('aria-pressed', 'false');

  let flipped = false;
  let busy = false;
  const HALF = 320; /* ~640 ms total */

  const easeIn = (t) => t * t * t;
  /* easeOutBack: abre un pelín de más y asienta (rebote corto) */
  const easeOutBack = (t) => {
    const c1 = 1.55;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };

  const setState = (next) => {
    flipped = next;
    flip.classList.toggle('is-flipped', flipped);
    flip.setAttribute('aria-pressed', flipped ? 'true' : 'false');
  };

  /* Transform en el stack: placas + carta squash juntas (si no, las placas se quedan y se ve roto) */
  const paint = (sx, edge) => {
    const sy = 1 - 0.045 * edge; /* scaleY ~0.955 en el canto */
    const shadowY = 8 + 14 * (1 - edge);
    const shadowBlur = 18 + 28 * (1 - edge);
    const shadowAlpha = 0.06 + 0.12 * (1 - edge);
    stack.style.transform = 'scaleX(' + sx.toFixed(4) + ') scaleY(' + sy.toFixed(4) + ')';
    stack.style.filter =
      'drop-shadow(0 ' + shadowY.toFixed(1) + 'px ' + shadowBlur.toFixed(1) +
      'px rgba(20,24,38,' + shadowAlpha.toFixed(3) + '))';
  };

  const animateScale = (fromX, toX, duration, ease, closing) =>
    new Promise((resolve) => {
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / duration);
        const e = ease(p);
        const sx = fromX + (toX - fromX) * e;
        const edge = closing ? e : 1 - Math.min(e, 1);
        paint(Math.max(sx, 0.02), Math.min(Math.max(edge, 0), 1));
        if (p < 1) requestAnimationFrame(step);
        else {
          paint(Math.max(toX, 0.02), closing ? 1 : 0);
          resolve();
        }
      };
      requestAnimationFrame(step);
    });

  const toggle = async () => {
    if (busy) return;
    busy = true;
    const next = !flipped;

    await animateScale(1, 0.02, HALF, easeIn, true);
    setState(next);
    await animateScale(0.02, 1, HALF, easeOutBack, false);

    stack.style.transform = '';
    stack.style.filter = '';
    busy = false;
  };

  flip.addEventListener('click', (e) => {
    e.preventDefault();
    toggle();
  });
  flip.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });
})();

/* Cuenta atrás del popup del hero (siempre activa; reinicia al llegar a cero) */
(function () {
  const timer = document.getElementById('tkTimer');
  if (!timer) return;
  const out = {
    d: timer.querySelector('[data-tk="d"]'),
    h: timer.querySelector('[data-tk="h"]'),
    m: timer.querySelector('[data-tk="m"]'),
    s: timer.querySelector('[data-tk="s"]')
  };
  if (!out.d || !out.h || !out.m || !out.s) return;
  const START = 2 * 24 * 60 * 60; /* 2 días — plazo de campaña más realista */
  let left = START;
  const pad = n => String(n).padStart(2, '0');
  const tick = () => {
    if (left < 0) left = START;
    out.d.textContent = pad(Math.floor(left / 86400));
    out.h.textContent = pad(Math.floor(left / 3600) % 24);
    out.m.textContent = pad(Math.floor(left / 60) % 60);
    out.s.textContent = pad(left % 60);
    left--;
  };
  tick();
  setInterval(tick, 1000);
})();

/* Avatares: 4 perfiles máx. → luego círculo gris +1, +2, +3 (barra y contador al unísono) */
(function () {
  const faces = Array.from(document.querySelectorAll('#tkAvatars [data-tk-av]'));
  const moreEl = document.getElementById('tkAvMore');
  const joinedEl = document.getElementById('tkJoinedN');
  const needEl = document.getElementById('tkNeedN');
  const pctEl = document.getElementById('tkPct');
  const barEl = document.getElementById('tkBarFill');
  if (!faces.length || !joinedEl || !pctEl || !barEl) return;

  const productEl = document.getElementById('tkProduct');
  const newPriceEl = document.getElementById('tkNewPrice');
  const offEl = document.getElementById('tkOff');
  const dealEl = document.getElementById('tkDealPrice');
  const ctaEl = document.getElementById('tkCtaLabel');
  const joinedLabelEl = document.getElementById('tkJoinedLabel');
  const tierEls = Array.from(document.querySelectorAll('#tkTiers [data-tk-tier]'));
  const END = 16;
  const MAX_FACES = 4;
  const BAR_MS = 640;
  const TIERS = [
    { at: 10, priceEs: '25,20 €', priceEn: '€25.20', off: '–10%' },
    { at: 20, priceEs: '22,96 €', priceEn: '€22.96', off: '–18%' }
  ];
  const CAP = TIERS[TIERS.length - 1].at; /* tope fijo de la barra: siempre /20 */
  let joined = 0;
  let barFrom = 0;
  let barAnim = null;
  let lastWasBurst = false;
  let discountAt = 0;

  const isEn = () => document.documentElement.lang === 'en';
  const tierPrice = (t) => (isEn() ? t.priceEn : t.priceEs);
  const nextTier = () => {
    for (let i = 0; i < TIERS.length; i++) {
      if (joined < TIERS[i].at) return TIERS[i];
    }
    return TIERS[TIERS.length - 1];
  };

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  /* Ritmo irregular: a veces casi seguido, a veces una pausa */
  const nextDelay = () => {
    const r = Math.random();
    if (!lastWasBurst && r < 0.30) {
      lastWasBurst = true;
      return 90 + Math.random() * 110;  /* dos casi al instante */
    }
    lastWasBurst = false;
    if (r < 0.55) return 240 + Math.random() * 160;
    if (r < 0.82) return 380 + Math.random() * 200;
    return 620 + Math.random() * 280;   /* pausa corta */
  };

  /* Barra: se “dibuja” frame a frame hasta el % objetivo */
  const drawBarTo = (targetPct) => {
    if (barAnim) cancelAnimationFrame(barAnim);
    const from = parseFloat(barEl.style.width) || barFrom;
    const to = targetPct;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / BAR_MS);
      const v = from + (to - from) * easeOut(p);
      barEl.style.width = v.toFixed(2) + '%';
      if (p < 1) {
        barAnim = requestAnimationFrame(step);
      } else {
        barFrom = to;
        barEl.style.width = to + '%';
        barAnim = null;
      }
    };
    barAnim = requestAnimationFrame(step);
  };

  const syncBackTiers = () => {
    tierEls.forEach((el) => {
      el.classList.toggle('is-on', joined >= Number(el.dataset.tkTier));
    });
  };

  const syncGoalCopy = () => {
    const next = nextTier();
    const goal = next.at;
    const price = tierPrice(next);
    const need = Math.max(0, goal - joined);
    if (needEl) needEl.textContent = String(need);
    if (dealEl) dealEl.textContent = price;
    if (ctaEl) {
      ctaEl.textContent = isEn() ? ('Drop it to ' + price) : ('Bájalo a ' + price);
    }
    if (joinedLabelEl) {
      joinedLabelEl.textContent = isEn()
        ? (' of ' + CAP + ' units reserved')
        : (' de ' + CAP + ' unidades reservadas');
    }
    return { goal, price };
  };

  const syncProductDiscount = () => {
    if (!productEl || !newPriceEl || !offEl) return;
    let next = 0;
    for (let i = 0; i < TIERS.length; i++) {
      if (joined >= TIERS[i].at) next = TIERS[i].at;
    }
    if (next <= discountAt) {
      if (discountAt > 0) {
        const cur = TIERS.find((t) => t.at === discountAt);
        if (cur) newPriceEl.textContent = tierPrice(cur);
      }
      syncBackTiers();
      return;
    }
    const tier = TIERS.find((t) => t.at === next);
    const upgrading = discountAt > 0;
    discountAt = next;
    newPriceEl.textContent = tierPrice(tier);
    offEl.textContent = tier.off;

    if (!upgrading) {
      productEl.classList.add('is-discounted');
    } else {
      productEl.classList.remove('is-tier-bump', 'is-ready');
      void productEl.offsetWidth;
      productEl.classList.add('is-tier-bump');
      requestAnimationFrame(() => productEl.classList.add('is-ready'));
    }
    syncBackTiers();
  };

  const paint = () => {
    const showFaces = Math.min(joined, MAX_FACES);
    const extra = Math.max(0, joined - MAX_FACES);

    faces.forEach((av, i) => {
      const shouldShow = i < showFaces;
      const wasIn = av.classList.contains('is-in');
      if (shouldShow && !wasIn) {
        av.classList.remove('is-in');
        void av.offsetWidth;
        av.classList.add('is-in');
      } else if (!shouldShow) {
        av.classList.remove('is-in');
      }
    });

    if (moreEl) {
      if (extra > 0) {
        const firstShow = !moreEl.classList.contains('is-in');
        moreEl.textContent = '+' + extra;
        if (firstShow) {
          void moreEl.offsetWidth;
          moreEl.classList.add('is-in');
        }
      } else {
        moreEl.classList.remove('is-in');
        moreEl.textContent = '+0';
      }
    }

    joinedEl.textContent = String(joined);
    syncGoalCopy();
    const pct = Math.round((joined / CAP) * 100);
    pctEl.textContent = pct + '%';
    drawBarTo(pct);
    syncProductDiscount();
  };

  paint();
  window.tukoSyncWidgetGoals = paint;

  const joinNext = () => {
    if (joined >= END) return;
    joined += 1;
    paint();
    if (joined < END) setTimeout(joinNext, nextDelay());
  };

  setTimeout(joinNext, 360);
})();

/* Vídeo: sustituye el poster por el iframe de YouTube al hacer clic */
(function () {
  const box = document.getElementById('tukoVideo');
  if (!box) return;

  const ytEmbedUrl = (id, autoplay) => {
    const origin = (location.protocol === 'http:' || location.protocol === 'https:')
      ? '&origin=' + encodeURIComponent(location.origin)
      : '';
    return 'https://www.youtube.com/embed/' + id +
      '?rel=0&modestbranding=1&playsinline=1' +
      (autoplay ? '&autoplay=1' : '') + origin;
  };

  const load = () => {
    const id = box.dataset.ytId;
    if (!id || id === 'REEMPLAZAR_ID_YOUTUBE' || box.classList.contains('is-playing')) return;
    const iframe = document.createElement('iframe');
    iframe.src = ytEmbedUrl(id, true);
    iframe.title = 'Tuko';
    iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.setAttribute('allowfullscreen', '');
    iframe.allowFullscreen = true;
    box.innerHTML = '';
    box.appendChild(iframe);
    box.classList.add('is-playing');
    box.removeAttribute('role');
    box.removeAttribute('tabindex');
  };
  box.addEventListener('click', load);
  box.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); load(); }
  });

  window.tukoYtEmbedUrl = ytEmbedUrl;
})();

// Trigger hero immediately
setTimeout(() => {
  document.querySelectorAll('.hero .fade-up').forEach(el => el.classList.add('visible'));
}, 80);

/* Contadores del hero: +50 y +30.000 € suben al aparecer */
(function () {
  const nums = document.querySelectorAll('.hero-stat-num');
  if (!nums.length) return;

  let started = false;
  let finished = false;

  const formatStat = (el, value) => {
    const type = el.dataset.countType;
    const lang = document.documentElement.lang === 'en' ? 'en' : 'es';
    const n = Math.round(value);
    if (type === 'money') {
      if (lang === 'en') return '+€' + n.toLocaleString('en-US');
      return '+' + n.toLocaleString('es-ES') + ' €';
    }
    return '+' + n.toLocaleString(lang === 'en' ? 'en-US' : 'es-ES');
  };

  const animateOne = (el) => {
    const target = Number(el.dataset.count) || 0;
    const duration = target >= 1000 ? 2200 : 1600;
    el.textContent = formatStat(el, 0);
    const t0 = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      el.textContent = formatStat(el, target * easeOut(p));
      if (p < 1) requestAnimationFrame(step);
      else {
        el.textContent = formatStat(el, target);
        finished = true;
      }
    };
    requestAnimationFrame(step);
  };

  const start = () => {
    if (started) return;
    started = true;
    nums.forEach((el) => { el.textContent = formatStat(el, 0); });
    nums.forEach(animateOne);
  };

  /* Solo reformatea idioma cuando el conteo ya terminó (no corta la animación) */
  window.tukoRefreshHeroStats = () => {
    if (!finished) return;
    nums.forEach((el) => {
      el.textContent = formatStat(el, Number(el.dataset.count) || 0);
    });
  };

  /* Arranca ~0,5 s después del fade del hero (delay d4) */
  setTimeout(start, 520);
})();

/* Arco del título: SVG que se dibuja (stroke), no se estira */
(function () {
  const ARC =
    '<svg class="hero-em-arc" viewBox="0 0 120 18" preserveAspectRatio="none" aria-hidden="true">' +
    '<path pathLength="1" d="M3 12 Q60 2 117 12" style="stroke-dasharray:1;stroke-dashoffset:1;opacity:0"/></svg>';

  window.tukoEnsureHeroEmArc = () => {
    document.querySelectorAll('.hero h1 em').forEach((em) => {
      if (em.querySelector('.hero-em-arc')) return;
      em.insertAdjacentHTML('beforeend', ARC);
    });
  };

  window.tukoEnsureHeroEmArc();
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
      window.scrollTo(0, targetY);
      return;
    }
    const ms = duration || Math.min(900, Math.max(420, Math.abs(dist) * 0.45));
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);

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
      window.scrollTo(0, startY + dist * ease(t));
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
      window.scrollTo(0, top);
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
        history.pushState(null, '', hash);
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

  /* Si se entra con #en-la-url (Chrome a veces ignora scroll-padding) */
  window.addEventListener('load', () => {
    if (location.hash) {
      requestAnimationFrame(() => scrollToId(location.hash, false));
    }
  });
})();
