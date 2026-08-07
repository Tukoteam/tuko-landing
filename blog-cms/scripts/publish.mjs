/**
 * Publica vía GitHub App (Contents API).
 * Requiere: secrets/github-app.pem + GITHUB_APP_ID + GITHUB_INSTALLATION_ID en .env
 *
 * Sin credenciales → sale con instrucciones (no falla el repo).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cmsRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(cmsRoot, '..');

function loadEnv() {
  const envPath = path.join(cmsRoot, '.env');
  if (!fs.existsSync(envPath)) return {};
  const out = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function appJwt(appId, pem) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ iat: now - 60, exp: now + 9 * 60, iss: appId }));
  const data = `${header}.${payload}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data);
  sign.end();
  const sig = sign.sign(pem).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${data}.${sig}`;
}

async function gh(url, token, opts = {}) {
  const res = await fetch(`https://api.github.com${url}`, {
    ...opts,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'tuko-blog-cms',
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  return body;
}

const env = { ...process.env, ...loadEnv() };
const pemPath = path.join(cmsRoot, 'secrets', 'github-app.pem');

if (!env.GITHUB_APP_ID || !env.GITHUB_INSTALLATION_ID || !fs.existsSync(pemPath)) {
  console.log('tuko · CMS publish\n');
  console.log('Faltan credenciales de GitHub App. Sigue blog-cms/README.md (Documento 4).');
  console.log('\nNecesario:');
  console.log('  - blog-cms/.env  → GITHUB_APP_ID, GITHUB_INSTALLATION_ID, GITHUB_OWNER, GITHUB_REPO');
  console.log('  - blog-cms/secrets/github-app.pem');
  console.log('\nMientras tanto puedes:');
  console.log('  npm run import');
  console.log('  npm run simulate');
  console.log('  npm run verify-seo');
  process.exit(0);
}

const pem = fs.readFileSync(pemPath, 'utf8');
const jwt = appJwt(env.GITHUB_APP_ID, pem);
const inst = await gh(`/app/installations/${env.GITHUB_INSTALLATION_ID}/access_tokens`, jwt, {
  method: 'POST',
  body: JSON.stringify({}),
});
const token = inst.token;
const owner = env.GITHUB_OWNER || 'desarollotuko';
const repo = env.GITHUB_REPO || 'pre-landing';
const branch = env.GITHUB_BRANCH || 'main';

const ref = await gh(`/repos/${owner}/${repo}/git/ref/heads/${branch}`, token);
const baseSha = ref.object.sha;
const baseCommit = await gh(`/repos/${owner}/${repo}/git/commits/${baseSha}`, token);

const paths = [
  'sitemap.xml',
  'blog/index.html',
  '_redirects',
  'vercel.json',
];
for (const f of fs.readdirSync(path.join(repoRoot, 'blog')).filter((x) => x.endsWith('.html'))) {
  paths.push(`blog/${f}`);
}

const blobs = [];
for (const p of paths) {
  const abs = path.join(repoRoot, p);
  if (!fs.existsSync(abs)) continue;
  const content = fs.readFileSync(abs);
  const blob = await gh(`/repos/${owner}/${repo}/git/blobs`, token, {
    method: 'POST',
    body: JSON.stringify({ content: content.toString('base64'), encoding: 'base64' }),
  });
  blobs.push({ path: p, mode: '100644', type: 'blob', sha: blob.sha });
  console.log('blob', p);
}

const tree = await gh(`/repos/${owner}/${repo}/git/trees`, token, {
  method: 'POST',
  body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree: blobs }),
});

const commit = await gh(`/repos/${owner}/${repo}/git/commits`, token, {
  method: 'POST',
  body: JSON.stringify({
    message: 'chore(blog): SEO clean URLs, analytics and CMS content sync',
    tree: tree.sha,
    parents: [baseSha],
  }),
});

await gh(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, token, {
  method: 'PATCH',
  body: JSON.stringify({ sha: commit.sha }),
});

console.log(`\n✓ Publicado commit ${commit.sha} → ${owner}/${repo}@${branch}`);
