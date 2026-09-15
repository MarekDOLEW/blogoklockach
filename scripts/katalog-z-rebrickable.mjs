#!/usr/bin/env node
// Dopisuje do katalog.json zestawy, które mają cenę w feedach, a katalog ich nie zna.
//
// Skąd (15.09.2026): 1556 wycenionych zestawów nie miało huba wyłącznie dlatego,
// że nie było ich w katalog.json — stare numery (1195, 1382, 41087…) z ofertami
// na Allegro. Decyzja Marka: „wszystkie ceny muszą mieć strony", a raz wpisany
// zestaw zostaje na zawsze (dane historyczne, zero 404). Źródłem nazw, roczników
// i liczby elementów jest katalog Rebrickable (CSV do pobrania bez klucza,
// licencja pozwala na użycie danych z podaniem źródła — jak przy zdjęciach).
//
// Użycie:
//   node scripts/katalog-z-rebrickable.mjs --sucho          # tylko raport
//   node scripts/katalog-z-rebrickable.mjs                  # dopisz brakujące
//   node scripts/katalog-z-rebrickable.mjs --numery 41087,1382   # wskazane
//
// Reguły:
// - dopisujemy TYLKO numery nieobecne w katalogu (append-only; istniejących nie ruszamy);
// - kandydaci: numery z ceną w oferty_feed.json + z redirects.json + z wycofania.json;
// - seria: nazwa motywu Rebrickable, gdy istnieje w katalogu (porównanie bez
//   wielkości liter, także po motywie nadrzędnym); inaczej „Archiwum";
// - status: 'dostepny' dla rocznika ≥ 2025 (może być w sprzedaży), 'eol' dla starszych;
// - nazwa po angielsku z Rebrickable (RUNBOOK: stare pozycje mają angielskie nazwy,
//   nie ma do czego wyrównywać), pole cena_zrodlo brak — RRP nieznane;
// - pole `zrodlo: 'rebrickable'`, żeby dało się je odróżnić i kiedyś poprawić.

import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const arg = process.argv.slice(2);
const sucho = arg.includes('--sucho');
const numeryArg = arg.find((a) => a.startsWith('--numery='))?.slice(9) ?? (arg.includes('--numery') ? arg[arg.indexOf('--numery') + 1] : null);

const KATALOG = 'src/data/katalog.json';
const katalog = JSON.parse(readFileSync(KATALOG, 'utf8'));
const feed = JSON.parse(readFileSync('src/data/oferty_feed.json', 'utf8')).sety ?? {};
const redirects = JSON.parse(readFileSync('src/data/redirects.json', 'utf8'));
const wycofania = JSON.parse(readFileSync('src/data/wycofania.json', 'utf8')).wycofania ?? [];

const wKatalogu = new Set();
for (const [seria, lista] of Object.entries(katalog)) {
  if (seria === '_meta' || !Array.isArray(lista)) continue;
  for (const s of lista) wKatalogu.add(String(s.numer));
}
const serieKatalogu = new Map([...Object.keys(katalog)].filter((k) => k !== '_meta').map((k) => [k.toLowerCase(), k]));
// Motywy Rebrickable, które u nas nazywają się inaczej. Reszta realnych motywów
// LEGO (Nexo Knights, DOTS, Bionicle, Chima…) dostaje własną serię pod nazwą
// Rebrickable — to prawdziwe linie produktowe, a strona serii pokazuje „pełny
// katalog" także po EOL. Gadżety (Gear: magnesy, breloki) idą do „Gadżety".
const ALIASY = new Map(Object.entries({
  'super heroes dc': 'DC', 'super heroes marvel': 'Marvel', 'lego art': 'Art', 'duplo': 'DUPLO',
  'creator expert': 'Icons', 'sonic the hedgehog': 'Sonic', 'town': 'City', 'classic town': 'City',
  'collectible minifigures': 'Minifigurki', 'lego exclusive': 'Ekskluzywne i promocyjne',
  'promotional': 'Ekskluzywne i promocyjne', 'lego brand store': 'Ekskluzywne i promocyjne',
  'gear': 'Gadżety', 'other': 'Archiwum', 'bricklink designer program': 'BrickLink Designer Program',
}));
// Własną serię dostaje tylko motyw z co najmniej MIN_SERII zestawami do dopisania
// i spoza listy „to nie jest linia dla naszego czytelnika" — inaczej powstawało
// 80 stron serii po 1–3 zestawy (Primo, Quatro, Books…), a nazwa z ukośnikiem
// („Dino Attack / Dino 2010") wywracała build. Nazwy serii bez '/' i '&'.
const MIN_SERII = 10;
const NIE_SERIA = new Set(['books', 'games', 'educational and dacta', 'universal building set', 'service packs',
  'bulk bricks', 'freestyle', 'primo', 'quatro', 'studios', 'boat', 'sports', 'factory', 'make & create',
  'dino attack / dino 2010', 'fabuland', 'baby', 'explore', 'znap', 'scala', 'belville', 'clikits', 'galidor',
  'seasonal', 'brickheadz']);
const seriaZMotywu = (wlasny, nadrz) => {
  for (const kandydat of [wlasny, nadrz]) {
    const k = (kandydat ?? '').toLowerCase();
    if (!k) continue;
    if (serieKatalogu.has(k)) return serieKatalogu.get(k);
    if (ALIASY.has(k)) return ALIASY.get(k);
  }
  // realny motyw LEGO bez odpowiednika — własna seria pod nazwą nadrzędną (albo własną),
  // ale dopiero po policzeniu (drugi przebieg niżej sprowadza małe do „Archiwum")
  const kandydat = nadrz ?? wlasny ?? 'Archiwum';
  if (NIE_SERIA.has(kandydat.toLowerCase()) || /[\/&]/.test(kandydat)) return 'Archiwum';
  return kandydat;
};

const maCene = (w) => Boolean(w?.cena || Object.values(w?.oferty ?? {}).some((c) => c > 0));
let kandydaci;
if (numeryArg) {
  kandydaci = new Set(numeryArg.split(',').map((x) => x.trim()).filter(Boolean));
} else {
  kandydaci = new Set([
    ...Object.entries(feed).filter(([, w]) => maCene(w)).map(([n]) => n),
    ...Object.values(redirects).flatMap((m) => (m && typeof m === 'object' ? Object.keys(m) : [])),
    ...wycofania.map((w) => String(w.numer)),
  ]);
}
const brakujace = [...kandydaci].filter((n) => /^\d{3,7}$/.test(n) && !wKatalogu.has(n));
console.log(`Kandydatów: ${kandydaci.size}, spoza katalogu: ${brakujace.length}`);
if (brakujace.length === 0) process.exit(0);

// Rebrickable: pobieramy CSV (gzip) — bez klucza, ok. 0,5 MB.
async function csv(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (tylkoklocki.pl katalog)' } });
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  const tekst = gunzipSync(Buffer.from(await r.arrayBuffer())).toString('utf8');
  // CSV Rebrickable ma końce linii CRLF — bez zdjęcia \r ostatnia kolumna (parent_id) nie pasuje do id
  const [naglowek, ...wiersze] = tekst.split(/\r?\n/).filter(Boolean);
  const kol = naglowek.split(',');
  return wiersze.map((w) => {
    // proste CSV: nazwy mogą mieć przecinki w cudzysłowie
    const pola = []; let biez = ''; let wCudz = false;
    for (const ch of w) {
      if (ch === '"') wCudz = !wCudz;
      else if (ch === ',' && !wCudz) { pola.push(biez); biez = ''; }
      else biez += ch;
    }
    pola.push(biez);
    return Object.fromEntries(kol.map((k, i) => [k, pola[i] ?? '']));
  });
}
const [sets, themes] = await Promise.all([
  csv('https://cdn.rebrickable.com/media/downloads/sets.csv.gz'),
  csv('https://cdn.rebrickable.com/media/downloads/themes.csv.gz'),
]);
const motyw = new Map(themes.map((t) => [t.id, t]));
const nazwaMotywu = (id) => motyw.get(id)?.name ?? null;
const motywNadrzedny = (id) => { const t = motyw.get(id); return t?.parent_id ? nazwaMotywu(t.parent_id) : null; };
// „<numer>-1" to główny wariant zestawu; -2, -3 to warianty regionalne/przepakowania
const poNumerze = new Map();
for (const s of sets) {
  const m = /^(\d{3,7})-1$/.exec(s.set_num);
  if (m) poNumerze.set(m[1], s);
}

const dopisane = []; const nieznane = [];
for (const n of brakujace) {
  const s = poNumerze.get(n);
  if (!s) { nieznane.push(n); continue; }
  const rok = Number(s.year) || null;
  const wlasny = nazwaMotywu(s.theme_id); const nadrz = motywNadrzedny(s.theme_id);
  const seria = seriaZMotywu(wlasny, nadrz);
  dopisane.push({ seria, wpis: {
    numer: n, nazwa: s.name, rok, elementy: Number(s.num_parts) || null,
    status: rok && rok >= 2025 ? 'dostepny' : 'eol', cena_katalogowa: null,
    zrodlo: 'rebrickable', motyw_rebrickable: [wlasny, nadrz].filter(Boolean).join(' / ') || null,
  } });
}
// drugi przebieg: nowa seria (spoza katalogu) z mniej niż MIN_SERII zestawami → Archiwum
const liczność = {};
for (const d of dopisane) liczność[d.seria] = (liczność[d.seria] ?? 0) + 1;
for (const d of dopisane) {
  if (!serieKatalogu.has(d.seria.toLowerCase()) && d.seria !== 'Archiwum' && d.seria !== 'Gadżety' && liczność[d.seria] < MIN_SERII) d.seria = 'Archiwum';
}
const wgSerii = {};
for (const d of dopisane) wgSerii[d.seria] = (wgSerii[d.seria] ?? 0) + 1;
console.log(`Znalezione w Rebrickable: ${dopisane.length}, nieznane: ${nieznane.length}`);
console.log('Wg serii:', Object.entries(wgSerii).sort((a, b) => b[1] - a[1]).map(([s, n]) => `${s} ${n}`).join(', '));
if (nieznane.length) console.log('Nieznane (pierwsze 20):', nieznane.slice(0, 20).join(' '));
if (sucho) { console.log('Tryb --sucho: nic nie zapisano.'); process.exit(0); }

const przed = wKatalogu.size;
for (const { seria, wpis } of dopisane) {
  if (!Array.isArray(katalog[seria])) katalog[seria] = [];
  katalog[seria].push(wpis);
}
katalog._meta = katalog._meta ?? {};
katalog._meta.rebrickable = `${new Date().toISOString().slice(0, 10)}: dopisano ${dopisane.length} zestawów z katalogu Rebrickable (nazwy EN, bez RRP, pole zrodlo=rebrickable) — wycenione w feedach numery, których katalog nie znał; decyzja Marka 15.09.2026: raz wpisany zestaw zostaje na zawsze.`;
writeFileSync(KATALOG, JSON.stringify(katalog, null, 1) + '\n');
// walidacja append-only
const po = JSON.parse(readFileSync(KATALOG, 'utf8'));
let liczba = 0; for (const [k, v] of Object.entries(po)) if (k !== '_meta' && Array.isArray(v)) liczba += v.length;
if (liczba < przed + dopisane.length) throw new Error(`walidacja: było ${przed}, miało być ${przed + dopisane.length}, jest ${liczba}`);
console.log(`Zapisano: ${przed} → ${liczba} zestawów w katalogu.`);
