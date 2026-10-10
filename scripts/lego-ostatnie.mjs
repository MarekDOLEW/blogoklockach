// Dział „Ostatnie zestawy” na lego.com/pl-pl → lista numerów + porównanie z wycofania.json.
//
// To jest oficjalne oznaczenie LEGO „zestaw schodzi z oferty”, czyli dowód dla
// statusu „potwierdzone” w wycofania.json. lego.com odrzuca WebFetch i curl (403),
// dlatego runner Wycofań przez cały wrzesień nie mógł tego działu przeczytać i
// 93 zestawy z działu stały u nas jako „przewidywane” (sprawdzone 10.10.2026:
// 343 produkty, 306 rozpoznanych zestawów). Firecrawl przechodzi bez problemu.
//
// Koszt: 1 kredyt Firecrawla na stronę (22–24 produkty), ok. 16 stron.
// Skrypt NICZEGO nie zapisuje w repo — wypisuje różnice; plik wycofania.json
// zmienia wyłącznie runner Wycofań (jest jego jedynym autorem).
//
// Wymaga FIRECRAWL_KEY. Użycie:
//   node scripts/lego-ostatnie.mjs                       # porównanie z wycofania.json
//   node scripts/lego-ostatnie.mjs --wyjscie /tmp/ostatnie.json   # + lista numerów do pliku
import fs from 'node:fs';

const key = process.env.FIRECRAWL_KEY;
if (!key) { console.error('Brak FIRECRAWL_KEY – nie da się odczytać działu (lego.com blokuje ruch serwerowy).'); process.exit(2); }
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null; };
const BAZA = 'https://www.lego.com/pl-pl/categories/last-chance-to-buy';

async function strona(n) {
  const url = BAZA + (n > 1 ? `?page=${n}` : '');
  for (let proba = 1; proba <= 2; proba++) {
    const r = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true, maxAge: 0, waitFor: 3000 }),
    });
    if (r.status === 402 || r.status === 429) throw new Error(`Firecrawl ${r.status} – brak kredytów albo limit`);
    if (r.ok) return (await r.json()).data?.markdown ?? '';
  }
  throw new Error(`Firecrawl nie odpowiedział dla ${url}`);
}

const numery = new Map();
let deklarowane = null;
for (let n = 1; n <= 40; n++) {
  const md = await strona(n);
  if (n === 1) deklarowane = Number(md.match(/\d+ z (\d+)/)?.[1] ?? 0) || null;
  const naStronie = [...new Set([...md.matchAll(/\/product\/([a-z0-9-]*?)-(\d{4,7})\b/g)].map((m) => m[2]))];
  for (const nr of naStronie) numery.set(nr, n);
  if (!naStronie.length) break;
  if (deklarowane && numery.size >= deklarowane) break;
}

console.log(`Dział „Ostatnie zestawy”: ${numery.size} produktów${deklarowane ? ` (LEGO podaje ${deklarowane})` : ''}.`);
if (deklarowane && numery.size < deklarowane * 0.9) console.log('UWAGA: odczytano mniej niż 90% deklarowanej liczby – dział mógł się nie wczytać w całości. Nie obniżaj na tej podstawie żadnych statusów.');

const w = JSON.parse(fs.readFileSync('src/data/wycofania.json', 'utf8'));
const lista = Array.isArray(w) ? w : w.wycofania;
const idx = new Map(lista.map((e) => [String(e.numer), e]));
const katalog = JSON.parse(fs.readFileSync('src/data/katalog.json', 'utf8'));
const kat = new Map();
for (const v of Object.values(katalog)) if (Array.isArray(v)) for (const e of v) kat.set(String(e.numer), e);

const wDziale = [...numery.keys()];
const brak = wDziale.filter((n) => !idx.has(n) && kat.has(n)).sort();
const nieznane = wDziale.filter((n) => !idx.has(n) && !kat.has(n)).sort();
const doPotwierdzenia = wDziale.filter((n) => idx.get(n)?.status === 'przewidywane').sort();
const potwPoza = lista.filter((e) => e.status === 'potwierdzone' && e.kiedy !== 'wycofany' && !numery.has(String(e.numer))).map((e) => String(e.numer)).sort();

const pokaz = (tytul, l, fn = (n) => n) => console.log(`\n${tytul}: ${l.length}${l.length ? '\n  ' + l.map(fn).join(', ') : ''}`);
const nazwa = (n) => `${n} ${(kat.get(n)?.nazwa ?? idx.get(n)?.nazwa ?? '').slice(0, 40)}`;
pokaz('W dziale, u nas „przewidywane” → do zmiany na „potwierdzone”', doPotwierdzenia);
pokaz('W dziale, w katalogu, ale BRAK w wycofania.json → do dopisania', brak, nazwa);
pokaz('W dziale, nieznane katalogowi (akcesoria, breloki, gadżety – zwykle pomijamy)', nieznane);
pokaz('U nas „potwierdzone”, a NIE ma ich w dziale (wyprzedane albo błąd – sprawdź, nie obniżaj automatycznie)', potwPoza, nazwa);

const wy = arg('--wyjscie');
if (wy) {
  fs.writeFileSync(wy, JSON.stringify({ data: new Date().toISOString().slice(0, 10), zrodlo: BAZA, deklarowane, numery: wDziale }, null, 1));
  console.log(`\nZapisano ${wy}`);
}
