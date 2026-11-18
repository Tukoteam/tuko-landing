/**
 * Lanzamientos · foto del producto «impresa» en el ticket.
 * Las impresoras térmicas no tienen grises: cada punto está encendido o apagado, y las fotos salen tramadas.
 * Aquí se dibuja el producto en grises (SVG) y se trama con Atkinson (el de los primeros Mac), punto a punto,
 * en un canvas pequeño que se muestra al doble sin suavizar. Si el navegador no deja leer el canvas, se muestra
 * el dibujo en grises sin tramar.
 */
(function () {
  'use strict';

  var W = 96;
  var H = 72;
  var INK = [27, 28, 34];

  // Dibujos de ejemplo, en grises: el tramado convierte cada gris en una densidad de puntos
  var ART = {
    hoodie:
      '<defs>' +
      '<linearGradient id="b" x1="0" x2="1"><stop offset="0" stop-color="#8f8f8f"/><stop offset=".42" stop-color="#e2e2e2"/><stop offset="1" stop-color="#5e5e5e"/></linearGradient>' +
      '<linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c4c4c4"/><stop offset="1" stop-color="#6c6c6c"/></linearGradient>' +
      '</defs>' +
      '<ellipse cx="60" cy="86" rx="42" ry="3" fill="#d4d4d4"/>' +
      '<path d="M35 25 L18 33 L9 73 L22 77 L31 47 Z" fill="url(#s)"/>' +
      '<path d="M85 25 L102 33 L111 73 L98 77 L89 47 Z" fill="url(#s)"/>' +
      '<path d="M35 23 Q60 15 85 23 L90 46 L88 84 L32 84 L30 46 Z" fill="url(#b)"/>' +
      '<path d="M43 22 Q60 3 77 22 Q69 31 60 31 Q51 31 43 22 Z" fill="#9b9b9b"/>' +
      '<path d="M49 22 Q60 11 71 22 Q66 27 60 27 Q54 27 49 22 Z" fill="#262626"/>' +
      '<path d="M56 29 L55 44 M64 29 L65 44" stroke="#4a4a4a" stroke-width="1.4" fill="none"/>' +
      '<path d="M42 61 L78 61 L74 76 L46 76 Z" fill="#a9a9a9" stroke="#5a5a5a" stroke-width="1"/>' +
      '<rect x="32" y="79" width="56" height="5" fill="#6a6a6a"/>' +
      '<path d="M9 71 L22 75 L21 79 L8 75 Z" fill="#6a6a6a"/><path d="M111 71 L98 75 L99 79 L112 75 Z" fill="#6a6a6a"/>',
    serum:
      '<defs>' +
      '<linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#4a4a4a"/><stop offset=".35" stop-color="#bdbdbd"/><stop offset=".55" stop-color="#8c8c8c"/><stop offset="1" stop-color="#3a3a3a"/></linearGradient>' +
      '<linearGradient id="k" x1="0" x2="1"><stop offset="0" stop-color="#1e1e1e"/><stop offset=".45" stop-color="#8a8a8a"/><stop offset="1" stop-color="#151515"/></linearGradient>' +
      '</defs>' +
      '<ellipse cx="60" cy="86" rx="26" ry="3" fill="#d0d0d0"/>' +
      '<rect x="45" y="32" width="30" height="53" rx="6" fill="url(#g)"/>' +
      '<rect x="52" y="25" width="16" height="9" rx="2" fill="#2c2c2c"/>' +
      '<path d="M54 25 L54 11 Q54 4 60 4 Q66 4 66 11 L66 25 Z" fill="url(#k)"/>' +
      '<rect x="48" y="49" width="24" height="25" rx="1.5" fill="#f4f4f4"/>' +
      '<rect x="51" y="53" width="18" height="3" fill="#2a2a2a"/>' +
      '<rect x="51" y="59" width="13" height="1.6" fill="#7a7a7a"/>' +
      '<rect x="51" y="63" width="15" height="1.6" fill="#7a7a7a"/>' +
      '<circle cx="66" cy="69" r="2.6" fill="#3a3a3a"/>' +
      '<rect x="48.5" y="35" width="3" height="12" rx="1.5" fill="#ffffff" opacity=".75"/>',
    mug:
      '<defs>' +
      '<linearGradient id="m" x1="0" x2="1"><stop offset="0" stop-color="#707070"/><stop offset=".3" stop-color="#cfcfcf"/><stop offset=".55" stop-color="#b4b4b4"/><stop offset="1" stop-color="#4e4e4e"/></linearGradient>' +
      '</defs>' +
      '<ellipse cx="58" cy="86" rx="36" ry="3" fill="#d2d2d2"/>' +
      '<path d="M44 20 Q40 14 46 9 M56 20 Q52 13 58 7 M68 20 Q64 14 70 9" stroke="#b9b9b9" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<path d="M80 40 Q96 40 96 55 Q96 70 80 70" stroke="#6b6b6b" stroke-width="7" fill="none"/>' +
      '<path d="M80 44 Q91 44 91 55 Q91 66 80 66" stroke="#b4b4b4" stroke-width="2" fill="none"/>' +
      '<path d="M34 28 L82 28 L80 78 Q79 84 72 84 L44 84 Q37 84 36 78 Z" fill="url(#m)"/>' +
      '<rect x="35" y="36" width="46" height="3" fill="#7a7a7a"/>' +
      '<ellipse cx="58" cy="28" rx="24" ry="5" fill="#5a5a5a"/>' +
      '<ellipse cx="58" cy="29" rx="21" ry="3.6" fill="#1f1f1f"/>',
    tote:
      '<defs>' +
      '<linearGradient id="t" x1="0" x2="1"><stop offset="0" stop-color="#9a9a9a"/><stop offset=".4" stop-color="#e6e6e6"/><stop offset="1" stop-color="#7a7a7a"/></linearGradient>' +
      '</defs>' +
      '<ellipse cx="60" cy="86" rx="34" ry="3" fill="#d2d2d2"/>' +
      '<path d="M46 34 Q46 8 60 8 Q74 8 74 34" stroke="#5a5a5a" stroke-width="3.2" fill="none"/>' +
      '<path d="M36 32 L84 32 L88 84 L32 84 Z" fill="url(#t)"/>' +
      '<rect x="36" y="32" width="48" height="3" fill="#8a8a8a"/>' +
      '<circle cx="60" cy="56" r="11" fill="#2a2a2a"/>' +
      '<path d="M54 56 L58 60 L67 51" stroke="#e8e8e8" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<rect x="47" y="72" width="26" height="2.4" fill="#4a4a4a"/>',
  };

  function svgFor(key) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90" width="' + W + '" height="' + H + '">' +
      '<rect width="120" height="90" fill="#ffffff"/>' + (ART[key] || '') + '</svg>';
  }

  /* Atkinson: reparte 3/4 del error entre seis vecinos (deja más blancos limpios: muy «ticket») */
  function atkinson(lum) {
    var x, y, i, old, nw, err;
    for (y = 0; y < H; y++) {
      for (x = 0; x < W; x++) {
        i = y * W + x;
        old = lum[i];
        nw = old < 128 ? 0 : 255;
        err = (old - nw) / 8;
        lum[i] = nw;
        if (x + 1 < W) lum[i + 1] += err;
        if (x + 2 < W) lum[i + 2] += err;
        if (y + 1 < H) {
          if (x > 0) lum[i + W - 1] += err;
          lum[i + W] += err;
          if (x + 1 < W) lum[i + W + 1] += err;
        }
        if (y + 2 < H) lum[i + 2 * W] += err;
      }
    }
    return lum;
  }

  function render(canvas, key) {
    if (!canvas || !canvas.getContext) return;
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.onload = function () {
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0, W, H);
      try {
        var data = ctx.getImageData(0, 0, W, H);
        var px = data.data;
        var lum = new Float32Array(W * H);
        for (var i = 0; i < W * H; i++) {
          // Algo más de contraste, como sube la densidad una térmica
          var l = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2];
          lum[i] = Math.max(0, Math.min(255, (l - 128) * 1.15 + 136));
        }
        atkinson(lum);
        for (var j = 0; j < W * H; j++) {
          var on = lum[j] < 128;
          px[j * 4] = INK[0];
          px[j * 4 + 1] = INK[1];
          px[j * 4 + 2] = INK[2];
          px[j * 4 + 3] = on ? 255 : 0;
        }
        ctx.putImageData(data, 0, 0);
      } catch (_) {
        /* Canvas no legible: se queda el dibujo en grises */
      }
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgFor(key));
  }

  window.TukoLzDither = { render: render };
})();
