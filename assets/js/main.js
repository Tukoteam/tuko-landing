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

// Hero grid (only on landing page)
const heroCanvas = document.getElementById('heroCanvas');
if (heroCanvas) initGrid(heroCanvas, {
  speed: 0.62, horizonY: 0.50, lineWidth: 1.3,
  cols: 22, spread: 3.8, zoom: 1.4, fadeLen: 0.42,
  maxAlpha: 0.17, baseColor: '90,90,90', vpX: 0.50, lateral: 0.04
});

// CTA grid (only on landing page)
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

// Trigger hero immediately
setTimeout(() => {
  document.querySelectorAll('.hero .fade-up').forEach(el => el.classList.add('visible'));
}, 80);

/* ── SMOOTH SCROLL for nav ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── Hamburger (blog y páginas que incluyen #navHamburger / #mobileMenu) ── */
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  function toggleMenu(open) {
    hamburger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => {
    toggleMenu(!hamburger.classList.contains('open'));
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  document.addEventListener('click', e => {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      toggleMenu(false);
    }
  });
});
