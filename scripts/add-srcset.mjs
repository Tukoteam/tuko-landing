import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const bannerDir = 'assets/images/banners-blog';
for (const f of fs.readdirSync(bannerDir)) {
  if (!f.endsWith('.webp') || f.includes('-800w')) continue;
  const src = path.join(bannerDir, f);
  const out = path.join(bannerDir, f.replace(/\.webp$/, '-800w.webp'));
  if (fs.existsSync(out)) {
    console.log('exists', out);
    continue;
  }
  await sharp(src).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 75 }).toFile(out);
  console.log('made', out);
}

function walk(d, a = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (['node_modules', '.git', '_to-migrate', '_versiones'].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, a);
    else if (e.name.endsWith('.html')) a.push(p);
  }
  return a;
}

let n = 0;
for (const f of walk('.')) {
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
      n++;
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
console.log('srcset_count', n);
