#!/usr/bin/env node
// Odświeżenie cen Smyka wprost ze stron produktów (bez Firecrawla, 0 kredytów).
//
// Po co (decyzja Marka 16.09.2026: „nie możemy mieć aktualnych?"): Adtraction NIE
// daje feedu produktowego dla Smyka (API: `"feed": false` przy programie Smyk PL),
// więc ceny stały od jednorazowego zrzutu z 29.08. Okazało się jednak, że
// smyk.com odpowiada zwykłemu zapytaniu z kontenera (200, ~0,5 MB, 1,7 s), a karta
// produktu niesie cenę i dostępność w danych strukturalnych schema.org:
//   <meta itemProp="price" content="1179"/>  + <link itemProp="availability" .../InStock>
// Adresy 704 kart mamy w `redirects.smyk` (zrzut 29.08 z `--link produkt`).
//
// Co zapisuje:
// - oferty_feed.json: `sety[nr].oferty.smyk` + `daty.smyk` (dzień odczytu);
//   zestaw niedostępny traci cenę Smyka (jak u Łowcy jego trzy sklepy), wpis zostaje;
// - sety.json: oferta {sklep:'smyk', cena, data}, kolejność alfabetyczna po sklepie.
// Nie rusza kluczy innych sklepów ani `redirects` — adresy kart są append-only.
//
// Użycie:
//   node scripts/smyk-odswiez.mjs --limit 12 --sucho   # próbka, bez zapisu
//   node scripts/smyk-odswiez.mjs                      # pełne odświeżenie (~4 min)

import { readFileSync, writeFileSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { zapiszFeed, zapiszSety } from './json-kolejnosc.mjs';

const wykonaj = promisify(execFile);
const P = (n) => `src/data/${n}`;
const arg = process.argv.slice(2);
const sucho = arg.includes('--sucho');
const limit = Number(arg[arg.indexOf('--limit') + 1]) || 0;
const ROWNOLEGLE = 6;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36';
const dzis = new Date().toISOString().slice(0, 10);

const redirects = JSON.parse(readFileSync(P('redirects.json'), 'utf8'));
const adresy = Object.entries(redirects.smyk ?? {}).filter(([nr, u]) => /^\d{4,7}$/.test(nr) && /^https?:/.test(u));
// --stare: tylko zestawy, których ceny nie odświeżyliśmy dzisiaj (domykanie
// błędów sieci z pierwszego przebiegu, bez ponownego pobierania 700 stron)
const feedPodglad = JSON.parse(readFileSync(P('oferty_feed.json'), 'utf8')).sety;
const tylkoStare = arg.includes('--stare');
const wybrane = tylkoStare
  ? adresy.filter(([nr]) => (feedPodglad[nr]?.daty ?? {}).smyk !== new Date().toISOString().slice(0, 10))
  : adresy;
const lista = limit ? wybrane.slice(0, limit) : wybrane;
console.log(`Kart Smyka do odczytu: ${lista.length}${lista.length !== adresy.length ? ` (z ${adresy.length})` : ''}${tylkoStare ? ' — tryb --stare' : ''}`);
if (!lista.length) { console.error('Brak adresów w redirects.smyk — najpierw zrzut katalogu.'); process.exit(2); }

/** Cena z karty: itemProp="price" (liczba całkowita) + grosze z widocznej ceny. */
function zeStrony(html) {
  const dostepny = /schema\.org\/InStock/.test(html);
  const meta = /itemProp="price"\s+content="([\d.]+)"/.exec(html)?.[1];
  const widoczna = /price__new[^>]*>\s*([\d\s ]+,\d{2})/.exec(html)?.[1];
  const cena = widoczna
    ? Number(widoczna.replace(/[\s ]/g, '').replace(',', '.'))
    : meta ? Number(meta) : null;
  return { cena: cena > 0 ? cena : null, dostepny };
}

const pobierz = async (url) => {
  // sieć bywa kapryśna przy kilku równoległych połączeniach — jedno ponowienie
  // po sekundzie załatwia większość błędów „Recv failure / connection reset"
  for (let proba = 1; ; proba++) {
    try {
      const { stdout } = await wykonaj('curl', ['-sSL', '--max-time', '30', '--retry', '1', '--retry-delay', '1', '-A', UA, url], { maxBuffer: 8 * 1024 * 1024 });
      return stdout;
    } catch (e) {
      if (proba >= 2) throw e;
      await new Promise((r) => setTimeout(r, 1200));
    }
  }
};

async function partiami(el, fn, ile) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: Math.min(ile, el.length) }, async () => {
    while (i < el.length) out.push(await fn(el[i++]));
  }));
  return out;
}

const wyniki = await partiami(lista, async ([nr, url]) => {
  try {
    const { cena, dostepny } = zeStrony(await pobierz(url));
    // Karta zestawu wyprzedanego nie pokazuje ceny w ogóle (OutOfStock, przykład
    // 10333 Barad-dûr) — to nie błąd odczytu, tylko brak oferty.
    if (!dostepny) return { nr, stan: 'niedostępny' };
    if (!cena) return { nr, stan: 'bez ceny mimo InStock' };
    return { nr, cena, stan: 'ok' };
  } catch (e) {
    return { nr, stan: `błąd: ${String(e.message).slice(0, 60)}` };
  }
}, ROWNOLEGLE);

const ok = wyniki.filter((w) => w.stan === 'ok');
const niedostepne = wyniki.filter((w) => w.stan === 'niedostępny');
const bledy = wyniki.filter((w) => w.stan !== 'ok' && w.stan !== 'niedostępny');
console.log(`Odczytane: ${ok.length} z ceną, ${niedostepne.length} niedostępnych, ${bledy.length} błędów.`);
for (const b of bledy.slice(0, 8)) console.log(`  ${b.nr}: ${b.stan}`);

const feedTekst = readFileSync(P('oferty_feed.json'), 'utf8');
const feed = JSON.parse(feedTekst);
const setyTekst = readFileSync(P('sety.json'), 'utf8');
const sety = JSON.parse(setyTekst);
const przedFeed = Object.keys(feed.sety).length;
const przedSety = Object.keys(sety).length;

let zmianyFeed = 0, zmianySety = 0, usuniete = 0;
for (const { nr, cena, stan } of wyniki) {
  const w = feed.sety[nr];
  if (!w) continue;
  if (stan === 'ok') {
    if ((w.oferty ??= {}).smyk !== cena) zmianyFeed++;
    w.oferty.smyk = cena;
    (w.daty ??= {}).smyk = dzis;
    const s = sety[nr];
    if (s) {
      s.oferty ??= [];
      const i = s.oferty.findIndex((o) => o.sklep === 'smyk');
      const oferta = { sklep: 'smyk', cena, data: dzis };
      if (i >= 0) { if (s.oferty[i].cena !== cena || s.oferty[i].data !== dzis) zmianySety++; s.oferty[i] = oferta; }
      else { s.oferty.push(oferta); zmianySety++; }
      s.oferty.sort((a, b) => String(a.sklep).localeCompare(String(b.sklep), 'pl'));
    }
  } else if (stan === 'niedostępny') {
    if (w.oferty?.smyk !== undefined) { delete w.oferty.smyk; delete w.daty?.smyk; usuniete++; }
    const s = sety[nr];
    if (s?.oferty) s.oferty = s.oferty.filter((o) => o.sklep !== 'smyk');
  }
  // błąd sieci nie kasuje wczorajszej ceny — zostaje ze swoją starą datą
}
console.log(`Zmiany: feed ${zmianyFeed}, sety ${zmianySety}, zdjęte oferty (brak w sprzedaży) ${usuniete}.`);
if (sucho) { console.log('Tryb --sucho: nic nie zapisano.'); process.exit(0); }

feed._meta.smyk_pobrano = dzis;
zapiszFeed(P('oferty_feed.json'), feed, feedTekst);
zapiszSety(P('sety.json'), sety, setyTekst);
const poFeed = Object.keys(JSON.parse(readFileSync(P('oferty_feed.json'), 'utf8')).sety).length;
const poSety = Object.keys(JSON.parse(readFileSync(P('sety.json'), 'utf8'))).length;
if (poFeed < przedFeed || poSety < przedSety) throw new Error(`walidacja: ubyło wpisów (feed ${przedFeed}→${poFeed}, sety ${przedSety}→${poSety})`);
console.log(`Zapisano. feed ${poFeed}, sety ${poSety}, data odczytu ${dzis}.`);
