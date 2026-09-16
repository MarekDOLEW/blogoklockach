#!/usr/bin/env node
// Import tygodniowego zrzutu cen Empiku (lego-empik.json ze skilla klocki-ceny-empik).
//
// Do 16.09.2026 reguły importu żyły wyłącznie w pamięci trwałej sesji Łowcy
// (commit f9b0cef: „415 gadżetów, 54 sanity, 10 konfliktów") — nie było ich ani
// w prompcie, ani w żadnym skrypcie, więc odtworzenie sesji zgubiłoby je bez
// śladu. Tu są spisane i wykonywane deterministycznie.
//
// Reguły (RUNBOOK „Ceny Empik"):
//   1. numer 4–7 cyfr bez zera wiodącego; numer z pola setNumber musi występować
//      w nazwie — gdy nazwa niesie INNY numer znany katalogowi, wygrywa katalog
//      (Empik potrafi wpisać w setNumber liczbę elementów albo model auta);
//   2. gadżety odpadają po rdzeniach nazwy (breloki, gablotki, uchwyty, pościel…);
//   3. próg sanity: cena poniżej 40% ceny katalogowej = zaślepka albo podszywka;
//   4. do danych wchodzą tylko zestawy, które mają hub (katalog.json / sety.json);
//   5. z kilku pozycji tego samego numeru zostaje najtańsza;
//   6. świeżość nadrzędna: zestaw nieobecny w zrzucie traci cenę Empiku;
//   7. `daty.empik` = data zrzutu (meta.scrapedAt), nie dzień importu.
// Zapis: oferty_feed.json (klucz empik + daty.empik, pola cena/sklep przeliczone),
// sety.json (oferta empik, kolejność alfabetyczna po sklepie), ceny_baza.json
// (nowe minimum). Wszystko przez json-kolejnosc.mjs — format plików bez zmian.
// Linki robi osobno: node scripts/empik-redirects.mjs <plik> --usun-martwe
//
// Użycie:
//   node scripts/empik-import.mjs lego-empik.json --sucho     # raport, bez zapisu
//   node scripts/empik-import.mjs lego-empik.json [--data RRRR-MM-DD]

import { readFileSync, writeFileSync } from 'node:fs';
import { parsujZKolejnoscia, kluczeObiektu, stringifyMapa, wykryjWciecie, zapiszFeed, zapiszSety } from './json-kolejnosc.mjs';

const args = process.argv.slice(2);
const sucho = args.includes('--sucho');
const plik = args.find((a) => !a.startsWith('--'));
const dataArg = args.includes('--data') ? args[args.indexOf('--data') + 1] : null;
if (!plik) { console.error('Użycie: node scripts/empik-import.mjs <lego-empik.json> [--sucho] [--data RRRR-MM-DD]'); process.exit(1); }

export const PROG_SANITY = 0.4;
export const GADZETY = /minifig|figurka\s+lego|instrukcj|pude[lł]k|naklejk|brelo|gablot|uchwyt|mocowan|lampk|latark|plecak|pi[oó]rnik|po[sś]ciel|kubek|zegar|ksi[aą][zż]k|magnes|d[lł]ugopis|notes|zeszyt|skarbonk|o[sś]wietleni|\bled\b|stojak|ramk[aiu]|poduszk|r[eę]cznik|portfel|czapk|puzzle|koszulk|torb|torebk|etui|worek|pisak|kalendarz\s+(?:szkolny|ścienny|biurkowy)|luzem|na\s+wag[eę]|cz[eę][sś]ci\s+lego|zestaw\s+cz[eę][sś]ci/i;
const NUMER = /^[1-9]\d{3,6}$/;
const numeryZNazwy = (nazwa) => [...String(nazwa ?? '').matchAll(/(?<!\d)([1-9]\d{3,6})(?!\d)/g)].map((m) => m[1]);

// ── dane repo ────────────────────────────────────────────────────────────────
const czytaj = (p) => readFileSync(p, 'utf8');
const feedTekst = czytaj('src/data/oferty_feed.json');
const setyTekst = czytaj('src/data/sety.json');
const cenyTekst = czytaj('src/data/ceny_baza.json');
const feed = JSON.parse(feedTekst);
const sety = mapaNaObiekt(parsujZKolejnoscia(setyTekst));
const cenyBaza = mapaNaObiekt(parsujZKolejnoscia(cenyTekst));
const katalog = JSON.parse(czytaj('src/data/katalog.json'));
const rrpPotwierdzone = JSON.parse(czytaj('src/data/rrp_potwierdzone.json'));
function mapaNaObiekt(w) {
  if (w instanceof Map) { const o = {}; for (const [k, v] of w) o[k] = mapaNaObiekt(v); return o; }
  if (Array.isArray(w)) return w.map(mapaNaObiekt);
  return w;
}
const wKatalogu = new Map();
for (const [seria, lista] of Object.entries(katalog)) if (seria !== '_meta' && Array.isArray(lista)) for (const z of lista) wKatalogu.set(String(z.numer), z);
const maHub = (nr) => wKatalogu.has(nr) || nr in sety;
const rrp = (nr) => rrpPotwierdzone[nr]?.cena ?? sety[nr]?.cena_katalogowa ?? cenyBaza[nr]?.cena_katalogowa ?? wKatalogu.get(nr)?.cena_katalogowa ?? null;

// ── zrzut ────────────────────────────────────────────────────────────────────
const zrzut = JSON.parse(czytaj(plik));
const produkty = zrzut.products ?? zrzut;
const dataZrzutu = dataArg ?? String(zrzut.meta?.scrapedAt ?? '').slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(dataZrzutu)) { console.error('Brak daty zrzutu (meta.scrapedAt) — podaj --data RRRR-MM-DD'); process.exit(1); }
if (!Array.isArray(produkty) || produkty.length < 500) { console.error(`Zrzut ma ${produkty?.length ?? 0} pozycji — za mało, żeby wierzyć (oczekiwane ~5 000). Nie importuję.`); process.exit(1); }

const odrzucone = { numer: [], konflikt: [], gadzet: [], sanity: [], spoza: [], cena: [] };
const ceny = new Map(); // nr -> {cena, nazwa}
for (const p of produkty) {
  const nazwa = String(p.name ?? '');
  let nr = String(p.setNumber ?? '').trim();
  const cena = Number(p.price);
  if (!(cena > 0)) { odrzucone.cena.push(`${nr} ${nazwa}`); continue; }
  const zNazwy = numeryZNazwy(nazwa);
  if (!NUMER.test(nr)) {
    const kandydat = zNazwy.find((n) => wKatalogu.has(n));
    if (!kandydat) { odrzucone.numer.push(`${nr || '—'} ${nazwa}`); continue; }
    nr = kandydat;
  } else if (!maHub(nr)) {
    // setNumber nieznany katalogowi (liczba elementów „1016el", model auta „M 1000"):
    // gdy nazwa niesie dokładnie jeden numer znany katalogowi — to jest zestaw
    const znane = zNazwy.filter((n) => n !== nr && maHub(n));
    if (znane.length === 1) nr = znane[0];
    else if (znane.length > 1) { odrzucone.konflikt.push(`${nr} vs nazwa [${zNazwy.join(',')}] ${nazwa}`); continue; }
  } else if (zNazwy.length && !zNazwy.includes(nr)) {
    // setNumber znany, ale nazwa mówi o innym numerze — nie zgadujemy
    odrzucone.konflikt.push(`${nr} vs nazwa [${zNazwy.join(',')}] ${nazwa}`); continue;
  }
  if (GADZETY.test(nazwa)) { odrzucone.gadzet.push(`${nr} ${nazwa} (${cena} zł)`); continue; }
  if (!maHub(nr)) { odrzucone.spoza.push(`${nr} ${nazwa}`); continue; }
  const kat = rrp(nr);
  if (kat && cena < PROG_SANITY * kat) { odrzucone.sanity.push(`${nr} ${nazwa}: ${cena} zł przy katalogowej ${kat}`); continue; }
  const stara = ceny.get(nr);
  if (!stara || cena < stara.cena) ceny.set(nr, { cena, nazwa });
}

// ── zmiany ───────────────────────────────────────────────────────────────────
const s = feed.sety;
let nowe = 0, zmiany = 0, bezZmian = 0, usuniete = 0;
const przeliczMin = (w) => {
  const wpisy = Object.entries(w.oferty ?? {}).filter(([, c]) => typeof c === 'number' && c > 0);
  if (!wpisy.length) { delete w.cena; delete w.sklep; return; }
  const [sklep, cena] = wpisy.reduce((a, b) => (b[1] < a[1] ? b : a));
  w.cena = cena; w.sklep = sklep;
};
for (const [nr, { cena }] of ceny) {
  const w = (s[nr] ??= {});
  w.oferty ??= {};
  if (w.oferty.empik === undefined) nowe++; else if (Math.abs(w.oferty.empik - cena) > 0.001) zmiany++; else bezZmian++;
  w.oferty.empik = cena;
  (w.daty ??= {}).empik = dataZrzutu;
  przeliczMin(w);
}
for (const [nr, w] of Object.entries(s)) {
  if (w?.oferty?.empik !== undefined && !ceny.has(nr)) { delete w.oferty.empik; if (w.daty) delete w.daty.empik; przeliczMin(w); usuniete++; }
}
feed._meta.empik_zrzut = dataZrzutu;

let setyZmienione = 0, setyUsuniete = 0;
for (const [nr, z] of Object.entries(sety)) {
  if (!Array.isArray(z.oferty)) continue;
  const nowa = ceny.get(nr);
  const bez = z.oferty.filter((o) => o.sklep !== 'empik');
  if (nowa) {
    const stara = z.oferty.find((o) => o.sklep === 'empik');
    if (!stara || stara.cena !== nowa.cena || stara.data !== dataZrzutu) setyZmienione++;
    z.oferty = [...bez, { sklep: 'empik', cena: nowa.cena, data: dataZrzutu }].sort((a, b) => String(a.sklep).localeCompare(String(b.sklep), 'pl'));
  } else if (bez.length !== z.oferty.length) { z.oferty = bez; setyUsuniete++; }
}

const noweMinima = [];
for (const [nr, { cena }] of ceny) {
  const b = cenyBaza[nr];
  if (!b || typeof b !== 'object' || nr === '_meta') continue;
  if (b.najnizsza_cena == null || cena < b.najnizsza_cena) { b.najnizsza_cena = cena; b.najnizsza_data = dataZrzutu; b.najnizsza_sklep = 'empik'; noweMinima.push(`${nr} ${cena}`); }
}

// ── raport ───────────────────────────────────────────────────────────────────
console.log(`Zrzut Empiku z ${dataZrzutu}: ${produkty.length} pozycji → ${ceny.size} cen po filtrach.`);
console.log(`Odrzucone: gadżety ${odrzucone.gadzet.length}, sanity (<${PROG_SANITY * 100}% RRP) ${odrzucone.sanity.length}, konflikt numeru ${odrzucone.konflikt.length}, zły numer ${odrzucone.numer.length}, spoza katalogu ${odrzucone.spoza.length}, bez ceny ${odrzucone.cena.length}.`);
console.log(`oferty_feed: nowe ${nowe}, zmiany ${zmiany}, bez zmian ${bezZmian}, usunięte (brak w zrzucie) ${usuniete}; sety.json: ${setyZmienione} ofert empik zapisanych, ${setyUsuniete} usuniętych; ceny_baza: ${noweMinima.length} nowych minimów.`);
for (const [k, lista] of Object.entries(odrzucone)) if (lista.length) { console.log(`\n${k} (${lista.length}, pierwsze 15):`); for (const x of lista.slice(0, 15)) console.log('  ' + x); }
if (noweMinima.length) console.log('\nnowe minima: ' + noweMinima.slice(0, 20).join(', ') + (noweMinima.length > 20 ? ' …' : ''));
if (sucho) { console.log('\n--sucho: nic nie zapisano.'); process.exit(0); }

// ── zapis + walidacja ────────────────────────────────────────────────────────
const przedFeed = Object.keys(JSON.parse(feedTekst).sety).length;
const przedSety = kluczeObiektu(setyTekst).length;
zapiszFeed('src/data/oferty_feed.json', feed, feedTekst);
zapiszSety('src/data/sety.json', sety, setyTekst);
writeFileSync('src/data/ceny_baza.json', stringifyMapa(cenyBaza, kluczeObiektu(cenyTekst), wykryjWciecie(cenyTekst) || 1) + (cenyTekst.endsWith('\n') ? '\n' : ''));
const poFeed = Object.keys(JSON.parse(czytaj('src/data/oferty_feed.json')).sety).length;
const poSety = Object.keys(JSON.parse(czytaj('src/data/sety.json'))).length;
JSON.parse(czytaj('src/data/ceny_baza.json'));
if (poFeed < przedFeed || poSety < przedSety) { console.error(`Liczba wpisów zmalała (feed ${przedFeed}→${poFeed}, sety ${przedSety}→${poSety}) — cofnij zmiany!`); process.exit(1); }
console.log(`\nZapisano: feed ${przedFeed}→${poFeed} wpisów, sety ${poSety}. Teraz: node scripts/empik-redirects.mjs ${plik} --usun-martwe`);
