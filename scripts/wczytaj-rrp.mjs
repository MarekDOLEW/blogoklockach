// Wczytanie potwierdzonych cen katalogowych do rrp_potwierdzone.json.
//
// Po co: serwer nie ma dostępu do lego.pl ani zklockow.pl (oba oddają 403 —
// odpowiednio blokada ruchu serwerowego i Cloudflare managed challenge), a
// Chromium w tym środowisku nie ma sieci wychodzącej. Ceny katalogowe musi więc
// dostarczyć człowiek albo Cowork z prawdziwą przeglądarką. Ten skrypt przyjmuje
// taką listę i wkłada ją do rejestru, który ma pierwszeństwo przed wszystkim.
//
// Cena katalogowa nie zmienia się w czasie, więc wpis raz dodany zostaje na
// zawsze — skrypt domyślnie NIE nadpisuje istniejących pozycji, tylko zgłasza
// konflikt. Świadomą korektę robi się z --nadpisz.
//
// Wejście: plik CSV/TSV (numer, cena — separator `;`, `,` lub tabulator, nagłówek
// opcjonalny) albo JSON w postaci {"31161": 249.99} lub {"31161": {"cena": 249.99}}.
//
// Użycie:
//   node scripts/wczytaj-rrp.mjs ceny.csv --zrodlo "zklockow.pl (Cowork)"
//   node scripts/wczytaj-rrp.mjs ceny.csv --zrodlo "..." --data 26.08.2026
//   node scripts/wczytaj-rrp.mjs ceny.csv --zrodlo "..." --sucho      # tylko raport
//   node scripts/wczytaj-rrp.mjs ceny.csv --zrodlo "..." --nadpisz    # korekta wpisów

import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const plik = args.find((a) => !a.startsWith('--'));
const opcja = (nazwa) => {
  const i = args.indexOf(`--${nazwa}`);
  return i >= 0 ? args[i + 1] : null;
};
const sucho = args.includes('--sucho');
const nadpisz = args.includes('--nadpisz');
const zrodlo = opcja('zrodlo');

if (!plik || !zrodlo) {
  console.error('Użycie: node scripts/wczytaj-rrp.mjs <plik> --zrodlo "skąd potwierdzenie" [--data DD.MM.RRRR] [--sucho] [--nadpisz]');
  process.exit(2);
}

const dzis = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
};
const data = opcja('data') ?? dzis();

// ── wejście ──
const surowe = readFileSync(plik, 'utf8').trim();
const wejscie = new Map();
if (surowe.startsWith('{')) {
  for (const [nr, w] of Object.entries(JSON.parse(surowe))) {
    if (nr === '_meta') continue;
    const cena = typeof w === 'number' ? w : w?.cena;
    if (typeof cena === 'number') wejscie.set(String(nr), cena);
  }
} else {
  // Nie dzielimy po przecinku — w polskich cenach przecinek to separator
  // dziesiętny („249,99"), więc rozjechałby kwotę na dwa pola. Numer zestawu
  // bierzemy z pierwszej grupy 4–7 cyfr, cenę z ostatniej liczby w linii.
  for (const linia of surowe.split(/\r?\n/)) {
    const nr = /(?:^|[^\d])(\d{4,7})(?:[^\d]|$)/.exec(linia)?.[1];
    if (!nr) continue;
    const kwoty = [...linia.matchAll(/(\d{1,5}(?:[.,]\d{1,2})?)\s*(?:zł)?/gi)]
      .map((m) => m[1])
      .filter((k) => k !== nr);
    const ostatnia = kwoty.at(-1);
    if (!ostatnia) continue;
    const cena = Number(ostatnia.replace(',', '.'));
    if (Number.isFinite(cena) && cena > 0) wejscie.set(nr, cena);
  }
}
if (wejscie.size === 0) {
  console.error('Nie znalazłem żadnej pary numer + cena. Sprawdź format pliku.');
  process.exit(2);
}

// ── scalenie ──
const sciezka = new URL('../src/data/rrp_potwierdzone.json', import.meta.url);
const rejestr = JSON.parse(readFileSync(sciezka));

const nowe = [];
const konflikty = [];
const bezZmian = [];
for (const [nr, cena] of wejscie) {
  const stary = rejestr[nr];
  if (!stary) nowe.push([nr, cena]);
  else if (Math.abs(stary.cena - cena) < 0.005) bezZmian.push(nr);
  else konflikty.push([nr, stary.cena, cena, stary.zrodlo]);
}

console.log(`Wczytano par numer+cena: ${wejscie.size}`);
console.log(`  nowych wpisów:        ${nowe.length}`);
console.log(`  już w rejestrze:      ${bezZmian.length}`);
console.log(`  KONFLIKTÓW:           ${konflikty.length}`);
for (const [nr, stara, nowa, zr] of konflikty) {
  console.log(`    ${nr.padEnd(8)} rejestr ${String(stara).padStart(8)} (${zr}) | plik ${String(nowa).padStart(8)}`);
}
if (konflikty.length && !nadpisz) {
  console.log('\nKonflikty zostawiam bez zmian. Cena katalogowa nie zmienia się w czasie, więc');
  console.log('różnica oznacza błąd po jednej ze stron — rozstrzygnij u źródła, potem --nadpisz.');
}

if (sucho) process.exit(konflikty.length ? 1 : 0);

for (const [nr, cena] of nowe) rejestr[nr] = { cena, zrodlo, data };
if (nadpisz) for (const [nr, , cena] of konflikty) rejestr[nr] = { cena, zrodlo, data };

rejestr._meta.zaktualizowano = new Date().toISOString().slice(0, 10);
// klucze numeryczne rosnąco, _meta zawsze pierwsze — plik ma być czytelny w diffie
const uporzadkowany = { _meta: rejestr._meta };
for (const nr of Object.keys(rejestr).filter((k) => k !== '_meta').sort((a, b) => Number(a) - Number(b))) {
  uporzadkowany[nr] = rejestr[nr];
}
writeFileSync(sciezka, JSON.stringify(uporzadkowany, null, 2) + '\n');

const razem = Object.keys(uporzadkowany).length - 1;
console.log(`\nZapisano. Rejestr ma teraz ${razem} potwierdzonych cen katalogowych.`);
console.log('Sprawdź jeszcze: node scripts/kontrola-rrp.mjs');
