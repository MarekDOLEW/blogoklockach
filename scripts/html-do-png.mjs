#!/usr/bin/env node
// HTML+CSS -> Playwright -> PNG.
//
// Wspólny silnik renderowania grafik z HTML: karuzele na Instagram/Threads,
// grafiki do postów, miniatury, slajdy. Piszesz zwykły plik HTML z CSS
// (fonty i obrazy inline albo z lokalnych plików), a skrypt otwiera go
// w headless Chromium i zapisuje PNG w zadanym rozmiarze.
//
// Użycie:
//   node scripts/html-do-png.mjs <plik.html | katalog> [opcje]
//
// Opcje:
//   --out <katalog>       gdzie zapisać PNG (domyślnie obok pliku HTML)
//   --w <px> --h <px>     viewport (domyślnie 1080x1350 = post IG 4:5)
//   --scale <n>           deviceScaleFactor (domyślnie 1; 2 = retina)
//   --selector <css>      zamiast całej strony zrzuca KAŻDY pasujący element
//                         do osobnego PNG: <nazwa>-01.png, <nazwa>-02.png ...
//                         (tak robi się karuzelę z jednego pliku HTML)
//   --full                cała strona, nie tylko viewport
//   --czekaj <ms>         dodatkowe oczekiwanie po załadowaniu (fonty, animacje)
//
// Przykłady:
//   node scripts/html-do-png.mjs grafiki/post.html
//   node scripts/html-do-png.mjs grafiki/karuzela.html --selector .slajd --out public/social/
//   node scripts/html-do-png.mjs grafiki/ --w 1200 --h 630        # katalog: wszystkie *.html
//
// Przeglądarka: kolejno CHROMIUM_PATH ze środowiska, Chromium Playwrighta
// (PLAYWRIGHT_BROWSERS_PATH), zainstalowany Google Chrome. Zależność:
// playwright-core (devDependency) — nie pobiera przeglądarki przy npm install.

import { chromium } from 'playwright-core';
import { readdirSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, basename, dirname, join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const opcja = (nazwa, domyslna) => {
  const i = args.indexOf(`--${nazwa}`);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : domyslna;
};
const flaga = (nazwa) => args.includes(`--${nazwa}`);
const wejscie = args.find((a) => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--'));

if (!wejscie || flaga('help')) {
  console.error('Użycie: node scripts/html-do-png.mjs <plik.html | katalog> [--out dir] [--w 1080 --h 1350] [--scale 1] [--selector .slajd] [--full] [--czekaj ms]');
  process.exit(wejscie ? 0 : 1);
}

const W = Number(opcja('w', 1080));
const H = Number(opcja('h', 1350));
const SCALE = Number(opcja('scale', 1));
const SELECTOR = opcja('selector', null);
const FULL = flaga('full');
const CZEKAJ = Number(opcja('czekaj', 0));
const OUT = opcja('out', null);

const sciezka = resolve(wejscie);
const pliki = statSync(sciezka).isDirectory()
  ? readdirSync(sciezka).filter((f) => extname(f).toLowerCase() === '.html').sort().map((f) => join(sciezka, f))
  : [sciezka];
if (pliki.length === 0) {
  console.error(`Brak plików .html w ${sciezka}`);
  process.exit(1);
}

// Szukanie przeglądarki: env -> Chromium Playwrighta -> Google Chrome.
function znajdzChromium() {
  if (process.env.CHROMIUM_PATH && existsSync(process.env.CHROMIUM_PATH)) return process.env.CHROMIUM_PATH;
  const baza = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (baza && existsSync(baza)) {
    const kandydaci = readdirSync(baza).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse();
    for (const d of kandydaci) {
      for (const rel of [
        'chrome-linux/chrome',
        'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
        'chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium',
        'chrome-win/chrome.exe',
      ]) {
        const p = join(baza, d, rel);
        if (existsSync(p)) return p;
      }
    }
  }
  return null;
}

async function uruchom() {
  const bledy = [];
  const exe = znajdzChromium();
  if (exe) {
    try { return await chromium.launch({ executablePath: exe }); } catch (e) { bledy.push(`${exe}: ${e.message.split('\n')[0]}`); }
  }
  try { return await chromium.launch(); } catch (e) { bledy.push(`chromium Playwrighta: ${e.message.split('\n')[0]}`); }
  try { return await chromium.launch({ channel: 'chrome' }); } catch (e) { bledy.push(`Google Chrome: ${e.message.split('\n')[0]}`); }
  console.error('Nie znalazłem przeglądarki. Próbowałem:\n  ' + bledy.join('\n  '));
  console.error('Ustaw CHROMIUM_PATH albo uruchom: npx playwright install chromium');
  process.exit(1);
}

const browser = await uruchom();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
let licznik = 0;

for (const plik of pliki) {
  const nazwa = basename(plik, '.html');
  const katalog = OUT ? resolve(OUT) : dirname(plik);
  mkdirSync(katalog, { recursive: true });

  await page.goto(pathToFileURL(plik).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  if (CZEKAJ) await page.waitForTimeout(CZEKAJ);

  if (SELECTOR) {
    const elementy = await page.locator(SELECTOR).all();
    if (elementy.length === 0) {
      console.error(`${nazwa}: brak elementów pasujących do "${SELECTOR}"`);
      continue;
    }
    for (let i = 0; i < elementy.length; i++) {
      const cel = join(katalog, `${nazwa}-${String(i + 1).padStart(2, '0')}.png`);
      await elementy[i].scrollIntoViewIfNeeded();
      await elementy[i].screenshot({ path: cel, type: 'png' });
      console.log(`  ${cel}`);
      licznik++;
    }
  } else {
    const cel = join(katalog, `${nazwa}.png`);
    await page.screenshot({ path: cel, type: 'png', fullPage: FULL });
    console.log(`  ${cel}`);
    licznik++;
  }
}

await browser.close();
console.log(`\nGotowe: ${licznik} PNG (${W}x${H}${SCALE !== 1 ? ` @${SCALE}x` : ''}${SELECTOR ? `, selector ${SELECTOR}` : ''}).`);
