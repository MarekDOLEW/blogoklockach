// Cięcie layoutu layout/Beko_Pyroliza_LP_2026.jpg (1400 px = skala 1:1 desktopu)
// na zasoby w img/src/. Elementy z płaskim tłem cięte prostokątnie (JPG),
// wycinki na granacie/niebieskim kluczowane kolorem do PNG z przezroczystością.
// Tekst wypalony w zdjęciach (hero, sekcja końcowa) jest maskowany rozmyciem,
// bo w HTML występuje jako prawdziwy tekst.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('../layout/Beko_Pyroliza_LP_2026.jpg', import.meta.url));
const OUT = fileURLToPath(new URL('../img/src/', import.meta.url));
mkdirSync(OUT, { recursive: true });
const cut = (left, top, width, height) => sharp(SRC).extract({ left, top, width, height });

/* ---- 1. prostokąty z płaskim tłem ---- */
const prostokaty = {
  'wideo-plakat': [230, 2900, 940, 530],
  'piekarnik-zawieszka': [365, 4765, 670, 460],
  'produkt-1': [250, 4000, 210, 200],
  'produkt-2': [480, 4000, 210, 200],
  'produkt-3': [710, 4000, 210, 200],
  'produkt-4': [940, 4000, 210, 200],
  'homewhiz-telefon': [770, 6065, 330, 435],
  'aeroperfect': [230, 6570, 410, 340],
  'pizza': [235, 7515, 420, 380],
  'ciastka': [245, 5315, 240, 130],
  'homewhiz-logo': [222, 6145, 260, 80],
  'ikona-skarbonka-piorun': [795, 7075, 300, 285],
};
for (const [n, [l, t, w, h]] of Object.entries(prostokaty)) {
  await cut(l, t, w, h).jpeg({ quality: 95 }).toFile(`${OUT}${n}.jpg`);
}

/* ---- 2. zdjęcia z wypalonym tekstem: maska rozmyciem (miękka krawędź) ---- */
async function zamaskuj(nazwa, [l, t, w, h], obszary, ciemniej = 0.85) {
  const baza = await cut(l, t, w, h).toBuffer();
  // silne uśrednienie: zmniejszenie 40x i powiększenie z powrotem (gładka plama bez śladu liter)
  const rozmyte = await sharp(await sharp(baza).resize({ width: Math.round(w / 40) }).toBuffer())
    .resize({ width: w, height: h, kernel: 'cubic' }).modulate({ brightness: ciemniej }).toBuffer();
  const maska = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><filter id="f"><feGaussianBlur stdDeviation="18"/></filter></defs>
    <rect width="${w}" height="${h}" fill="black"/>
    ${obszary.map(([x, y, rw, rh]) => `<rect x="${x}" y="${y}" width="${rw}" height="${rh}" rx="30" fill="white" filter="url(#f)"/>`).join('')}
  </svg>`);
  const maskaPng = await sharp(maska).png().toBuffer();
  const rozmyteZAlpha = await sharp(rozmyte).joinChannel(await sharp(maskaPng).extractChannel(0).toBuffer()).png().toBuffer();
  await sharp(baza).composite([{ input: rozmyteZAlpha }]).jpeg({ quality: 92 }).toFile(`${OUT}${nazwa}.jpg`);
}
await zamaskuj('hero', [0, 0, 1400, 700], [[90, 30, 470, 380], [625, 255, 130, 130], [1120, 25, 165, 95]], 0.78);
await zamaskuj('final', [0, 7930, 1400, 770], [[850, 40, 440, 150]], 0.8);
// kadry mobilne (pionowe) z zamaskowanych zdjęć
await sharp(`${OUT}hero.jpg`).extract({ left: 300, top: 0, width: 1100, height: 700 }).jpeg({ quality: 92 }).toFile(`${OUT}hero-mobile.jpg`);
await sharp(`${OUT}final.jpg`).extract({ left: 150, top: 0, width: 1000, height: 770 }).jpeg({ quality: 92 }).toFile(`${OUT}final-mobile.jpg`);

/* ---- 3. wycinki kluczowane kolorem tła -> PNG z alfą ---- */
// tryb 'navy': tło granatowe (próbka z rogów); 'blue': tło niebieskie o dowolnej jasności (klucz po odcieniu); 'dark': jasny znak na ciemnym tle (klucz po luminancji)
async function klucz(nazwa, [l, t, w, h], tryb, opts = {}) {
  const { data, info } = await cut(l, t, w, h).raw().toBuffer({ resolveWithObject: true });
  const px = info.width * info.height;
  const out = Buffer.alloc(px * 4);
  const t1 = opts.t1 ?? 28, t2 = opts.t2 ?? 70;
  // próbka tła: mediana z ramki 3 px
  const probki = [];
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (x < 3 || y < 3 || x >= info.width - 3 || y >= info.height - 3) { const i = (y * info.width + x) * 3; probki.push([data[i], data[i + 1], data[i + 2]]); }
  }
  const med = (k) => probki.map((p) => p[k]).sort((a, b) => a - b)[probki.length >> 1];
  const bg = [med(0), med(1), med(2)];
  for (let i = 0; i < px; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    let d;
    if (tryb === 'navy') {
      d = Math.hypot(r - bg[0], g - bg[1], b - bg[2]);
    } else if (tryb === 'blue') {
      const max = Math.max(r, g, b), min = Math.min(r, g, b), s = max ? (max - min) / max : 0;
      const niebieski = b > r + 25 && b > g + 5 && s > 0.35;
      d = niebieski ? 0 : 100;
    } else { // dark: jasność
      d = (0.299 * r + 0.587 * g + 0.114 * b) - 60;
    }
    const a = Math.max(0, Math.min(1, (d - t1) / (t2 - t1)));
    out[i * 4] = r; out[i * 4 + 1] = g; out[i * 4 + 2] = b; out[i * 4 + 3] = Math.round(a * 255);
  }
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(`${OUT}${nazwa}.png`);
}
await klucz('rekawica-intro', [0, 820, 215, 335], 'navy');
await klucz('balon', [825, 1126, 470, 640], 'navy');
await klucz('minutnik', [95, 1815, 530, 410], 'navy');
await klucz('skarbonka-rekawica', [885, 2325, 360, 480], 'navy');
await klucz('rekawica-lewa', [0, 4675, 215, 410], 'navy');
await klucz('rekawica-prawa', [1135, 4885, 265, 460], 'navy');
await klucz('ikona-tarcza', [220, 1310, 110, 130], 'navy', { t1: 20, t2: 50 });
await klucz('ikona-zegar', [645, 1825, 110, 110], 'navy', { t1: 20, t2: 50 });
await klucz('ikona-skarbonka', [220, 2375, 135, 130], 'navy', { t1: 20, t2: 50 });
await klucz('agd', [210, 8702, 570, 372], 'blue', { t1: 30, t2: 70 });
await klucz('laur', [872, 8735, 245, 215], 'blue', { t1: 30, t2: 70 });
await klucz('beko-state-of-mind', [862, 8978, 262, 58], 'blue', { t1: 30, t2: 70 });
await klucz('logo-beko', [1135, 40, 135, 70], 'dark', { t1: 60, t2: 120 });
console.log('OK – zasoby w img/src/');
