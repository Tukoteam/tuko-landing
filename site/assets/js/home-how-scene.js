/* Cómo funciona (Inicio): escena en 3D que avanza con el scroll, hacia delante y hacia atrás.
   Todo lo que se ve en las pantallas es la interfaz real de Tuko:
   antes de 0 (la sección entra) el portátil se abre;
   01 (0–0,25) la cámara se acerca a la pantalla: en la app de Tuko en Shopify, el asistente «Publicar grupo»
      (Empezar → Grupo: producto, 2 personas, 15 %, 24 h → Apariencia: tema claro → Publicar → «Sí, activar grupo»);
   02 (0,25–0,5) la pantalla pasa a la tienda y entra el móvil de Lucía: pulsa «Precio grupal», entra por 68,00 €,
      «Pago completado», «Ya estás dentro» (1 de 2, el reloj corre) y abre la hoja de compartir;
   03 (0,5–0,75) elige WhatsApp: el enlace vuela al móvil de Marta, lo abre, entra y el grupo se cierra (2 de 2);
   04 (0,75–1) los móviles se van y la cámara vuelve a la pantalla: en Estadísticas suben los grupos exitosos, las personas, los ingresos y el gráfico.
   Con el ratón la cámara se inclina un poco. Siempre animado; el scroll de la página no se toca, la escena solo lo sigue.
   En móvil no hay 3D: un aparato cada vez (el asistente, el móvil de Lucía, el de Marta, las estadísticas), grande y
   solo con opacidad y desplazamiento. Se mueven a .cm los mismos elementos; las pantallas cambian igual en los dos. */
(function () {
  'use strict';

  var sec = document.querySelector('.cs');
  if (!sec) return;
  var $ = function (s, r) { return (r || sec).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || sec).querySelectorAll(s)); };

  var track = $('.cs-track');
  var stage = $('.cs-stage');
  var world = $('.cs-world');
  var steps = $$('.cs-step');
  var countN = $('.cs-count-n'), mprog = $$('.cs-mprog i'), stepsList = $('.cs-steps');
  var COLORS = ['#4257ff', '#2f72ee', '#1898bd', '#0fa87c'];

  var laptop = $('.cs-laptop'), lid = $('.cs-lid'), dim = $('.cs-dim');
  var glares = $$('.cs-glare');
  var urls = {}; $$('.cs-url-x').forEach(function (u) { urls[u.getAttribute('data-v')] = u; });
  var views = {}; $$('.cs-view').forEach(function (v) { views[v.getAttribute('data-view')] = v; });

  /* El asistente real */
  var wz = $('.cs-wiz'), cursor = $('.cs-cursor');
  var intro = $('.intro', wz), btnStart = $('.btn-start', wz);
  var panels = $$('.panel', wz), stepItems = $$('.step-item', wz), bars = $$('.step-bar', wz);
  var bIc = $('.info-ic', wz), bTitle = $('.info-title', wz), bSub = $('.info-sub', wz);
  var btnBack = $('.btn-back', wz), btnNext = $('.btn-primary', wz), btnLabel = $('.btn-primary > span', wz);
  var product = $('.product-card', wz), disc = $('.input.strong span', wz), hint = $('.hint', wz);
  var themes = $$('.theme-card', wz), storeBtn = $('.store-btn', wz), textIn = $('.input.placeholder span', wz), meta = $('.summary-meta', wz);
  var confirmOv = $('.confirm-overlay', wz), confirmBox = $('.confirm-box', wz), btnYes = $('.btn-yes', wz);
  var EN = document.documentElement.lang === 'en';
  var TX = EN ? {
    banner: [
      ['Set up your purchase group', 'Choose the product, the people, the discount and the time.'],
      ['Here you can customize your button', 'Choose theme, colors and text — changes apply only to this product.'],
      ['Review and publish in your store', 'Check that everything is correct before activating the group.']
    ],
    hint: function (d, price) { return 'With 2 people, the discount will be ' + d + '% · Final price ' + price; },
    next: 'Continue', publish: 'Publish now',
    btnLight: 'Group price €68.00', btnDark: 'Buy it for €68.00',
    meta: function (light) { return '2 people · 24 h · ' + (light ? 'Light theme' : 'Dark theme'); },
    typing: 'typing…', online: 'online'
  } : {
    banner: [
      ['Configura tu grupo de compra', 'Elige el producto, las personas, el descuento y el tiempo.'],
      ['Aquí puedes personalizar tu botón', 'Elige tema, colores y texto — los cambios aplican solo a este producto.'],
      ['Revisa y publica en tu tienda', 'Comprueba que todo está correcto antes de activar el grupo.']
    ],
    hint: function (d, price) { return 'Con 2 personas, el descuento será del ' + d + '% · Precio final ' + price; },
    next: 'Continuar', publish: 'Publicar ahora',
    btnLight: 'Precio grupal 68,00 €', btnDark: 'Cómpralo por 68,00€',
    meta: function (light) { return '2 personas · 24 h · ' + (light ? 'Tema claro' : 'Tema oscuro'); },
    typing: 'escribiendo…', online: 'en línea'
  };
  var BANNER = TX.banner;

  /* Los grupos y pedidos (04) */
  var kpis = $$('.cs-kpi'), kv = kpis.map(function (k) { return $('.cs-kv', k); }), chart = $('.cs-chart'), barNow = $('.cs-bar--now'), cbars = $$('.cs-bar:not(.cs-bar--now)');
  var HIST = [3, 5, 6, 8, 9]; /* grupos exitosos de mayo a septiembre */

  /* Los móviles con la interfaz real */
  var phA = $('.cs-phone--a'), phB = $('.cs-phone--b');
  var hgA = $('.cs-hg', phA), hgB = $('.cs-hg', phB);
  var shA = $('.cs-shadow--a'), shB = $('.cs-shadow--b');
  var odo = function (hg, k) { return $('.hg-odo[data-odo="' + k + '"]', hg); };
  var oA = { n: odo(hgA, 'n'), h: odo(hgA, 'h'), m: odo(hgA, 'm'), s: odo(hgA, 's') };
  var oB = { n: odo(hgB, 'n'), h: odo(hgB, 'h'), m: odo(hgB, 'm'), s: odo(hgB, 's') };
  var tukoA = $('.hg-btn--tuko', hgA), ctaA = $('.hg-cta', hgA), waNet = $('.hg-net--wa', hgA), ctaB = $('.hg-cta', hgB);
  var touchA = $('.cs-touch', phA), touchB = $('.cs-touch', phB);
  var chat = $('.cs-pv--chat'), waSt = $('.cs-wa-st'), bubble = $('.cs-bubble'), preview = $('.cs-preview');
  var fly = $('.cs-fly'), trail = $$('.cs-trail i');

  /* Móvil ligero: sus huecos y lo que se mueve a ellos (y de vuelta al pasar a escritorio) */
  var cm = $('.cm'), cmWin = $('.cm-win'), cmPa = $('.cm-pa'), cmPb = $('.cm-pb'), cmStat = $('.cm-stat');
  var cmWizBody = $('.cm-body--wiz'), stContent = $('.cs-st');
  var MOVES = [[wz, cmWizBody], [stContent, $('.cm-body--stat')], [hgA, cmPa], [hgB, cmPb]].map(function (m) {
    return { el: m[0], to: m[1], home: m[0].parentNode, next: m[0].nextSibling };
  });
  var placedMobile = false;
  var place = function (mobile) {
    if (mobile === placedMobile) return;
    MOVES.forEach(function (m) { if (mobile) m.to.appendChild(m.el); else m.home.insertBefore(m.el, m.next); });
    placedMobile = mobile;
    spots.clear();
  };

  /* Tramo local 0…1 de [a, b], con curva suave */
  var seg = function (p, a, b) { return Math.max(0, Math.min(1, (p - a) / (b - a))); };
  var ease = function (u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
  var lerp = function (a, b, u) { return a + (b - a) * u; };
  var on = function (el, v, cls) { el.classList.toggle(cls || 'is-on', !!v); };
  var within = function (p, a, b) { return p >= a && p < b; };
  var euro = function (n) { return EN ? '€' + n.toFixed(2) : n.toFixed(2).replace('.', ',') + ' €'; };
  /* Con separador de miles: 5.304,00 € */
  var euroK = function (n) {
    var t = n.toFixed(2).split('.');
    return EN ? '€' + t[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + t[1] : t[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + t[1] + ' €';
  };
  var two = function (n) { return (n < 10 ? '0' : '') + n; };
  var setText = function (el, t) { if (el.textContent !== t) el.textContent = t; };

  /* Gestos que se lanzan al cruzar su momento hacia delante (la onda, el clic) */
  var lastP = null;
  var crossed = function (p, t) { return lastP !== null && lastP < t && p >= t; };
  var replay = function (el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  /* Centro (px) de un elemento dentro de un contenedor, sin contar transformaciones; root null = su .hg-screen */
  var spots = new Map();
  var spotIn = function (el, root, k) {
    if (!spots.has(el)) {
      var x = el.offsetWidth / 2, y = el.offsetHeight / 2, n = el;
      while (n && n !== root && !(root === null && n.classList.contains('hg-screen'))) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      spots.set(el, { x: x, y: y });
    }
    var s = spots.get(el);
    return { x: s.x * (k || 1), y: s.y * (k || 1) };
  };
  /* Dentro de la pantalla del portátil: lo del asistente va reducido (0,67) desde su esquina */
  var WK = 0.67, wScroll = 0, mainApp = $('.cs-main--app');
  var inAdmin = function (el) {
    var w = spotIn(wz, views.admin);
    var q = spotIn(el, wz, WK);
    return { x: w.x - wz.offsetWidth / 2 + q.x, y: w.y - wz.offsetHeight / 2 + q.y - wScroll };
  };
  /* El asistente es más alto que la pantalla: como en la app de verdad, baja hasta el botón antes de pulsarlo
     y vuelve arriba al cambiar de paso */
  var wizScroll = function (p) {
    var max = Math.max(0, wz.offsetHeight * WK + 18 - mainApp.offsetHeight);
    var e = function (a, b) { return ease(seg(p, a, b)); };
    var u = p < 0.116 ? e(0.094, 0.104) : p < 0.16 ? Math.max(1 - e(0.116, 0.122), e(0.142, 0.15)) : Math.max(1 - e(0.16, 0.166), e(0.17, 0.18));
    return u * max;
  };

  /* El dedo: se posa sobre lo que se va a pulsar, aprieta en el momento y se va */
  var touch = function (dot, el, p, at) {
    var o = seg(p, at - 0.022, at - 0.008) * (1 - seg(p, at + 0.006, at + 0.02));
    dot.style.opacity = o.toFixed(3);
    if (o <= 0) return;
    var q = spotIn(el, null), press = p >= at && p < at + 0.012;
    dot.style.transform = 'translate(' + q.x.toFixed(1) + 'px,' + (q.y + 3).toFixed(1) + 'px) scale(' + (press ? 0.72 : 1 + (1 - seg(p, at - 0.022, at - 0.008)) * 0.5).toFixed(3) + ')';
  };

  /* ── La cámara: escala, desplazamiento (px del mundo) y giro, por tramos ── */
  var CAM = [
    { p: -0.25, s: 0.8, tx: 0, ty: 20, rx: -26, ry: -12 },
    { p: -0.03, s: 0.98, tx: 0, ty: 40, rx: -11, ry: -5 },
    { p: 0.05, s: 1.3, tx: 0, ty: 142, rx: -4, ry: -3 },   /* cerca de la pantalla */
    { p: 0.23, s: 1.3, tx: 0, ty: 142, rx: -3, ry: 3 },
    { p: 0.31, s: 0.98, tx: -20, ty: 34, rx: -9, ry: -10 }, /* se aleja y gira hacia Lucía */
    { p: 0.47, s: 1.02, tx: -36, ty: 36, rx: -8, ry: -7 },
    { p: 0.55, s: 0.92, tx: 0, ty: 26, rx: -10, ry: 3 },    /* plano abierto: las dos */
    { p: 0.73, s: 0.94, tx: 0, ty: 26, rx: -9, ry: -2 },
    { p: 0.81, s: 1.27, tx: 0, ty: 138, rx: -4, ry: 3 },    /* de vuelta a la pantalla */
    { p: 1.0, s: 1.25, tx: 0, ty: 136, rx: -5, ry: -3 }
  ];
  var camAt = function (p) {
    if (p <= CAM[0].p) return CAM[0];
    for (var i = 1; i < CAM.length; i++) {
      if (p <= CAM[i].p) {
        var a = CAM[i - 1], b = CAM[i], u = ease(seg(p, a.p, b.p));
        return { s: lerp(a.s, b.s, u), tx: lerp(a.tx, b.tx, u), ty: lerp(a.ty, b.ty, u), rx: lerp(a.rx, b.rx, u), ry: lerp(a.ry, b.ry, u) };
      }
    }
    return CAM[CAM.length - 1];
  };

  /* El cursor del asistente: qué pulsa y cuándo (llega antes y se queda hasta el clic) */
  var CUR = [
    { p: 0.012, el: btnStart, dx: 70, dy: 50 },
    { p: 0.026, el: btnStart, click: 0.03 },
    { p: 0.05, el: product },
    { p: 0.062, el: disc },
    { p: 0.098, el: disc },
    { p: 0.106, el: btnNext, click: 0.113 },
    { p: 0.132, el: themes[0], click: 0.138 },
    { p: 0.152, el: btnNext, click: 0.158 },
    { p: 0.18, el: btnNext, click: 0.192 },
    { p: 0.206, el: btnYes, click: 0.212 },
    { p: 0.24, el: btnYes }
  ];
  var curPos = function (k) { var q = inAdmin(k.el); return { x: q.x + (k.dx || 0), y: q.y + (k.dy || 0) }; };
  var cursorAt = function (p) {
    if (p <= CUR[0].p) return curPos(CUR[0]);
    for (var i = 1; i < CUR.length; i++) {
      if (p <= CUR[i].p) {
        var a = curPos(CUR[i - 1]), b = curPos(CUR[i]), u = ease(seg(p, CUR[i - 1].p, CUR[i].p));
        return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) };
      }
    }
    return curPos(CUR[CUR.length - 1]);
  };

  /* El vuelo del enlace: del botón de WhatsApp de Lucía al chat de Marta, en arco y por delante de los dos */
  var arc = function (u, F, T) {
    var M = { x: (F.x + T.x) / 2, y: Math.min(F.y, T.y) - 230, z: 340 };
    var v = 1 - u;
    return {
      x: v * v * F.x + 2 * v * u * M.x + u * u * T.x,
      y: v * v * F.y + 2 * v * u * M.y + u * u * T.y,
      z: v * v * F.z + 2 * v * u * M.z + u * u * T.z
    };
  };
  /* Esquina de la pantalla de cada móvil en el mundo (el marco mide un 2,8 % del ancho) */
  var phoneOrigin = function (ph) { return { x: ph.offsetLeft + 5.3, y: ph.offsetTop + 5.3 }; };

  var K = 1, MOBILE = false;
  var mouse = { x: 0, y: 0, cx: 0, cy: 0 };

  /* ── Móvil: qué aparato se ve en cada momento (solo opacidad y desplazamiento, sin 3D) ── */
  var CMW = 375;
  var slot = function (el, op, x, y, sc) {
    el.style.opacity = op.toFixed(3);
    /* El que no se ve, oculto del todo: el móvil no lo pinta */
    el.style.visibility = op > 0.002 ? 'visible' : 'hidden';
    el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + sc.toFixed(3) + ')';
  };
  var layoutMobile = function (p) {
    var e = function (a, b) { return ease(seg(p, a, b)); };
    /* 01 · El asistente */
    var wOut = e(0.235, 0.27);
    slot(cmWin, 1 - wOut, 0, -wOut * 24, 1 - wOut * 0.04);
    /* 02-03 · Lucía entra; al compartir se desliza a la izquierda (el enlace «se va» con ella) y vuelve en pequeño para el «2 de 2» */
    var aIn = e(0.25, 0.29), away = e(0.5, 0.545), back = e(0.68, 0.71), out = e(0.75, 0.785);
    var aX = p < 0.68 ? -1.15 * CMW * away : lerp(-1.15 * CMW, -0.26 * CMW, back);
    var aOp = (p < 0.68 ? aIn * (1 - away) : back) * (1 - out);
    slot(cmPa, aOp, aX, (1 - aIn) * 40 - out * 20, p < 0.68 ? 1 : lerp(1, 0.6, back));
    /* Marta entra desde la derecha y, al cerrarse el grupo, se coloca a la derecha de Lucía */
    var bIn = e(0.5, 0.545);
    slot(cmPb, bIn * (1 - out), lerp(1.15 * CMW, 0, bIn) + 0.26 * CMW * back, -out * 20, lerp(1, 0.6, back));
    /* 04 · Estadísticas */
    var sIn = e(0.77, 0.81);
    slot(cmStat, sIn, 0, (1 - sIn) * 30, 0.97 + sIn * 0.03);
  };

  /* La línea que une los pasos (escritorio): se mide al cambiar de tamaño o de paso, no en cada fotograma */
  var measureRail = function () {
    if (MOBILE) return;
    var lastHead = steps[3].querySelector('.cs-head');
    stepsList.style.setProperty('--rh', Math.max(0, steps[3].offsetTop + lastHead.offsetTop + lastHead.offsetHeight / 2 - 28) + 'px');
  };

  var render = function (p) {
    var pp = Math.max(0, p);

    if (!MOBILE) {
      /* ── Cámara ── */
      var c = camAt(p);
      var ry = c.ry + mouse.cx * 3.2, rx = c.rx - mouse.cy * 2;
      /* Sin zoom extra en móvil: con la perspectiva, los móviles (delante) ya se ven más grandes y se saldrían por los lados */
      /* En móvil, los planos cerca del portátil (01 y 04) un poco más lejos: si no, el portátil se sale por los lados */
      var s = c.s * K * (MOBILE ? 1 - 0.18 * seg(c.s, 0.95, 1.3) : 1);
      world.style.transform = 'perspective(1900px) translate3d(' + (c.tx * s).toFixed(1) + 'px,' + (c.ty * s).toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ') rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
      glares.forEach(function (g) { g.style.setProperty('--gx', (50 - ry * 4).toFixed(1) + '%'); });
  
      /* ── El portátil: se abre al entrar y se queda un poco atrás mientras mandan los móviles ── */
      /* Se abre justo cuando la sección se queda fija (un poco tarde: se ve el gesto) */
      var open = ease(seg(p, -0.12, 0.015));
      lid.style.transform = 'rotateX(' + ((1 - open) * -90).toFixed(2) + 'deg)';
      var back = ease(seg(p, 0.25, 0.31)) * (1 - ease(seg(p, 0.75, 0.81)));
      laptop.style.transform = 'translate3d(0,0,' + (back * -90).toFixed(1) + 'px)';
      dim.style.opacity = (back * 0.28).toFixed(3);
  
      /* Qué se ve en la pantalla: la app → la tienda → los grupos */
      var toStore = ease(seg(p, 0.25, 0.3)), toOrders = ease(seg(p, 0.76, 0.8));
      var vA = 1 - toStore, vS = toStore * (1 - toOrders), vO = toOrders;
      views.admin.style.opacity = vA.toFixed(3);
      views.store.style.opacity = vS.toFixed(3);
      views.orders.style.opacity = vO.toFixed(3);
      urls.admin.style.opacity = vA.toFixed(3);
      urls.store.style.opacity = vS.toFixed(3);
      urls.orders.style.opacity = vO.toFixed(3);
  
    }
    /* ── 01 · El asistente «Publicar grupo» ── */
    var S = p < 0.032 ? 0 : p < 0.116 ? 1 : p < 0.16 ? 2 : 3;
    var St = Math.max(1, S);
    on(intro, S > 0, 'is-hidden');
    panels.forEach(function (pn, i) { on(pn, St === i + 1, 'active'); on(pn, St > i + 1, 'exit-left'); });
    stepItems.forEach(function (st, i) { on(st, St === i + 1, 'active'); on(st, St > i + 1, 'done'); });
    bars.forEach(function (b, i) { on(b, St > i + 1, 'filled'); });
    bIc.setAttribute('data-ic', String(St));
    setText(bTitle, BANNER[St - 1][0]);
    setText(bSub, BANNER[St - 1][1]);
    on(btnBack, St <= 1, 'hidden');
    setText(btnLabel, St === 3 ? TX.publish : TX.next);
    var d = Math.round(ease(seg(p, 0.066, 0.096)) * 15);
    setText(disc, String(d));
    setText(hint, TX.hint(d, euro(80 - 80 * d / 100)));
    var light = p >= 0.138;
    on(themes[0], light, 'selected');
    on(themes[1], !light, 'selected');
    on(storeBtn, light, 'cs-light');
    setText(storeBtn, light ? TX.btnLight : TX.btnDark);
    setText(textIn, light ? TX.btnLight : TX.btnDark);
    setText(meta, TX.meta(light));
    on(btnStart, within(p, 0.03, 0.036), 'pressed');
    on(btnNext, within(p, 0.113, 0.119) || within(p, 0.158, 0.164) || within(p, 0.192, 0.198), 'pressed');
    on(btnYes, within(p, 0.212, 0.218), 'pressed');
    on(confirmOv, within(p, 0.197, 0.27), 'visible');
    on(confirmBox, p >= 0.218, 'is-success');

    if (!MOBILE) {
      wScroll = wizScroll(p);
      wz.style.transform = 'translateY(' + (-wScroll).toFixed(1) + 'px) scale(' + WK + ')';
      var cu = cursorAt(pp);
      cursor.style.opacity = (seg(p, 0.014, 0.024) * (1 - seg(p, 0.235, 0.25))).toFixed(3);
      cursor.style.transform = 'translate(' + cu.x.toFixed(1) + 'px,' + cu.y.toFixed(1) + 'px)';
      CUR.forEach(function (k) { if (k.click && crossed(p, k.click)) replay(cursor, 'is-click'); });
  
    }
    /* ── 02 · Lucía: «Precio grupal» → entra → pago completado → dentro → compartir ── */
    if (!MOBILE) {
      var aU = ease(seg(p, 0.27, 0.34)), aOut = ease(seg(p, 0.75, 0.81));
      phA.style.opacity = (aU * (1 - aOut)).toFixed(3);
      phA.style.transform = 'translate3d(' + (aOut * 90).toFixed(1) + 'px,' + ((1 - aU) * 180 + aOut * 40).toFixed(1) + 'px,' + (175 + (1 - aU) * 140).toFixed(1) + 'px) rotateY(' + (-14 - (1 - aU) * 24).toFixed(2) + 'deg) rotateX(' + ((1 - aU) * 18).toFixed(2) + 'deg)';
      shA.style.opacity = (aU * (1 - aOut) * 0.9).toFixed(3);
    }
    var joined = p >= 0.415, full = p >= 0.68;
    on(hgA, within(p, 0.328, 0.345), 'is-call');
    on(hgA, within(p, 0.345, 0.356), 'is-tap');
    on(hgA, p >= 0.352, 'is-fsp');
    on(hgA, within(p, 0.383, 0.392), 'is-cta');
    on(hgA, within(p, 0.392, 0.415), 'is-modal');
    on(hgA, within(p, 0.392, 0.415), 'is-ok');
    on(hgA, joined, 'is-joined');
    on(hgA, within(p, 0.443, 0.452), 'is-share');
    on(hgA, within(p, 0.452, 0.6), 'is-ss');
    on(waNet, within(p, 0.47, 0.53), 'cs-pick');
    hgA.setAttribute('data-step', full ? '3' : '0');

    /* El reloj corre desde que Lucía entra hasta que se cierra el grupo */
    var left = joined ? 86400 - Math.floor(seg(p, 0.415, 0.68) * 7380) : 86400;
    var hh = two(Math.floor(left / 3600)), mm = two(Math.floor(left % 3600 / 60)), ss = two(left % 60);
    [oA, oB].forEach(function (o) { setText(o.h, hh); setText(o.m, mm); setText(o.s, ss); });
    setText(oA.n, full ? '2' : joined ? '1' : '0');
    setText(oB.n, full ? '2' : '1');

    /* ── 03 · El enlace vuela a Marta, lo abre, entra y se cierra el grupo ── */
    if (!MOBILE) {
      var bU = ease(seg(p, 0.46, 0.52)), bOut = ease(seg(p, 0.75, 0.81));
      phB.style.opacity = (bU * (1 - bOut)).toFixed(3);
      phB.style.transform = 'translate3d(' + (-bOut * 90).toFixed(1) + 'px,' + ((1 - bU) * 180 + bOut * 40).toFixed(1) + 'px,' + (175 + (1 - bU) * 140).toFixed(1) + 'px) rotateY(' + (14 + (1 - bU) * 24).toFixed(2) + 'deg) rotateX(' + ((1 - bU) * 18).toFixed(2) + 'deg)';
      shB.style.opacity = (bU * (1 - bOut) * 0.9).toFixed(3);
  
      var f = seg(p, 0.505, 0.585), fe = ease(f);
      var oa = phoneOrigin(phA), ob = phoneOrigin(phB);
      var wq = spotIn(waNet, null), bq = spotIn(bubble, null);
      var F = { x: oa.x + wq.x, y: oa.y + wq.y, z: 205 }, T = { x: ob.x + bq.x, y: ob.y + bq.y, z: 215 };
      var at = arc(fe, F, T);
      /* Nace pequeña sobre el botón de WhatsApp, crece en el aire y se encoge al llegar al chat (donde aparece el mensaje) */
      var vis = f > 0 && f < 1 ? Math.min(1, f / 0.1) * Math.min(1, (1 - f) / 0.12) : 0;
      var sc = lerp(0.45, 1.06, ease(seg(f, 0, 0.4))) - 0.22 * ease(seg(f, 0.7, 1));
      fly.style.opacity = vis.toFixed(3);
      fly.style.transform = 'translate3d(' + (at.x - 88).toFixed(1) + 'px,' + (at.y - 22).toFixed(1) + 'px,' + at.z.toFixed(1) + 'px) rotateY(' + ((0.5 - fe) * 26).toFixed(1) + 'deg) rotateZ(' + ((0.5 - fe) * -7).toFixed(1) + 'deg) scale(' + sc.toFixed(3) + ')';
      trail.forEach(function (t, i) {
        var tu = Math.max(0, fe - (i + 1) * 0.035);
        var tp = arc(tu, F, T);
        t.style.opacity = (f > 0 && f < 1 && tu > 0 ? vis * (1 - i / trail.length) * 0.9 : 0).toFixed(3);
        t.style.transform = 'translate3d(' + tp.x.toFixed(1) + 'px,' + tp.y.toFixed(1) + 'px,' + tp.z.toFixed(1) + 'px) scale(' + (1 - i / trail.length * 0.7).toFixed(3) + ')';
      });
  
    }
    var opened = p >= 0.635;
    on(chat, !opened);
    on(bubble, p >= 0.582);
    /* Mientras el enlace vuela, Lucía «escribe» en el chat de Marta */
    setText(waSt, within(p, 0.52, 0.582) ? TX.typing : TX.online);
    if (crossed(p, 0.62)) replay(preview, 'is-tap');
    on(hgB, opened, 'is-fsp');
    on(hgB, within(p, 0.655, 0.665), 'is-cta');
    on(hgB, full, 'is-joined');
    hgB.setAttribute('data-step', full ? '3' : '0');
    [phA, phB, hgA, hgB].forEach(function (el) { on(el, within(p, 0.68, 0.74), 'is-win'); });

    /* El dedo de cada móvil */
    if (p < 0.37) touch(touchA, tukoA, p, 0.345);
    else if (p < 0.42) touch(touchA, ctaA, p, 0.383);
    else if (p < 0.47) touch(touchA, ctaA, p, 0.443);
    else touch(touchA, waNet, p, 0.5);
    if (p < 0.637) touch(touchB, preview, p, 0.62);
    else touch(touchB, ctaB, p, 0.655);

    /* ── 04 · Estadísticas: entran las tarjetas y el grupo cerrado sube los números y el gráfico ── */
    kpis.forEach(function (k, i) { on(k, p >= 0.8 + i * 0.012); });
    on(chart, p >= 0.83);
    /* Los meses anteriores ya tenían grupos: las barras crecen al aparecer y la de octubre sube un grupo más (7 → 8) */
    cbars.forEach(function (b, i) { b.style.setProperty('--bh', (0.02 + 0.98 * HIST[i] / 10 * ease(seg(p, 0.835 + i * 0.008, 0.875 + i * 0.008))).toFixed(3)); });
    var gain = ease(seg(p, 0.9, 0.95));
    barNow.style.setProperty('--bh', (0.02 + 0.98 * (7 + gain) / 10 * ease(seg(p, 0.875, 0.915))).toFixed(3));
    barNow.style.setProperty('--tipo', seg(p, 0.93, 0.96).toFixed(3));
    /* Y las tarjetas suman ese grupo: 38 → 39 exitosos, 76 → 78 personas, +136,00 € y la tasa sube un punto */
    var won = p >= 0.9;
    setText(kv[1], won ? '39' : '38');
    setText(kv[2], String(76 + Math.round(ease(seg(p, 0.9, 0.93)) * 2)));
    setText(kv[3], euroK(5168 + 136 * ease(seg(p, 0.905, 0.94))));
    setText(kv[4], (won ? 91 : 90) + '%');
    on(kpis[1], within(p, 0.9, 0.94), 'is-hot');
    on(kpis[2], within(p, 0.905, 0.945), 'is-hot');
    on(kpis[3], within(p, 0.91, 0.95), 'is-hot');
    on(kpis[4], within(p, 0.915, 0.955), 'is-hot');

    /* ── Pasos y color ── */
    var active = Math.max(0, Math.min(3, Math.floor(pp * 4)));
    steps.forEach(function (st, i) {
      st.classList.toggle('is-on', i === active);
      st.style.setProperty('--sp', seg(p, i / 4, (i + 1) / 4).toFixed(3));
    });
    setText(countN, '0' + (active + 1));
    mprog.forEach(function (g, i) { g.style.setProperty('--sp', seg(p, i / 4, (i + 1) / 4).toFixed(3)); });
    stepsList.style.setProperty('--tp', Math.min(1, pp / 0.75).toFixed(4));
    sec.style.setProperty('--cc', COLORS[active]);
    if (MOBILE) layoutMobile(p);
    lastP = p;
  };

  /* Escritorio: el mundo (900×600) se escala para caber en el escenario.
     Móvil: los elementos pasan a .cm y se dimensionan para caber (el móvil de verdad en alto, el asistente en ancho) */
  var fit = function () {
    spots.clear();
    MOBILE = window.matchMedia('(max-width: 900px)').matches;
    place(MOBILE);
    var side = $('.cs-side');
    stepsList.style.setProperty('--steps-h', MOBILE ? Math.max.apply(null, steps.map(function (st) { return st.offsetHeight; })) + 'px' : '');
    sec.style.setProperty('--card-h', MOBILE ? (side.offsetHeight + 16) + 'px' : '');
    sec.style.setProperty('--card-top', MOBILE ? '0px' : '');
    if (MOBILE) {
      CMW = cm.clientWidth;
      var cmH = cm.clientHeight;
      sec.style.setProperty('--cm-pw', Math.round(Math.min(CMW * 0.64, (cmH - 12) * 9 / 19.3)) + 'px');
      var cardW = Math.min(CMW - 28, 440);
      wz.style.transform = 'none';
      var mk = Math.min(cardW / 400, (cmH - 30 - 8) / wz.offsetHeight);
      wz.style.transform = 'scale(' + mk.toFixed(4) + ')';
      /* La tarjeta mide justo lo que el asistente reducido: sin huecos a los lados */
      wz.style.left = '0px';
      cmWin.firstElementChild.style.width = Math.floor(400 * mk) + 'px';
      sec.style.setProperty('--wiz-h', Math.round(wz.offsetHeight * mk) + 'px');
      /* Las estadísticas, si no caben en alto, se reducen un poco */
      var statCard = cmStat.firstElementChild;
      statCard.style.transform = '';
      var sh = statCard.offsetHeight;
      statCard.style.transform = sh > cmH - 8 ? 'scale(' + ((cmH - 8) / sh).toFixed(4) + ')' : '';
    } else {
      wz.style.left = '';
      K = Math.min(stage.clientWidth / 900, stage.clientHeight / 600);
    }
    measureRail();
  };

  /* Avance del scroll y ratón, suavizados (sin tirones) */
  var target = 0, cur = null, raf = 0;
  var read = function () {
    var r = track.getBoundingClientRect();
    target = Math.max(-0.25, Math.min(1, -r.top / Math.max(1, r.height - window.innerHeight)));
  };
  var loop = function () {
    raf = 0;
    if (cur === null) cur = target;
    /* En móvil sigue al dedo más de cerca (el scroll táctil ya viene suavizado) */
    cur += (target - cur) * (MOBILE ? 0.32 : 0.14);
    if (Math.abs(target - cur) < 0.0004) cur = target;
    mouse.cx += (mouse.x - mouse.cx) * 0.08;
    mouse.cy += (mouse.y - mouse.cy) * 0.08;
    var still = Math.abs(mouse.x - mouse.cx) < 0.002 && Math.abs(mouse.y - mouse.cy) < 0.002;
    render(cur);
    if (cur !== target || !still) raf = requestAnimationFrame(loop);
  };
  var kick = function () { read(); if (!raf) raf = requestAnimationFrame(loop); };

  /* Pulsar un paso lleva a su tramo (scroll normal y suave) */
  steps.forEach(function (st, i) {
    st.querySelector('.cs-head').addEventListener('click', function () {
      var r = track.getBoundingClientRect();
      var range = r.height - window.innerHeight;
      window.scrollTo({ top: window.scrollY + r.top + range * (i / 4 + 0.2), behavior: 'smooth' });
    });
  });

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    sec.addEventListener('pointermove', function (e) {
      mouse.x = e.clientX / window.innerWidth * 2 - 1;
      mouse.y = e.clientY / window.innerHeight * 2 - 1;
      kick();
    });
    sec.addEventListener('pointerleave', function () { mouse.x = 0; mouse.y = 0; kick(); });
  }

  /* La línea de los pasos se vuelve a medir cuando termina de abrirse o cerrarse una descripción */
  stepsList.addEventListener('transitionend', function () { measureRail(); });
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', function () { fit(); kick(); });
  /* Las medidas dependen de las fuentes: se vuelven a tomar cuando han cargado */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { spots.clear(); kick(); });
  fit();
  kick();
})();
