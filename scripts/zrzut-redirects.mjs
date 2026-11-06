#!/usr/bin/env node
// Linki produktowe ze zrzutu sklepu robionego lokalną przeglądarką: Empik
// (deeplink Tradedoublera) i x-kom (adres karty + uniwersalny kod SalesMasters).
// Jeden skrypt od 24.09.2026; `empik-redirects.mjs` i `xkom-redirects.mjs` to
// nakładki ustawiające `--sklep`.
//
// Empik — dlaczego nie z feedu: feed Tradedoublera NIE zawiera zestawów LEGO
// (weryfikacja na pełnym pliku 2,5 GB z 19.08.2026: zero trafień). Jedynym
// źródłem adresów jest zrzut z przeglądarki. Afiliacja: adres produktu pakujemy
// w deeplink Tradedoublera, bo prowizję liczy `clk.tradedoubler.com`, a cel jest
// w nim tylko parametrem `url=`. Bezpośredni link do empik.com = klik bez prowizji.
//
// x-kom — SalesMasters nie ma feedu, strony blokują ruch serwerowy. Kod partnerski
// konta jest uniwersalny (`sm=…`, test 16.08.2026: działa doklejony do każdego
// adresu, także w incognito), więc link = adres karty produktu + kod. Bez kodu
// klik nie liczy prowizji.
//
// Worker bierze wpis z redirects.json PRZED swoją wyszukiwarką, więc zestawy
// bez adresu zachowują dotychczasowe zachowanie i nic nie trzeba w nim zmieniać.
//
// WYJĄTEK OD APPEND-ONLY (uzgodniony 14.09.2026 dla Empiku, 24.09 rozszerzony
// na x-kom). Ten skrypt USUWA wpisy zestawów, których nie ma w bieżącym zrzucie.
// Powód: adres karty produktu żyje tak długo, jak produkt jest w ofercie — gdy
// zniknie, link prowadzi na 404, czyli gorzej niż wyszukiwarka, która zawsze coś
// pokaże. Usunięcie martwego adresu z mapy linków jest naprawą, nie utratą danych —
// ceny i cała reszta zostają nietknięte. Bez --usun-martwe skrypt tylko dopisuje.
//
// Użycie:
//   node scripts/zrzut-redirects.mjs --sklep empik lego-empik.json --sucho
//   node scripts/zrzut-redirects.mjs --sklep xkom lego-xkom.json --usun-martwe

import { readFileSync, writeFileSync } from 'node:fs';

import { AKCESORIA, slug } from './akcesoria.mjs';

// kod partnerski SalesMasters (afiliacje_rejestr.json, sekcja x-kom) — ten sam,
// którego używa worker w /idz/xkom/<nr> dla zestawów bez wpisu
export const KOD_SALESMASTERS = 'Y74rgdCO';
const SKLEPY = {
  empik: {
    nazwa: 'Empik',
    // adres musi być kartą produktu empik.com — inaczej wyślemy klienta nie wiadomo gdzie
    kartaProduktu: (url) => /^https:\/\/(www\.)?empik\.com\//.test(url) && !url.includes('/szukaj/'),
    // p = program Empiku w Tradedoublerze, a = nasze konto wydawcy
    link: (url) => `https://clk.tradedoubler.com/click?p=289664&a=3494691&url=${encodeURIComponent(url)}`,
    opisOdrzucenia: 'adres nie jest kartą produktu empik.com',
  },
  xkom: {
    nazwa: 'x-kom',
    kartaProduktu: (url) => /^https:\/\/(www\.)?x-kom\.pl\/p\/\d+-/.test(url) && !url.includes('/szukaj'),
    link: (url) => `${url.replace(/[?#].*$/, '')}?sm=${KOD_SALESMASTERS}`,
    opisOdrzucenia: 'adres nie jest kartą produktu x-kom.pl (/p/<id>-…)',
  },
};
const args = process.argv.slice(2);
const sklep = args.includes('--sklep') ? args[args.indexOf('--sklep') + 1] : null;
const plik = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--sklep');
const sucho = args.includes('--sucho');
const usunMartwe = args.includes('--usun-martwe');
// --tylko-akcesoria: bez zrzutu — samo czyszczenie istniejącej mapy z linków do akcesoriów
const tylkoAkcesoria = args.includes('--tylko-akcesoria');
if ((!plik && !tylkoAkcesoria) || !SKLEPY[sklep]) {
  console.error('Użycie: node scripts/zrzut-redirects.mjs --sklep <empik|xkom> (<plik.json> [--usun-martwe] | --tylko-akcesoria) [--sucho]');
  process.exit(2);
}
const S = SKLEPY[sklep];

const zrzut = tylkoAkcesoria ? { products: [] } : JSON.parse(readFileSync(plik, 'utf8'));
const produkty = zrzut.products ?? zrzut;
if (!tylkoAkcesoria) console.log(`Zrzut z ${zrzut.meta?.scrapedAt ?? '?'}: ${produkty.length} pozycji.`);

const katalog = JSON.parse(readFileSync('src/data/katalog.json', 'utf8'));
const znane = new Set(
  Object.entries(katalog)
    .filter(([s]) => s !== '_meta')
    .flatMap(([, l]) => (Array.isArray(l) ? l.map((z) => String(z.numer)) : [])),
);

const redirects = JSON.parse(readFileSync('src/data/redirects.json', 'utf8'));
const mapa = (redirects[sklep] ??= {});
const przed = Object.keys(mapa).length;

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
  if (!S.kartaProduktu(url)) {
    odrzucone.push([nr, url.slice(0, 70)]);
    continue;
  }
  if (!znane.has(nr)) continue; // zestaw spoza naszego katalogu — nie ma podstrony
  // akcesorium pod numerem zestawu nie może nadpisać karty zestawu (75455 → gablota)
  if (AKCESORIA.test(`${slug(url)} ${p.name ?? ''}`)) {
    odrzucone.push([nr, `akcesorium: ${String(p.name ?? slug(url)).slice(0, 60)}`]);
    continue;
  }
  // numer musi być osobnym tokenem w nazwie produktu: „sw1246" to kod minifigurki,
  // nie zestaw 1246 (audyt 22.09) — taka karta nie może być deeplinkiem zestawu
  if (!new RegExp(`(?<![A-Za-z0-9])${nr}(?![A-Za-z0-9])`).test(String(p.name ?? ''))) {
    odrzucone.push([nr, `numer tylko wewnątrz tokenu: ${String(p.name ?? '').slice(0, 60)}`]);
    continue;
  }
  const nowy = S.link(url);
  if (!mapa[nr]) dodane.push(nr);
  else if (mapa[nr] !== nowy) zmienione.push(nr);
  mapa[nr] = nowy;
}

// Linki do akcesoriów, które weszły przed filtrem — usuwamy zawsze (naprawa w ramach
// wyjątku od append-only dla redirects.empik/xkom; zestaw wraca na wyszukiwarkę sklepu).
const akcesoria = Object.keys(mapa).filter((nr) => AKCESORIA.test(slug(mapa[nr])));
for (const nr of akcesoria) delete mapa[nr];

// Martwe: mamy wpis, a zestawu nie ma w bieżącym zrzucie (zniknął z oferty).
const martwe = tylkoAkcesoria ? [] : Object.keys(mapa).filter((nr) => !wZrzucie.has(nr));
if (usunMartwe) for (const nr of martwe) delete mapa[nr];

const po = Object.keys(mapa).length;
console.log(`redirects.${sklep}: ${przed} → ${po}`);
console.log(`  nowych adresów:        ${dodane.length}`);
console.log(`  zaktualizowanych:      ${zmienione.length}`);
console.log(`  pozycji bez url w zrzucie: ${bezUrl} (zostaje wyszukiwarka)`);
console.log(`  usunięte linki do akcesoriów: ${akcesoria.length}${akcesoria.length ? ` (${akcesoria.slice(0, 12).join(', ')}${akcesoria.length > 12 ? ' …' : ''})` : ''}`);
if (odrzucone.length) {
  console.log(`  ODRZUCONE (${S.opisOdrzucenia}): ${odrzucone.length}`);
  for (const [nr, u] of odrzucone.slice(0, 10)) console.log(`    ${nr}  ${u}…`);
}
console.log(
  `  zniknęły z oferty (${S.nazwa}): ${martwe.length}` +
    (usunMartwe ? ' — USUNIĘTE, wracają na wyszukiwarkę' : ' — zostawione (dodaj --usun-martwe)'),
);
if (martwe.length) console.log(`    ${martwe.slice(0, 15).join(', ')}${martwe.length > 15 ? ' …' : ''}`);

if (sucho) {
  console.log('\n--sucho: nic nie zapisano.');
  process.exit(0);
}
writeFileSync('src/data/redirects.json', `${JSON.stringify(redirects, null, 1)}\n`);
console.log('Zapisano src/data/redirects.json');
