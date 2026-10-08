import fs from 'fs';

function extract(file, { writeAssets, cssHref, jsAnimHref, jsUiHref }) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const styleStart = lines.findIndex((l) => l.trim() === '<style>');
  const styleEnd = lines.findIndex((l, i) => i > styleStart && l.trim() === '</style>');
  let s1 = -1,
    s1e = -1,
    s2 = -1,
    s2e = -1;
  for (let i = styleEnd + 1; i < lines.length; i++) {
    if (s1 < 0 && lines[i].trim() === '<script>') {
      s1 = i;
      continue;
    }
    if (s1 >= 0 && s1e < 0 && lines[i].trim() === '</script>') {
      s1e = i;
      continue;
    }
    if (s1e >= 0 && s2 < 0 && lines[i].trim() === '<script>') {
      s2 = i;
      continue;
    }
    if (s2 >= 0 && s2e < 0 && lines[i].trim() === '</script>') {
      s2e = i;
      break;
    }
  }
  console.log(file, { styleStart, styleEnd, s1, s1e, s2, s2e });
  if ([styleStart, styleEnd, s1, s1e, s2, s2e].some((x) => x < 0)) {
    throw new Error('markers missing in ' + file);
  }
  const css = lines.slice(styleStart + 1, styleEnd).join('\n') + '\n';
  const js1 = lines.slice(s1 + 1, s1e).join('\n') + '\n';
  const js2 = lines.slice(s2 + 1, s2e).join('\n') + '\n';
  if (writeAssets) {
    fs.writeFileSync('assets/css/home.css', css);
    fs.writeFileSync('assets/js/home-animations.js', js1);
    fs.writeFileSync('assets/js/home-ui.js', js2);
  }
  const out = [
    ...lines.slice(0, styleStart),
    '<link rel="stylesheet" href="' + cssHref + '">',
    ...lines.slice(styleEnd + 1, s1),
    '<script src="' + jsAnimHref + '"></script>',
    '<script src="' + jsUiHref + '"></script>',
    ...lines.slice(s2e + 1),
  ].join('\n');
  fs.writeFileSync(file, out);
  console.log('wrote', file, 'lines', out.split('\n').length);
}

// ES home is source of truth for shared assets
extract('index.html', {
  writeAssets: true,
  cssHref: '/assets/css/home.css',
  jsAnimHref: '/assets/js/home-animations.js',
  jsUiHref: '/assets/js/home-ui.js',
});

// EN home: if still has inline blocks, extract without overwriting shared assets
// (EN currently embeds its own translations in the second script — keep separate file)
const enLines = fs.readFileSync('en/index.html', 'utf8').split(/\r?\n/);
const hasStyle = enLines.some((l) => l.trim() === '<style>');
if (hasStyle) {
  // Extract EN UI script separately if different
  const styleStart = enLines.findIndex((l) => l.trim() === '<style>');
  const styleEnd = enLines.findIndex((l, i) => i > styleStart && l.trim() === '</style>');
  let s1 = -1,
    s1e = -1,
    s2 = -1,
    s2e = -1;
  for (let i = styleEnd + 1; i < enLines.length; i++) {
    if (s1 < 0 && enLines[i].trim() === '<script>') {
      s1 = i;
      continue;
    }
    if (s1 >= 0 && s1e < 0 && enLines[i].trim() === '</script>') {
      s1e = i;
      continue;
    }
    if (s1e >= 0 && s2 < 0 && enLines[i].trim() === '<script>') {
      s2 = i;
      continue;
    }
    if (s2 >= 0 && s2e < 0 && enLines[i].trim() === '</script>') {
      s2e = i;
      break;
    }
  }
  const js1 = enLines.slice(s1 + 1, s1e).join('\n') + '\n';
  const js2 = enLines.slice(s2 + 1, s2e).join('\n') + '\n';
  const esAnim = fs.readFileSync('assets/js/home-animations.js', 'utf8');
  const esUi = fs.readFileSync('assets/js/home-ui.js', 'utf8');
  const animSame = js1 === esAnim;
  const uiSame = js2 === esUi;
  console.log({ animSame, uiSame, enUiLen: js2.length, esUiLen: esUi.length });
  let jsAnimHref = '/assets/js/home-animations.js';
  let jsUiHref = '/assets/js/home-ui.js';
  if (!animSame) {
    fs.writeFileSync('assets/js/home-animations-en.js', js1);
    jsAnimHref = '/assets/js/home-animations-en.js';
  }
  if (!uiSame) {
    fs.writeFileSync('assets/js/home-ui-en.js', js2);
    jsUiHref = '/assets/js/home-ui-en.js';
  }
  const out = [
    ...enLines.slice(0, styleStart),
    '<link rel="stylesheet" href="/assets/css/home.css">',
    ...enLines.slice(styleEnd + 1, s1),
    '<script src="' + jsAnimHref + '"></script>',
    '<script src="' + jsUiHref + '"></script>',
    ...enLines.slice(s2e + 1),
  ].join('\n');
  fs.writeFileSync('en/index.html', out);
  console.log('wrote en/index.html lines', out.split('\n').length);
}
