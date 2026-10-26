/* Hero de la home (ES y EN): nav de cristal, aurora WebGL «dos luces» y widget de Tuko en vivo.
   Azul = quien compra primero; verde = quien se une. Al cargar se encuentran detrás de «compran.». */
(function () {
  'use strict';

  /* Siempre animado, también con «menos movimiento»: decisión de producto (ver home-07-nav-hero.css) */

  var fineMq = window.matchMedia('(hover: hover) and (pointer: fine)');
  var root = document.documentElement;

  /* Curvas de la hoja de estilos (--ease-out, --ease-in-out) para lo que anima JS */
  function bezier(x1, y1, x2, y2) {
    function at(t, p1, p2) { return ((1 - 3 * p2 + 3 * p1) * t * t + (3 * p2 - 6 * p1) * t + 3 * p1) * t; }
    function slope(t, p1, p2) { return 3 * (1 - 3 * p2 + 3 * p1) * t * t + 2 * (3 * p2 - 6 * p1) * t + 3 * p1; }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x;
      for (var i = 0; i < 8; i++) {
        var s = slope(t, x1, x2);
        if (Math.abs(s) < 1e-6) break;
        t -= (at(t, x1, x2) - x) / s;
      }
      return at(Math.min(1, Math.max(0, t)), y1, y2);
    };
  }
  var easeInOut = bezier(0.77, 0, 0.175, 1);

  /* ── NAV: cápsula de cristal al hacer scroll ── */
  var nav = document.querySelector('header > nav');
  if (nav) {
    var navTicking = false;
    var syncNav = function () {
      navTicking = false;
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', function () {
      if (navTicking) return;
      navTicking = true;
      window.requestAnimationFrame(syncNav);
    }, { passive: true });
    syncNav();
  }

  /* ── NAV: píldora que se desliza entre enlaces (solo ratón) ── */
  var links = document.querySelector('.nav-links');
  if (links && fineMq.matches) {
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
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('pointerenter', function () {
        if (a.classList.contains('nav-cta')) hidePill();
        else movePill(a);
      });
    });
    links.addEventListener('pointerleave', hidePill);
  }

  var hero = document.querySelector('.hero');
  if (!hero) return;

  /* ── AURORA ── */
  initAurora(hero, document.getElementById('heroAurora'));

  function initAurora(hero, canvas) {
    if (!canvas) return null;
    var gl = null;
    try {
      gl = canvas.getContext('webgl', {
        alpha: true, premultipliedAlpha: true, antialias: false,
        depth: false, stencil: false, powerPreference: 'low-power'
      });
    } catch (e) { gl = null; }
    if (!gl) { hero.classList.add('is-static'); return null; }

    var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var FS = [
      '#ifdef GL_FRAGMENT_PRECISION_HIGH',
      'precision highp float;',
      '#else',
      'precision mediump float;',
      '#endif',
      'uniform float uTime, uMerge, uPulse, uDark, uU, uW;',
      'uniform vec2 uMeet, uMouse;',
      'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
      'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
      '  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}',
      'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*noise(p);p=p*2.03+7.1;a*=.5;}return v;}',
      'void main(){',
      '  vec2 p=gl_FragCoord.xy; float t=uTime;',
      '  vec2 n=p/uU;',
      '  vec2 w=vec2(fbm(n*.9+vec2(0.,t*.05)),fbm(n*.9+vec2(5.2,-t*.04)))-.5;',
      '  vec2 q=p+w*uU*.5;',
      /* Libres: azul arriba a la izquierda, verde a la derecha */
      '  vec2 a0=uMeet+vec2(-uW*.30,uU*.62)+uU*.12*vec2(sin(t*.13),cos(t*.11));',
      '  vec2 b0=uMeet+vec2(uW*.30,uU*.18)+uU*.12*vec2(cos(t*.12),sin(t*.15));',
      /* Juntas: orbitan una alrededor de la otra, detrás del titular */
      '  float g=t*.22;',
      '  vec2 orb=vec2(cos(g)*uW*(.19+.03*sin(t*.31)),sin(g)*uU*.24);',
      '  vec2 lift=vec2(0.,uU*.16);',
      '  vec2 a=mix(a0,uMeet+lift+orb,uMerge)+uMouse*uU*vec2(.26,.14);',
      '  vec2 b=mix(b0,uMeet+lift-orb,uMerge)-uMouse*uU*vec2(.16,.09);',
      '  vec2 da=(q-a)/(uU*1.05), db=(q-b)/uU;',
      '  float fa=exp(-dot(da,da)*1.5), fb=exp(-dot(db,db)*1.6), core=fa*fb;',
      '  vec3 cA=vec3(.259,.341,1.), cB=vec3(.078,.769,.573);',
      '  float ia=fa*mix(.30,.74,uDark), ib=fb*mix(.40,.70,uDark);',
      '  float ic=core*(mix(.45,1.05,uDark)+uPulse*.7);',
      '  vec3 cC=mix(mix(cA,cB,.5),vec3(.82,.95,1.),.3+.3*uDark);',
      '  float s=ia+ib+ic+1e-4;',
      '  vec3 col=(cA*ia+cB*ib+cC*ic)/s;',
      '  float al=clamp(s,0.,mix(.58,.9,uDark));',
      '  al*=smoothstep(0.,uU*1.3,p.y);',
      '  al+=(hash(p+fract(t)*61.)-.5)*.008;',
      '  al=clamp(al,0.,1.);',
      '  gl_FragColor=vec4(col*al,al);',
      '}'
    ].join('\n');

    function shader(type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
    }
    var vs = shader(gl.VERTEX_SHADER, VS);
    var fs = shader(gl.FRAGMENT_SHADER, FS);
    var prog = gl.createProgram();
    if (vs && fs) {
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
    }
    if (!vs || !fs || !gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      hero.classList.add('is-static');
      return null;
    }
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var u = {};
    ['uTime', 'uMerge', 'uPulse', 'uDark', 'uU', 'uW', 'uMeet', 'uMouse'].forEach(function (k) {
      u[k] = gl.getUniformLocation(prog, k);
    });

    var SCALE = 0.5; /* luz difusa: media resolución basta y ahorra GPU */
    var time = Math.random() * 40;
    /* data-calm: las luces ya empiezan juntas y el destello es suave (sin cambio brusco al entrar) */
    var calm = canvas.hasAttribute('data-calm');
    var merge = calm ? 1 : 0;
    var mergeFrom = 0;
    var mergeAt = 0;
    var MERGE_DELAY = 620;
    var MERGE_DUR = 1700;
    var pulse = 0;
    /* La cabecera es un escenario oscuro en los dos modos: la luz se pinta siempre en su versión de oscuro */
    var dark = 1;
    var meet = [0, 0];
    var unit = 1;
    var mouse = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
    var raf = 0;
    var last = 0;
    var started = 0;
    var inView = true;
    var ready = false;

    function measure() {
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.max(1, Math.round(w * SCALE));
      canvas.height = Math.max(1, Math.round(h * SCALE));
      gl.viewport(0, 0, canvas.width, canvas.height);
      unit = Math.min(window.innerHeight || h, 980) * 0.5 * SCALE;
      var cr = canvas.getBoundingClientRect();
      /* data-meet: elemento en cuyo centro se encuentran las luces (p. ej. el móvil) */
      var target = canvas.getAttribute('data-meet') && hero.querySelector(canvas.getAttribute('data-meet'));
      if (target) {
        var mr = target.getBoundingClientRect();
        meet[0] = (mr.left + mr.width / 2 - cr.left) * SCALE;
        meet[1] = (cr.bottom - (mr.top + mr.height * 0.42)) * SCALE;
        return;
      }
      var acc = hero.querySelector('.hero-accent') || hero.querySelector('.hero-title');
      var r = acc ? acc.getBoundingClientRect() : cr;
      var title = hero.querySelector('.hero-title');
      var tr = title ? title.getBoundingClientRect() : r;
      /* Punto de encuentro: centro del titular en X, a la altura de «compran.» */
      meet[0] = (tr.left + tr.width / 2 - cr.left) * SCALE;
      meet[1] = (cr.bottom - (r.top + r.height * 0.5)) * SCALE;
    }

    function frame(now) {
      raf = 0;
      if (!last) last = now;
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!started) started = now;

      time += dt;

      if (merge < 1) {
        if (!mergeAt) mergeAt = started + MERGE_DELAY;
        var k = (now - mergeAt) / MERGE_DUR;
        merge = k <= 0 ? mergeFrom : mergeFrom + (1 - mergeFrom) * easeInOut(Math.min(1, k));
      }

      pulse *= Math.exp(-dt * 1.4);

      var darkTarget = 1;
      dark += (darkTarget - dark) * Math.min(1, dt * 5);

      /* Muelle crítico: el ratón tira de las luces con inercia */
      var K = 28;
      var C = 2 * Math.sqrt(K);
      mouse.vx += ((mouse.tx - mouse.x) * K - mouse.vx * C) * dt;
      mouse.vy += ((mouse.ty - mouse.y) * K - mouse.vy * C) * dt;
      mouse.x += mouse.vx * dt;
      mouse.y += mouse.vy * dt;

      gl.uniform1f(u.uTime, time);
      gl.uniform1f(u.uMerge, merge);
      gl.uniform1f(u.uPulse, pulse);
      gl.uniform1f(u.uDark, dark);
      gl.uniform1f(u.uU, unit);
      gl.uniform1f(u.uW, canvas.width);
      gl.uniform2f(u.uMeet, meet[0], meet[1]);
      gl.uniform2f(u.uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!ready) {
        ready = true;
        canvas.classList.add('is-ready');
      }
      if (inView && !document.hidden) raf = window.requestAnimationFrame(frame);
    }

    function play() {
      if (raf || !inView || document.hidden) return;
      last = 0;
      raf = window.requestAnimationFrame(frame);
    }
    function pause() {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
    }

    measure();
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { measure(); }).observe(hero);
    } else {
      window.addEventListener('resize', measure);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) play();
        else pause();
      }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause();
      else play();
    });

    if (fineMq.matches) {
      window.addEventListener('pointermove', function (e) {
        if (!inView) return;
        mouse.tx = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1));
        mouse.ty = Math.max(-1, Math.min(1, 1 - (e.clientY / window.innerHeight) * 2));
      }, { passive: true });
    }

    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault();
      pause();
      hero.classList.add('is-static');
      canvas.classList.remove('is-ready');
    });

    play();

    /* Cualquier pieza del hero avisa con este evento cuando se completa un grupo */
    document.addEventListener('tuko:hero-pair', function () { pulse = Math.min(1, pulse + (calm ? 0.3 : 0.85)); });

    return true;
  }
})();
