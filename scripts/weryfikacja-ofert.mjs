#!/usr/bin/env node
// Sprawdzenie kart produktów przed slajderami (decyzja Marka 26.10.2026).
//
// Strona główna (slajder 5 okazji, lista 12 „Dziś w dobrej cenie”) i slajder /promocje-lego/
// biorą ofertę sklepu z cenami tygodniowymi (Empik, x-kom, Ceneo, LEGO.com, Smyk, Lidl,
// MediaMarkt) tylko wtedy, gdy ten skrypt potwierdził ją dziś albo wczoraj na karcie produktu
// (src/lib/weryfikacja.js). Media Expert, Allegro i Planeta Klocków idą bez sprawdzania —
// Łowca ma ich ceny z codziennych feedów.
//
// Kogo sprawdzamy: zestawy z sety.json, w których oferta takiego sklepu jest tańsza od
// najtańszej oferty z codziennego feedu i daje rabat ≥10% od ceny katalogowej — to są oferty,
// które slajdery by wybrały. Po kolei z czterech półek cenowych (>1500, 801–1500, 201–800,
// do 200 zł), w półce od największego rabatu, do limitu kart (domyślnie 40 = 40 kredytów).
// Oferta sprawdzona dziś z tą samą ceną nie jest pobierana drugi raz.
//
// Wynik: src/data/weryfikacja_ofert.json (klucz „<nr>|<sklep>”, wpisy się nadpisują, nie
// kasują). Gdy karta pokazuje inną cenę, skrypt poprawia ją w sety.json i oferty_feed.json
// (data = dziś) — tak jak 26.10 ręcznie przy 43303.
//
// Uruchamia: Routine „LEGO 09:17 — Weryfikacja ofert do slajderów” (sesja Code, po Łowcy). Wymaga FIRECRAWL_KEY.
// Krok w prompcie Łowcy byłby naturalniejszy, ale prompt Routine zmienia tylko jego własna sesja.
// Użycie:
//   node scripts/weryfikacja-ofert.mjs [--limit 40] [--sucho]   # --sucho: lista kandydatów bez pobierania

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { scrape } from './firecrawl.mjs';

const args = process.argv.slice(2);
const opcja = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const LIMIT = Number(opcja('limit', 40));
const SUCHO = args.includes('--sucho');

const sciezka = (p) => new URL(`../src/data/${p}`, import.meta.url);
const czytajSurowo = (p) => readFileSync(sciezka(p), 'utf8');
const czytaj = (p) => JSON.parse(czytajSurowo(p));

const CODZIENNE = new Set(['mediaexpert', 'allegro', 'planetaklockow']);
const MAX_WIEK_DNI = 14; // jak MAX_WIEK_OFERTY_DNI w src/lib/oferty.js
const MIN_RABAT = 10;
const POLKI = [(c) => c > 1500, (c) => c > 800 && c <= 1500, (c) => c > 200 && c <= 800, (c) => c <= 200];

const dzis = new Date().toISOString().slice(0, 10);
const teraz = new Date().toISOString().slice(0, 16).replace('T', ' ');
const sety = czytaj('sety.json');
const feedSurowy = czytajSurowo('oferty_feed.json');
const feed = JSON.parse(feedSurowy);
const redirects = czytaj('redirects.json');
const potwierdzone = czytaj('deale_potwierdzone.json').potwierdzone ?? {};
const wynikiPlik = czytaj('weryfikacja_ofert.json');
wynikiPlik.oferty ??= {};

// ── kandydaci ──────────────────────────────────────────────────────────────
const swieza = (o) => !o.data || (Date.parse(dzis) - Date.parse(o.data)) / 864e5 <= MAX_WIEK_DNI;
const niePodejrzana = (nr, o, rrp) => o.cena >= 0.5 * rrp || (potwierdzone[nr] && o.cena >= potwierdzone[nr].cena);

const kandydaci = [];
for (const [nr, s] of Object.entries(sety)) {
  const rrp = s.cena_katalogowa;
  if (!rrp || !Array.isArray(s.oferty)) continue;
  const oferty = s.oferty.filter((o) => o?.cena > 0 && swieza(o) && niePodejrzana(nr, o, rrp));
  const codzienna = Math.min(...oferty.filter((o) => CODZIENNE.has(o.sklep)).map((o) => o.cena), Infinity);
  for (const o of oferty) {
    if (CODZIENNE.has(o.sklep) || o.cena >= codzienna) continue;
    const rabat = Math.round((1 - o.cena / rrp) * 100);
    if (rabat < MIN_RABAT) continue;
    kandydaci.push({ nr, sklep: o.sklep, cena: o.cena, rabat, polka: POLKI.findIndex((p) => p(o.cena)) });
  }
}
const kolejki = POLKI.map((_, i) => kandydaci.filter((k) => k.polka === i).sort((a, b) => b.rabat - a.rabat));
const kolejnosc = [];
for (let i = 0; kolejki.some((k) => i < k.length); i++) for (const k of kolejki) if (k[i]) kolejnosc.push(k[i]);

// cena z aktywnego kodu w kody_rabatowe.json jest już sprawdzona na karcie przy dopisywaniu kodu
const kody = czytaj('kody_rabatowe.json');
const zKodu = (k) => (kody[k.sklep] ?? []).some((e) => Array.isArray(kody[k.sklep]) && e.do >= dzis && Math.abs((e.zestawy?.[k.nr] ?? -1) - k.cena) < 0.011);
const juzDzis = (k) => {
  if (zKodu(k)) return true;
  const w = wynikiPlik.oferty[`${k.nr}|${k.sklep}`];
  return w && w.sprawdzono === dzis && Math.abs(w.cena - k.cena) < 0.011;
};
const doSprawdzenia = kolejnosc.filter((k) => !juzDzis(k)).slice(0, LIMIT);

console.log(`Kandydaci (oferta tygodniowa tańsza od codziennej, rabat ≥${MIN_RABAT}%): ${kandydaci.length}; ` +
  `pominiętych (sprawdzone dziś albo cena z kodu): ${kolejnosc.length - kolejnosc.filter((k) => !juzDzis(k)).length}; do pobrania teraz: ${doSprawdzenia.length} (limit ${LIMIT}).`);
if (SUCHO) {
  for (const k of doSprawdzenia) console.log(`  ${k.nr} ${k.sklep} ${k.cena} zł (−${k.rabat}%)`);
  process.exit(0);
}
if (!process.env.FIRECRAWL_KEY) {
  console.error('Brak FIRECRAWL_KEY — bez sprawdzenia slajdery pokażą tylko oferty z codziennych feedów.');
  process.exit(2);
}

// ── adres karty z linku afiliacyjnego ──────────────────────────────────────
function adresKarty(link) {
  if (!link) return null;
  const td = /url\((https?%3A[^)]+)\)/.exec(link); // pdt.tradedoubler.com: …url(<zakodowany adres>)
  if (td) return decodeURIComponent(td[1]);
  try {
    const u = new URL(link);
    for (const p of ['url', 'redirect_url']) if (u.searchParams.get(p)) return u.searchParams.get(p);
    const r = u.searchParams.get('r'); // webep1.com: base64
    if (r) return Buffer.from(r, 'base64').toString('utf8');
    return link;
  } catch {
    return null;
  }
}

// ── cena i dostępność z karty ──────────────────────────────────────────────
const liczba = (t) => {
  if (t === undefined || t === null || t === '') return null;
  const n = Number(String(Array.isArray(t) ? t[0] : t).replace(/\s| /g, '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
};
const NIEDOSTEPNE = /chwilowo niedostępny|produkt niedostępny|produkt chwilowo niedostępny|brak w magazynie|wyprzedan[ya]|out of stock|temporarily out of stock/i;

function odczyt(d, oczekiwana) {
  const m = d.metadata ?? {};
  const dostepnosc = String(m['product:availability'] ?? '').toLowerCase();
  const gora = (d.markdown ?? '').slice(0, 6000);
  const niedostepne = ['false', 'out of stock', 'outofstock', 'oos'].includes(dostepnosc) || NIEDOSTEPNE.test(gora);
  let cena = liczba(m['product:sale_price:amount']) ?? liczba(m['product:price:amount']) ?? liczba(m['og:price:amount']) ?? liczba(m.price); // price: Smyk
  if (!cena) {
    const opis = /za\s*([\d\s.,]+)\s*(?:PLN|zł)/i.exec(String(m.description ?? ''));
    cena = opis ? liczba(opis[1]) : null;
  }
  if (!cena) {
    // pierwsza kwota w treści, która wygląda na cenę tego zestawu (0,25–1,6 × cena w danych)
    for (const t of gora.matchAll(/(\d{1,3}(?:[  ]\d{3})*,\d{2})\s*zł/g)) {
      const c = liczba(t[1]);
      if (c && c >= 0.25 * oczekiwana && c <= 1.6 * oczekiwana) { cena = c; break; }
    }
  }
  return { cena, niedostepne };
}

// ── poprawka ceny w danych ─────────────────────────────────────────────────
// Zapis przez Pythona: JSON.stringify w Node przestawia klucze liczbowe (numery zestawów)
// rosnąco, a sety.json i oferty_feed.json trzymają kolejność dopisywania — diff miałby
// dziesiątki tysięcy linii. Python zachowuje kolejność i format tych plików.
const zmiany = [];
const popraw = (nr, sklep, cena) => zmiany.push({ nr, sklep, cena });
const ZAPIS_PY = `
import json, sys
zmiany, dzis = json.loads(sys.argv[1]), sys.argv[2]
p = 'src/data/sety.json'; raw = open(p, encoding='utf-8').read(); s = json.loads(raw)
for z in zmiany:
    for o in (s.get(z['nr']) or {}).get('oferty', []):
        if o.get('sklep') == z['sklep']: o['cena'] = z['cena']; o['data'] = dzis
open(p, 'w', encoding='utf-8').write(json.dumps(s, ensure_ascii=False, indent=1) + ('\\n' if raw.endswith('\\n') else ''))
p = 'src/data/oferty_feed.json'; raw = open(p, encoding='utf-8').read(); f = json.loads(raw)
for z in zmiany:
    e = f['sety'].get(z['nr'])
    if not e or z['sklep'] not in (e.get('oferty') or {}): continue
    e['oferty'][z['sklep']] = z['cena']; e.setdefault('daty', {})[z['sklep']] = dzis
    ceny = [(v, k) for k, v in e['oferty'].items() if isinstance(v, (int, float)) and v > 0]
    if ceny: e['cena'], e['sklep'] = min(ceny)
open(p, 'w', encoding='utf-8').write(json.dumps(f, ensure_ascii=False, separators=(',', ':')) + ('\\n' if raw.endswith('\\n') else ''))
`;

// ── przebieg ───────────────────────────────────────────────────────────────
let kredyty = 0;
const licznik = {};
for (const k of doSprawdzenia) {
  const url = adresKarty(redirects[k.sklep]?.[k.nr]);
  const wpis = { cena: k.cena, sprawdzono: dzis, czas: teraz };
  if (!url) {
    Object.assign(wpis, { status: 'brak_linku' });
  } else {
    try {
      // Empik potrafi raz oddać stronę bez danych produktu, a za chwilę pełną — przy braku ceny jedna powtórka
      let d = scrape(url, { formaty: ['markdown'], dodatkowe: { maxAge: 0 } });
      kredyty += Number(d.metadata?.creditsUsed ?? 1);
      let { cena, niedostepne } = odczyt(d, k.cena);
      if (!cena && !niedostepne) {
        d = scrape(url, { formaty: ['markdown'], dodatkowe: { maxAge: 0 } });
        kredyty += Number(d.metadata?.creditsUsed ?? 1);
        ({ cena, niedostepne } = odczyt(d, k.cena));
      }
      if (niedostepne) Object.assign(wpis, { status: 'niedostepne', cena_strony: cena });
      else if (!cena) Object.assign(wpis, { status: 'nieodczytane' });
      else if (Math.abs(cena - k.cena) <= Math.max(0.011, 0.01 * k.cena)) Object.assign(wpis, { status: 'ok', cena_strony: cena });
      else {
        popraw(k.nr, k.sklep, cena);
        Object.assign(wpis, { status: 'zmiana', cena, cena_danych: k.cena, cena_strony: cena });
      }
    } catch (e) {
      Object.assign(wpis, { status: 'nieodczytane', blad: String(e.message).slice(0, 160) });
    }
  }
  wynikiPlik.oferty[`${k.nr}|${k.sklep}`] = wpis;
  licznik[wpis.status] = (licznik[wpis.status] ?? 0) + 1;
  console.log(`  ${k.nr} ${k.sklep}: ${k.cena} zł → ${wpis.status}${wpis.cena_strony && wpis.cena_strony !== k.cena ? ` (karta ${wpis.cena_strony} zł)` : ''}`);
}

wynikiPlik._meta.ostatni_przebieg = { czas: teraz, sprawdzono: doSprawdzenia.length, kredyty, wyniki: licznik };
writeFileSync(sciezka('weryfikacja_ofert.json'), JSON.stringify(wynikiPlik, null, 1) + '\n');
if (zmiany.length) {
  execFileSync('python3', ['-c', ZAPIS_PY, JSON.stringify(zmiany), dzis], { cwd: new URL('..', import.meta.url).pathname, stdio: 'inherit' });
}
console.log(`Sprawdzone karty: ${doSprawdzenia.length}, kredyty Firecrawla: ${kredyty}. Wyniki: ${JSON.stringify(licznik)}.` +
  (zmiany.length ? ` Poprawione ceny w danych: ${zmiany.map((z) => `${z.nr} ${z.sklep} ${z.cena} zł`).join(', ')}.` : ''));
