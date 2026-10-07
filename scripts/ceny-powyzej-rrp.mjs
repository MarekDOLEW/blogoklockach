#!/usr/bin/env node
// Zestawy, w których najniższa oferta stoi POWYŻEJ ceny katalogowej.
//
// Po co: na hubie taka pozycja wygląda jak zepsuta porównywarka — czytelnik widzi
// „od 3 865,55 zł" przy zestawie z katalogową 1 899,99 zł i nie klika (raport
// Kontrolera z 14.09 wiąże z tym zerowy CTR przy pozycji 7 w Google).
//
// Ale nie każdy taki przypadek to błąd. Przy zestawie po EOL cena powyżej
// katalogowej jest NORMALNA — LEGO już nie sprzedaje, zostaje rynek wtórny
// i ceny kolekcjonerskie. Dlatego lista dzieli się na dwie części i tylko
// pierwsza wymaga sprawdzenia.
//
// Status EOL ustalamy tak samo jak serwis (src/lib/status.js): najpierw lista
// wycofań (kuratorowana co tydzień, wpis `kiedy: "wycofany"`), potem katalog.
//
// Nasz status EOL bywa niepełny — sprawdzenie 14.09 pokazało, że zestawy
// oznaczone jako „w sprzedaży" bywają dawno wycofane (przede wszystkim gadżety
// z serii 40xxx: dodatki do zakupów, sezonowe, krótka dostępność). Dlatego
// skrypt przyjmuje katalog lego.com i rozstrzyga twardo: czego nie ma
// w katalogu producenta, tego LEGO nie sprzedaje, więc przebitka jest normalna.
//
// Użycie:
//   node scripts/ceny-powyzej-rrp.mjs
//   node scripts/ceny-powyzej-rrp.mjs --lego katalog-legopl.json --csv plik.csv

import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const csv = args.includes('--csv') ? args[args.indexOf('--csv') + 1] : null;
const plikLego = args.includes('--lego') ? args[args.indexOf('--lego') + 1] : null;

const czytaj = (p) => JSON.parse(readFileSync(`src/data/${p}`, 'utf8'));
const feed = czytaj('oferty_feed.json').sety ?? {};
const rrp = czytaj('rrp_potwierdzone.json');
const katalog = czytaj('katalog.json');
const wycofania = czytaj('wycofania.json').wycofania ?? [];
const sklepy = czytaj('sklepy.json');

// Katalog lego.com (scripts/firecrawl-legopl.mjs) — opcjonalny, ale bez niego
// grupa „w sprzedaży" miesza dwie różne rzeczy.
let wKataloguLego = null;
let dataKatalogu = null;
if (plikLego) {
  const k = JSON.parse(readFileSync(plikLego, 'utf8'));
  wKataloguLego = new Set((k.products ?? k).map((p) => String(p.setNumber)));
  dataKatalogu = k.meta?.scrapedAt ?? '?';
}

const wpis = new Map();
for (const [seria, lista] of Object.entries(katalog)) {
  if (seria === '_meta' || !Array.isArray(lista)) continue;
  for (const z of lista) wpis.set(String(z.numer), { ...z, seria });
}
// „odwołane" nie liczy się jako wycofanie — LEGO wróciło do sprzedaży
const wycofanieIdx = new Map(
  wycofania.filter((w) => w.kiedy !== 'odwołane').map((w) => [String(w.numer), w]),
);

const cenaRRP = (nr) => {
  const v = rrp[nr];
  const z = typeof v === 'object' && v ? v.cena : v;
  if (typeof z === 'number' && z > 0) return z;
  const k = wpis.get(nr)?.cena_katalogowa;
  return typeof k === 'number' && k > 0 ? k : null;
};

// EOL: lista wycofań ma pierwszeństwo przed katalogiem (tak samo jak lib/status.js)
function eol(nr) {
  const w = wycofanieIdx.get(nr);
  if (w) return w.kiedy === 'wycofany';
  return wpis.get(nr)?.status === 'eol';
}

const znalezione = [];
for (const [nr, v] of Object.entries(feed)) {
  if (nr === '_meta' || !v || typeof v !== 'object') continue;
  // Ceneo to porównywarka, nie sklep — jej cena nie jest naszą ofertą
  const oferty = Object.entries(v.oferty ?? {}).filter(
    ([s, c]) => s !== 'ceneo' && typeof c === 'number' && c > 0,
  );
  if (!oferty.length) continue;
  const kat = cenaRRP(nr);
  if (!kat) continue;
  const [sklep, cena] = oferty.reduce((a, b) => (b[1] < a[1] ? b : a));
  if (cena <= kat) continue;
  znalezione.push({
    nr,
    nazwa: wpis.get(nr)?.nazwa ?? '',
    seria: wpis.get(nr)?.seria ?? '',
    kat,
    cena,
    sklep: sklepy[sklep]?.nazwa ?? sklep,
    nadwyzka: Math.round(((cena / kat) * 100 - 100) * 10) / 10,
    eol: eol(nr),
    wLego: wKataloguLego ? wKataloguLego.has(nr) : null,
  });
}
znalezione.sort((a, b) => b.nadwyzka - a.nadwyzka);

const poEol = znalezione.filter((x) => x.eol);
// Z grupy „w sprzedaży" wypada to, czego nie ma w katalogu producenta —
// LEGO tego nie sprzedaje, więc przebitka jest normalna, tylko nasz status
// jest nieaktualny.
const nieuNasEol = znalezione.filter((x) => !x.eol);
const doSprawdzenia = nieuNasEol.filter((x) => x.wLego !== false);
const statusDoPoprawki = nieuNasEol.filter((x) => x.wLego === false);

console.log(`Zestawów z najniższą ofertą powyżej ceny katalogowej: ${znalezione.length}`);
console.log(`  Po EOL — przebitka normalna:          ${poEol.length}`);
if (wKataloguLego) {
  console.log(`  Brak w katalogu lego.com (${dataKatalogu}) —`);
  console.log(`    przebitka normalna, NASZ STATUS DO POPRAWKI: ${statusDoPoprawki.length}`);
}
console.log(`  W sprzedaży wg LEGO — DO SPRAWDZENIA:  ${doSprawdzenia.length}`);
if (statusDoPoprawki.length) {
  console.log(`\n--- BRAK W KATALOGU lego.com (u nas wciąż „w sprzedaży") ---`);
  for (const x of statusDoPoprawki.slice(0, 20)) {
    console.log(`${x.nr.padEnd(8)}${`+${x.nadwyzka}%`.padStart(9)}  ${x.cena.toFixed(2).padStart(10)}  ${x.kat.toFixed(2).padStart(10)}  ${x.nazwa.slice(0, 40)}`);
  }
}
console.log(`\n--- W SPRZEDAŻY WG LEGO (najpierw największa nadwyżka) ---`);
console.log(`${'nr'.padEnd(8)}${'nadwyżka'.padStart(9)}  ${'oferta'.padStart(10)}  ${'katalog'.padStart(10)}  ${'sklep'.padEnd(16)}nazwa`);
for (const x of doSprawdzenia) {
  console.log(
    `${x.nr.padEnd(8)}${`+${x.nadwyzka}%`.padStart(9)}  ${x.cena.toFixed(2).padStart(10)}  ${x.kat.toFixed(2).padStart(10)}  ${x.sklep.padEnd(16)}${x.nazwa.slice(0, 40)}`,
  );
}

if (csv) {
  const wiersze = [
    'numer;nazwa;seria;status;w_katalogu_lego;sklep;cena_oferty;cena_katalogowa;nadwyzka_proc;hub',
    ...znalezione.map((x) =>
      [x.nr, x.nazwa, x.seria,
       x.eol ? 'po EOL' : x.wLego === false ? 'status do poprawki' : 'w sprzedazy',
       x.wLego === null ? '?' : x.wLego ? 'tak' : 'NIE', x.sklep,
       x.cena.toFixed(2), x.kat.toFixed(2), x.nadwyzka,
       `https://tylkoklocki.pl/zestaw/${x.nr}/`].join(';'),
    ),
  ];
  writeFileSync(csv, `﻿${wiersze.join('\n')}\n`);
  console.log(`\nZapisano ${csv} (${znalezione.length} wierszy, obie grupy).`);
}
