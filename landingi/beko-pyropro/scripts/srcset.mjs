// Przepisuje w index.html atrybuty src/srcset/width/height każdego <img> i <source>
// na podstawie plików faktycznie obecnych w img/ (po `npm run obrazy`).
// Dzięki temu po podmianie źródeł w img/src/ HTML nie wymaga ręcznych poprawek.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const pliki = readdirSync(ROOT + 'img/').filter((f) => /-\d+\.(avif|webp|jpg|png)$/.test(f));
const manifest = {}; // nazwa -> { avif: [w...], webp: [...], jpg|png: [...] }
for (const f of pliki) {
  const m = f.match(/^(.+)-(\d+)\.(avif|webp|jpg|png)$/);
  ((manifest[m[1]] ??= {})[m[3]] ??= []).push(+m[2]);
}
for (const n of Object.values(manifest)) for (const k of Object.keys(n)) n[k].sort((a, b) => a - b);

const wymiary = {};
for (const [nazwa, fm] of Object.entries(manifest)) {
  const ext = fm.jpg ? 'jpg' : 'png';
  const w = Math.max(...fm[ext]);
  const meta = await sharp(`${ROOT}img/${nazwa}-${w}.${ext}`).metadata();
  wymiary[nazwa] = { w: meta.width, h: meta.height, ext };
}

let html = readFileSync(ROOT + 'index.html', 'utf8');
const srcset = (nazwa, ext) => manifest[nazwa][ext].map((w) => `img/${nazwa}-${w}.${ext} ${w}w`).join(', ');
const baza = (s) => s.match(/img\/([a-z0-9-]+)-\d+\.(avif|webp|jpg|png)/);
let zmiany = 0;

// <source type="image/avif|webp" ... srcset="img/NAZWA-...">
html = html.replace(/<source type="image\/(avif|webp)"([^>]*?)srcset="([^"]+)"/g, (m, typ, przed, ss) => {
  const b = baza(ss); if (!b || !manifest[b[1]]?.[typ]) return m;
  zmiany++; return `<source type="image/${typ}"${przed}srcset="${srcset(b[1], typ)}"`;
});
// <img src="img/NAZWA-..." [srcset=...] width height>
html = html.replace(/<img ([^>]*?)>/g, (m, attrs) => {
  const b = baza(attrs); if (!b) return m;
  const n = b[1], d = wymiary[n]; if (!d) return m;
  const ma = manifest[n][d.ext];
  let a = attrs.replace(/src="[^"]+"/, `src="img/${n}-${Math.max(...ma)}.${d.ext}"`);
  if (/srcset="/.test(a)) a = a.replace(/srcset="[^"]+"/, `srcset="${srcset(n, d.ext)}"`);
  a = a.replace(/width="\d+"/, `width="${d.w}"`).replace(/height="\d+"/, `height="${d.h}"`);
  if (a !== attrs) zmiany++;
  return `<img ${a}>`;
});
// preload hero
html = html.replace(/(<link rel="preload" as="image" href=")[^"]+(" imagesrcset=")[^"]+(")/, (m, a, b, c) =>
  `${a}img/hero-${Math.max(...manifest.hero.avif)}.avif${b}${srcset('hero', 'avif')}${c}`);
writeFileSync(ROOT + 'index.html', html);

// kontrola: każdy plik z HTML istnieje
const brak = [...new Set(html.match(/img\/[a-z0-9-]+\.(avif|webp|jpg|png)/g))].filter((p) => !pliki.includes(p.slice(4)));
console.log(`srcset: ${zmiany} atrybutów zaktualizowanych, ${Object.keys(manifest).length} zasobów; brakujące: ${brak.length ? brak.join(', ') : 'brak'}`);
