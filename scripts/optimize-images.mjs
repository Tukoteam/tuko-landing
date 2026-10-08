/**
 * One-shot image cleanup for tuko-landing.
 * - Switch banner hero PNG refs → WebP
 * - Delete banner PNGs that have WebP twins
 * - Delete large unused images under assets/images
 * - Kebab-case rename for logos + used images; rewrite refs
 * - Resize WebP banners to max 1600w + 800w variants; add srcset where simple <img>
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
const skipDirs = new Set(['node_modules', '.git', '_to-migrate', '_versiones', 'landing-demo']);

function walk(dir, pred, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, pred, out);
    else if (pred(p, e.name)) out.push(p);
  }
  return out;
}

function kebab(name) {
  const ext = path.extname(name);
  const base = path.basename(name, ext);
  const k = base
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\s,]+/g, '-')
    .replace(/[^a-zA-Z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return k + ext.toLowerCase();
}

function readCorpus() {
  const files = walk(root, (p, n) => /\.(html|css|js|json|xml|md|toml)$/i.test(n));
  return files.map((f) => ({ f, c: fs.readFileSync(f, 'utf8') }));
}

function replaceAllInCorpus(corpus, from, to) {
  let hits = 0;
  for (const item of corpus) {
    if (!item.c.includes(from)) continue;
    const next = item.c.split(from).join(to);
    if (next !== item.c) {
      item.c = next;
      hits++;
    }
  }
  return hits;
}

function flushCorpus(corpus) {
  for (const item of corpus) fs.writeFileSync(item.f, item.c);
}

const corpus = readCorpus();
const report = { deleted: [], renamed: [], converted: [], srcset: 0 };

// 1) Banner PNG → WebP in HTML
const bannerDir = path.join(root, 'assets/images/banners-blog');
for (const f of fs.readdirSync(bannerDir)) {
  if (!f.toLowerCase().endsWith('.png')) continue;
  const webp = f.replace(/\.png$/i, '.webp');
  if (!fs.existsSync(path.join(bannerDir, webp))) continue;
  replaceAllInCorpus(corpus, f, webp);
  replaceAllInCorpus(corpus, encodeURI(f), encodeURI(webp));
}

// 2) Delete banner PNGs with webp twin
for (const f of fs.readdirSync(bannerDir)) {
  if (!f.toLowerCase().endsWith('.png')) continue;
  const webp = f.replace(/\.png$/i, '.webp');
  if (fs.existsSync(path.join(bannerDir, webp))) {
    fs.unlinkSync(path.join(bannerDir, f));
    report.deleted.push('banners-blog/' + f);
  }
}

flushCorpus(corpus);

// refresh corpus after writes
let corpus2 = readCorpus();
const joined = corpus2.map((x) => x.c).join('\n');

// 3) Delete unused large images under assets/images (not logos, not og)
const images = walk(path.join(root, 'assets/images'), (p, n) => /\.(png|jpe?g|webp)$/i.test(n));
for (const img of images) {
  const base = path.basename(img);
  const rel = path.relative(root, img);
  if (rel.startsWith('assets' + path.sep + 'images' + path.sep + 'banners-blog')) continue;
  const used =
    joined.includes(base) ||
    joined.includes(encodeURI(base)) ||
    joined.includes(base.replace(/ /g, '%20'));
  const size = fs.statSync(img).size;
  if (!used && size > 100 * 1024) {
    fs.unlinkSync(img);
    report.deleted.push(rel);
  }
}

// 4) Rename logos + remaining images to kebab-case
async function renameTree(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      await renameTree(p);
      continue;
    }
    if (!/\.(png|jpe?g|webp|svg)$/i.test(e.name)) continue;
    const next = kebab(e.name);
    if (next === e.name) continue;
    const dest = path.join(dir, next);
    if (fs.existsSync(dest)) {
      console.warn('skip rename collision', e.name, '→', next);
      continue;
    }
    // update refs before rename
    const corpusR = readCorpus();
    replaceAllInCorpus(corpusR, e.name, next);
    replaceAllInCorpus(corpusR, encodeURI(e.name), encodeURI(next));
    // also path segments with spaces in folder names handled separately
    flushCorpus(corpusR);
    fs.renameSync(p, dest);
    report.renamed.push(e.name + ' → ' + next);
  }
}

// Rename logos folder itself
const logosDir = path.join(root, 'assets', 'logos colaboradores');
if (fs.existsSync(logosDir)) {
  const logosKebab = path.join(root, 'assets', 'logos-colaboradores');
  const corpusL = readCorpus();
  replaceAllInCorpus(corpusL, 'logos colaboradores', 'logos-colaboradores');
  replaceAllInCorpus(corpusL, 'logos%20colaboradores', 'logos-colaboradores');
  flushCorpus(corpusL);
  fs.renameSync(logosDir, logosKebab);
  report.renamed.push('logos colaboradores/ → logos-colaboradores/');
  await renameTree(logosKebab);
}

await renameTree(path.join(root, 'assets', 'images'));

// 5) Optimize remaining webp/png under banners + used logos (compress png)
async function optimizeFile(file) {
  const ext = path.extname(file).toLowerCase();
  const meta = await sharp(file).metadata();
  const width = meta.width || 0;
  if (ext === '.webp' || ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
    const base = file.slice(0, -ext.length);
    // max 1600
    let pipeline = sharp(file).rotate();
    if (width > 1600) pipeline = pipeline.resize({ width: 1600, withoutEnlargement: true });
    if (ext === '.png' && !file.includes('logos-colaboradores')) {
      // convert heavy non-logo png to webp
      const out = base + '.webp';
      await pipeline.webp({ quality: 78 }).toFile(out + '.tmp');
      fs.renameSync(out + '.tmp', out);
      const corpusC = readCorpus();
      const oldName = path.basename(file);
      const newName = path.basename(out);
      replaceAllInCorpus(corpusC, oldName, newName);
      flushCorpus(corpusC);
      fs.unlinkSync(file);
      report.converted.push(oldName + ' → ' + newName);
      file = out;
    } else if (ext === '.webp') {
      await pipeline.webp({ quality: 78 }).toFile(file + '.tmp');
      fs.renameSync(file + '.tmp', file);
    } else if (ext === '.png') {
      await pipeline.png({ compressionLevel: 9, palette: true }).toFile(file + '.tmp');
      fs.renameSync(file + '.tmp', file);
    }

    // 800w variant for banners
    if (file.includes('banners-blog') && file.endsWith('.webp')) {
      const m = await sharp(file).metadata();
      if ((m.width || 0) > 900) {
        const out800 = file.replace(/\.webp$/i, '-800w.webp');
        await sharp(file).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 75 }).toFile(out800);
        report.converted.push('variant ' + path.basename(out800));
      }
    }
  }
}

const toOpt = walk(path.join(root, 'assets'), (p, n) => /\.(png|jpe?g|webp)$/i.test(n));
for (const f of toOpt) {
  try {
    await optimizeFile(f);
  } catch (e) {
    console.warn('optimize fail', f, e.message);
  }
}

// 6) Add srcset for banner imgs that have -800w variant
const corpusS = readCorpus();
for (const item of corpusS) {
  if (!item.f.endsWith('.html')) continue;
  item.c = item.c.replace(
    /<img([^>]*?)src="([^"]*banners-blog\/[^"]+\.webp)"([^>]*)>/gi,
    (full, pre, src, post) => {
      if (src.includes('-800w.webp') || /srcset=/i.test(full)) return full;
      const src800 = src.replace(/\.webp$/i, '-800w.webp');
      const abs = path.join(root, src.replace(/^\//, '').replace(/\//g, path.sep));
      // relative resolution rough
      const candidates = [
        abs,
        path.join(path.dirname(item.f), src),
        path.join(root, src.replace(/^\.\.\//, '').replace(/^(\.\.\/)+/, '')),
      ];
      // try resolve from html dir
      let ok = false;
      for (const c of candidates) {
        if (fs.existsSync(c.replace(/\.webp$/i, '-800w.webp').replace(/banners-blog\\[^\\]+$/, (m) => m))) {
          /* noop */
        }
      }
      const fromHtml = path.resolve(path.dirname(item.f), src);
      const v800 = fromHtml.replace(/\.webp$/i, '-800w.webp');
      if (!fs.existsSync(v800) && !fs.existsSync(path.join(root, src800.replace(/^\//, '')))) {
        // try assets path from root
        const rootTry = path.join(root, src.replace(/^(\.\.\/)+/, '').replace(/^\//, ''));
        const root800 = rootTry.replace(/\.webp$/i, '-800w.webp');
        if (!fs.existsSync(root800)) return full;
      }
      report.srcset++;
      const srcsetRel = src.replace(/\.webp$/i, '-800w.webp');
      let attrs = pre + post;
      if (!/\bwidth=/i.test(full)) attrs += ' width="1600"';
      if (!/\bheight=/i.test(full)) attrs += ' height="1067"';
      if (!/\bloading=/i.test(full)) attrs += ' loading="lazy"';
      if (!/\bdecoding=/i.test(full)) attrs += ' decoding="async"';
      return `<img${pre}src="${src}" srcset="${srcsetRel} 800w, ${src} 1600w" sizes="(max-width: 800px) 100vw, 1600px"${post}>`.replace(
        /<img([^>]*)>/,
        `<img$1>`
      );
    }
  );
}
// Simpler second pass srcset
for (const item of corpusS) {
  if (!item.f.endsWith('.html')) continue;
  item.c = item.c.replace(
    /<img(\s[^>]*?)src="([^"]*\/banners-blog\/[^"]+?)(\.webp)"([^>]*)>/gi,
    (full, pre, stem, ext, post) => {
      if (stem.endsWith('-800w') || /srcset=/i.test(full)) return full;
      const file800 = path.resolve(path.dirname(item.f), stem + '-800w' + ext);
      const file800root = path.join(root, (stem + '-800w' + ext).replace(/^(\.\.\/)+/, '').replace(/^\//, ''));
      if (!fs.existsSync(file800) && !fs.existsSync(file800root)) return full;
      if (/srcset=/i.test(full)) return full;
      report.srcset++;
      return `<img${pre}src="${stem}${ext}" srcset="${stem}-800w${ext} 800w, ${stem}${ext} 1600w" sizes="(max-width: 800px) 100vw, 800px"${post}>`;
    }
  );
}
flushCorpus(corpusS);

console.log(JSON.stringify(report, null, 2));
const imgs = walk(path.join(root, 'assets'), (p, n) => /\.(png|jpe?g|webp|gif|svg)$/i.test(n));
const mb = imgs.reduce((s, f) => s + fs.statSync(f).size, 0) / (1024 * 1024);
console.log('AFTER_MB=' + mb.toFixed(2) + ' COUNT=' + imgs.length);
