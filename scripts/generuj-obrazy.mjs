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
