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
  // Absolute (/assets/...), root-relative (assets/...), or up-tree (../assets/...)
  return html.replace(
    /(\b(?:href|src)=["'])((?:\.\.\/)+|\/)?assets\/((?:css|js)\/[^"'?#]+\.(?:css|js))(?:\?[^"']*)?(["'])/gi,
    (full, pre, prefix, assetTail, post) => {
      const normalized = `/assets/${assetTail}`;
      const v = bustVersion(normalized);
      if (!v) return full;
      // Keep original path style (../ vs /) so relative pages keep working
      const outPath = prefix && prefix.startsWith('.')
        ? `${prefix}assets/${assetTail}`
        : normalized;
      return `${pre}${outPath}?v=${v}${post}`;
    }
  );
}

/** Concatenate site/assets/css/{folder}/*.css into site/assets/css/{entry}.css */
function concatCssBundles() {
  const cssDir = path.join(siteDir, 'assets', 'css');
  const bundles = [
    { entry: 'home.css', folder: 'home' },
    { entry: 'tuko-theme.css', folder: 'theme' },
    { entry: 'main.css', folder: 'main' },
    { entry: 'tuko-ai.css', folder: 'tuko-ai' },
  ];
  let n = 0;
  for (const { entry, folder } of bundles) {
    const dir = path.join(cssDir, folder);
    if (!fs.existsSync(dir)) continue;
    const parts = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.css'))
      .sort();
    if (!parts.length) continue;
    const banner = `/* Built from ./${folder}/ — edit parts, not this file */\n`;
    const body = parts
      .map((f) => fs.readFileSync(path.join(dir, f), 'utf8').trimEnd())
      .join('\n\n');
    fs.writeFileSync(path.join(cssDir, entry), `${banner}${body}\n`);
    n += 1;
    hashCache.delete(path.join(cssDir, entry));
  }
  return n;
}

/** Concatenate ES module parts into a classic IIFE-compatible bundle when folder exists */
function concatJsBundles() {
  const jsDir = path.join(siteDir, 'assets', 'js');
  const bundles = [
    { entry: 'home-ui.js', folder: 'home-ui' },
    { entry: 'home-ui-en.js', folder: 'home-ui-en' },
    { entry: 'home-animations.js', folder: 'home-animations' },
    { entry: 'home-animations-en.js', folder: 'home-animations-en' },
  ];
  let n = 0;
  for (const { entry, folder } of bundles) {
    const dir = path.join(jsDir, folder);
    if (!fs.existsSync(dir)) continue;
    const parts = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.js') && !f.startsWith('_'))
      .sort();
    if (!parts.length) continue;
    const banner = `/* Built from ./${folder}/ — edit parts, not this file */\n`;
    const body = parts
      .map((f) => fs.readFileSync(path.join(dir, f), 'utf8').trimEnd())
      .join('\n\n');
    fs.writeFileSync(path.join(jsDir, entry), `${banner}${body}\n`);
    n += 1;
    hashCache.delete(path.join(jsDir, entry));
  }
  return n;
}

const cssBundles = concatCssBundles();
const jsBundles = concatJsBundles();

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
  `build-site: ${changed} HTML updated · ${partials.size} partials · ${cssBundles} css bundles · ${jsBundles} js bundles · ${hashCache.size} assets hashed`
);
