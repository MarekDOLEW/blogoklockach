#!/usr/bin/env node
// Ceny ze Smyka (smyk.com) — wczytanie katalogu do ofert serwisu.
//
// Smyk nie udostępnia feedu produktowego (afiliacje_rejestr: "feed": null), więc
// katalog przychodzi jako JSON zebrany przez Cowork/Firecrawl: { meta, products }
// z polami setNumber, name, price, url.
//
// UWAGA — to ceny SKLEPOWE, nie katalogowe. Do rrp_potwierdzone.json nie trafiają
// (Smyk wycenia na własnej drabinie .00/.90, nie na drabinie LEGO .99/.49).
//
// LANDING: deeplink Adtraction do Smyka NIE dowozi na produkt — Adtraction
// w handoffie do netSalesMedia zostawia `j=` puste i gubi docelowy URL, więc klient
// ląduje na smyk.com. Sprawdzone 28.08.2026 na obu formatach (z encodingiem i bez).
// Dlatego link wybiera się świadomie:
//
//   --link afiliacja  (domyślnie) — worker kieruje przez Adtraction; cookie 45 dni
//                      się ustawia i prowizja od późniejszego zakupu jest nasza,
//                      ale klient ląduje na stronie głównej i sam szuka zestawu.
//   --link produkt     — do redirects.json trafia bezpośredni adres karty produktu;
//                      klient trafia dokładnie tam, gdzie obiecuje cena, ale
//                      z tego kliknięcia nie ma prowizji.
//
// Użycie:
//   node scripts/smyk-ceny.mjs legosmyk.json --sucho
//   node scripts/smyk-ceny.mjs legosmyk.json --link produkt

import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const plik = args.find((a) => !a.startsWith('--'));
const opcja = (n) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : null;
};
const sucho = args.includes('--sucho');
const rodzajLinku = opcja('link') ?? 'afiliacja';

if (!plik || !['afiliacja', 'produkt'].includes(rodzajLinku)) {
  console.error('Użycie: node scripts/smyk-ceny.mjs <plik.json> [--link afiliacja|produkt] [--sucho]');
  process.exit(2);
}

const wejscie = JSON.parse(readFileSync(plik, 'utf8'));
const produkty = wejscie.products ?? wejscie;
console.log(`Wczytano ${produkty.length} pozycji ze ${wejscie.meta?.source ?? plik}.`);

// Numer potwierdzamy adresem karty produktu — slug Smyka kończy się numerem
// zestawu i wewnętrznym ID (…-10280-i6835716). Nazwa bywa bez numeru, więc
// jako potwierdzenie się nie nadaje.
const NUMER_Z_URL = /-(\d{4,7})-i\d+\/?$/;

const kat = JSON.parse(readFileSync('src/data/katalog.json', 'utf8'));
const znane = new Set(
  Object.entries(kat)
    .filter(([s]) => s !== '_meta')
    .flatMap(([, l]) => (Array.isArray(l) ? l.map((z) => String(z.numer)) : [])),
);

const przyjete = new Map(); // nr -> { cena, url }
const odrzucone = { numer: [], cena: [], spozaKatalogu: [] };

for (const p of produkty) {
  const nr = String(p.setNumber ?? '');
  const zUrl = NUMER_Z_URL.exec((p.url ?? '').replace(/\?.*$/, ''))?.[1] ?? null;
  if (!/^\d{4,7}$/.test(nr) || (zUrl && zUrl !== nr)) {
    odrzucone.numer.push([nr, zUrl, p.url]);
    continue;
  }
  if (typeof p.price !== 'number' || p.price <= 0) {
    odrzucone.cena.push([nr, p.price]);
    continue;
  }
  if (!znane.has(nr)) {
    odrzucone.spozaKatalogu.push([nr, p.price, p.name]);
    continue;
  }
  przyjete.set(nr, { cena: p.price, url: p.url });
}

console.log(
  `Przyjęte: ${przyjete.size} | odrzucone — numer: ${odrzucone.numer.length}, ` +
    `cena: ${odrzucone.cena.length}, spoza katalogu serwisu: ${odrzucone.spozaKatalogu.length}`,
);
for (const r of odrzucone.numer.slice(0, 10)) console.log('  numer:', r.join(' | '));
for (const r of odrzucone.cena.slice(0, 10)) console.log('  cena: ', r.join(' | '));

// ── zapis ──
const sciezkaOferty = 'src/data/oferty_feed.json';
const sciezkaRedirects = 'src/data/redirects.json';
const oferty = JSON.parse(readFileSync(sciezkaOferty, 'utf8'));
const redirects = JSON.parse(readFileSync(sciezkaRedirects, 'utf8'));
const przedOferty = Object.keys(oferty.sety ?? {}).length;
const przedRedirects = Object.keys(redirects.smyk ?? {}).length;

const dzis = new Date().toISOString().slice(0, 10);
let nowe = 0;
let zmienione = 0;
for (const [nr, { cena, url }] of przyjete) {
  const wpis = (oferty.sety[nr] ??= {});
  const o = (wpis.oferty ??= {});
  if (o.smyk === undefined) nowe += 1;
  else if (o.smyk !== cena) zmienione += 1;
  o.smyk = cena;
  wpis.data = dzis;
  if (rodzajLinku === 'produkt') (redirects.smyk ??= {})[nr] = url;
}

const poOferty = Object.keys(oferty.sety).length;
const poRedirects = Object.keys(redirects.smyk ?? {}).length;
// Pliki danych są append-only — jeśli cokolwiek ubyło, to błąd, nie zapisujemy.
if (poOferty < przedOferty || poRedirects < przedRedirects) {
  console.error(`PRZERWANE: ubyło wpisów (sety ${przedOferty}→${poOferty}, redirects.smyk ${przedRedirects}→${poRedirects}).`);
  process.exit(1);
}

console.log(
  `\noferty_feed: ${nowe} nowych cen Smyka, ${zmienione} zaktualizowanych (setów w pliku ${przedOferty}→${poOferty})`,
);
if (rodzajLinku === 'produkt') {
  console.log(`redirects.smyk: ${przedRedirects}→${poRedirects} (bezpośrednie adresy kart produktu)`);
} else {
  console.log('redirects.smyk: bez zmian — link buduje worker przez Adtraction (landing: strona główna Smyka)');
}

if (sucho) {
  console.log('\n--sucho: nic nie zapisano.');
  process.exit(0);
}
writeFileSync(sciezkaOferty, `${JSON.stringify(oferty, null, 1)}\n`);
if (rodzajLinku === 'produkt') writeFileSync(sciezkaRedirects, `${JSON.stringify(redirects, null, 1)}\n`);
console.log('Zapisano.');
