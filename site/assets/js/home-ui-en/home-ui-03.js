  if (!sections.length) return;

  const navLinks = Array.from(
    document.querySelectorAll('.nav-links a[href^="#"], #mobileMenu a[href^="#"]')
  ).filter(a => sectionIds.includes((a.getAttribute('href') || '').slice(1)));

  if (!navLinks.length) return;

  function setActive(id) {
    navLinks.forEach(a => {
      const match = a.getAttribute('href') === '#' + id;
      a.classList.toggle('nav-link-active', match);
      if (match) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  function headerOffset() {
    const header = document.querySelector('header');
    return (header ? header.offsetHeight : 64) + 24;
  }

  function updateSpy() {
    const line = headerOffset();
    let current = '';
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= line) {
        current = sections[i].id;
      }
    }
    setActive(current);
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateSpy();
      ticking = false;
    });
  }, { passive: true });

  navLinks.forEach(a => {
    a.addEventListener('click', () => {
      const id = (a.getAttribute('href') || '').slice(1);
      if (id) setActive(id);
    });
  });

  updateSpy();
});

/* ── Cifras del bloque de datos: cuentan desde 0 al entrar en pantalla ── */
(function () {
  const nums = document.querySelectorAll('.data-num[data-count]');
  if (!nums.length) return;
  const ease = t => 1 - Math.pow(1 - t, 3);
  const suffix = () => (document.documentElement.lang === 'en' ? '%' : ' %');
  const fmt = (v) => String(v) + suffix();

  function run(el) {
    if (el.dataset.countBusy === '1') return;
    const target = parseInt(el.getAttribute('data-count') || '0', 10);
    if (!isFinite(target)) return;
    el.dataset.countBusy = '1';
    el.dataset.countPlayed = '1';
    const dur = 1400, t0 = performance.now();
    el.textContent = fmt(0);
    const step = now => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = fmt(Math.round(target * ease(p)));
      if (p < 1) requestAnimationFrame(step);
      else {
        el.setAttribute('aria-label', fmt(target));
        el.dataset.countBusy = '0';
      }
    };
    requestAnimationFrame(step);
  }

  function tryRun(el) {
    if (el.dataset.countPlayed === '1') return;
    const host = el.closest('.fade-up') || el.closest('.data-card') || el;
    if (host.classList.contains('fade-up') && !host.classList.contains('visible')) return;
    run(el);
  }

  window.tukoDataCountSync = function () {
    nums.forEach(el => {
      const target = parseInt(el.getAttribute('data-count') || '0', 10);
      if (!isFinite(target)) return;
      if (el.dataset.countPlayed === '1') {
        el.textContent = fmt(target);
        el.setAttribute('aria-label', fmt(target));
      } else {
        el.textContent = fmt(0);
      }
    });
  };

  if (!('IntersectionObserver' in window)) {
    nums.forEach(run);
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target.classList.contains('data-num')
        ? e.target
        : e.target.querySelector('.data-num[data-count]');
      if (!el) return;
      const host = el.closest('.fade-up');
      if (host) host.classList.add('visible');
      tryRun(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  nums.forEach(el => {
    el.textContent = fmt(0);
    const host = el.closest('.fade-up') || el.closest('.data-card') || el;
    io.observe(host);
    host.addEventListener('tuko:visible', () => tryRun(el));
  });
})();

/* ── Calculadora de precios: coste mensual por plan según lo vendido con Tuko (tope aplicado) ── */
(function () {
  const range = document.getElementById('calcRange');
  const out = document.getElementById('calcSales');
  const wrap = document.getElementById('calcPlans');
  const calc = range ? range.closest('.calc') : null;
  if (!range || !out || !wrap || !calc) return;

  const PLANS = [
    { id: 'p1', fee: 0,     rate: 0.042, cap: 500 },
    { id: 'p2', fee: 14.99, rate: 0.025, cap: 400 },
    { id: 'p3', fee: 69.99, rate: 0.007, cap: 300 },
    { id: 'p4', fee: 169,   rate: 0,     cap: null }
  ];
  const dict = () => translations[document.documentElement.lang] || translations.es;
  const isEn = () => document.documentElement.lang === 'en';
  const money = v => {
    const n = Math.round(Number(v) * 100) / 100;
    const hasCents = Math.abs(n - Math.round(n)) > 0.001;
    const s = n.toLocaleString(isEn() ? 'en-US' : 'de-DE', {
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: 2
    });
    return isEn() ? '€' + s : s + ' €';
  };
  const pct = r => {
    const v = Math.round(r * 1000) / 10;
    const s = Number.isInteger(v) ? String(v) : String(v).replace('.', isEn() ? '.' : ',');
    return s + (isEn() ? '%' : ' %');
  };
  const tpl = (key, vars) => {
    let s = dict()[key] || '';
    Object.keys(vars || {}).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  };
  const planCost = (p, sales) => p.cap == null ? p.fee : p.fee + Math.min(sales * p.rate, p.cap);

  function render() {
    const sales = Number(range.value) || 0;
    const min = Number(range.min) || 0, max = Number(range.max) || 1;
    out.textContent = money(sales);
    range.style.setProperty('--p', (((sales - min) / (max - min)) * 100).toFixed(2) + '%');
    calc.querySelectorAll('[data-scale]').forEach(s => { s.textContent = money(Number(s.getAttribute('data-scale'))); });

    let best = null;
    const rows = PLANS.map(p => {
      const cost = planCost(p, sales);
      const capped = p.cap != null && sales * p.rate > p.cap;
      if (!best || cost < best.cost - 0.001) best = { id: p.id, cost };
      return { p, cost, capped };
    });
    const t = dict();
    rows.forEach(({ p, cost, capped }) => {
      const row = wrap.querySelector('[data-plan="' + p.id + '"]');
      if (!row) return;
      row.querySelector('[data-cost]').textContent = money(cost);
      const sub = row.querySelector('[data-sub]');
      if (p.cap == null) sub.textContent = tpl('calc_sub_flat', { fee: money(p.fee) });
      else if (capped) sub.textContent = tpl('calc_sub_capped', { cap: money(p.cap) });
      else if (sales === 0 && !p.fee) sub.textContent = t.calc_sub_zero || '';
      else if (!p.fee) sub.textContent = tpl('calc_sub_pct', { rate: pct(p.rate) });
      else sub.textContent = tpl('calc_sub_tpl', { fee: money(p.fee), rate: pct(p.rate) });
      row.classList.toggle('is-best', !!best && best.id === p.id);
    });
  }
  window.tukoCalcRender = render;
  range.addEventListener('input', render);
  render();
})();

/* ── Rescue móvil: las 3 tarjetas a la misma altura (la más alta) ── */
(function () {
  const fork = document.querySelector('#si-no-se-llena .rescue-fork');
  if (!fork) return;
  const mq = window.matchMedia('(max-width: 900px)');
  let timer = null;

  function equalize() {
    const cards = Array.from(fork.querySelectorAll('.rescue-card'));
    if (!cards.length) return;
    cards.forEach(c => c.style.removeProperty('--rescue-card-h'));
    if (!mq.matches) return;
    void fork.offsetHeight;
    let max = 0;
    cards.forEach(c => { max = Math.max(max, c.offsetHeight); });
    if (max > 0) cards.forEach(c => c.style.setProperty('--rescue-card-h', max + 'px'));
  }
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(equalize, 60);
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('load', schedule);
  if (mq.addEventListener) mq.addEventListener('change', schedule); else mq.addListener(schedule);
  document.addEventListener('tuko:langchange', schedule);
  schedule();
})();

/* ── CTA fija en móvil: visible tras el hero; se oculta al hacer scroll y reaparece a ~1,5s ── */
(function () {
  const bar = document.getElementById('stickyCta');
  const hero = document.querySelector('.hero');
  if (!bar || !hero || !('IntersectionObserver' in window)) return;
  const stops = [document.querySelector('.pricing'), document.querySelector('.final-cta-wrap'), document.querySelector('#solicitud'), document.querySelector('footer')].filter(Boolean);
  const mq = window.matchMedia('(max-width: 960px)');
  let heroIn = true;
  const inView = new Set();
  let scrolling = false;
  let idleTimer = null;

  function update() {
    const on = mq.matches && !heroIn && inView.size === 0 && !scrolling;
    bar.classList.toggle('is-on', on);
    bar.setAttribute('aria-hidden', on ? 'false' : 'true');
    if ('inert' in bar) bar.inert = !on;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.target === hero) heroIn = e.isIntersecting;
      else if (e.isIntersecting) inView.add(e.target);
      else inView.delete(e.target);
    });
    update();
  }, { threshold: 0.02 });
  io.observe(hero);
  stops.forEach(s => io.observe(s));

  window.addEventListener('scroll', function () {
    if (!mq.matches) return;
    scrolling = true;
    update();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      scrolling = false;
      update();
    }, 1500);
  }, { passive: true });

  if (mq.addEventListener) mq.addEventListener('change', update); else mq.addListener(update);
  update();
})();

/* ── Plan piloto: las tres peticiones se encienden de izquierda a derecha ── */
(function () {
  const grid = document.getElementById('pilotAsks');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.pilot-ask'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    cards.forEach(c => c.classList.add('is-lit'));
    return;
  }
  let timers = [];
  let lit = false;
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const io = new IntersectionObserver(entries => {
    const e = entries[entries.length - 1];
    if (e.isIntersecting && e.intersectionRatio >= 0.45) {
      if (lit) return;
      lit = true;
      cards.forEach((c, i) => timers.push(setTimeout(() => c.classList.add('is-lit'), 700 + i * 1200)));
    } else if (!e.isIntersecting) {
      lit = false;
      clear();
      cards.forEach(c => c.classList.remove('is-lit'));
    }
  }, { threshold: [0, 0.45] });
  io.observe(grid);
})();
