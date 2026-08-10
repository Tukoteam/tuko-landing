import fs from 'node:fs';

function fix(srcPath, destPath) {
  let html = fs.readFileSync(srcPath, 'utf8');
  html = html
    .replaceAll('../assets/', 'assets/')
    .replaceAll('href="../index.html"', 'href="/"')
    .replaceAll('href="../index.html#', 'href="/#')
    .replaceAll('href="../blog/index.html"', 'href="/blog/"')
    .replaceAll('href="../tuko-ai"', 'href="/tuko-ai"')
    .replaceAll('href="privacidad.html"', 'href="/privacidad"')
    .replaceAll('href="terminos.html"', 'href="/terminos"');
  fs.writeFileSync(destPath, html, 'utf8');
  console.log('wrote', destPath);
}

fix('pages/privacidad.html', 'privacidad.html');
fix('pages/terminos.html', 'terminos.html');
