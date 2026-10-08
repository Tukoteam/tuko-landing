import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

function walk(d, a = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (['node_modules', '.git', '_to-migrate', '_versiones'].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, a);
    else if (/\.(html|xml|webmanifest|json)$/i.test(e.name)) a.push(p);
  }
  return a;
}

const restore = [
  ['assets/og-image.webp', 'assets/og-image.png'],
  ['assets/favicon.webp', 'assets/favicon.png'],
  ['assets/apple-touch-icon.webp', 'assets/apple-touch-icon.png'],
  ['assets/icon-192.webp', 'assets/icon-192.png'],
  ['assets/tuko-nav-logo.webp', 'assets/tuko-nav-logo.png'],
];
for (const [from, to] of restore) {
  if (!fs.existsSync(from)) {
    console.log('missing', from);
    continue;
  }
  await sharp(from).png().toFile(to);
  fs.unlinkSync(from);
  console.log('restored', to);
}

const swaps = [
  ['og-image.webp', 'og-image.png'],
  ['favicon.webp', 'favicon.png'],
  ['apple-touch-icon.webp', 'apple-touch-icon.png'],
  ['icon-192.webp', 'icon-192.png'],
  ['tuko-nav-logo.webp', 'tuko-nav-logo.png'],
];
for (const f of walk('.')) {
  let c = fs.readFileSync(f, 'utf8');
  const o = c;
  for (const [a, b] of swaps) c = c.split(a).join(b);
  if (c !== o) {
    fs.writeFileSync(f, c);
    console.log('refs', f);
  }
}

async function forceKebab(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      await forceKebab(p);
      continue;
    }
    if (!/\.(png|jpe?g|webp|svg)$/i.test(e.name)) continue;
    const ext = path.extname(e.name);
    const base = path.basename(e.name, ext);
    const k =
      base
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[_\s,]+/g, '-')
        .replace(/[^a-zA-Z0-9.-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase() + ext.toLowerCase();
    if (k === e.name) continue;
    const dest = path.join(dir, k);
    if (e.name.toLowerCase() === k.toLowerCase()) {
      const tmp = path.join(dir, '__tmp_' + k);
      fs.renameSync(p, tmp);
      fs.renameSync(tmp, dest);
    } else if (!fs.existsSync(dest)) {
      fs.renameSync(p, dest);
    } else continue;
    for (const f of walk('.')) {
      let c = fs.readFileSync(f, 'utf8');
      if (!c.includes(e.name)) continue;
      fs.writeFileSync(f, c.split(e.name).join(k));
    }
    console.log('renamed', e.name, '->', k);
  }
}

await forceKebab('assets/logos-colaboradores');
await forceKebab('assets/images');

const bannerDir = 'assets/images/banners-blog';
for (const f of fs.readdirSync(bannerDir)) {
  if (!f.endsWith('.webp') || f.includes('-800w')) continue;
  const src = path.join(bannerDir, f);
  const out = path.join(bannerDir, f.replace(/\.webp$/, '-800w.webp'));
  if (fs.existsSync(out)) continue;
  await sharp(src).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 75 }).toFile(out);
  console.log('800w', out);
}

for (const f of walk('.')) {
  if (!f.endsWith('.html')) continue;
  let c = fs.readFileSync(f, 'utf8');
  const next = c.replace(
    /<img(\s[^>]*?)src="([^"]*\/banners-blog\/[^"]+?)(\.webp)"([^>]*)>/gi,
    (full, pre, stem, ext, post) => {
      if (stem.endsWith('-800w') || /srcset=/i.test(full)) return full;
      const rel800 = stem + '-800w' + ext;
      const cand = [
        path.resolve(path.dirname(f), rel800),
        path.join(process.cwd(), rel800.replace(/^(\.\.\/)+/, '').replace(/^\//, '')),
      ];
      if (!cand.some((x) => fs.existsSync(x))) return full;
      let extra = '';
      if (!/loading=/i.test(full)) extra += ' loading="lazy"';
      if (!/decoding=/i.test(full)) extra += ' decoding="async"';
      return (
        '<img' +
        pre +
        'src="' +
        stem +
        ext +
        '" srcset="' +
        rel800 +
        ' 800w, ' +
        stem +
        ext +
        ' 1600w" sizes="(max-width:800px) 100vw, 800px"' +
        post +
        extra +
        '>'
      );
    }
  );
  if (next !== c) {
    fs.writeFileSync(f, next);
    console.log('srcset', f);
  }
}

const imgs = [];
function wi(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (['node_modules', '.git'].includes(e.name)) continue;
    if (e.isDirectory()) wi(p);
    else if (/\.(png|jpe?g|webp|gif|svg)$/i.test(e.name)) imgs.push(p);
  }
}
wi('assets');
const mb = imgs.reduce((s, p) => s + fs.statSync(p).size, 0) / 1024 / 1024;
console.log('AFTER_MB=' + mb.toFixed(2), 'COUNT=' + imgs.length);
