#!/usr/bin/env node
// Dzienny zapis cen — po jednej linii na PARĘ (zestaw, sklep) — czyli materiał
// nie tylko na wykres „jak zmieniała się cena zestawu", ale też na pytania typu
// „który sklep jest najczęściej najtańszy w tej serii" albo „ile to kosztowało
// w Empiku w listopadzie".
//
// Do 18.09.2026 nie mieliśmy żadnej serii czasowej: ceny_baza.json trzyma
// wyłącznie minimum wszech czasów, a oferty_feed.json to migawka z dziś.
// Pierwsza wersja tego skryptu zapisywała tylko najniższą cenę dnia; Marek
// przestawił na wersję per sklep tego samego dnia, zanim plik urósł — danych,
// których nie zaczniemy zbierać dziś, nie da się odtworzyć za pół roku.
//
// Format: JSON Lines, jeden plik na miesiąc, w `src/data/historia-cen/`.
//   {"d":"2026-09-18","nr":"76444","s":"empik","c":613.39}   cena tego dnia
//   {"d":"2026-09-30","nr":"76444","s":"empik","c":null}     oferta zniknęła
//
// Dlaczego w src/data, skoro to nie są dane serwisu: runnery commitują `src/data`
// (mają to wprost w promptach), a kontener po przebiegu znika. Plik poza tym
// katalogiem groziłby tym, że historia nigdy nie trafi do repo. Buildowi to nie
// ciąży: Astro pakuje wyłącznie to, co ktoś zaimportuje, a .jsonl nie importuje
// nikt (w src/ nie ma żadnego import.meta.glob po src/data).
//
// ZAPISUJEMY TYLKO ZMIANY. Cena, która stoi, nie generuje linii — plik rośnie
// w tempie realnych ruchów rynku, nie 12 000 linii dziennie.
//
// Ceneo pomijamy: to porównywarka, a jej cena jest echem innych sklepów.
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

const KATALOG_HISTORII = join(KATALOG, 'src/data/historia-cen');
const PLIK_MIESIACA = join(KATALOG_HISTORII, `${dzis.slice(0, 7)}.jsonl`);
const PLIK_STANU = join(KATALOG_HISTORII, '_ostatnie.json');
mkdirSync(KATALOG_HISTORII, { recursive: true });

// Stan: ostatnia zapisana cena każdej pary „numer|sklep". Bez tego trzeba by
// czytać całą historię, żeby stwierdzić, czy cena się ruszyła.
const stan = existsSync(PLIK_STANU) ? JSON.parse(readFileSync(PLIK_STANU, 'utf8')) : {};

// Dzisiejsze ceny: feed i sety.json razem, najniższa gdy sklep występuje w obu.
const dzisiaj = new Map();
const zglos = (nr, sklep, cena) => {
  if (!sklep || sklep === 'ceneo' || !(cena > 0)) return;
  const klucz = `${nr}|${sklep}`;
  const stara = dzisiaj.get(klucz);
  if (stara === undefined || cena < stara) dzisiaj.set(klucz, Number(cena));
};
for (const [nr, w] of Object.entries(feed)) for (const [sklep, cena] of Object.entries(w.oferty ?? {})) zglos(nr, sklep, cena);
for (const [nr, z] of Object.entries(sety)) for (const o of z.oferty ?? []) zglos(nr, o.sklep, o.cena);

// Ile ofert ma dziś każdy sklep — potrzebne do bezpiecznika niżej.
const dzisPerSklep = new Map();
for (const klucz of dzisiaj.keys()) {
  const sklep = klucz.slice(klucz.indexOf('|') + 1);
  dzisPerSklep.set(sklep, (dzisPerSklep.get(sklep) ?? 0) + 1);
}
const wczorajPerSklep = new Map();
for (const [klucz, w] of Object.entries(stan)) {
  if (w.c === null) continue;
  const sklep = klucz.slice(klucz.indexOf('|') + 1);
  wczorajPerSklep.set(sklep, (wczorajPerSklep.get(sklep) ?? 0) + 1);
}

// BEZPIECZNIK. Zniknięcie oferty zapisujemy jako `c: null` — to cenna informacja
// („wtedy zestaw wypadł z Empiku"). Ale gdy padnie feed, znikają naraz WSZYSTKIE
// oferty sklepu i bez tego warunku wpisalibyśmy tysiące fałszywych „zniknięć".
// Dlatego sklep, który stracił z dnia na dzień ponad połowę ofert, jest
// traktowany jako awaria pobrania: nie odnotowujemy zniknięć i mówimy o tym wprost.
const PROG_AWARII = 0.5;
const podejrzaneSklepy = new Set();
for (const [sklep, bylo] of wczorajPerSklep) {
  if ((dzisPerSklep.get(sklep) ?? 0) < bylo * PROG_AWARII) podejrzaneSklepy.add(sklep);
}

const linie = [];
let bezZmian = 0;
for (const [klucz, cena] of [...dzisiaj].sort((a, b) => a[0].localeCompare(b[0]))) {
  const p = stan[klucz];
  if (p && p.d === dzis) { bezZmian++; continue; }            // już zapisane dziś
  if (p && p.c !== null && Math.abs(p.c - cena) < 0.005) { bezZmian++; continue; } // bez ruchu
  const [nr, sklep] = [klucz.slice(0, klucz.indexOf('|')), klucz.slice(klucz.indexOf('|') + 1)];
  linie.push(JSON.stringify({ d: dzis, nr, s: sklep, c: cena }));
  stan[klucz] = { d: dzis, c: cena };
}

let zniknieto = 0;
for (const [klucz, p] of Object.entries(stan)) {
  if (p.c === null || dzisiaj.has(klucz)) continue;
  const sklep = klucz.slice(klucz.indexOf('|') + 1);
  if (podejrzaneSklepy.has(sklep)) continue;
  const nr = klucz.slice(0, klucz.indexOf('|'));
  linie.push(JSON.stringify({ d: dzis, nr, s: sklep, c: null }));
  stan[klucz] = { d: dzis, c: null };
  zniknieto++;
}

console.log(`Par (zestaw, sklep) dziś: ${dzisiaj.size}. Nowych wpisów: ${linie.length} (w tym zniknięć: ${zniknieto}). Bez zmiany: ${bezZmian}.`);
if (podejrzaneSklepy.size) console.log(`Pominięte zniknięcia — sklep stracił ponad połowę ofert, to wygląda na awarię feedu: ${[...podejrzaneSklepy].join(', ')}.`);
if (sucho) { console.log('--sucho: nic nie zapisano.'); process.exit(0); }
if (linie.length) appendFileSync(PLIK_MIESIACA, linie.join('\n') + '\n');
writeFileSync(PLIK_STANU, JSON.stringify(stan) + '\n');
console.log(`Zapisano: src/data/historia-cen/${dzis.slice(0, 7)}.jsonl (+${linie.length} linii).`);
