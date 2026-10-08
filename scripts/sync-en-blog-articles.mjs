/**
 * Copia header+footer de en/blog/index.html a artículos EN.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogDir = path.resolve(__dirname, '..', 'site', 'en', 'blog');
const index = fs.readFileSync(path.join(blogDir, 'index.html'), 'utf8');

const headerMatch = index.match(/<header role="banner">[\s\S]*?(?=<main\b)/);
const footerMatch = index.match(/<!-- FOOTER -->\s*<footer>[\s\S]*?<\/footer>/)
  || index.match(/<footer>[\s\S]*?<\/footer>/);
if (!headerMatch || !footerMatch) {
  console.error('No header/footer in en/blog/index.html');
  process.exit(1);
}

const header = headerMatch[0].trimEnd() + '\n';
const footer = footerMatch[0].startsWith('<!--')
  ? footerMatch[0]
  : `<!-- FOOTER -->\n${footerMatch[0]}`;

let ok = 0;
for (const f of fs.readdirSync(blogDir)) {
  if (!f.endsWith('.html') || f === 'index.html') continue;
  const p = path.join(blogDir, f);
  let html = fs.readFileSync(p, 'utf8');
  html = html.replace(
    /(?:<!--\s*NAV\s*-->\s*)?(?:<header\b[\s\S]*?<\/header>\s*)?(?:<nav\b[\s\S]*?<\/nav>\s*)?(?:<div class="mobile-menu"[\s\S]*?)?(?=<main\b)/,
    `${header}\n`
  );
  html = html.replace(
    /(?:<!--\s*FOOTER\s*-->\s*)?<footer\b[\s\S]*?<\/footer>/,
    footer
  );
  // Legal PDFs → HTML EN
  html = html.replace(
    /href="[^"]*politica-de-privacidad\.pdf"[^>]*>/gi,
    'href="/en/privacidad">'
  );
  html = html.replace(
    /href="[^"]*terminos-y-condiciones\.pdf"[^>]*>/gi,
    'href="/en/terminos">'
  );
  fs.writeFileSync(p, html);
  ok += 1;
  console.log('OK', f);
}
console.log('DONE', ok);
