/**
 * PR D: inject src/partials into site HTML markers + auto ?v= cache-bust.
 *
 * Markers:
 *   <!-- tuko:partial:NAME --> ... <!-- /tuko:partial:NAME -->
 *   <!-- tuko:include:NAME -->  (single-line, replaced with partial)
 *
 * Cache-bust: rewrites ?v= for /assets/css/*.css and /assets/js/*.js
 * using first 8 chars of sha256 of the asset file.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const siteDir = path.join(root, 'site');
const partialsDir = path.join(root, 'src', 'partials');

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'landing-demo') continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function loadPartials() {
  const map = new Map();
  if (!fs.existsSync(partialsDir)) return map;
  for (const name of fs.readdirSync(partialsDir)) {
    if (!name.endsWith('.html')) continue;
    const key = name.replace(/\.html$/, '');
    map.set(key, fs.readFileSync(path.join(partialsDir, name), 'utf8').trimEnd());
  }
  return map;
}

function assetHash(absPath) {
  const buf = fs.readFileSync(absPath);
  return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 8);
}

const hashCache = new Map();
function bustVersion(urlPath) {
  // urlPath like /assets/css/main.css
  const rel = urlPath.replace(/^\//, '');
  const abs = path.join(siteDir, rel);
  if (!fs.existsSync(abs)) return null;
  if (!hashCache.has(abs)) hashCache.set(abs, assetHash(abs));
  return hashCache.get(abs);
}

function injectPartials(html, partials) {
  let out = html;
  out = out.replace(
    /<!--\s*tuko:include:([a-z0-9_-]+)\s*-->/gi,
    (_, name) => {
      const body = partials.get(name);
      if (!body) {
        console.warn('missing partial include:', name);
        return _;
      }
      return `<!-- tuko:partial:${name} -->\n${body}\n<!-- /tuko:partial:${name} -->`;
    }
  );
  out = out.replace(
    /<!--\s*tuko:partial:([a-z0-9_-]+)\s*-->[\s\S]*?<!--\s*\/tuko:partial:\1\s*-->/gi,
    (full, name) => {
      const body = partials.get(name);
      if (!body) {
        console.warn('missing partial:', name);
        return full;
      }
      return `<!-- tuko:partial:${name} -->\n${body}\n<!-- /tuko:partial:${name} -->`;
    }
  );
  return out;
}

function bustAssetQueries(html) {
  return html.replace(
    /(\b(?:href|src)=["'])(\/?assets\/(?:css|js)\/[^"'?#]+\.(?:css|js))(?:\?[^"']*)?(["'])/gi,
    (full, pre, assetPath, post) => {
      const normalized = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
      const v = bustVersion(normalized);
      if (!v) return full;
      return `${pre}${normalized}?v=${v}${post}`;
    }
  );
}

const partials = loadPartials();
const htmlFiles = walk(siteDir).filter((f) => f.endsWith('.html'));
let changed = 0;
for (const file of htmlFiles) {
  const before = fs.readFileSync(file, 'utf8');
  let html = before;
  if (partials.size) html = injectPartials(html, partials);
  html = bustAssetQueries(html);
  if (html !== before) {
    fs.writeFileSync(file, html);
    changed += 1;
  }
}

console.log(
  `build-site: ${changed} HTML updated · ${partials.size} partials · ${hashCache.size} assets hashed`
);
