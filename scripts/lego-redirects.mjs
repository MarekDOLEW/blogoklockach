#!/usr/bin/env node
// Kanoniczne adresy kart produktu na lego.com → redirects.json → lego.
//
// Stan bez tego pliku jest poprawny: worker ma dla LEGO fallback
// `lego.com/pl-pl/product/<numer>`, a lego.com przekierowuje taki skrót na pełny
// adres ze slugiem (sprawdzone na produkcji: /idz/lego/42232 oddaje 302 na
// https://www.lego.com/pl-pl/product/42232). To jednak CUDZE przekierowanie —
// działa, dopóki LEGO je utrzymuje, a z naszego środowiska nie da się tego
// monitorować, bo lego.com odrzuca ruch serwerowy (403 na curl i WebFetch).
//
// Wpis w redirects.json ma pierwszeństwo przed fallbackiem, więc dla zestawów,
// których kanoniczny adres znamy, przestajemy na tym przekierowaniu polegać.
// Dla reszty fallback zostaje bez zmian.
//
// Wejście: katalog lego.pl w formacie z scripts/firecrawl-legopl.mjs
// ({ meta, products: [{ setNumber, url, ... }] }).
//
// Użycie:
//   node scripts/lego-redirects.mjs katalog-legopl.json --sucho
//   node scripts/lego-redirects.mjs katalog-legopl.json

import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const plik = args.find((a) => !a.startsWith('--'));
const sucho = args.includes('--sucho');
if (!plik) {
  console.error('Użycie: node scripts/lego-redirects.mjs <katalog-legopl.json> [--sucho]');
  process.exit(2);
}

const katalogLego = JSON.parse(readFileSync(plik, 'utf8'));
const produkty = katalogLego.products ?? katalogLego;

// Wpisujemy tylko zestawy, które znamy z własnego katalogu — inaczej do pliku
// trafiłyby adresy gadżetów i akcesoriów, dla których nie mamy podstron.
const katalog = JSON.parse(readFileSync('src/data/katalog.json', 'utf8'));
const znane = new Set(
  Object.entries(katalog)
    .filter(([s]) => s !== '_meta')
    .flatMap(([, l]) => (Array.isArray(l) ? l.map((z) => String(z.numer)) : [])),
);

const redirects = JSON.parse(readFileSync('src/data/redirects.json', 'utf8'));
const lego = (redirects.lego ??= {});
const przed = Object.keys(lego).length;

const dodane = [];
const odrzucone = [];
for (const p of produkty) {
  const nr = String(p.setNumber ?? '');
  const url = p.url ?? '';
  if (!/^\d{4,7}$/.test(nr) || lego[nr] || !znane.has(nr)) continue;
  // numer musi kończyć adres karty — slug lego.com ma postać `nazwa-<numer>`;
  // bez tego sprawdzenia wpis mógłby prowadzić do innego zestawu
  if (!url.startsWith('https://www.lego.com/pl-pl/product/') || !url.replace(/\/$/, '').endsWith(nr)) {
    odrzucone.push([nr, url.slice(0, 80)]);
    continue;
  }
  lego[nr] = url;
  dodane.push(nr);
}

const po = Object.keys(lego).length;
if (po < przed) {
  console.error(`PRZERWANE: ubyło wpisów (${przed} → ${po}).`);
  process.exit(1);
}
console.log(`redirects.lego: ${przed} → ${po} (+${dodane.length})`);
if (odrzucone.length) {
  console.log(`  ODRZUCONE (adres nie kończy się numerem zestawu): ${odrzucone.length}`);
  for (const [nr, u] of odrzucone.slice(0, 10)) console.log(`    ${nr}  ${u}…`);
}
if (sucho) {
  console.log('--sucho: nic nie zapisano.');
  process.exit(0);
}
writeFileSync('src/data/redirects.json', `${JSON.stringify(redirects, null, 1)}\n`);
console.log('Zapisano src/data/redirects.json');
