#!/usr/bin/env node
// Dzienny zapis najniższej ceny każdego zestawu — materiał na wykresy „jak
// zmieniała się cena" (dziś nie mamy żadnej serii czasowej: ceny_baza.json trzyma
// wyłącznie minimum wszech czasów, oferty_feed.json to migawka z dziś).
//
// Format: JSON Lines, jeden plik na miesiąc, w `materialy/historia-cen/`.
// CELOWO POZA src/data: wszystko w src/data wchodzi do builda Astro, a historia
// ma rosnąć latami. Gdy dojdą wykresy na hubach, osobny skrypt wytnie z tego
// kompaktową serię (tygodniowe punkty, tylko zestawy z hubem) do src/data.
//
// Zapisujemy TYLKO ZMIANY: jeśli najniższa cena zestawu jest taka sama jak
// w ostatnim wpisie, nowej linii nie ma. Dzięki temu plik rośnie w tempie
// realnych ruchów cen, a nie 8 000 linii dziennie.
//
// Ceneo pomijamy — to porównywarka, nie sklep; jej cena i tak jest echem innych.
//
// Użycie:
//   node scripts/historia-cen.mjs           # dopisz dzisiejszy stan
//   node scripts/historia-cen.mjs --sucho   # tylko policz, nic nie zapisuj

import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const KATALOG = join(dirname(fileURLToPath(import.meta.url)), '..');
const sucho = process.argv.includes('--sucho');
const czytaj = (p) => JSON.parse(readFileSync(join(KATALOG, 'src/data', p), 'utf8'));

const feed = czytaj('oferty_feed.json').sety ?? {};
const sety = czytaj('sety.json');
const dzis = new Date().toISOString().slice(0, 10);

const KATALOG_HISTORII = join(KATALOG, 'materialy/historia-cen');
const PLIK_MIESIACA = join(KATALOG_HISTORII, `${dzis.slice(0, 7)}.jsonl`);
const PLIK_STANU = join(KATALOG_HISTORII, '_ostatnie.json');
mkdirSync(KATALOG_HISTORII, { recursive: true });

// Ostatnia zapisana cena per zestaw — bez tego trzeba by czytać całą historię.
const ostatnie = existsSync(PLIK_STANU) ? JSON.parse(readFileSync(PLIK_STANU, 'utf8')) : {};

// Najniższa dzisiejsza oferta zestawu: feed + sety.json razem, bez Ceneo.
const najnizsze = new Map();
const zglos = (nr, sklep, cena) => {
  if (sklep === 'ceneo' || !(cena > 0)) return;
  const stara = najnizsze.get(nr);
  if (!stara || cena < stara.c) najnizsze.set(nr, { c: Number(cena), s: sklep });
};
for (const [nr, w] of Object.entries(feed)) for (const [sklep, cena] of Object.entries(w.oferty ?? {})) zglos(nr, sklep, cena);
for (const [nr, z] of Object.entries(sety)) for (const o of z.oferty ?? []) zglos(nr, o.sklep, o.cena);

const linie = [];
let bezZmian = 0;
for (const [nr, { c, s }] of [...najnizsze].sort((a, b) => a[0].localeCompare(b[0]))) {
  const p = ostatnie[nr];
  // Ten sam dzień już zapisany albo cena bez zmiany — nie dokładamy linii.
  if (p && (p.d === dzis || (Math.abs(p.c - c) < 0.005 && p.s === s))) { bezZmian++; continue; }
  linie.push(JSON.stringify({ d: dzis, nr, c, s }));
  ostatnie[nr] = { d: dzis, c, s };
}

console.log(`Zestawów z ofertą: ${najnizsze.size}. Nowych wpisów: ${linie.length}. Bez zmiany: ${bezZmian}.`);
if (sucho) { console.log('--sucho: nic nie zapisano.'); process.exit(0); }
if (linie.length) appendFileSync(PLIK_MIESIACA, linie.join('\n') + '\n');
writeFileSync(PLIK_STANU, JSON.stringify(ostatnie) + '\n');
console.log(`Zapisano: ${PLIK_MIESIACA.replace(KATALOG + '/', '')} (+${linie.length} linii).`);
