#!/usr/bin/env node
// Ceny i dostępność z lego.pl → dane serwisu. Wejściem jest katalog z
// scripts/firecrawl-legopl.mjs ({ meta, products }); ten skrypt nic nie pobiera.
//
// Po co (15.09.2026, decyzja Marka: „LEGO sprawdzamy co najmniej raz w tygodniu"):
// oferty LEGO.com w sety.json miały datę 16.08 (jednorazowy zrzut), a katalog
// nie wiedział, które zestawy są w dystrybucji wyłącznie LEGO. Listing lego.pl
// ma cenę, cenę przed obniżką, etykiety („Ekskluzywne", „Ostatnie zestawy",
// „Przedsprzedaż", „Wkrótce dostępne") i adres karty produktu.
//
// Co zapisuje (wszystko append/replace, nic nie kasuje):
// - oferty_feed.json: `sety[nr].oferty.lego = cena` + `daty.lego` (data zaciągu) — tabela
//   cen huba bierze oferty z feedu, więc LEGO.com dostaje świeżą cenę dla
//   każdego zestawu z listingu, także spoza sety.json;
// - sety.json: oferta {sklep:'lego', cena, data} zastępuje starą; pole
//   `ekskluzyw` = true/false z etykiety „Ekskluzywne";
// - katalog.json: status 'dostepny' dla zestawów z listingu (plus
//   `lego_pl_widziano: <data>` i `ekskluzyw`); zestawy „dostepny", których
//   listing NIE pokazał, dostają tylko brak nowej daty — statusu nie zmieniamy
//   automatycznie (listing bywa niepełny), decyduje audyt / runner Wycofań.
// Ceny katalogowe (RRP) idą osobną ścieżką: wczytaj-rrp.mjs (rejestr write-once).
// Linki do kart produktu: lego-redirects.mjs.
//
// Użycie:
//   node scripts/lego-ceny.mjs katalog-legopl.json --sucho
//   node scripts/lego-ceny.mjs katalog-legopl.json

import { readFileSync, writeFileSync } from 'node:fs';

const arg = process.argv.slice(2);
const plik = arg.find((a) => !a.startsWith('--'));
const sucho = arg.includes('--sucho');
if (!plik) {
  console.error('Użycie: node scripts/lego-ceny.mjs <katalog-legopl.json> [--sucho]');
  process.exit(2);
}
const katalogLego = JSON.parse(readFileSync(plik, 'utf8'));
const produkty = (katalogLego.products ?? []).filter((p) => /^\d{4,7}$/.test(String(p.setNumber ?? '')) && p.price > 0);
const dzis = new Date().toISOString().slice(0, 10);
// zaciąg starszy niż tydzień nie ma prawa nadpisać świeższych danych
const dataZaciagu = katalogLego.meta?.scrapedAt ?? dzis;
if (dataZaciagu < new Date(Date.now() - 8 * 864e5).toISOString().slice(0, 10)) {
  console.error(`Katalog z ${dataZaciagu} jest starszy niż tydzień — nie wczytuję.`);
  process.exit(2);
}

const P = (n) => `src/data/${n}`;
const feedTekst = readFileSync(P('oferty_feed.json'), 'utf8');
const setyTekst = readFileSync(P('sety.json'), 'utf8');
const feed = JSON.parse(feedTekst);
const sety = JSON.parse(setyTekst);

// Klucze numeryczne („21372") JSON.stringify wypisuje posortowane rosnąco — a
// sety.json i mapa feed.sety są w kolejności wpisów (pisze je Python, który ją
// zachowuje). Bez tego jeden przebieg przepisywał cały plik (37 tys. linii diffu).
// Dlatego kolejność kluczy bierzemy z oryginalnego tekstu (własny mini-parser
// zwracający obiekty jako Map), a nowe wpisy dopisujemy na końcu.
function parsujZKolejnoscia(tekst) {
  let i = 0;
  const bialy = () => { while (i < tekst.length && ' \t\n\r'.includes(tekst[i])) i++; };
  const napis = () => {
    const p = i; i++;
    while (i < tekst.length) { if (tekst[i] === '\\') i += 2; else if (tekst[i] === '"') break; else i++; }
    i++;
    return JSON.parse(tekst.slice(p, i));
  };
  const wartosc = () => {
    bialy();
    const c = tekst[i];
    if (c === '{') {
      i++; const m = new Map(); bialy();
      if (tekst[i] === '}') { i++; return m; }
      for (;;) { bialy(); const k = napis(); bialy(); i++; m.set(k, wartosc()); bialy(); if (tekst[i] === ',') { i++; continue; } i++; return m; }
    }
    if (c === '[') {
      i++; const a = []; bialy();
      if (tekst[i] === ']') { i++; return a; }
      for (;;) { a.push(wartosc()); bialy(); if (tekst[i] === ',') { i++; continue; } i++; return a; }
    }
    if (c === '"') return napis();
    const p = i; while (i < tekst.length && !',}] \t\n\r'.includes(tekst[i])) i++;
    return JSON.parse(tekst.slice(p, i));
  };
  return wartosc();
}
const kluczeObiektu = (tekst, sciezka = []) => {
  let w = parsujZKolejnoscia(tekst);
  for (const k of sciezka) w = w?.get(k);
  return w instanceof Map ? [...w.keys()] : [];
};
// JSON.stringify i tak posortuje klucze numeryczne — serializujemy mapę ręcznie
function stringifyMapa(obiekt, klucze, wciecie) {
  const kolejnosc = [...klucze.filter((k) => k in obiekt), ...Object.keys(obiekt).filter((k) => !klucze.includes(k))];
  if (!wciecie) return '{' + kolejnosc.map((k) => JSON.stringify(k) + ':' + JSON.stringify(obiekt[k])).join(',') + '}';
  const pad = ' '.repeat(wciecie);
  return '{\n' + kolejnosc.map((k) => pad + JSON.stringify(k) + ': ' + JSON.stringify(obiekt[k], null, wciecie).replace(/\n/g, '\n' + pad)).join(',\n') + '\n}';
}
const katalog = JSON.parse(readFileSync(P('katalog.json'), 'utf8'));
const liczbaSetow = Object.keys(sety).length;
const liczbaFeed = Object.keys(feed.sety ?? {}).length;
const liczbaKatalog = Object.values(katalog).filter(Array.isArray).reduce((n, l) => n + l.length, 0);

const etykiety = (p) => (p.labels ?? [p.status]).filter(Boolean).map((e) => e.toLowerCase());
const ekskluzywny = (p) => etykiety(p).some((e) => e.includes('ekskluzyw'));
const wKatalogu = new Map();
for (const [seria, lista] of Object.entries(katalog)) {
  if (seria === '_meta' || !Array.isArray(lista)) continue;
  for (const s of lista) wKatalogu.set(String(s.numer), s);
}

let feedZmiany = 0, setyZmiany = 0, katalogZmiany = 0, ekskl = 0, nowyDostepny = 0, spozaKatalogu = [], rozbieznosci = [];
for (const p of produkty) {
  const nr = String(p.setNumber);
  const cena = Number(p.price);
  const eks = ekskluzywny(p);
  // Numer, którego nie zna ani katalog, ani sety.json, nie dostaje wpisu w feedzie:
  // to głównie akcesoria i merch (numery 5xxxxxx), a bez nazwy i serii nie ma
  // z czego zrobić huba. Zestawy z tej listy dopisuje Scout / katalog-z-rebrickable.
  const k = wKatalogu.get(nr);
  const s = sety[nr];
  if (!k && !s) { spozaKatalogu.push(nr); continue; }
  if (eks) ekskl++;

  // oferty_feed — LEGO.com jako sklep „lego"
  feed.sety ??= {};
  const w = (feed.sety[nr] ??= {});
  w.oferty ??= {};
  if (w.oferty.lego !== cena) feedZmiany++;
  w.oferty.lego = cena;
  (w.daty ??= {}).lego = dataZaciagu;   // data per sklep — czyta ją ofertyZFeedu()
  if (!w.data) w.data = dataZaciagu;
  // zgodność wstecz: pola cena/sklep = najniższa z mapy
  const [sklepMin, cenaMin] = Object.entries(w.oferty).filter(([, c]) => c > 0).sort((a, b) => a[1] - b[1])[0] ?? [];
  if (cenaMin) { w.cena = cenaMin; w.sklep = sklepMin; }

  // sety.json — oferta lego + flaga ekskluzywu
  if (s) {
    s.oferty ??= [];
    const i = s.oferty.findIndex((o) => o.sklep === 'lego');
    const oferta = { sklep: 'lego', cena, data: dataZaciagu };
    if (i >= 0) { if (s.oferty[i].cena !== cena || s.oferty[i].data !== dataZaciagu) setyZmiany++; s.oferty[i] = oferta; }
    else { s.oferty.push(oferta); setyZmiany++; }
    // flaga w sety.json bywa ręczna (z karty produktu); listing potrafi zgubić
    // etykietę, więc podnosimy ją do true, ale nie zdejmujemy automatycznie —
    // rozbieżności idą do raportu, decyduje człowiek
    if (eks && !s.ekskluzyw) { s.ekskluzyw = true; setyZmiany++; }
    else if (!eks && s.ekskluzyw) rozbieznosci.push(nr);
  }

  // katalog — status i ślad obecności na lego.pl
  if (k) {
    if (k.status !== 'dostepny') { k.status = 'dostepny'; nowyDostepny++; katalogZmiany++; }
    if (Boolean(k.ekskluzyw) !== eks) { k.ekskluzyw = eks; katalogZmiany++; }
    if (k.lego_pl_widziano !== dataZaciagu) { k.lego_pl_widziano = dataZaciagu; katalogZmiany++; }
  }
}

console.log(`Produkty z listingu: ${produkty.length}, znane serwisowi: ${produkty.length - spozaKatalogu.length} (ekskluzywne: ${ekskl}). Zmiany: feed ${feedZmiany}, sety ${setyZmiany}, katalog ${katalogZmiany} (nowo „dostepny": ${nowyDostepny}). Spoza katalogu: ${spozaKatalogu.length}${spozaKatalogu.length ? ' — ' + spozaKatalogu.slice(0, 15).join(' ') + (spozaKatalogu.length > 15 ? '…' : '') : ''}`);
if (spozaKatalogu.length) console.log('  Spoza katalogu i sety.json: pominięte (bez nazwy i serii nie ma huba). Zestawy stąd dopisze Scout (nowości) albo katalog-z-rebrickable.mjs; numery 5xxxxxx to akcesoria/merch.');
if (rozbieznosci.length) console.log(`  Ekskluzyw wg sety.json, ale bez etykiety na listingu (flaga zostaje, do sprawdzenia ręcznie): ${rozbieznosci.join(' ')}`);
if (sucho) { console.log('Tryb --sucho: nic nie zapisano.'); process.exit(0); }

feed._meta = feed._meta ?? {};
feed._meta.lego_pl = `${dataZaciagu}: ceny LEGO.com z listingu lego.pl (scripts/lego-ceny.mjs, klucz oferty.lego + daty.lego). Odświeżane co tydzień.`;
katalog._meta = katalog._meta ?? {};
katalog._meta.lego_pl = `${dataZaciagu}: status dostepny + ekskluzyw + lego_pl_widziano z listingu lego.pl (scripts/lego-ceny.mjs).`;
// oferty_feed.json pisze feedy-lego.py w jednej linii; sety.json ma wcięcie 1 spacji
const kluczeFeed = kluczeObiektu(feedTekst, ['sety']);
const feedBezSetow = Object.fromEntries(Object.entries(feed).filter(([k]) => k !== 'sety'));
const feedJson = '{' + Object.entries(feedBezSetow).map(([k, v]) => JSON.stringify(k) + ':' + JSON.stringify(v)).join(',') + (Object.keys(feedBezSetow).length ? ',' : '') + '"sety":' + stringifyMapa(feed.sety, kluczeFeed, 0) + '}';
writeFileSync(P('oferty_feed.json'), feedJson + (feedTekst.endsWith('\n') ? '\n' : ''));
writeFileSync(P('sety.json'), stringifyMapa(sety, kluczeObiektu(setyTekst), 1) + (setyTekst.endsWith('\n') ? '\n' : ''));
writeFileSync(P('katalog.json'), JSON.stringify(katalog, null, 1) + '\n');
// walidacja append-only
const po = {
  sety: Object.keys(JSON.parse(readFileSync(P('sety.json'), 'utf8'))).length,
  feed: Object.keys(JSON.parse(readFileSync(P('oferty_feed.json'), 'utf8')).sety).length,
  katalog: Object.values(JSON.parse(readFileSync(P('katalog.json'), 'utf8'))).filter(Array.isArray).reduce((n, l) => n + l.length, 0),
};
if (po.sety < liczbaSetow || po.feed < liczbaFeed || po.katalog < liczbaKatalog) throw new Error(`walidacja: liczba wpisów zmalała ${JSON.stringify({ przed: { liczbaSetow, liczbaFeed, liczbaKatalog }, po })}`);
console.log(`Zapisano. sety ${po.sety}, feed ${po.feed}, katalog ${po.katalog}.`);
