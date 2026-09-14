#!/usr/bin/env node
// Deeplinki produktowe Empiku z tygodniowego zrzutu (skill klocki-ceny-empik).
//
// Dlaczego nie z feedu: feed Tradedoublera NIE zawiera zestawów LEGO —
// weryfikacja na pełnym pliku 2,5 GB z 19.08.2026 (sprawdzone wprost 10316,
// 21348, 76454, 60337: zero trafień). To marketplace Empiku, czyli gabloty,
// opłatki i magazyny. Jedynym źródłem adresów jest zrzut z przeglądarki.
//
// Afiliacja: adres produktu pakujemy w deeplink Tradedoublera, bo prowizję
// liczy `clk.tradedoubler.com`, a cel jest w nim tylko parametrem `url=`.
// Bezpośredni link do empik.com = klik bez prowizji.
//
// Worker bierze wpis z redirects.json PRZED swoją wyszukiwarką, więc zestawy
// bez adresu zachowują dotychczasowe zachowanie i nic nie trzeba w nim zmieniać.
//
// WYJĄTEK OD APPEND-ONLY (uzgodniony 14.09.2026). Ten skrypt USUWA wpisy
// zestawów, których nie ma w bieżącym zrzucie. Powód: adres karty produktu
// żyje tak długo, jak produkt jest w ofercie — gdy zniknie, link prowadzi na
// 404, czyli gorzej niż wyszukiwarka, która zawsze coś pokaże. Zniknięcie
// z oferty poznajemy po tym, że pozycji nie ma w zrzucie. Usunięcie martwego
// adresu z mapy linków jest naprawą, nie utratą danych — ceny i cała reszta
// zostają nietknięte. Bez --usun-martwe skrypt tylko dopisuje.
//
// Użycie:
//   node scripts/empik-redirects.mjs lego-empik.json --sucho
//   node scripts/empik-redirects.mjs lego-empik.json --usun-martwe

import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const plik = args.find((a) => !a.startsWith('--'));
const sucho = args.includes('--sucho');
const usunMartwe = args.includes('--usun-martwe');
if (!plik) {
  console.error('Użycie: node scripts/empik-redirects.mjs <lego-empik.json> [--usun-martwe] [--sucho]');
  process.exit(2);
}

// p = program Empiku w Tradedoublerze, a = nasze konto wydawcy
const DEEPLINK = (url) =>
  `https://clk.tradedoubler.com/click?p=289664&a=3494691&url=${encodeURIComponent(url)}`;

const zrzut = JSON.parse(readFileSync(plik, 'utf8'));
const produkty = zrzut.products ?? zrzut;
console.log(`Zrzut z ${zrzut.meta?.scrapedAt ?? '?'}: ${produkty.length} pozycji.`);

const katalog = JSON.parse(readFileSync('src/data/katalog.json', 'utf8'));
const znane = new Set(
  Object.entries(katalog)
    .filter(([s]) => s !== '_meta')
    .flatMap(([, l]) => (Array.isArray(l) ? l.map((z) => String(z.numer)) : [])),
);

const redirects = JSON.parse(readFileSync('src/data/redirects.json', 'utf8'));
const empik = (redirects.empik ??= {});
const przed = Object.keys(empik).length;

const wZrzucie = new Set();
const dodane = [];
const zmienione = [];
const odrzucone = [];
let bezUrl = 0;

for (const p of produkty) {
  const nr = String(p.setNumber ?? '');
  if (!/^\d{4,7}$/.test(nr)) continue;
  wZrzucie.add(nr);
  const url = (p.url ?? '').trim();
  if (!url) {
    bezUrl += 1;
    continue;
  }
  // adres musi być kartą produktu empik.com — inaczej wyślemy klienta nie wiadomo gdzie
  if (!/^https:\/\/(www\.)?empik\.com\//.test(url) || url.includes('/szukaj/')) {
    odrzucone.push([nr, url.slice(0, 70)]);
    continue;
  }
  if (!znane.has(nr)) continue; // zestaw spoza naszego katalogu — nie ma podstrony
  const nowy = DEEPLINK(url);
  if (!empik[nr]) dodane.push(nr);
  else if (empik[nr] !== nowy) zmienione.push(nr);
  empik[nr] = nowy;
}

// Martwe: mamy wpis, a zestawu nie ma w bieżącym zrzucie (zniknął z oferty).
const martwe = Object.keys(empik).filter((nr) => !wZrzucie.has(nr));
if (usunMartwe) for (const nr of martwe) delete empik[nr];

const po = Object.keys(empik).length;
console.log(`redirects.empik: ${przed} → ${po}`);
console.log(`  nowych adresów:        ${dodane.length}`);
console.log(`  zaktualizowanych:      ${zmienione.length}`);
console.log(`  pozycji bez url w zrzucie: ${bezUrl} (zostaje wyszukiwarka)`);
if (odrzucone.length) {
  console.log(`  ODRZUCONE (adres nie jest kartą produktu empik.com): ${odrzucone.length}`);
  for (const [nr, u] of odrzucone.slice(0, 10)) console.log(`    ${nr}  ${u}…`);
}
console.log(
  `  zniknęły z oferty Empiku: ${martwe.length}` +
    (usunMartwe ? ' — USUNIĘTE, wracają na wyszukiwarkę' : ' — zostawione (dodaj --usun-martwe)'),
);
if (martwe.length) console.log(`    ${martwe.slice(0, 15).join(', ')}${martwe.length > 15 ? ' …' : ''}`);

if (sucho) {
  console.log('\n--sucho: nic nie zapisano.');
  process.exit(0);
}
writeFileSync('src/data/redirects.json', `${JSON.stringify(redirects, null, 1)}\n`);
console.log('Zapisano src/data/redirects.json');
