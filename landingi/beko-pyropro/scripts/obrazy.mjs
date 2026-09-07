// Optymalizacja obrazów: img/src/<nazwa>.(jpg|png) -> img/<nazwa>-<szer>.(avif|webp|jpg)
// Każde zdjęcie dostaje warianty: pełna szerokość i połowa (dla mobile / DPR 1),
// więc w HTML używamy srcset z deskryptorami `w` i atrybutu sizes.
import sharp from 'sharp';
import { readdirSync, mkdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('../img/src/', import.meta.url));
const OUT = fileURLToPath(new URL('../img/', import.meta.url));
mkdirSync(OUT, { recursive: true });

const pliki = readdirSync(SRC).filter((f) => /\.(jpe?g|png)$/i.test(f));
let razemIn = 0, razemOut = 0;

for (const plik of pliki) {
  const nazwa = plik.replace(/\.(jpe?g|png)$/i, '');
  const meta = await sharp(SRC + plik).metadata();
  razemIn += statSync(SRC + plik).size;
  const szerokosci = [meta.width, Math.round(meta.width / 2)].filter((w, i) => i === 0 || w >= 200);
  for (const w of szerokosci) {
    const baza = sharp(SRC + plik).resize({ width: w, withoutEnlargement: true });
    const zapis = async (fmt, opts, ext) => {
      const out = `${OUT}${nazwa}-${w}.${ext}`;
      const info = await baza.clone()[fmt](opts).toFile(out);
      razemOut += info.size;
      return info.size;
    };
    const alfa = meta.hasAlpha;
    const a = await zapis('avif', { quality: alfa ? 60 : 55, effort: 4 }, 'avif');
    const b = await zapis('webp', { quality: alfa ? 85 : 78 }, 'webp');
    // fallback: JPG dla zdjęć, PNG dla wycinków z przezroczystością
    const c = alfa
      ? await zapis('png', { compressionLevel: 9, palette: true, quality: 90 }, 'png')
      : await zapis('jpeg', { quality: 80, mozjpeg: true, progressive: true }, 'jpg');
    console.log(`${nazwa}-${w}: avif ${(a / 1024).toFixed(0)}K  webp ${(b / 1024).toFixed(0)}K  ${alfa ? 'png' : 'jpg'} ${(c / 1024).toFixed(0)}K`);
  }
}
console.log(`\nŹródła: ${(razemIn / 1024).toFixed(0)}K -> warianty łącznie: ${(razemOut / 1024).toFixed(0)}K (${pliki.length} plików)`);
