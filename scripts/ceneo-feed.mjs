#!/usr/bin/env node
// Ceneo (Tradedoubler, program CPS 385881) — feed Ceneo_LEGO fid=256472.
//
// Ceneo jest porównywarką, nie sklepem: cena z feedu to najniższa oferta
// rynkowa, a klient po kliknięciu trafia na kartę produktu w Ceneo i stamtąd
// do sklepu. Dlatego w tabelach cen wiersz Ceneo stoi ZAWSZE NA KOŃCU i nie
// bierze udziału w sortowaniu ani w wyliczaniu "najniższej ceny" na listach
// (patrz TabelaCen.astro i lib/oferty.js).
//
// Zapisuje:
//   src/data/redirects.json  -> ceneo: { <nr>: <gotowy link trackingowy> }
//   src/data/oferty_feed.json-> sety[<nr>].oferty.ceneo = <cena>
// Oba pliki są append-only — skrypt tylko dopisuje i aktualizuje ceny.
//
// Wymaga TD_TOKEN w środowisku. Użycie: node scripts/ceneo-feed.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const FID = 256472;
const TOKEN = process.env.TD_TOKEN;
if (!TOKEN) {
  console.error('Brak TD_TOKEN w środowisku.');
  process.exit(1);
}

const URL_FEED = `https://api.tradedoubler.com/1.0/productsUnlimited.json;fid=${FID}?token=${TOKEN}`;

// Pełny feed generuje się po stronie TD: pierwsze wywołanie zwraca 202,
// kolejne (po chwili) 200 z plikiem. Czekamy do skutku, maks. ~5 minut.
// Pobieramy curl-em, bo wyjście sieciowe środowiska idzie przez proxy,
// z którego natywny fetch Node'a nie korzysta.
async function pobierzFeed() {
  for (let proba = 1; proba <= 15; proba++) {
    const wynik = execFileSync('curl', ['-sL', '--max-time', '300', '-w', '\n%{http_code}', URL_FEED], {
      encoding: 'utf8',
      maxBuffer: 512 * 1024 * 1024,
    });
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

const dane = await pobierzFeed();
const produkty = dane.products ?? [];
console.log(`Pobrano ${produkty.length} produktów z feedu Ceneo_LEGO.`);

// numer setu z nazwy: "LEGO <seria> <numer> <tytuł>"
const NUMER = /\b(\d{4,7})\b/;
const zebrane = new Map(); // nr -> { cena, link }
for (const p of produkty) {
  const nr = NUMER.exec(p.name ?? '')?.[1];
  if (!nr) continue;
  const oferta = p.offers?.[0];
  const cena = Number(oferta?.priceHistory?.at(-1)?.price?.value);
  const link = oferta?.productUrl;
  if (!nr || !link || !(cena > 0)) continue;
  const stara = zebrane.get(nr);
  if (!stara || cena < stara.cena) zebrane.set(nr, { cena, link });
}
console.log(`Rozpoznano ${zebrane.size} numerów zestawów.`);

const dzis = new Date().toISOString().slice(0, 10);

// --- redirects.json ---
const sciezkaRedirects = 'src/data/redirects.json';
const redirects = JSON.parse(readFileSync(sciezkaRedirects, 'utf8'));
const przedR = Object.keys(redirects.ceneo ?? {}).length;
redirects.ceneo = { ...(redirects.ceneo ?? {}) };
for (const [nr, { link }] of zebrane) redirects.ceneo[nr] = link;
const poR = Object.keys(redirects.ceneo).length;
if (poR < przedR) throw new Error('Liczba linków Ceneo zmalała — przerywam (append-only).');
writeFileSync(sciezkaRedirects, JSON.stringify(redirects, null, 2) + '\n');

// --- oferty_feed.json ---
const sciezkaOfert = 'src/data/oferty_feed.json';
const oferty = JSON.parse(readFileSync(sciezkaOfert, 'utf8'));
const przedO = Object.keys(oferty.sety).length;
for (const [nr, { cena }] of zebrane) {
  const wpis = (oferty.sety[nr] ??= { oferty: {}, data: dzis });
  wpis.oferty = { ...(wpis.oferty ?? {}), ceneo: cena };
  wpis.data = dzis;
}
const poO = Object.keys(oferty.sety).length;
if (poO < przedO) throw new Error('Liczba setów w oferty_feed zmalała — przerywam (append-only).');
oferty._meta = { ...(oferty._meta ?? {}), ceneo_pobrano: dzis };
writeFileSync(sciezkaOfert, JSON.stringify(oferty, null, 2) + '\n');

console.log(`Linki Ceneo: ${przedR} → ${poR}. Sety w oferty_feed: ${przedO} → ${poO}.`);
