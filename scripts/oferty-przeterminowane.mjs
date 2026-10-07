#!/usr/bin/env node
// Usuwa z sety.json oferty starsze niż N dni (domyślnie 14).
//
// Po co: sety.json trzymał 16.09.2026 siedemnaście ofert z 12–16.08 — ze sklepów
// bez feedu (proshop, rozetka, brixani, sferis, dadada, klocekplus, bricksberg,
// amazon) i trzy LEGO.com sprzed listingu — a hub pokazywał je z przyciskiem.
// Strona od 16.09 sama ich nie pokazuje (src/lib/oferty.js → ofertaAktualna),
// ale dane też nie powinny udawać, że sklep ma ofertę; runnery i tak przepisują
// oferty co dzień, więc to nie łamie append-only (liczba ZESTAWÓW nie maleje).
//
// Użycie:
//   node scripts/oferty-przeterminowane.mjs --sucho       # tylko pokaż
//   node scripts/oferty-przeterminowane.mjs [--dni 14]    # zapisz

import { readFileSync } from 'node:fs';
import { parsujZKolejnoscia, zapiszSety } from './json-kolejnosc.mjs';

const args = process.argv.slice(2);
const sucho = args.includes('--sucho');
const dni = Number(args[args.indexOf('--dni') + 1]) || 14;
const PLIK = 'src/data/sety.json';

const tekst = readFileSync(PLIK, 'utf8');
const mapa = parsujZKolejnoscia(tekst);
const sety = {};
for (const [nr, z] of mapa) sety[nr] = mapaNaObiekt(z);
function mapaNaObiekt(w) {
  if (w instanceof Map) { const o = {}; for (const [k, v] of w) o[k] = mapaNaObiekt(v); return o; }
  if (Array.isArray(w)) return w.map(mapaNaObiekt);
  return w;
}

const prog = Date.now() - dni * 864e5;
const usuniete = [];
for (const [nr, z] of Object.entries(sety)) {
  if (!Array.isArray(z.oferty)) continue;
  const zostaja = z.oferty.filter((o) => {
    const ms = Date.parse(o.data ?? '');
    const stara = !Number.isNaN(ms) && ms < prog;
    if (stara) usuniete.push(`${nr} ${z.nazwa} | ${o.sklep} ${o.cena} zł z ${o.data}`);
    return !stara;
  });
  if (zostaja.length !== z.oferty.length) z.oferty = zostaja;
}

console.log(`Ofert starszych niż ${dni} dni: ${usuniete.length}`);
for (const u of usuniete) console.log('  ' + u);
if (sucho) { console.log('--sucho: nic nie zapisano.'); process.exit(0); }
if (!usuniete.length) process.exit(0);
const przed = mapa.size;
zapiszSety(PLIK, sety, tekst);
const po = Object.keys(JSON.parse(readFileSync(PLIK, 'utf8'))).length;
if (po !== przed) { console.error(`Liczba zestawów zmieniła się ${przed} → ${po} — sprawdź plik!`); process.exit(1); }
console.log(`Zapisano ${PLIK}: ${przed} zestawów (bez zmian liczby), usunięto ${usuniete.length} ofert.`);
