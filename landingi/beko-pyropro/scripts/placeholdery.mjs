// Generuje placeholdery zdjęć w docelowych wymiarach do img/src/.
// Docelowo pliki w img/src/ podmienia się na wycięte z layoutu zdjęcia
// (te same nazwy), a `npm run obrazy` tworzy z nich warianty AVIF/WebP/JPG.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT = new URL('../img/src/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const NAVY = '#0a2c5c', NAVY2 = '#061c3d', YEL = '#f2c300', GREY = '#e9edf2';

const glove = (x, y, s, rot = 0) => `
<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
  <path fill="${YEL}" d="M40 160c-20 0-32-14-32-36V60c0-9 7-16 16-16s16 7 16 16v34h6V24c0-9 7-16 16-16s16 7 16 16v70h6V12c0-9 7-16 16-16s16 7 16 16v82h6V30c0-9 7-16 16-16s16 7 16 16v96c0 20-16 36-36 36H40z"/>
  <path fill="${YEL}" d="M120 120l30-46c5-8 16-10 23-4 7 6 8 17 2 24l-40 52z"/>
  <rect x="34" y="150" width="90" height="34" rx="6" fill="#d9ad00"/>
</g>`;

const oven = (x, y, w, h) => `
<g transform="translate(${x} ${y})">
  <rect width="${w}" height="${h}" rx="${w * 0.03}" fill="#2b2f36"/>
  <rect x="${w * 0.05}" y="${h * 0.06}" width="${w * 0.9}" height="${h * 0.13}" rx="4" fill="#15181d"/>
  <rect x="${w * 0.08}" y="${h * 0.09}" width="${w * 0.22}" height="${h * 0.07}" rx="3" fill="#3a3f47"/>
  <rect x="${w * 0.36}" y="${h * 0.09}" width="${w * 0.28}" height="${h * 0.07}" rx="3" fill="#0e4f9e"/>
  <rect x="${w * 0.05}" y="${h * 0.24}" width="${w * 0.9}" height="${h * 0.06}" rx="3" fill="#8d939c"/>
  <rect x="${w * 0.05}" y="${h * 0.34}" width="${w * 0.9}" height="${h * 0.6}" rx="6" fill="#0b0d10"/>
  <rect x="${w * 0.12}" y="${h * 0.42}" width="${w * 0.76}" height="${h * 0.44}" rx="4" fill="#3c2a10" opacity=".9"/>
  <rect x="${w * 0.12}" y="${h * 0.42}" width="${w * 0.76}" height="${h * 0.44}" rx="4" fill="url(#glow)"/>
</g>`;

const scene = (w, h, bg, inner, label) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/>
    </linearGradient>
    <radialGradient id="glow" cx=".5" cy=".6" r=".7">
      <stop offset="0" stop-color="#ff9a1f" stop-opacity=".55"/><stop offset="1" stop-color="#ff9a1f" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  ${inner}
  <text x="${w / 2}" y="${h - 14}" font-family="Arial, sans-serif" font-size="${Math.max(11, Math.round(w / 90))}" fill="#ffffff" fill-opacity=".55" text-anchor="middle">PLACEHOLDER · ${label} · ${w}×${h}</text>
</svg>`;

const family = (w, h) => `
  <ellipse cx="${w * 0.62}" cy="${h * 0.85}" rx="${w * 0.42}" ry="${h * 0.35}" fill="#1c4b8e" opacity=".55"/>
  <circle cx="${w * 0.66}" cy="${h * 0.34}" r="${h * 0.12}" fill="#e8c7a6"/>
  <rect x="${w * 0.58}" y="${h * 0.46}" width="${w * 0.16}" height="${h * 0.42}" rx="${w * 0.03}" fill="#334b66"/>
  <circle cx="${w * 0.5}" cy="${h * 0.5}" r="${h * 0.09}" fill="#f0d2b4"/>
  <rect x="${w * 0.445}" y="${h * 0.59}" width="${w * 0.11}" height="${h * 0.3}" rx="${w * 0.02}" fill="#c14b5a"/>
  ${glove(w * 0.36, h * 0.52, h / 520, -20)}
  ${glove(w * 0.72, h * 0.5, h / 520, 15)}`;

const jobs = [
  ['hero', 1400, 700, [NAVY2, NAVY], (w, h) => family(w, h), 'Rodzina w kuchni w żółtych rękawicach (hero desktop)'],
  ['hero-mobile', 780, 880, [NAVY2, NAVY], (w, h) => family(w, h), 'Rodzina w kuchni (hero mobile)'],
  ['rekawica-balon', 640, 640, [NAVY, NAVY2], (w, h) => `
      <circle cx="${w * 0.42}" cy="${h * 0.42}" r="${h * 0.08}" fill="#f0d2b4"/>
      <rect x="${w * 0.37}" y="${h * 0.5}" width="${w * 0.1}" height="${h * 0.36}" rx="${w * 0.02}" fill="#5c7aa0"/>
      <line x1="${w * 0.46}" y1="${h * 0.55}" x2="${w * 0.62}" y2="${h * 0.3}" stroke="#fff" stroke-width="2"/>
      ${glove(w * 0.52, h * 0.02, h / 640, 10)}`, 'Kobieta z balonem-rękawicą'],
  ['sciereczka', 520, 360, [NAVY2, NAVY], (w, h) => `
      <path d="M${w * 0.15} ${h * 0.55} q ${w * 0.15} -${h * 0.3} ${w * 0.35} -${h * 0.1} t ${w * 0.35} ${h * 0.05} l -${w * 0.05} ${h * 0.3} q -${w * 0.3} ${h * 0.1} -${w * 0.6} 0z" fill="${YEL}"/>`, 'Żółta ściereczka'],
  ['skarbonka-rekawica', 520, 440, [NAVY2, NAVY], (w, h) => `
      <ellipse cx="${w * 0.5}" cy="${h * 0.55}" rx="${w * 0.3}" ry="${h * 0.25}" fill="${YEL}"/>
      <circle cx="${w * 0.76}" cy="${h * 0.5}" r="${h * 0.12}" fill="${YEL}"/>
      <circle cx="${w * 0.8}" cy="${h * 0.48}" r="5" fill="#333"/>
      <rect x="${w * 0.42}" y="${h * 0.3}" width="${w * 0.14}" height="${h * 0.03}" rx="4" fill="#8a6d00"/>`, 'Rękawica jako skarbonka'],
  ['wideo-plakat', 1400, 620, [NAVY2, '#1a1a1a'], (w, h) => `${oven(w * 0.28, h * 0.08, w * 0.44, h * 0.98)}
      <circle cx="${w * 0.66}" cy="${h * 0.6}" r="${h * 0.06}" fill="#f0d2b4"/>`, 'Kadr wideo: piekarnik i dłoń przy panelu'],
  ['produkt-1', 400, 400, ['#ffffff', GREY], (w, h) => oven(w * 0.12, h * 0.08, w * 0.76, h * 0.8), 'Piekarnik – model 1'],
  ['produkt-2', 400, 400, ['#ffffff', GREY], (w, h) => oven(w * 0.12, h * 0.08, w * 0.76, h * 0.8), 'Piekarnik – model 2'],
  ['produkt-3', 400, 400, ['#ffffff', GREY], (w, h) => oven(w * 0.12, h * 0.08, w * 0.76, h * 0.8), 'Piekarnik – model 3'],
  ['produkt-4', 400, 400, ['#ffffff', GREY], (w, h) => oven(w * 0.12, h * 0.08, w * 0.76, h * 0.8), 'Piekarnik – model 4'],
  ['piekarnik-zawieszka', 800, 800, ['#ffffff', '#f4f6f8'], (w, h) => `${oven(w * 0.15, h * 0.05, w * 0.7, h * 0.92)}`, 'Piekarnik z zawieszką „Sprzątam”'],
  ['rekawica-lewa', 420, 640, ['#ffffff', '#ffffff'], (w, h) => glove(w * 0.05, h * 0.25, h / 300, -15), 'Rękawica lewa'],
  ['rekawica-prawa', 420, 640, ['#ffffff', '#ffffff'], (w, h) => glove(w * 0.2, h * 0.2, h / 300, 15), 'Rękawica prawa'],
  ['homewhiz-telefon', 420, 700, [GREY, '#f7f8fa'], (w, h) => `
      <rect x="${w * 0.15}" y="${h * 0.05}" width="${w * 0.7}" height="${h * 0.9}" rx="${w * 0.08}" fill="#1a1d22"/>
      <rect x="${w * 0.2}" y="${h * 0.1}" width="${w * 0.6}" height="${h * 0.8}" rx="${w * 0.04}" fill="#0a2c5c"/>
      <text x="${w * 0.5}" y="${h * 0.5}" font-family="Arial" font-weight="700" font-size="${w * 0.1}" fill="#fff" text-anchor="middle">HomeWhiz</text>`, 'Smartfon z aplikacją HomeWhiz'],
  ['aeroperfect', 640, 440, ['#111', '#3a2a10'], (w, h) => `
      <circle cx="${w / 2}" cy="${h / 2}" r="${h * 0.42}" fill="#2a2e35"/>
      ${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M${w / 2} ${h / 2} l ${h * 0.4} -${h * 0.1} a ${h * 0.4} ${h * 0.4} 0 0 1 0 ${h * 0.2}z" fill="#6d7480" transform="rotate(${a} ${w / 2} ${h / 2})"/>`).join('')}
      <circle cx="${w / 2}" cy="${h / 2}" r="${h * 0.1}" fill="#d0d4da"/>`, 'Wentylator AeroPerfect'],
  ['pizza', 640, 440, ['#ffffff', GREY], (w, h) => `
      <circle cx="${w / 2}" cy="${h / 2}" r="${h * 0.42}" fill="#e5b866"/>
      <circle cx="${w / 2}" cy="${h / 2}" r="${h * 0.36}" fill="#d6452f"/>
      <circle cx="${w / 2}" cy="${h / 2}" r="${h * 0.34}" fill="#f6e2a3"/>
      ${[[0.4, 0.4], [0.6, 0.38], [0.5, 0.58], [0.38, 0.6], [0.63, 0.6]].map(([x, y]) => `<circle cx="${w * x}" cy="${h * y}" r="${h * 0.05}" fill="#b62f1f"/>`).join('')}`, 'Domowa pizza'],
  ['final', 1400, 560, [NAVY2, NAVY], (w, h) => family(w, h), 'Rodzina – sekcja końcowa'],
  ['agd', 640, 260, [NAVY2, NAVY2], (w, h) => `
      <rect x="${w * 0.05}" y="${h * 0.1}" width="${w * 0.2}" height="${h * 0.8}" rx="6" fill="#9aa3ad"/>
      <rect x="${w * 0.3}" y="${h * 0.3}" width="${w * 0.2}" height="${h * 0.6}" rx="6" fill="#dfe3e8"/>
      <rect x="${w * 0.55}" y="${h * 0.3}" width="${w * 0.2}" height="${h * 0.6}" rx="6" fill="#dfe3e8"/>
      <rect x="${w * 0.8}" y="${h * 0.1}" width="${w * 0.15}" height="${h * 0.8}" rx="6" fill="#9aa3ad"/>`, 'Sprzęty AGD Beko (stopka)'],
];

for (const [name, w, h, bg, inner, label] of jobs) {
  const svg = scene(w, h, bg, inner(w, h), label);
  await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(fileURLToPath(new URL(`${name}.jpg`, OUT)));
  console.log('ok', name, `${w}x${h}`);
}
