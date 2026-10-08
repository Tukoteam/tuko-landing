import fs from 'fs';

const cssExtra = `
/* Skip link (extracted from inline for CSP hygiene) */
.skip-link {
  position: absolute;
  left: -9999px;
  top: 4px;
  z-index: 9999;
  padding: 8px 16px;
  background: #3D50F2;
  color: #fff;
  font-weight: 600;
  border-radius: 6px;
  text-decoration: none;
}
.skip-link:focus {
  left: 4px;
}
`;
fs.appendFileSync('assets/css/home.css', cssExtra);

for (const f of ['index.html', 'en/index.html']) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(
    /<a href="#main-content" class="skip-link" style="[^"]*" onfocus="[^"]*" onblur="[^"]*"/,
    '<a href="#main-content" class="skip-link"'
  );
  fs.writeFileSync(f, c);
  console.log('skip', f);
}
