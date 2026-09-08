// Build produkcyjny -> dist/produkcja/ : zminifikowany CSS wstawiony inline do HTML (bez requestu
// blokującego render), zminifikowany JS z hashem w nazwie, skopiowane img/ i media/,
// pliki nagłówków cache dla Cloudflare Pages / Netlify (_headers) i Apache (.htaccess).
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const esbuild = require('esbuild');

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const OUT = ROOT + 'dist/produkcja/';
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT + 'js', { recursive: true });

const css = esbuild.transformSync(readFileSync(ROOT + 'css/style.css', 'utf8'), { loader: 'css', minify: true }).code;
const js = esbuild.transformSync(readFileSync(ROOT + 'js/main.js', 'utf8'), { loader: 'js', minify: true, target: 'es2019' }).code;
const hash = createHash('sha1').update(js).digest('hex').slice(0, 8);
writeFileSync(`${OUT}js/main.${hash}.js`, js);

let html = readFileSync(ROOT + 'index.html', 'utf8');
// CSS inline (ścieżki url("../img/...") -> "img/...")
html = html.replace('<link rel="stylesheet" href="css/style.css">', () => `<style>${css.replace(/url\("\.\.\/img\//g, 'url("img/')}</style>`);
html = html.replace('<script src="js/main.js" defer></script>', `<script src="js/main.${hash}.js" defer></script>`);
// usuń komentarze HTML i zbędne wcięcia (bezpiecznie: tylko poza <pre>/<script>)
html = html.replace(/<!--[\s\S]*?-->/g, '').replace(/\n\s+</g, '\n<');
writeFileSync(OUT + 'index.html', html);

// zasoby: tylko warianty faktycznie użyte w HTML + filmy webowe (bez oryginałów Beko_Spot_*)
mkdirSync(OUT + 'img'); mkdirSync(OUT + 'media');
const uzyte = new Set([...html.matchAll(/img\/[a-z0-9-]+\.(?:avif|webp|jpg|png)/g)].map((m) => m[0]));
for (const f of uzyte) cpSync(ROOT + f, OUT + f);
for (const f of readdirSync(ROOT + 'media')) if (/^pyropro-.*\.(mp4|webm)$/.test(f)) cpSync(ROOT + 'media/' + f, OUT + 'media/' + f);

// nagłówki cache: obrazy/filmy/JS z hashem -> rok, HTML -> krótko
writeFileSync(OUT + '_headers', `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
/index.html
  Cache-Control: public, max-age=600, must-revalidate
/img/*
  Cache-Control: public, max-age=31536000, immutable
/media/*
  Cache-Control: public, max-age=31536000, immutable
/js/*
  Cache-Control: public, max-age=31536000, immutable
`);
writeFileSync(OUT + '.htaccess', `# Apache: kompresja i cache (odpowiednik _headers)
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml
</IfModule>
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/avif "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType video/mp4 "access plus 1 year"
  ExpiresByType video/webm "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/html "access plus 10 minutes"
</IfModule>
AddType image/avif .avif
AddType image/webp .webp
`);
const rozmiar = (d) => readdirSync(d, { withFileTypes: true }).reduce((a, e) => a + (e.isDirectory() ? rozmiar(d + e.name + '/') : readFileSync(d + e.name).length), 0);
console.log(`dist/produkcja: HTML ${(html.length / 1024).toFixed(0)} KB (CSS inline ${(css.length / 1024).toFixed(0)} KB), JS ${(js.length / 1024).toFixed(1)} KB, img ${uzyte.size} plików, razem ${(rozmiar(OUT) / 1048576).toFixed(1)} MB`);
