/**
 * Static site hygiene checks for CI (no network).
 * Fail: broken internal links, sitemap issues, hreflang, ES/EN parity,
 * presence of _redirects/_headers.
 * Warn: same asset referenced with multiple ?v= values.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const configPath = path.join(__dirname, "check-site.config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const siteDir = path.join(root, config.siteDir);
const host = (config.host || "https://tukoteam.com").replace(/\/$/, "");
const excludeDirs = new Set(config.excludeDirs || []);
const esOnly = new Set(config.esOnlyBlogPosts || []);

const errors = [];
const warnings = [];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    const rel = path.relative(siteDir, full).replace(/\\/g, "/");
    const top = rel.split("/")[0];
    if (ent.isDirectory()) {
      if (excludeDirs.has(ent.name) || excludeDirs.has(top)) continue;
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

/** Redirect sources that leave the URL (301/302), not SPA-style 200 rewrites. */
function readRedirectAwayFroms() {
  const froms = new Set();
  const toml = fs.readFileSync(path.join(root, "netlify.toml"), "utf8");
  const blocks = toml.split(/\[\[redirects\]\]/).slice(1);
  for (const block of blocks) {
    const from = block.match(/from\s*=\s*"([^"]+)"/)?.[1];
    const status = Number(block.match(/status\s*=\s*(\d+)/)?.[1] || "0");
    if (from && (status === 301 || status === 302)) froms.add(from);
  }
  return froms;
}

function urlPathToCandidates(urlPath) {
  let p = urlPath.split("?")[0].split("#")[0];
  if (!p || p === "/") return ["index.html"];
  if (p.startsWith("/")) p = p.slice(1);
  if (p.endsWith("/")) p = p.slice(0, -1);

  const candidates = [];
  if (p.endsWith(".html") || p.endsWith(".pdf") || p.endsWith(".css") ||
      p.endsWith(".js") || p.endsWith(".svg") || p.endsWith(".png") ||
      p.endsWith(".webp") || p.endsWith(".jpg") || p.endsWith(".jpeg") ||
      p.endsWith(".woff2") || p.endsWith(".xml") || p.endsWith(".txt") ||
      p.endsWith(".ico")) {
    candidates.push(p);
  } else {
    candidates.push(`${p}.html`);
    candidates.push(path.posix.join(p, "index.html"));
    candidates.push(p);
  }
  return candidates;
}

function resolveExists(urlPath) {
  for (const c of urlPathToCandidates(urlPath)) {
    const full = path.join(siteDir, c);
    if (fs.existsSync(full) && fs.statSync(full).isFile()) return true;
  }
  return false;
}

function isExternalOrSpecial(href) {
  if (!href || href === "#" || href.startsWith("#")) return true;
  if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) return true;
  if (/^https?:\/\//i.test(href)) {
    if (href.startsWith(host)) return false;
    return true;
  }
  if (href.startsWith("//")) return true;
  return false;
}

function normalizeInternal(href, fromFile) {
  let h = href.split("#")[0];
  if (!h) return null;
  if (h.startsWith(host)) {
    h = h.slice(host.length) || "/";
  }
  if (h.startsWith("/")) return h;

  const fromRel = path.relative(siteDir, fromFile).replace(/\\/g, "/");
  const fromDir = path.posix.dirname(fromRel);
  const joined = path.posix.normalize(path.posix.join(fromDir === "." ? "" : fromDir, h));
  return "/" + joined.replace(/^\.\//, "");
}

// --- 5. _redirects / _headers must not exist ---
for (const banned of ["_redirects", "_headers"]) {
  if (fs.existsSync(path.join(root, banned))) {
    errors.push(`forbidden file present: ${banned}`);
  }
}

const htmlFiles = walk(siteDir).filter((f) => f.endsWith(".html"));
const assetVersionMap = new Map(); // assetPath -> Set of ?v=
const redirectFroms = readRedirectAwayFroms();

// --- 1. Internal href/src ---
const attrRe = /\b(?:href|src)=["']([^"']+)["']/gi;
for (const file of htmlFiles) {
  const rel = path.relative(siteDir, file).replace(/\\/g, "/");
  const html = fs.readFileSync(file, "utf8");
  let m;
  while ((m = attrRe.exec(html))) {
    const raw = m[1].trim();
    if (isExternalOrSpecial(raw)) continue;

    const noHash = raw.split("#")[0];
    const qIdx = noHash.indexOf("?");
    const pathPart = qIdx >= 0 ? noHash.slice(0, qIdx) : noHash;
    const vQuery = qIdx >= 0 ? noHash.slice(qIdx + 1) : "";

    const internal = normalizeInternal(pathPart || (raw.startsWith("#") ? "" : pathPart), file);
    if (!internal) continue;

    // track ?v=
    if (vQuery) {
      const key = internal;
      if (!assetVersionMap.has(key)) assetVersionMap.set(key, new Set());
      for (const part of vQuery.split("&")) {
        if (part.startsWith("v=") || part.match(/^v=/)) {
          assetVersionMap.get(key).add(part);
        } else if (part.includes("=") && part.split("=")[0] === "v") {
          assetVersionMap.get(key).add(part);
        } else if (/^\d/.test(part) === false && part.startsWith("v")) {
          assetVersionMap.get(key).add(part);
        }
      }
      // also capture bare ?v=5 style already in part
      const vm = vQuery.match(/(?:^|&)v=([^&]*)/);
      if (vm) assetVersionMap.get(key).add(`v=${vm[1]}`);
    }

    if (!resolveExists(internal)) {
      errors.push(`broken link in ${rel}: ${raw} → ${internal}`);
    }
  }
}

// --- soft warn multiple ?v= ---
for (const [asset, versions] of assetVersionMap) {
  if (versions.size > 1) {
    warnings.push(`multiple ?v= for ${asset}: ${[...versions].join(", ")}`);
  }
}

// --- 2. Sitemap locs ---
const sitemapPath = path.join(siteDir, "sitemap.xml");
if (!fs.existsSync(sitemapPath)) {
  errors.push("missing site/sitemap.xml");
} else {
  const xml = fs.readFileSync(sitemapPath, "utf8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1].trim());
  for (const loc of locs) {
    let p;
    try {
      p = new URL(loc).pathname;
    } catch {
      errors.push(`invalid sitemap loc: ${loc}`);
      continue;
    }
    if (!resolveExists(p)) {
      errors.push(`sitemap loc missing file: ${loc}`);
    }
    // Sitemap canonicals must not be a 301/302 "from" (legacy .html is OK as redirect source, not as loc)
    const locPath = p.endsWith("/") && p !== "/" ? p.slice(0, -1) : p;
    if (redirectFroms.has(locPath) || redirectFroms.has(p)) {
      errors.push(`sitemap loc is a redirect-away from: ${loc}`);
    }
  }
}

// --- 3. hreflang reciprocal ES↔EN ---
function pageUrlFromFile(file) {
  let rel = path.relative(siteDir, file).replace(/\\/g, "/");
  if (rel === "index.html") return `${host}/`;
  if (rel.endsWith("/index.html")) {
    return `${host}/` + rel.slice(0, -"index.html".length);
  }
  if (rel.endsWith(".html")) rel = rel.slice(0, -5);
  return `${host}/${rel}`;
}

const hreflangByUrl = new Map(); // page canonical-ish url -> {es, en}
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const alts = {};
  for (const m of html.matchAll(
    /<link\s+[^>]*rel=["']alternate["'][^>]*>/gi
  )) {
    const tag = m[0];
    const hl = tag.match(/hreflang=["']([^"']+)["']/i)?.[1];
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
    if (hl && href) alts[hl] = href.replace(/\/$/, "") || href;
  }
  if (!alts.es && !alts.en) continue;
  const self = pageUrlFromFile(file).replace(/\/$/, "") || `${host}/`;
  hreflangByUrl.set(self, alts);
}

for (const [page, alts] of hreflangByUrl) {
  if (alts.es && alts.en) {
    const esNorm = alts.es.replace(/\/$/, "");
    const enNorm = alts.en.replace(/\/$/, "");
    const esAlts = hreflangByUrl.get(esNorm) || hreflangByUrl.get(esNorm + "/") ;
    // find by matching keys
    let esEntry = null;
    let enEntry = null;
    for (const [k, v] of hreflangByUrl) {
      if (k.replace(/\/$/, "") === esNorm) esEntry = v;
      if (k.replace(/\/$/, "") === enNorm) enEntry = v;
    }
    if (!esEntry) {
      errors.push(`hreflang es target missing page: ${alts.es} (from ${page})`);
    } else {
      const back = (esEntry.en || "").replace(/\/$/, "");
      if (back !== enNorm) {
        errors.push(`hreflang not reciprocal: ${alts.es} en→${esEntry.en} expected ${alts.en}`);
      }
    }
    if (!enEntry) {
      errors.push(`hreflang en target missing page: ${alts.en} (from ${page})`);
    } else {
      const back = (enEntry.es || "").replace(/\/$/, "");
      if (back !== esNorm) {
        errors.push(`hreflang not reciprocal: ${alts.en} es→${enEntry.es} expected ${alts.es}`);
      }
    }
  }
}

// --- 4. ES/EN blog parity ---
const esBlog = path.join(siteDir, "blog");
const enBlog = path.join(siteDir, "en", "blog");
if (fs.existsSync(esBlog)) {
  for (const name of fs.readdirSync(esBlog)) {
    if (!name.endsWith(".html") || name === "index.html") continue;
    const slug = name.replace(/\.html$/, "");
    if (esOnly.has(slug)) continue;
    const enPath = path.join(enBlog, name);
    if (!fs.existsSync(enPath)) {
      errors.push(`ES blog post without EN pair: blog/${name}`);
    }
  }
}

// --- 5b. EN pages must not deep-link into ES surface paths ---
// Allow: /en/*, language switcher, hreflang/canonical (stripped), assets.
function isEnPageFile(rel) {
  return rel === "en/index.html" || rel.startsWith("en/");
}

for (const file of htmlFiles) {
  const rel = path.relative(siteDir, file).replace(/\\/g, "/");
  if (!isEnPageFile(rel)) continue;
  const html = fs.readFileSync(file, "utf8");

  // Strip alternate/canonical link tags before scanning anchors (hreflang ES is intentional)
  const scanned = html
    .replace(/<link\b[^>]*rel=["']alternate["'][^>]*>/gi, "")
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, "")
    .replace(/\bdata-url-es=["'][^"']*["']/gi, "");

  const hrefRe = /\bhref=["']([^"']+)["']/gi;
  let hm;
  while ((hm = hrefRe.exec(scanned))) {
    const raw = hm[1].trim();
    if (isExternalOrSpecial(raw) && !raw.startsWith(host)) continue;
    const internal = normalizeInternal(raw.split("#")[0] || raw, file);
    if (!internal) continue;

    // Relative ../blog from en/* resolving to /blog is the classic leak
    const pathOnly = internal.split("?")[0];
    const isEsSurface =
      pathOnly === "/blog" ||
      pathOnly.startsWith("/blog/") ||
      pathOnly === "/tuko-ai" ||
      pathOnly === "/tuko-ai.html" ||
      pathOnly === "/privacidad" ||
      pathOnly === "/privacidad.html" ||
      pathOnly === "/terminos" ||
      pathOnly === "/terminos.html" ||
      // Absolute host without /en
      (raw.startsWith(host) &&
        !raw.startsWith(`${host}/en`) &&
        (/\/blog(\/|$)/.test(raw) ||
          /\/tuko-ai(\.html)?(\/|$|\?|#)/.test(raw) ||
          /\/privacidad(\.html)?(\/|$|\?|#)/.test(raw) ||
          /\/terminos(\.html)?(\/|$|\?|#)/.test(raw)));

    if (!isEsSurface) continue;

    // Lang switcher / ES twin controls
    const idx = hm.index ?? 0;
    const around = scanned.slice(Math.max(0, idx - 240), idx + 80);
    if (/lang-switcher|data-lang=["']es["']|mobile-lang|hreflang|data-url-es/i.test(around)) {
      continue;
    }

    errors.push(`EN page links to ES surface in ${rel}: ${raw} → ${pathOnly}`);
  }
}

// Deduplicate errors
const uniqErrors = [...new Set(errors)];
const uniqWarnings = [...new Set(warnings)];

for (const w of uniqWarnings) console.warn(`WARN: ${w}`);
for (const e of uniqErrors) console.error(`ERROR: ${e}`);

console.log(
  `\ncheck-site: ${uniqErrors.length} error(s), ${uniqWarnings.length} warning(s)`
);
if (uniqErrors.length) process.exit(1);
