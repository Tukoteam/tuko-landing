/**
 * Surface inventory: curl -sI style checks for publish hygiene.
 * Usage: node scripts/check-surface.mjs <BASE_URL> [sitemapPath] [outFile]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const base = (process.argv[2] || "https://tukoteam.com").replace(/\/$/, "");
const sitemapPath =
  process.argv[3] || path.join(root, "site", "sitemap.xml");
const outFile =
  process.argv[4] || path.join(root, "docs", "PR-B-inventory-before.txt");

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

function extractRedirectFroms() {
  const froms = new Set();
  const toml = fs.readFileSync(path.join(root, "netlify.toml"), "utf8");
  for (const m of toml.matchAll(/from\s*=\s*"([^"]+)"/g)) froms.add(m[1]);
  const redir = path.join(root, "_redirects");
  if (fs.existsSync(redir)) {
    for (const line of fs.readFileSync(redir, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const parts = t.split(/\s+/);
      if (parts[0]) froms.add(parts[0]);
    }
  }
  return [...froms];
}

const internal = [
  "/AGENTS.md",
  "/CLAUDE.md",
  "/ARCHITECTURE.md",
  "/README.md",
  "/SEO_NOTES.md",
  "/package.json",
  "/serve.json",
  "/docs/SPRINT3-CTO-OPINION.md",
  "/docs/SPRINT3-LOVABLE-HANDOFF.md",
  "/docs/SPRINT3-PR-B-CTO-OK.md",
  "/scripts/README.md",
  "/_to-migrate/README.md",
  "/google5360a4cde3647abe.html",
];

function toUrl(entry) {
  if (entry.startsWith("http")) return entry;
  const p = entry.startsWith("/") ? entry : `/${entry}`;
  return `${base}${p.replace(/\*$/, "x")}`;
}

async function probe(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "manual" });
    const h = res.headers;
    return {
      url,
      status: res.status,
      location: h.get("location") || "",
      csp: h.get("content-security-policy") || "",
      pp: h.get("permissions-policy") || "",
      cache: h.get("cache-control") || "",
    };
  } catch (e) {
    return { url, status: "ERR", location: "", csp: "", pp: "", cache: String(e) };
  }
}

const urls = new Set();
if (fs.existsSync(sitemapPath)) {
  for (const loc of extractLocs(fs.readFileSync(sitemapPath, "utf8"))) urls.add(loc);
}
for (const f of extractRedirectFroms()) urls.add(toUrl(f));
for (const p of internal) urls.add(`${base}${p}`);

const list = [...urls].sort();
const lines = [
  `# Surface inventory`,
  `# base=${base}`,
  `# generated=${new Date().toISOString()}`,
  `# count=${list.length}`,
  ``,
];

for (const u of list) {
  const r = await probe(u);
  lines.push(
    [
      r.status,
      r.url,
      r.location ? `Location=${r.location}` : "",
      r.csp ? `CSP=yes` : "CSP=",
      r.pp ? `PP=${r.pp.slice(0, 80)}` : "PP=",
      r.cache ? `Cache=${r.cache}` : "",
    ]
      .filter(Boolean)
      .join(" | ")
  );
  process.stdout.write(".");
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, lines.join("\n") + "\n");
console.log(`\nWrote ${outFile} (${list.length} URLs)`);
