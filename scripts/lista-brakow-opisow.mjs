// Lista zestawów bez opisu (karty P07) — zamówienie dla Piotra.
//
// Prośba Claude'a Piotra (mail 01.11.2026): świeża lista co ~5 paczek, żeby
// kolejka u nich zawsze startowała z aktualnego stanu strony. Pierwszą taką
// listę (31.08.2026) robiliśmy ręcznie w sesji; ten skrypt ją odtwarza
// z bieżących danych, w tym samym układzie CSV (separator ;).
//
// Priorytety:
//   1-rocznik-biezacy    — zestaw z bieżącego rocznika katalogu bez karty
//   2-starszy-w-sprzedazy — starszy zestaw ze statusem "dostepny" albo z ofertą
//                           w sklepie pierwszej ręki (bez Allegro/Ceneo — tam
//                           rynek wtórny ma wszystko, zawyżałby listę)
// Zestawy wycofane bez oferty pomijamy — tabela cen i tak tam nie działa.
//
//   node scripts/lista-brakow-opisow.mjs                 # CSV na stdout + podsumowanie na stderr
//   node scripts/lista-brakow-opisow.mjs > braki.csv

import { readFileSync } from 'node:fs';

const czytaj = (p) => JSON.parse(readFileSync(new URL(`../src/data/${p}`, import.meta.url)));
const karty = czytaj('karty_setow.json');
const katalog = czytaj('katalog.json');
const feed = czytaj('oferty_feed.json').sety ?? {};

const ROK = new Date().getFullYear();
const SKLEPY_PIERWSZEJ_REKI = ['mediaexpert', 'planetaklockow', 'empik', 'smyk', 'xkom'];
const wSklepie = (nr) => {
  const o = feed[nr]?.oferty ?? {};
  return SKLEPY_PIERWSZEJ_REKI.some((s) => o[s] > 0);
};

// Kolumny na prośbę Piotra (02.11.2026): status sprzedaży, liczba sklepów
// z ofertą (pierwsza ręka, bez Allegro/Ceneo) i czy istnieje /zestaw/<nr>/.
// Istnienie strony czytamy ze zbudowanego dist/ — bez builda kolumna mówi
// "zbuduj-dist" zamiast zgadywać.
import { existsSync } from 'node:fs';
const maDist = existsSync(new URL('../dist/zestaw', import.meta.url));
const maStrone = (nr) => (maDist ? (existsSync(new URL(`../dist/zestaw/${nr}/index.html`, import.meta.url)) ? 'tak' : 'nie') : 'zbuduj-dist');
const liczbaSklepow = (nr) => {
  const o = feed[nr]?.oferty ?? {};
  return SKLEPY_PIERWSZEJ_REKI.filter((s) => o[s] > 0).length;
};

const wiersze = [['numer', 'nazwa', 'seria', 'rok', 'status_sprzedazy', 'liczba_sklepow_z_oferta', 'ma_strone', 'elementy', 'cena_katalogowa', 'priorytet']];
let b1 = 0, b2 = 0;
for (const [seria, lista] of Object.entries(katalog)) {
  if (!Array.isArray(lista)) continue;
  for (const x of lista) {
    if (karty[x.numer]) continue;
    const nazwa = (x.nazwa ?? '').replaceAll(';', ',');
    const wspolne = [x.numer, nazwa, seria, x.rok ?? '', x.status ?? '', liczbaSklepow(x.numer), maStrone(x.numer), x.elementy ?? '', x.cena_katalogowa ?? ''];
    if (x.rok >= ROK) {
      wiersze.push([...wspolne, '1-rocznik-biezacy']);
      b1++;
    } else if (x.status === 'dostepny' || wSklepie(x.numer)) {
      wiersze.push([...wspolne, '2-starszy-w-sprzedazy']);
      b2++;
    }
  }
}
const naglowek = wiersze.shift();
wiersze.sort((a, b) => a[9].localeCompare(b[9]) || a[2].localeCompare(b[2]) || String(a[0]).localeCompare(String(b[0])));
console.log([naglowek, ...wiersze].map((w) => w.join(';')).join('\n'));
console.error(`rocznik bieżący bez karty: ${b1} | starsze w sprzedaży bez karty: ${b2} | razem: ${b1 + b2}`);
