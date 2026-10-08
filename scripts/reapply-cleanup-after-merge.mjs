import fs from 'fs';
import path from 'path';

function walk(d, a = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (['node_modules', '.git', '_to-migrate', '_versiones'].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, a);
    else if (e.name.endsWith('.html')) a.push(p);
  }
  return a;
}

const logoMap = [
  ['assets/logos colaboradores/UPM-color.svg', 'assets/logos-colaboradores/upm-color.svg'],
  ['assets/logos colaboradores/Xiji Incubator - Logo.png', 'assets/logos-colaboradores/xiji-incubator-logo.png'],
  ['assets/logos colaboradores/Ocea-Hub-color.png', 'assets/logos-colaboradores/ocea-hub-color.png'],
  ['assets/logos colaboradores/Bio-Vida-Sana-color.png', 'assets/logos-colaboradores/bio-vida-sana-color.png'],
  ['assets/logos colaboradores/Saper - Logo.png', 'assets/logos-colaboradores/saper-logo.png'],
  ['../assets/logos colaboradores/UPM-color.svg', '../assets/logos-colaboradores/upm-color.svg'],
  ['../assets/logos colaboradores/Xiji Incubator - Logo.png', '../assets/logos-colaboradores/xiji-incubator-logo.png'],
  ['../assets/logos colaboradores/Ocea-Hub-color.png', '../assets/logos-colaboradores/ocea-hub-color.png'],
  ['../assets/logos colaboradores/Bio-Vida-Sana-color.png', '../assets/logos-colaboradores/bio-vida-sana-color.png'],
  ['../assets/logos colaboradores/Saper - Logo.png', '../assets/logos-colaboradores/saper-logo.png'],
];

const bannerMap = [
  ['ChatGPT Image 11 mar 2026, 16_21_45.webp', 'chatgpt-image-11-mar-2026-16-21-45.webp'],
  ['ChatGPT Image 11 mar 2026, 16_29_14.webp', 'chatgpt-image-11-mar-2026-16-29-14.webp'],
  ['ChatGPT Image 11 mar 2026, 16_29_29.webp', 'chatgpt-image-11-mar-2026-16-29-29.webp'],
  ['ChatGPT Image 11 mar 2026, 17_59_56.webp', 'chatgpt-image-11-mar-2026-17-59-56.webp'],
  ['ChatGPT Image 11 mar 2026, 18_03_24.webp', 'chatgpt-image-11-mar-2026-18-03-24.webp'],
  ['ChatGPT Image 11 mar 2026, 18_23_16.webp', 'chatgpt-image-11-mar-2026-18-23-16.webp'],
  ['ChatGPT Image 11 mar 2026, 18_44_43.webp', 'chatgpt-image-11-mar-2026-18-44-43.webp'],
  ['Esta la mejorare con claude.webp', 'esta-la-mejorare-con-claude.webp'],
  ['ChatGPT Image 11 mar 2026, 16_21_45.png', 'chatgpt-image-11-mar-2026-16-21-45.webp'],
  ['ChatGPT Image 11 mar 2026, 16_29_29.png', 'chatgpt-image-11-mar-2026-16-29-29.webp'],
  ['ChatGPT Image 11 mar 2026, 17_59_56.png', 'chatgpt-image-11-mar-2026-17-59-56.webp'],
  ['ChatGPT Image 11 mar 2026, 18_03_24.png', 'chatgpt-image-11-mar-2026-18-03-24.webp'],
  ['ChatGPT Image 11 mar 2026, 18_23_16.png', 'chatgpt-image-11-mar-2026-18-23-16.webp'],
  ['ChatGPT Image 11 mar 2026, 18_44_43.png', 'chatgpt-image-11-mar-2026-18-44-43.webp'],
  ['Esta la mejorare con claude.png', 'esta-la-mejorare-con-claude.webp'],
];

function cookieSnippet(cssHref, jsHref) {
  return (
    '<link rel="stylesheet" href="' +
    cssHref +
    '">\n' +
    '<script src="' +
    jsHref +
    '" defer></script>'
  );
}

for (const f of walk('.')) {
  let c = fs.readFileSync(f, 'utf8');
  const o = c;
  for (const [a, b] of logoMap) c = c.split(a).join(b);
  for (const [a, b] of bannerMap) c = c.split(a).join(b);

  if (c.includes('ga4-loader.js') && !c.includes('cookie-consent.js')) {
    if (c.includes('src="/assets/js/ga4-loader.js"')) {
      c = c.replace(
        /<script src="\/assets\/js\/ga4-loader\.js"[^>]*><\/script>/,
        (m) => m + '\n' + cookieSnippet('/assets/css/cookie-consent.css', '/assets/js/cookie-consent.js')
      );
    } else if (c.includes('src="../assets/js/ga4-loader.js"')) {
      c = c.replace(
        /<script src="\.\.\/assets\/js\/ga4-loader\.js"[^>]*><\/script>/,
        (m) => m + '\n' + cookieSnippet('../assets/css/cookie-consent.css', '../assets/js/cookie-consent.js')
      );
    } else if (c.includes('src="assets/js/ga4-loader.js"')) {
      c = c.replace(
        /<script src="assets\/js\/ga4-loader\.js"[^>]*><\/script>/,
        (m) => m + '\n' + cookieSnippet('assets/css/cookie-consent.css', 'assets/js/cookie-consent.js')
      );
    } else if (c.includes('src="../../assets/js/ga4-loader.js"')) {
      c = c.replace(
        /<script src="\.\.\/\.\.\/assets\/js\/ga4-loader\.js"[^>]*><\/script>/,
        (m) =>
          m +
          '\n' +
          cookieSnippet('../../assets/css/cookie-consent.css', '../../assets/js/cookie-consent.js')
      );
    }
  }

  if (c !== o) {
    fs.writeFileSync(f, c);
    console.log('fixed', f);
  }
}

console.log('done');
