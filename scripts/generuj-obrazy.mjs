// Generuje src/data/obrazy.json — mapę numer setu -> źródłowy URL zdjęcia.
//
// Z mapy korzysta worker (trasa /img/<numer>.jpg): serwuje zdjęcia z naszej
// domeny, pobierając źródło raz i trzymając kopię w cache Cloudflare.
// Priorytet źródeł identyczny jak w src/lib/media.js — dzięki temu strona
// i worker zawsze mówią o tym samym zdjęciu.
//
// Uruchamiane automatycznie w `npm run build` (skrypt prebuild).

import { readFileSync, writeFileSync } from 'node:fs';

const czytaj = (p) => JSON.parse(readFileSync(new URL(`../src/data/${p}`, import.meta.url)));
const sety = czytaj('sety.json');
const feed = czytaj('oferty_feed.json').sety ?? {};
const mapa = czytaj('zdjecia.json');
const wycofania = czytaj('wycofania.json').wycofania ?? [];

// Dociąganie zdjęć nowości (od 14.10.2026). Zestaw dopisany przez Scouta albo
// przez listing lego.pl, którego nie ma jeszcze w feedach sklepów, nie miał
// skąd wziąć zdjęcia — 67009 stał w Nowościach z zaślepką, choć Rebrickable
// i Brickset miały już zdjęcie. Przy ręcznym uruchomieniu i w przebiegu Łowcy
// sprawdzamy dla zestawów z sety.json albo z ofertą: najpierw Rebrickable,
// potem Brickset (te same źródła i licencje co w _meta zdjecia.json), i wynik
// dopisujemy do zdjecia.json. W `npm run build` (prebuild) sieci nie dotykamy.
if (process.env.npm_lifecycle_event !== 'prebuild') {
  const maZrodlo = (nr) =>
    Boolean(sety[nr]?.zdjecia?.glowne || feed[nr]?.zdjecie || (typeof mapa[nr] === 'object' ? mapa[nr]?.url : mapa[nr]));
  const kandydaci = [...new Set([...Object.keys(sety), ...Object.keys(feed).filter((nr) => Object.keys(feed[nr]?.oferty ?? {}).length)])]
    .filter((nr) => /^\d{4,7}$/.test(nr) && !maZrodlo(nr) && !(nr in mapa));
  const jest = async (url) => {
    try {
      const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
      return r.ok && /^image\//.test(r.headers.get('content-type') ?? '');
    } catch { return false; }
  };
  let dopisane = 0;
  for (const nr of kandydaci.slice(0, 60)) {
    for (const [zrodlo, url] of [['rebrickable', `https://cdn.rebrickable.com/media/sets/${nr}-1.jpg`], ['brickset', `https://images.brickset.com/sets/images/${nr}-1.jpg`]]) {
      if (await jest(url)) { mapa[nr] = { url, zrodlo, dodano: new Date().toISOString().slice(0, 10) }; dopisane++; break; }
    }
  }
  if (dopisane) {
    // Dopisujemy na końcu surowego tekstu: JSON.stringify przestawiłby klucze
    // liczbowe przed `_meta` i diff objąłby cały plik (7 tys. wpisów).
    const sciezka = new URL('../src/data/zdjecia.json', import.meta.url);
    const tekst = readFileSync(sciezka, 'utf8');
    const koniec = tekst.lastIndexOf('}');
    const nowe = Object.entries(mapa)
      .filter(([nr, z]) => z?.dodano && !tekst.includes(`\n "${nr}": {`))
      .map(([nr, z]) => `,\n "${nr}": ${JSON.stringify(z, null, 1).replace(/\n/g, '\n ')}`)
      .join('');
    writeFileSync(sciezka, tekst.slice(0, koniec).replace(/\s*$/, '') + nowe + '\n' + tekst.slice(koniec));
  }
  if (kandydaci.length) console.log(`zdjęcia nowości: ${kandydaci.length} bez źródła, dopisane ${dopisane} (Rebrickable/Brickset)`);
}

const obrazy = {};
// mediaexpert.pl odpowiada 200 przeglądarkom, ale odrzuca zapytania
// z Cloudflare Workers — taki URL jako źródło daje 502 na /img/
const zablokowane = /^https?:\/\/(www\.)?mediaexpert\.pl\//;
const ustaw = (nr, url) => {
  if (nr && url && !zablokowane.test(url) && !obrazy[nr]) obrazy[nr] = url;
};

for (const [nr, s] of Object.entries(sety)) ustaw(nr, s?.zdjecia?.glowne);
for (const [nr, f] of Object.entries(feed)) ustaw(nr, f?.zdjecie);
for (const [nr, z] of Object.entries(mapa)) {
  if (nr !== '_meta') ustaw(nr, typeof z === 'object' ? z?.url : null);
}
for (const w of wycofania) ustaw(w.numer, w.zdjecie);

writeFileSync(
  new URL('../src/data/obrazy.json', import.meta.url),
  JSON.stringify(obrazy),
);
console.log(`obrazy.json: ${Object.keys(obrazy).length} zdjęć`);
