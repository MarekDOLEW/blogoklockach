// Zapis plików danych z zachowaniem kolejności kluczy i formatu pliku.
//
// JSON.stringify wypisuje klucze numeryczne („21372") posortowane rosnąco, a
// sety.json i mapa oferty_feed.sety są w kolejności wpisów (pisze je Python,
// który ją zachowuje). Skrypt piszący z JS bez tej biblioteki przepisuje cały
// plik (15.09.2026: 37 tys. linii diffu po jednym przebiegu). Stąd:
//   - parsujZKolejnoscia(tekst)  → obiekty jako Map (kolejność z pliku)
//   - kluczeObiektu(tekst, sciezka) → lista kluczy w kolejności z pliku
//   - stringifyMapa(obiekt, klucze, wciecie) → JSON w podanej kolejności, nowe klucze na końcu
//   - wykryjWciecie(tekst) → 0 (jedna linia) albo liczba spacji
//   - zapiszFeed(sciezka, feed, tekstOryg) / zapiszSety(sciezka, sety, tekstOryg)
// Każdy skrypt piszący sety.json albo oferty_feed.json z JS ma używać tych funkcji.

import { writeFileSync } from 'node:fs';

export function parsujZKolejnoscia(tekst) {
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

export function kluczeObiektu(tekst, sciezka = []) {
  let w = parsujZKolejnoscia(tekst);
  for (const k of sciezka) w = w?.get(k);
  return w instanceof Map ? [...w.keys()] : [];
}

export function stringifyMapa(obiekt, klucze, wciecie) {
  const zbior = new Set(klucze);
  const kolejnosc = [...klucze.filter((k) => k in obiekt), ...Object.keys(obiekt).filter((k) => !zbior.has(k))];
  if (!wciecie) return '{' + kolejnosc.map((k) => JSON.stringify(k) + ':' + JSON.stringify(obiekt[k])).join(',') + '}';
  const pad = ' '.repeat(wciecie);
  return '{\n' + kolejnosc.map((k) => pad + JSON.stringify(k) + ': ' + JSON.stringify(obiekt[k], null, wciecie).replace(/\n/g, '\n' + pad)).join(',\n') + '\n}';
}

/** 0 = plik w jednej linii; inaczej liczba spacji wcięcia pierwszego poziomu. */
export function wykryjWciecie(tekst) {
  const m = /^\{\n( +)"/.exec(tekst);
  return m ? m[1].length : 0;
}

/** oferty_feed.json: `_meta` i inne klucze najwyższego poziomu w oryginalnej kolejności, mapa `sety` w kolejności z pliku. */
export function zapiszFeed(sciezka, feed, tekstOryg) {
  const wciecie = wykryjWciecie(tekstOryg);
  const kluczeTop = kluczeObiektu(tekstOryg);
  const kluczeSety = kluczeObiektu(tekstOryg, ['sety']);
  const top = {};
  for (const k of [...kluczeTop.filter((k) => k in feed), ...Object.keys(feed).filter((k) => !kluczeTop.includes(k))]) top[k] = feed[k];
  let json;
  if (!wciecie) {
    json = '{' + Object.keys(top).map((k) => JSON.stringify(k) + ':' + (k === 'sety' ? stringifyMapa(top.sety, kluczeSety, 0) : JSON.stringify(top[k]))).join(',') + '}';
  } else {
    const pad = ' '.repeat(wciecie);
    json = '{\n' + Object.keys(top).map((k) => pad + JSON.stringify(k) + ': ' + (k === 'sety' ? stringifyMapa(top.sety, kluczeSety, wciecie).replace(/\n/g, '\n' + pad) : JSON.stringify(top[k], null, wciecie).replace(/\n/g, '\n' + pad))).join(',\n') + '\n}';
  }
  writeFileSync(sciezka, json + (tekstOryg.endsWith('\n') ? '\n' : ''));
}

/** sety.json: mapa numer → zestaw, kolejność z pliku, wcięcie z pliku. */
export function zapiszSety(sciezka, sety, tekstOryg) {
  const wciecie = wykryjWciecie(tekstOryg) || 1;
  writeFileSync(sciezka, stringifyMapa(sety, kluczeObiektu(tekstOryg), wciecie) + (tekstOryg.endsWith('\n') ? '\n' : ''));
}

/** katalog.json: liczba wpisów musi równać się liczbie unikalnych numerów (15.09.2026: 4 duble). */
export function sprawdzUnikalnoscKatalogu(katalog) {
  const numery = new Map();
  for (const [seria, lista] of Object.entries(katalog)) {
    if (seria === '_meta' || !Array.isArray(lista)) continue;
    for (const s of lista) { const nr = String(s.numer); numery.set(nr, [...(numery.get(nr) ?? []), seria]); }
  }
  const duble = [...numery].filter(([, serie]) => serie.length > 1);
  if (duble.length) throw new Error(`katalog.json: zdublowane numery ${duble.map(([nr, s]) => `${nr} (${s.join(', ')})`).join('; ')} — nie zapisuję`);
}
