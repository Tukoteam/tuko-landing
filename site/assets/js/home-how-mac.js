/* Cómo funciona (Inicio, escritorio): el portátil como un MacBook de verdad, en WebGL (three.js).
   El modelo es nuestro: base y tapa son losas de aluminio con cantos pulidos y las proporciones del MacBook Air,
   teclado con su textura, trackpad de cristal, bisagra, cristal negro de la pantalla y el logo de Tuko detrás.
   Luz de estudio con reflejos reales (RoomEnvironment) y sombra suave en el suelo.
   La escena (home-how-scene.js) sigue mandando: cada vez que pinta, pasa aquí su cámara (escala, desplazamiento y giro
   del mundo), lo abierta que está la tapa y lo atrás que está el portátil. La cámara de three.js es, en números, la
   misma perspectiva de CSS (1900 px desde el centro del escenario), así que el Mac encaja con lo que sigue en HTML:
   la pantalla (la interfaz real de Tuko) y los móviles, delante del lienzo, y el suelo, detrás.
   Solo en escritorio; three.js se descarga cuando la sección está cerca. Sin WebGL se queda el portátil de CSS.
   Unidades del modelo: milímetros (620 px del mundo = 304 mm, el ancho del Mac). */
const sec = document.querySelector('.cs');
const stage = sec && sec.querySelector('.cs-stage');
const world = stage && stage.querySelector('.cs-world');
const sticky = sec && sec.querySelector('.cs-sticky');
const DESK = window.matchMedia('(min-width: 901px)');
const V = '/assets/vendor/three-0.170.0/';

if (world && sticky) {
  let started = false, near = false;
  const go = () => {
    if (started || !near || !DESK.matches) return;
    started = true;
    start().catch(() => {});
  };
  new IntersectionObserver((es) => { near = es.some((e) => e.isIntersecting); go(); }, { rootMargin: '150% 0px' }).observe(sec);
  DESK.addEventListener('change', go);
}

async function start() {
  const THREE = await import(V + 'three.module.min.js');
  const { RoomEnvironment } = await import(V + 'addons/RoomEnvironment.js');

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return; }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = 'cs-gl';
  canvas.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  /* Cámara fija a 1900 px del plano z = 0, como perspective(1900px); el encuadre se ajusta al lienzo en layout() */
  const D = 1900;
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(0, 0, D);
  camera.updateMatrixWorld();

  /* ── Materiales ── */
  const SILVER = { alu: 0xc9ccd3, pad: 0xd9dce2 };
  const SPACE = { alu: 0x6a6e78, pad: 0x7a7e88 };
  const alu = new THREE.MeshPhysicalMaterial({ color: SILVER.alu, metalness: 1, roughness: 0.33, clearcoat: 0.2, clearcoatRoughness: 0.45 });
  const pad = new THREE.MeshPhysicalMaterial({ color: SILVER.pad, metalness: 0.85, roughness: 0.18, clearcoat: 0.7, clearcoatRoughness: 0.15 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x030405, metalness: 0, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.04 });
  const hingeMat = new THREE.MeshStandardMaterial({ color: 0x101114, metalness: 0.5, roughness: 0.5 });

  /* ── Geometría: losas de esquinas redondeadas con canto biselado ── */
  /* Rectángulo redondeado en XY, centrado; rt para las esquinas de arriba (y+) y rb para las de abajo */
  const roundRect = (w, h, rt, rb = rt) => {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + rb, y);
    s.lineTo(x + w - rb, y); s.quadraticCurveTo(x + w, y, x + w, y + rb);
    s.lineTo(x + w, y + h - rt); s.quadraticCurveTo(x + w, y + h, x + w - rt, y + h);
    s.lineTo(x + rt, y + h); s.quadraticCurveTo(x, y + h, x, y + h - rt);
    s.lineTo(x, y + rb); s.quadraticCurveTo(x, y, x + rb, y);
    return s;
  };
  /* Normales suaves: las caras que comparten vértice se promedian (los cantos biselados brillan sin facetas) */
  const smooth = (g) => {
    const p = g.attributes.position, n = p.count, acc = new Map(), keys = new Array(n);
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    const key = (i) => Math.round(p.getX(i) * 50) + ',' + Math.round(p.getY(i) * 50) + ',' + Math.round(p.getZ(i) * 50);
    for (let i = 0; i < n; i += 3) {
      a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
      const f = c.sub(b).cross(a.sub(b));
      if (f.lengthSq() < 1e-12) continue;
      f.normalize();
      for (let j = i; j < i + 3; j++) {
        const k = keys[j] = key(j);
        const v = acc.get(k);
        if (v) v.add(f); else acc.set(k, f.clone());
      }
    }
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const v = acc.get(keys[i] || key(i));
      if (!v) continue;
      const l = v.length() || 1;
      out[i * 3] = v.x / l; out[i * 3 + 1] = v.y / l; out[i * 3 + 2] = v.z / l;
    }
    g.setAttribute('normal', new THREE.BufferAttribute(out, 3));
    return g;
  };
  /* Losa de w × h y grosor t: el contorno en XY y el grosor de z = 0 a z = t */
  const slab = (w, h, t, rt, rb, bv) => {
    const g = new THREE.ExtrudeGeometry(roundRect(w - 2 * bv, h - 2 * bv, rt - bv, rb - bv), {
      depth: t - 2 * bv, bevelEnabled: true, bevelThickness: bv, bevelSize: bv, bevelSegments: 5, curveSegments: 28
    });
    g.translate(0, 0, bv);
    return smooth(g);
  };

  /* ── El Mac ──
     Origen en la bisagra: x en el centro, y = 0 en la superficie de la base, z = 0 en el cristal de la pantalla.
     La pantalla de HTML (598 × 375 px) está 30 px por encima de la bisagra y tiene 11 px de marco arriba y a los lados */
  const MM = 620 / 304;
  const W = 304;
  const LID = { top: 416 / MM, low: -2, t: 3.7 };      /* de 2 mm por debajo de la base (tapado) hasta 204 mm */
  const BASE = { d: 210, t: 6.8 };
  const mac = new THREE.Group();
  mac.matrixAutoUpdate = false;
  scene.add(mac);

  /* Base: tumbada, de la bisagra (z = 0) hacia delante */
  const baseGeo = slab(W, BASE.d, BASE.t, 11, 11, 1.7);
  baseGeo.rotateX(-Math.PI / 2);
  baseGeo.translate(0, -BASE.t, BASE.d / 2);
  mac.add(new THREE.Mesh(baseGeo, alu));

  /* Teclado: la textura de teclas (SVG) pintada en un lienzo grande para que se vea nítida */
  const KB = { w: 263, h: 263 / (562 / 213.1) };
  const kbCanvas = document.createElement('canvas');
  kbCanvas.width = 2400; kbCanvas.height = Math.round(2400 * KB.h / KB.w);
  const kbTex = new THREE.CanvasTexture(kbCanvas);
  kbTex.colorSpace = THREE.SRGBColorSpace;
  kbTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const keyboard = new THREE.Mesh(new THREE.PlaneGeometry(KB.w, KB.h).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: kbTex, transparent: true, roughness: 0.55, metalness: 0 }));
  keyboard.position.set(0, 0.06, 12 + KB.h / 2);
  mac.add(keyboard);

  /* Trackpad de cristal, a 10 mm del canto de delante */
  const trackpad = new THREE.Mesh(new THREE.ShapeGeometry(roundRect(122, 78, 6), 24).rotateX(-Math.PI / 2), pad);
  trackpad.position.set(0, 0.04, BASE.d - 10 - 39);
  mac.add(trackpad);

  /* Bisagra: la barra oscura al pie de la pantalla */
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 236, 28).rotateZ(Math.PI / 2), hingeMat);
  hinge.position.set(0, 0.5, -1.9);
  mac.add(hinge);

  /* Tapa: gira en la bisagra; se modela abierta (de pie) y la escena la cierra hacia delante */
  const lidPivot = new THREE.Group();
  mac.add(lidPivot);
  const lidH = LID.top - LID.low;
  const lidGeo = slab(W, lidH, LID.t, 11, 4, 1.3);
  lidGeo.translate(0, LID.low + lidH / 2, -LID.t);
  lidPivot.add(new THREE.Mesh(lidGeo, alu));
  /* El cristal negro, casi hasta el canto (como en el MacBook): solo queda un filo de aluminio de 1 mm */
  const display = new THREE.Mesh(new THREE.ShapeGeometry(roundRect(W - 2, lidH - 2, 10, 3), 24), glass);
  display.position.set(0, LID.low + lidH / 2, 0.04);
  lidPivot.add(display);
  /* Detrás, el logo de Tuko */
  const logoCanvas = document.createElement('canvas');
  logoCanvas.width = logoCanvas.height = 512;
  const logoTex = new THREE.CanvasTexture(logoCanvas);
  logoTex.colorSpace = THREE.SRGBColorSpace;
  const logoMat = new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, opacity: 0.85, depthWrite: false });
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(31, 31), logoMat);
  logo.rotation.y = Math.PI;
  logo.position.set(0, LID.low + lidH / 2, -LID.t - 0.05);
  lidPivot.add(logo);

  /* La luz de la pantalla sobre el teclado */
  const screenLight = new THREE.PointLight(0xdfe6ff, 0, 0, 2);
  screenLight.position.set(0, 60, 70);
  mac.add(screenLight);

  /* Sombra en el suelo: una amplia y suave y otra de contacto, justo debajo (texturas de degradado, sin bordes) */
  const shadowTex = (stops) => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const x = c.getContext('2d'), gr = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    stops.forEach((s) => gr.addColorStop(s[0], s[1]));
    x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  };
  const shadowSoft = new THREE.MeshBasicMaterial({ map: shadowTex([[0, 'rgba(10,14,40,0.5)'], [0.55, 'rgba(10,14,40,0.2)'], [1, 'rgba(10,14,40,0)']]), transparent: true, depthWrite: false });
  const shadowAo = new THREE.MeshBasicMaterial({ map: shadowTex([[0, 'rgba(6,8,26,0.7)'], [0.6, 'rgba(6,8,26,0.45)'], [1, 'rgba(6,8,26,0)']]), transparent: true, depthWrite: false });
  const floorY = -BASE.t - 0.3;
  const soft = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.5, BASE.d * 1.6).rotateX(-Math.PI / 2), shadowSoft);
  soft.position.set(0, floorY, BASE.d / 2 + 8);
  const ao = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.1, BASE.d * 1.16).rotateX(-Math.PI / 2), shadowAo);
  ao.position.set(0, floorY + 0.1, BASE.d / 2 + 2);
  soft.renderOrder = -2; ao.renderOrder = -1;
  mac.add(soft, ao);

  /* Luz de estudio: un foco principal y relleno suave (los reflejos los da el entorno) */
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(260, 420, 320);
  scene.add(key);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8890a0, 0.35));

  /* Texturas: el teclado y el logo, de sus SVG */
  const paint = (src, cv, tex, pad0) => {
    const img = new Image();
    img.onload = () => {
      const x = cv.getContext('2d');
      x.clearRect(0, 0, cv.width, cv.height);
      x.drawImage(img, pad0, pad0, cv.width - 2 * pad0, cv.height - 2 * pad0);
      tex.needsUpdate = true;
      redraw();
    };
    img.src = src;
  };

  /* ── Tema: plata en claro, gris espacial en oscuro ── */
  const applyTheme = () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const c = dark ? SPACE : SILVER;
    alu.color.setHex(c.alu);
    pad.color.setHex(c.pad);
    renderer.toneMappingExposure = dark ? 0.95 : 1.05;
    /* En oscuro, el estudio más tenue: si no, los cantos brillan demasiado al lado del gris espacial */
    scene.environmentIntensity = dark ? 0.5 : 0.95;
    shadowSoft.opacity = dark ? 1 : 0.8;
    shadowAo.opacity = dark ? 1 : 0.75;
    redraw();
  };

  /* ── Capas: el suelo de HTML pasa a un mundo gemelo detrás del lienzo; el resto del mundo queda delante ── */
  const floor = world.querySelector('.cs-floor');
  const floorWorld = document.createElement('div');
  floorWorld.className = 'cs-world cs-world--floor';
  floorWorld.setAttribute('aria-hidden', 'true');
  floorWorld.style.transform = world.style.transform;
  floorWorld.appendChild(floor);
  stage.insertBefore(floorWorld, world);
  stage.insertBefore(canvas, world);

  /* El lienzo cubre todo el escenario fijo (el Mac puede salirse del recuadro en los primeros planos);
     el centro de la perspectiva sigue siendo el centro del escenario */
  const layout = () => {
    const sr = stage.getBoundingClientRect(), vr = sticky.getBoundingClientRect();
    const w = Math.max(1, Math.round(vr.width)), h = Math.max(1, Math.round(vr.height));
    const left = vr.left - sr.left, top = vr.top - sr.top;
    Object.assign(canvas.style, { left: left + 'px', top: top + 'px', width: w + 'px', height: h + 'px' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(4.5e6 / (w * h))));
    renderer.setSize(w, h, false);
    const x0 = left - sr.width / 2, y0 = top - sr.height / 2, n = 40, q = n / D;
    camera.projectionMatrix.makePerspective(x0 * q, (x0 + w) * q, -y0 * q, -(y0 + h) * q, n, 8000);
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    redraw();
  };

  /* ── Un fotograma: la misma transformación que el mundo de CSS, pasada a three.js (y hacia arriba) ──
     CSS: translate3d(tx, ty, 0) scale(s) rotateX(rx) rotateY(ry) desde el centro del mundo (450, 300);
     con y al revés, rotateX cambia de signo. La bisagra está en (450, 408) del mundo y el portátil retrocede back × 90 px */
  const D2R = Math.PI / 180, m = new THREE.Matrix4();
  let last = null;
  const draw = (st) => {
    last = st;
    const f = st.s * MM;
    mac.matrix.makeTranslation(st.tx, -st.ty, 0)
      .multiply(m.makeScale(st.s, st.s, st.s))
      .multiply(m.makeRotationX(-st.rx * D2R))
      .multiply(m.makeRotationY(st.ry * D2R))
      .multiply(m.makeTranslation(0, -108, -90 * st.back))
      .multiply(m.makeScale(MM, MM, MM));
    mac.matrixWorldNeedsUpdate = true;
    lidPivot.rotation.x = (1 - st.open) * Math.PI / 2;
    /* La luz de la pantalla, con la misma caída aunque cambie la escala */
    screenLight.intensity = 9000 * f * f * Math.max(0, Math.min(1, (st.open - 0.5) / 0.5)) * (1 - st.back * 0.3);
    screenLight.distance = 260 * f;
    floorWorld.style.transform = world.style.transform;
    renderer.render(scene, camera);
  };
  function redraw() { if (last) draw(last); }

  let ready = false;
  const frame = (st) => {
    draw(st);
    if (!ready) { ready = true; sec.classList.add('is-gl'); }
  };

  /* Sin WebGL a mitad (el sistema recupera la memoria de la gráfica): vuelve el portátil de CSS */
  canvas.addEventListener('webglcontextlost', () => {
    sec.csGL = null;
    sec.classList.remove('is-gl');
    world.insertBefore(floor, world.firstChild);
    floorWorld.remove();
    canvas.remove();
  });

  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  paint('/assets/images/macbook-teclado-3d.svg', kbCanvas, kbTex, 0);
  paint('/assets/favicon.svg', logoCanvas, logoTex, 24);
  new ResizeObserver(layout).observe(stage);
  window.addEventListener('resize', layout);
  layout();

  /* Los shaders se preparan antes de que se vea la sección; luego la escena empieza a pasar sus fotogramas */
  try { if (renderer.compileAsync) await renderer.compileAsync(scene, camera); } catch (e) { /* se compilan al pintar */ }
  sec.csGL = frame;
  sec.dispatchEvent(new Event('cs-gl'));
}
