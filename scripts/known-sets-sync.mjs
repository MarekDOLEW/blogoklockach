#!/usr/bin/env node
// Rejestr Scouta (known_sets.json) kontra śledzone zestawy (sety.json).
//
// Po co (19.10.2026): `known_sets.json` to notes Scouta — lista numerów, które
// zna, plus `liczba_setow` i `data_aktualizacji`. Nikt nie pisze go skryptem;
// gdy sesja Code dopisze zestawy do `sety.json` ręcznie (52e1586, 11.10: 18
// dużych zestawów z listy Radaru), rejestr zostaje w tyle i przez trzy dni
// `liczba_setow` kłamie. Ten skrypt dociąga rejestr do stanu `sety.json`:
// dopisuje brakujące numery, przelicza `liczba_setow`, ustawia datę. Niczego
// nie kasuje (append-only) — numer obecny w rejestrze, a nieobecny w sety.json
// jest zgłaszany, nie usuwany, bo to może być zestaw świadomie zdjęty z listy
// śledzonych i Scout ma o tym wiedzieć.
//
// Wykrywanie rozjazdu robi `diagnoza.mjs` (także `--szybko`), więc każdy runner
// widzi go następnego dnia; ten skrypt to naprawa jednym poleceniem.
//
// Użycie:
//   node scripts/known-sets-sync.mjs           # dociąga i zapisuje
//   node scripts/known-sets-sync.mjs --sucho   # tylko pokazuje różnice

import { readFileSync, writeFileSync } from 'node:fs';

const sucho = process.argv.includes('--sucho');
const P_KNOWN = new URL('../src/data/known_sets.json', import.meta.url);
const P_SETY = new URL('../src/data/sety.json', import.meta.url);

const known = JSON.parse(readFileSync(P_KNOWN, 'utf8'));
const sety = JSON.parse(readFileSync(P_SETY, 'utf8'));

const wSety = Object.keys(sety).filter((k) => !k.startsWith('_'));
const wKnown = new Set((known.sety ?? []).map(String));
const brak = wSety.filter((nr) => !wKnown.has(nr));
const nadmiar = [...wKnown].filter((nr) => !Object.hasOwn(sety, nr));

console.log(`sety.json: ${wSety.length} zestawów · known_sets.sety: ${wKnown.size} · liczba_setow: ${known.liczba_setow}`);
if (brak.length) console.log(`W sety.json bez wpisu w rejestrze (${brak.length}): ${brak.join(', ')}`);
if (nadmiar.length) console.log(`W rejestrze, a nie w sety.json (${nadmiar.length}) — NIE kasuję, do decyzji Scouta: ${nadmiar.join(', ')}`);
const liczbaZla = known.liczba_setow !== wKnown.size + brak.length;
if (!brak.length && !nadmiar.length && !liczbaZla) { console.log('Rejestr zgodny — nic do zrobienia.'); process.exit(0); }

if (sucho) { console.log('--sucho: bez zapisu.'); process.exit(nadmiar.length ? 1 : 0); }

// Kolejność numerów jak w rejestrze: posortowana, bo tak go prowadzi Scout.
known.sety = [...wKnown, ...brak].map(String).sort((a, b) => a.localeCompare(b, 'pl', { numeric: true }));
known.liczba_setow = known.sety.length;
known.data_aktualizacji = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' }).format(new Date());
writeFileSync(P_KNOWN, `${JSON.stringify(known, null, 1)}\n`);
console.log(`Zapisano: dopisane ${brak.length}, liczba_setow ${known.liczba_setow}, data ${known.data_aktualizacji}.`);
process.exit(nadmiar.length ? 1 : 0);
