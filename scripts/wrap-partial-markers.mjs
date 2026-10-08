/**
 * Wrap chrome regions with tuko:partial markers on key pages (idempotent).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');

const targets = [
  { file: 'index.html', nav: 'nav-es', footer: 'footer-es', theme: true },
  { file: 'en/index.html', nav: 'nav-en', footer: 'footer-en', theme: true },
  { file: 'blog/index.html', nav: 'nav-es', footer: 'footer-es', theme: true },
  { file: 'en/blog/index.html', nav: 'nav-en', footer: 'footer-en', theme: true },
  { file: 'privacidad.html', nav: 'nav-es', footer: 'footer-es', theme: true },
  { file: 'terminos.html', nav: 'nav-es', footer: 'footer-es', theme: true },
  { file: 'en/privacidad.html', nav: 'nav-en', footer: 'footer-en', theme: true },
  { file: 'en/terminos.html', nav: 'nav-en', footer: 'footer-en', theme: true },
  { file: 'tuko-ai.html', nav: 'nav-es', footer: 'footer-es', theme: true },
  { file: 'en/tuko-ai.html', nav: 'nav-en', footer: 'footer-en', theme: true },
];

function wrapNav(html, name) {
  if (html.includes(`<!-- tuko:partial:${name} -->`)) return html;
  // Close after mobile-cta (nested divs inside mobile-menu break naive <\/div>)
  const re =
    /(?:<!--\s*NAV\s*-->\s*)?<header\b[\s\S]*?<\/header>\s*(?:<!--\s*MOBILE MENU\s*-->\s*)?<div class="mobile-menu"[\s\S]*?<a[^>]*class="mobile-cta"[\s\S]*?<\/a>\s*<\/div>/i;
  if (!re.test(html)) {
    console.warn('nav pattern miss', name);
    return html;
  }
  return html.replace(re, (block) => {
    return `<!-- tuko:partial:${name} -->\n${block.trim()}\n<!-- /tuko:partial:${name} -->\n\n`;
  });
}

function wrapFooter(html, name) {
  if (html.includes(`<!-- tuko:partial:${name} -->`)) return html;
  return html.replace(
    /(?:<!--\s*FOOTER\s*-->\s*)?<footer\b[\s\S]*?<\/footer>/i,
    (block) => `<!-- tuko:partial:${name} -->\n${block}\n<!-- /tuko:partial:${name} -->`
  );
}

function wrapTheme(html) {
  if (html.includes('<!-- tuko:partial:theme-head -->')) return html;
  return html.replace(
    /<script>\(function\(\)\{try\{var t=localStorage\.getItem\("tuko_theme"\)[\s\S]*?<\/script>/,
    (block) =>
      `<!-- tuko:partial:theme-head -->\n${block}\n<!-- /tuko:partial:theme-head -->`
  );
}

for (const t of targets) {
  const p = path.join(site, t.file);
  if (!fs.existsSync(p)) {
    console.warn('skip', t.file);
    continue;
  }
  let html = fs.readFileSync(p, 'utf8');
  if (t.theme) html = wrapTheme(html);
  html = wrapNav(html, t.nav);
  html = wrapFooter(html, t.footer);
  fs.writeFileSync(p, html);
  console.log('wrapped', t.file);
}
