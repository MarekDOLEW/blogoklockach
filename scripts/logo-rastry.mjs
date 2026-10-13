// Rastry logo z plików SVG, które tworzy scripts/generuj-logo.py:
//   public/og.png, public/apple-touch-icon.png, public/favicon.ico (16 + 32 px),
//   assets/logo/logo-og-stopka.png (wkleja go scripts/generuj-og.py).
//
// Uruchamia człowiek na żądanie, zaraz po generuj-logo.py:
//   python3 scripts/generuj-logo.py && node scripts/logo-rastry.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const repo = new URL('../', import.meta.url);
const p = (sciezka) => new URL(sciezka, repo);

async function png(zrodlo, cel, { szer, gestosc = 72, paleta = false } = {}) {
  let obraz = sharp(readFileSync(p(zrodlo)), { density: gestosc });
  if (szer) obraz = obraz.resize({ width: szer });
  const bufor = await obraz.png(paleta ? { palette: true, colours: 64, compressionLevel: 9 } : { compressionLevel: 9 }).toBuffer();
  writeFileSync(p(cel), bufor);
  console.log(`${cel}  ${(bufor.length / 1024).toFixed(1)} KB`);
  return bufor;
}

await png('assets/logo/og.svg', 'public/og.png', { paleta: true });
await png('assets/logo/apple-touch-icon.svg', 'public/apple-touch-icon.png');
// stopka OG artykułów: 3x gęstość, żeby po wklejeniu w 1200x630 krawędzie były ostre
await png('assets/logo/logo-og-stopka.svg', 'assets/logo/logo-og-stopka.png', { gestosc: 72 * 1.5 });

// favicon.ico: dwa obrazy PNG w kontenerze ICO (przeglądarki czytają PNG w ICO od lat)
const svgZnak = readFileSync(p('public/favicon.svg'));
const klatki = [];
for (const r of [16, 32]) {
  klatki.push({ r, dane: await sharp(svgZnak, { density: 72 * r / 100 * 4 }).resize(r, r).png().toBuffer() });
}
const naglowek = Buffer.alloc(6 + 16 * klatki.length);
naglowek.writeUInt16LE(0, 0); naglowek.writeUInt16LE(1, 2); naglowek.writeUInt16LE(klatki.length, 4);
let offset = naglowek.length;
klatki.forEach(({ r, dane }, i) => {
  const o = 6 + 16 * i;
  naglowek.writeUInt8(r, o); naglowek.writeUInt8(r, o + 1);
  naglowek.writeUInt16LE(1, o + 4); naglowek.writeUInt16LE(32, o + 6);
  naglowek.writeUInt32LE(dane.length, o + 8); naglowek.writeUInt32LE(offset, o + 12);
  offset += dane.length;
});
const ico = Buffer.concat([naglowek, ...klatki.map((k) => k.dane)]);
writeFileSync(p('public/favicon.ico'), ico);
console.log(`public/favicon.ico  ${(ico.length / 1024).toFixed(1)} KB`);
