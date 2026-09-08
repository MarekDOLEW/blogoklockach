// Buduje jednoplikowe wersje strony do podglądu / hostingu bez serwera plików:
//   dist/index.html    – pełny dokument HTML z inline CSS, JS i obrazami (data URI)
//   dist/artifact.html – ta sama treść bez szkieletu <html>/<head>/<body>
//                        (format wymagany przez hosting Artifacts na claude.ai)
// W wersji inline zostawiamy tylko WebP + JPG (bez AVIF), żeby plik był mniejszy.
// Produkcyjnie wdrażamy normalne pliki (index.html + css/ + js/ + img/), nie ten build.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
mkdirSync(ROOT + 'dist', { recursive: true });

let html = readFileSync(ROOT + 'index.html', 'utf8');
const css = readFileSync(ROOT + 'css/style.css', 'utf8');
const js = readFileSync(ROOT + 'js/main.js', 'utf8');
const MIME = { jpg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif', png: 'image/png', mp4: 'video/mp4', webm: 'video/webm' };
const cache = new Map();
const dataUri = (sciezka) => {
  if (!cache.has(sciezka)) {
    const ext = sciezka.split('.').pop();
    cache.set(sciezka, `data:${MIME[ext]};base64,${readFileSync(ROOT + sciezka).toString('base64')}`);
  }
  return cache.get(sciezka);
};

// 1. usuń <source type="image/avif"> i preload AVIF (mniejszy plik inline)
html = html.replace(/\s*<source type="image\/avif"[^>]*>/g, '');
html = html.replace(/\s*<link rel="preload" as="image"[^>]*>/, '');
// 2. inline CSS i JS
const cssInline = css.replace(/url\("\.\.\/(img\/[a-z0-9-]+\.(?:jpg|webp|png))"\)/g, (m, p) => `url("${dataUri(p)}")`);
html = html.replace(/<link rel="stylesheet" href="css\/style\.css">/, () => `<style>\n${cssInline}\n</style>`);
html = html.replace(/<script src="js\/main\.js" defer><\/script>/, () => `<script>\n${js}\n</script>`);
// 3. obrazy -> data URI (src, srcset)
// tylko lokalne ścieżki (nie fragmenty adresów absolutnych w og:image / JSON-LD)
html = html.replace(/(?<![\w\/])img\/[a-z0-9-]+\.(?:jpg|webp|png)/g, (m) => dataUri(m));
// filmy: w podglądzie jednoplikowym osadzamy tylko lekkie WebM (limit 16 MB); MP4 zostaje na produkcji w media/
html = html.replace(/data-wideo="media\/[a-z0-9-]+\.mp4"/g, 'data-wideo=""');
html = html.replace(/data-wideo-webm="(media\/[a-z0-9-]+\.webm)"/g, (m, p) => `data-wideo-webm="${dataUri(p)}"`);
html = html.replace(/\s*<source src="media\/[a-z0-9-]+\.mp4" type="video\/mp4">/g, '');
html = html.replace(/<source src="(media\/[a-z0-9-]+\.webm)" type="video\/webm">/g, (m, p) => `<source src="${dataUri(p)}" type="video/webm">`);

writeFileSync(ROOT + 'dist/index.html', html);

// 4. wariant „artifact”: tylko zawartość <head> (bez meta charset/viewport) + <body>
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1]
  .replace(/\s*<meta charset="utf-8">/, '')
  .replace(/\s*<meta name="viewport"[^>]*>/, '');
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1];
writeFileSync(ROOT + 'dist/artifact.html', `${head.trim()}\n${body.trim()}\n`);

const kb = (p) => (readFileSync(ROOT + p).length / 1024).toFixed(0) + ' KB';
console.log(`dist/index.html: ${kb('dist/index.html')}, dist/artifact.html: ${kb('dist/artifact.html')} (${cache.size} obrazów inline)`);
