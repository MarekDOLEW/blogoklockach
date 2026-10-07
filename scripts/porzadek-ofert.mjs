#!/usr/bin/env node
// Stała kolejność ofert w sety.json: alfabetycznie po nazwie sklepu.
//
// Po co (decyzja Marka 16.09.2026): Łowca zapisywał oferty posortowane po cenie,
// więc każda zmiana ceny przestawiała kolejność i przy wcięciu 2 spacji diff
// jednego przebiegu miał 76 tys. linii — historia zmian była nieczytelna.
// Kolejność w danych nie wpływa na stronę: tabela cen i `najlepszaOferta()`
// sortują po cenie same. Po normalizacji dzienny diff pokazuje tylko realnie
// zmienione ceny i daty.
//
// Użycie:
//   node scripts/porzadek-ofert.mjs --sucho   # ile wpisów wymaga zmiany
//   node scripts/porzadek-ofert.mjs           # zapisz

import { readFileSync, writeFileSync } from 'node:fs';
import { zapiszSety } from './json-kolejnosc.mjs';

const P = 'src/data/sety.json';
const sucho = process.argv.includes('--sucho');
const tekst = readFileSync(P, 'utf8');
const sety = JSON.parse(tekst);
const przed = Object.keys(sety).length;

let zmienione = 0;
for (const wpis of Object.values(sety)) {
  if (!Array.isArray(wpis?.oferty) || wpis.oferty.length < 2) continue;
  const przedKolejnosc = wpis.oferty.map((o) => o.sklep).join('|');
  wpis.oferty.sort((a, b) => String(a.sklep).localeCompare(String(b.sklep), 'pl'));
  if (wpis.oferty.map((o) => o.sklep).join('|') !== przedKolejnosc) zmienione++;
}
console.log(`Zestawów z ofertami do przestawienia: ${zmienione} (z ${przed} w pliku).`);
if (sucho) { console.log('Tryb --sucho: nic nie zapisano.'); process.exit(0); }
if (!zmienione) { console.log('Kolejność już stabilna — nic nie zapisano.'); process.exit(0); }

zapiszSety(P, sety, tekst);
const po = Object.keys(JSON.parse(readFileSync(P, 'utf8'))).length;
if (po < przed) throw new Error(`walidacja: liczba zestawów zmalała ${przed} → ${po}`);
console.log(`Zapisano. Zestawów: ${po}. Oferty w kolejności alfabetycznej po sklepie.`);
