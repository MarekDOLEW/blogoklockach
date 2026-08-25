// Kontrola cen katalogowych w katalog.json.
//
// Skąd problem: `cena_katalogowa` w katalog.json jest uzupełniana partiami
// (backfill per seria) na podstawie Bricksetu, a Brickset podaje ceny w GBP,
// USD i EUR — nie w złotówkach. Przeliczenie kursem daje kwoty, których
// w polskim cenniku LEGO w ogóle nie ma: 59,99 € to u nas 249,99 zł, a nie
// 259,99 zł. Kontrola z 25.08.2026 znalazła 22 takie wpisy na 198 możliwych
// do porównania (11%), w większości zawyżone — jeden set miał 304,99 zł
// zamiast 104,99 zł.
//
// Dlaczego to boli: `cenaKatalogowaSetu()` schodzi do katalog.json dla setów
// spoza sety.json i ceny_baza.json, a od RRP liczymy rabat w tabelach cen.
// Zawyżone RRP = zmyślony rabat na stronie.
//
// Co robi skrypt:
//   1. porównuje katalog.json ze źródłami zweryfikowanymi (sety.json,
//      ceny_baza.json) tam, gdzie set występuje w obu — to miara błędu;
//   2. wypisuje ceny, których nie ma w żadnym zweryfikowanym wpisie i które
//      nie leżą na polskiej drabinie cenowej — kandydatów do sprawdzenia.
//
// Użycie:
//   node scripts/kontrola-rrp.mjs           # raport
//   node scripts/kontrola-rrp.mjs --napraw  # nadpisz katalog danymi zweryfikowanymi
//
// Kod wyjścia 1, gdy są rozbieżności — nadaje się do bramki przed commitem.

import { readFileSync, writeFileSync } from 'node:fs';

const sciezka = (p) => new URL(`../src/data/${p}`, import.meta.url);
const czytaj = (p) => JSON.parse(readFileSync(sciezka(p)));

const katalog = czytaj('katalog.json');
const cenyBaza = czytaj('ceny_baza.json');
const sety = czytaj('sety.json');

const naprawiaj = process.argv.includes('--napraw');

const zweryfikowana = (nr) =>
  sety[nr]?.cena_katalogowa ?? (nr !== '_meta' ? cenyBaza[nr]?.cena_katalogowa : null) ?? null;

// Polska drabina cenowa LEGO: wszystkie kwoty kończą się na ,99 i schodzą
// z listy cen, a nie z przelicznika walutowego. Zbieramy ją z danych
// zweryfikowanych — jeśli kwoty z katalogu nie ma na tej liście ani w jej
// bezpośrednim sąsiedztwie, to sygnał, że powstała z przeliczenia.
const drabina = new Set();
for (const [nr, w] of Object.entries(cenyBaza)) if (nr !== '_meta' && w.cena_katalogowa) drabina.add(w.cena_katalogowa);
for (const s of Object.values(sety)) if (s.cena_katalogowa) drabina.add(s.cena_katalogowa);

const wpisy = [];
for (const [seria, lista] of Object.entries(katalog)) {
  if (seria === '_meta' || !Array.isArray(lista)) continue;
  for (const s of lista) if (s.cena_katalogowa) wpisy.push({ ...s, seria, wpis: s });
}

const rozbiezne = [];
for (const w of wpisy) {
  const pewna = zweryfikowana(w.numer);
  if (pewna !== null && pewna !== w.cena_katalogowa) rozbiezne.push({ ...w, pewna });
}

console.log(`Wpisów z ceną katalogową: ${wpisy.length}`);
console.log(`Porównywalnych ze źródłem zweryfikowanym: ${wpisy.filter((w) => zweryfikowana(w.numer) !== null).length}`);
console.log(`ROZBIEŻNYCH: ${rozbiezne.length}`);
for (const r of rozbiezne.slice(0, 40)) {
  const kierunek = r.cena_katalogowa > r.pewna ? 'zawyżona' : 'zaniżona';
  console.log(`  ${r.numer.padEnd(8)} ${r.seria.padEnd(16)} katalog ${String(r.cena_katalogowa).padStart(8)} | pewna ${String(r.pewna).padStart(8)}  (${kierunek})`);
}

const nieNaDrabinie = wpisy.filter((w) => zweryfikowana(w.numer) === null && !drabina.has(w.cena_katalogowa));
const wgKwoty = new Map();
for (const w of nieNaDrabinie) wgKwoty.set(w.cena_katalogowa, (wgKwoty.get(w.cena_katalogowa) ?? 0) + 1);
console.log(`\nKwoty spoza drabiny (bez źródła zweryfikowanego): ${wgKwoty.size} kwot, ${nieNaDrabinie.length} setów`);
console.log('To tylko sygnał, nie błąd — drabina zna dziś ceny tylko z 270 zweryfikowanych setów.');
for (const [c, n] of [...wgKwoty.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`  ${String(c).padStart(8)} — ${n} setów`);
}

if (naprawiaj && rozbiezne.length) {
  for (const r of rozbiezne) r.wpis.cena_katalogowa = r.pewna;
  writeFileSync(sciezka('katalog.json'), JSON.stringify(katalog, null, 1) + '\n');
  console.log(`\nNaprawiono ${rozbiezne.length} wpisów w katalog.json.`);
  process.exit(0);
}

process.exit(rozbiezne.length ? 1 : 0);
