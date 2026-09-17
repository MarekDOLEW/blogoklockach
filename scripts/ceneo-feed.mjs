#!/usr/bin/env node
// Feedy produktowe Tradedoublera (productsUnlimited) → dane serwisu.
//
// Do 17.09.2026 skrypt znał jeden feed (Ceneo_LEGO, fid 256472). Od Lidla
// (feed 259772 „LEGO klocki", zgłoszenie 17.09) każdy feed TD jest wpisem
// w src/data/feedy.json z polami `fid`, `siec: "Tradedoubler…"` i `aktywny`
// — nowy sklep to zmiana w danych, nie w promptach (zasada z _meta feedy.json).
// Bez argumentów przetwarza wszystkie aktywne feedy TD; `--sklep lidl` jeden.
//
// Zapisuje (append-only, tylko dopisuje/aktualizuje):
//   redirects.json     -> <sklep>: { <nr>: <gotowy link trackingowy pdt.tradedoubler.com> }
//   oferty_feed.json   -> sety[<nr>].oferty.<sklep> = <cena>, daty.<sklep> = dziś
//   sety.json          -> oferta {sklep, cena, data} (NIE dla Ceneo — porównywarka,
//                         nie sklep: jej wiersz stoi na końcu tabeli i nie liczy
//                         się do „najniższej ceny"; sklepy z własnym magazynem
//                         (Lidl) wchodzą do sety.json, żeby liczyły się w dealach)
//
// Wymaga TD_TOKEN. Użycie:
//   node scripts/ceneo-feed.mjs [--sklep ceneo|lidl] [--sucho]

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { parsujZKolejnoscia, zapiszFeed, zapiszSety } from './json-kolejnosc.mjs';

const args = process.argv.slice(2);
const sucho = args.includes('--sucho');
const tylko = args.includes('--sklep') ? args[args.indexOf('--sklep') + 1] : null;
const TOKEN = process.env.TD_TOKEN;
if (!TOKEN) { console.error('Brak TD_TOKEN w środowisku.'); process.exit(1); }

const feedy = JSON.parse(readFileSync('src/data/feedy.json', 'utf8'));
const doPobrania = Object.entries(feedy)
  .filter(([k, v]) => k !== '_meta' && v && typeof v === 'object' && /tradedoubler/i.test(v.siec ?? '') && v.fid)
  .filter(([k, v]) => (tylko ? k === tylko : v.aktywny !== false));
if (!doPobrania.length) { console.error(tylko ? `feedy.json: brak feedu TD dla sklepu „${tylko}"` : 'feedy.json: brak aktywnych feedów TD'); process.exit(1); }

// Pełny feed generuje się po stronie TD: pierwsze wywołanie zwraca 202,
// kolejne (po chwili) 200 z plikiem. Czekamy do skutku, maks. ~5 minut.
// Pobieramy curl-em, bo wyjście sieciowe środowiska idzie przez proxy,
// z którego natywny fetch Node'a nie korzysta.
function pobierzFeed(fid) {
  const url = `https://api.tradedoubler.com/1.0/productsUnlimited.json;fid=${fid}?token=${TOKEN}`;
  for (let proba = 1; proba <= 15; proba++) {
    const wynik = execFileSync('curl', ['-sL', '--max-time', '300', '-w', '\n%{http_code}', url], { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 });
    const granica = wynik.lastIndexOf('\n');
    const status = wynik.slice(granica + 1).trim();
    const tresc = wynik.slice(0, granica);
    if (status === '200') return JSON.parse(tresc);
    if (status !== '202') throw new Error(`TD zwrócił ${status}: ${tresc.slice(0, 200)}`);
    console.log(`  feed się generuje (próba ${proba})…`);
    execFileSync('sleep', ['20']);
  }
  throw new Error('Feed nie wygenerował się w oczekiwanym czasie.');
}

const NUMER = /\b(\d{4,7})\b/;
const dzis = new Date().toISOString().slice(0, 10);
const mapaNaObiekt = (w) => (w instanceof Map ? Object.fromEntries([...w].map(([k, v]) => [k, mapaNaObiekt(v)])) : Array.isArray(w) ? w.map(mapaNaObiekt) : w);

const sciezkaRedirects = 'src/data/redirects.json';
const sciezkaOfert = 'src/data/oferty_feed.json';
const sciezkaSety = 'src/data/sety.json';
const redirects = JSON.parse(readFileSync(sciezkaRedirects, 'utf8'));
const ofertyTekst = readFileSync(sciezkaOfert, 'utf8');
const oferty = JSON.parse(ofertyTekst);
const setyTekst = readFileSync(sciezkaSety, 'utf8');
const sety = mapaNaObiekt(parsujZKolejnoscia(setyTekst));
const przedO = Object.keys(oferty.sety).length;
let bladow = 0;

for (const [sklep, cfg] of doPobrania) {
  console.log(`\n== ${sklep} (fid ${cfg.fid})`);
  let dane;
  try { dane = pobierzFeed(cfg.fid); } catch (e) { console.error(`  ${e.message}`); bladow++; continue; }
  const produkty = dane.products ?? [];
  console.log(`  pobrano ${produkty.length} produktów`);
  const zebrane = new Map(); // nr -> { cena, link }
  for (const p of produkty) {
    const nr = NUMER.exec(p.name ?? '')?.[1];
    const oferta = p.offers?.[0];
    const cena = Number(oferta?.priceHistory?.at(-1)?.price?.value);
    const link = oferta?.productUrl;
    if (!nr || !link || !(cena > 0)) continue;
    const stara = zebrane.get(nr);
    if (!stara || cena < stara.cena) zebrane.set(nr, { cena, link });
  }
  console.log(`  rozpoznano ${zebrane.size} numerów zestawów`);
  if (!zebrane.size) { console.error('  0 zestawów — nic nie zapisuję dla tego sklepu'); bladow++; continue; }

  const przedR = Object.keys(redirects[sklep] ?? {}).length;
  const noweLinki = { ...(redirects[sklep] ?? {}) };
  for (const [nr, { link }] of zebrane) noweLinki[nr] = link;
  if (Object.keys(noweLinki).length < przedR) throw new Error(`Liczba linków ${sklep} zmalała — przerywam (append-only).`);
  let nowe = 0, zmiany = 0;
  for (const [nr, { cena }] of zebrane) {
    const wpis = (oferty.sety[nr] ??= { oferty: {}, data: dzis });
    wpis.oferty ??= {};
    if (wpis.oferty[sklep] === undefined) nowe++; else if (Math.abs(wpis.oferty[sklep] - cena) > 0.001) zmiany++;
    wpis.oferty[sklep] = cena;
    // data per sklep — wspólnej `data` nie ruszamy (audyt 15.09: cudze wiersze
    // dostawały datę tego przebiegu zamiast daty swojego zrzutu)
    (wpis.daty ??= {})[sklep] = dzis;
  }
  let wSety = 0;
  if (sklep !== 'ceneo') {
    for (const [nr, z] of Object.entries(sety)) {
      const nowa = zebrane.get(nr);
      if (!nowa || !Array.isArray(z.oferty)) continue;
      const bez = z.oferty.filter((o) => o.sklep !== sklep);
      z.oferty = [...bez, { sklep, cena: nowa.cena, data: dzis }].sort((a, b) => String(a.sklep).localeCompare(String(b.sklep), 'pl'));
      wSety++;
    }
  }
  console.log(`  linki ${przedR} → ${Object.keys(noweLinki).length}; ceny w feedzie: nowe ${nowe}, zmiany ${zmiany}${sklep !== 'ceneo' ? `; oferty w sety.json: ${wSety}` : ''}`);
  if (!sucho) {
    redirects[sklep] = noweLinki;
    oferty._meta = { ...(oferty._meta ?? {}), [`${sklep}_pobrano`]: dzis };
    feedy[sklep].ostatnie_pobranie = dzis;
  }
}

if (sucho) { console.log('\n--sucho: nic nie zapisano.'); process.exit(bladow ? 1 : 0); }
const poO = Object.keys(oferty.sety).length;
if (poO < przedO) throw new Error('Liczba setów w oferty_feed zmalała — przerywam (append-only).');
writeFileSync(sciezkaRedirects, JSON.stringify(redirects, null, 1) + '\n'); // wcięcie 1 jak reszta skryptów redirects
zapiszFeed(sciezkaOfert, oferty, ofertyTekst);
zapiszSety(sciezkaSety, sety, setyTekst);
writeFileSync('src/data/feedy.json', JSON.stringify(feedy, null, 1));
console.log(`\nZapisano. Sety w oferty_feed: ${przedO} → ${poO}.${bladow ? ` Feedów z błędem: ${bladow}.` : ''}`);
process.exit(bladow ? 1 : 0);
