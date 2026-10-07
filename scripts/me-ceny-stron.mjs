#!/usr/bin/env node
// Kontrola cen Media Expertu na kartach produktów — poprawka do wyciągu z feedu.
//
// Po co: feed produktowy ME (Google Shopping, generowany raz na dobę o 00:30)
// rozjeżdża się z kartą produktu w OBIE strony, co potwierdziliśmy 02.10.2026
// na próbie kart przez Firecrawla:
//   60499  feed 199,99 (g:price) → karta 179,00 — promocja siedzi w <g:sale_price>
//   10440  feed  84,99           → karta  52,89 — feed nie zna ceny ze strony
//   71513  feed 219,99           → karta 146,36
//   10300  feed 849,99           → karta 775,00 (karta ma swoje 869,99 regularne)
//   42213  feed 202,99           → karta 185,50
// Czytanie samego feedu pokazywało czytelnikowi kwoty, których w sklepie nie ma.
// Karta produktu jest arbitrem — to ona mówi, ile czytelnik zapłaci.
//
// Dlaczego nie wszystkie karty: ME ma w feedzie ~750 zestawów, a budżet
// Firecrawla to 5 000 kredytów na miesiąc (1 kredyt za kartę). Sprawdzamy więc
// tylko te oferty, w których błędna cena faktycznie kogoś wprowadza w błąd:
//   (a) cena z feedu różni się od naszej zapisanej o więcej niż `--prog` (15%)
//       — tam albo feed skłamał, albo jest prawdziwy ruch ceny i warto wiedzieć,
//   (b) ME byłby najtańszą ofertą z przewagą powyżej `--przewaga` (10%)
//       — to ta cena, którą czytelnik zobaczy jako „najlepszą" i w nią kliknie.
// Reszta zostaje z ceną z feedu; jest to kompromis budżetowy, nie ideał.
//
// NIGDY nie odpytujemy linku trackingowego (track.performers.tech) — to byłby
// sztucznie nabity klik w sieci afiliacyjnej. Adres karty wyjmujemy z parametru
// `url=` tego linku i pobieramy wyłącznie jego (ta sama zasada co w
// kontrola-linkow.mjs).
//
// Użycie:
//   cat wyciag.json | node scripts/me-ceny-stron.mjs > poprawiony.json
//   node scripts/me-ceny-stron.mjs --plik /tmp/feedy-lego.json [--sucho]
//   opcje: --limit 80  --prog 0.15  --przewaga 0.10
//
// Brak FIRECRAWL_KEY nie jest błędem: skrypt przepuszcza wyciąg bez zmian
// i dopisuje powód do `_meta.mediaexpert_karty`. Łowca ma się nie wywalić
// z powodu brakującego klucza do kontroli, która jest ulepszeniem, nie bazą.

import { readFileSync, writeFileSync } from 'node:fs';
import { scrape } from './firecrawl.mjs';

const KATALOG = new URL('..', import.meta.url).pathname;

const args = process.argv.slice(2);
const opcja = (n, domyslna) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : domyslna;
};
const plik = opcja('plik');
const sucho = args.includes('--sucho');
const LIMIT = Number(opcja('limit', 80));
// Budzet czasu, bo ten krok siedzi w sciezce Lowcy: karta schodzi ~10 s, wiec
// 80 kart to ~13 min. Po przekroczeniu konczymy na tym, co sprawdzone, zamiast
// trzymac caly przebieg cen w zawieszeniu.
const MAX_SEKUND = Number(opcja('max-sekund', 900));
const PROG = Number(opcja('prog', 0.15));
const PRZEWAGA = Number(opcja('przewaga', 0.10));

// Adres karty produktu z linku afiliacyjnego — parametr `url=`.
function adresKarty(link) {
  try {
    const u = new URL(link);
    const cel = u.searchParams.get('url');
    if (cel) return cel.split('?')[0];
    return link.includes('mediaexpert.pl') ? link.split('?')[0] : null;
  } catch {
    return null;
  }
}

function cenaZMeta(meta, pole) {
  const t = meta?.[pole];
  if (!t) return null;
  const w = Number(String(t).replace(/[^\d.]/g, ''));
  return Number.isFinite(w) && w > 0 ? w : null;
}

// Które oferty trzeba sprawdzić na karcie — razem z miarą „ile na tym stoi",
// żeby limit obcinał najmniej ważne, a nie pierwsze z listy.
function doSprawdzenia(oferty, zapisane) {
  const kandydaci = [];
  for (const [nr, o] of Object.entries(oferty)) {
    if (!o?.dostepny || !o.cena) continue;
    const zapis = zapisane[nr]?.oferty ?? {};
    const nasza = zapis.mediaexpert;
    const inne = Object.entries(zapis)
      .filter(([s, c]) => s !== 'mediaexpert' && c)
      .map(([, c]) => c);
    const najtansza_inna = inne.length ? Math.min(...inne) : null;

    const powody = [];
    let waga = 0;
    if (nasza && Math.abs(o.cena - nasza) / nasza > PROG) {
      powody.push('skok ceny');
      waga = Math.max(waga, Math.abs(o.cena - nasza));
    }
    if (najtansza_inna && o.cena < najtansza_inna * (1 - PRZEWAGA)) {
      powody.push('byłby najtańszy');
      waga = Math.max(waga, najtansza_inna - o.cena);
    }
    if (powody.length) kandydaci.push({ nr, powody, waga });
  }
  kandydaci.sort((a, b) => b.waga - a.waga);
  return kandydaci;
}

function main() {
  const wejscie = plik ? readFileSync(plik, 'utf8') : readFileSync(0, 'utf8');
  const wyciag = JSON.parse(wejscie);
  const oferty = wyciag.mediaexpert;
  const wypisz = (t) => process.stderr.write(t + '\n');
  const oddaj = () => {
    const tresc = JSON.stringify(wyciag);
    if (plik && !sucho) writeFileSync(plik, tresc);
    else if (!plik) process.stdout.write(tresc);
  };

  if (!oferty || !Object.keys(oferty).length) {
    wypisz('me-ceny-stron: brak ofert Media Expertu w wyciągu — nic do sprawdzenia.');
    oddaj();
    return;
  }
  if (!process.env.FIRECRAWL_KEY) {
    wyciag._meta ??= {};
    wyciag._meta.mediaexpert_karty = { sprawdzone: 0, powod: 'brak FIRECRAWL_KEY' };
    wypisz('me-ceny-stron: brak FIRECRAWL_KEY — ceny zostają z feedu (nie sprawdzono kart).');
    oddaj();
    return;
  }

  const zapisane = JSON.parse(
    readFileSync(`${KATALOG}src/data/oferty_feed.json`, 'utf8'),
  ).sety ?? {};

  const kandydaci = doSprawdzenia(oferty, zapisane);
  const wybrani = kandydaci.slice(0, LIMIT);
  wypisz(
    `me-ceny-stron: kandydatów ${kandydaci.length}, sprawdzam ${wybrani.length}` +
      (kandydaci.length > wybrani.length ? ` (limit ${LIMIT})` : ''),
  );

  const poprawki = [];
  const znikniete = [];
  const bledy = [];
  const start = Date.now();
  let sprawdzone = 0;
  let przerwane = 0;
  for (const { nr, powody } of wybrani) {
    if ((Date.now() - start) / 1000 > MAX_SEKUND) {
      przerwane = wybrani.length - sprawdzone;
      wypisz(`me-ceny-stron: budżet ${MAX_SEKUND} s wyczerpany — zostaje ${przerwane} kart na jutro.`);
      break;
    }
    sprawdzone += 1;
    const o = oferty[nr];
    const url = adresKarty(o.link);
    if (!url) {
      bledy.push([nr, 'brak adresu karty w linku']);
      continue;
    }
    let meta;
    try {
      const d = scrape(url, {
        formaty: ['markdown'],
        glownaTresc: true,
        dodatkowe: { proxy: 'basic', includeTags: ['title'], maxAge: 0 },
      });
      meta = d.metadata ?? {};
    } catch (e) {
      bledy.push([nr, e.message.slice(0, 120)]);
      continue;
    }
    // Karta ma ten sam uklad co feed: przy promocji `product:price:amount` jest
    // cena regularna, a ta do zaplaty siedzi w `product:sale_price:amount`
    // (72050: price 829,99 + sale_price 499,00 — w sklepie placisz 499).
    // `product:original_price:amount` nie jest cena regularna — powtarza price.
    const regularna = cenaZMeta(meta, 'product:price:amount');
    const promocyjna = cenaZMeta(meta, 'product:sale_price:amount');
    const cena = promocyjna ?? regularna;
    const dostepny = (meta['product:availability'] ?? '') === 'available';

    if (!dostepny) {
      o.dostepny = false;
      znikniete.push(nr);
      continue;
    }
    if (!cena) {
      bledy.push([nr, 'karta bez ceny w meta']);
      continue;
    }
    o.cena_feed = o.cena;
    o.cena_zrodlo = 'karta';
    if (Math.abs(cena - o.cena) / o.cena > 0.01) {
      poprawki.push([nr, o.cena, cena, powody.join('+')]);
      o.cena = cena;
    }
    o.cena_regularna = regularna && regularna > cena ? regularna : null;
  }

  wyciag._meta ??= {};
  wyciag._meta.mediaexpert_karty = {
    kandydatow: kandydaci.length,
    sprawdzone: sprawdzone - bledy.length,
    poprawione: poprawki.length,
    niedostepne: znikniete,
    nieodpytane: przerwane,
    bledy: bledy.map(([nr, b]) => `${nr}: ${b}`),
  };

  wypisz(
    `me-ceny-stron: poprawionych ${poprawki.length}, niedostępnych ${znikniete.length}, ` +
      `błędów ${bledy.length}`,
  );
  for (const [nr, z, na, powod] of poprawki
    .slice()
    .sort((a, b) => Math.abs(b[2] - b[1]) - Math.abs(a[2] - a[1]))
    .slice(0, 15)) {
    wypisz(`  ${nr}: feed ${z} → karta ${na} (${powod})`);
  }
  for (const [nr, b] of bledy.slice(0, 10)) wypisz(`  ! ${nr}: ${b}`);

  oddaj();
}

main();
