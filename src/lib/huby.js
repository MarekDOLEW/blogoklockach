// Jedno źródło prawdy: dla których numerów istnieje podstrona /zestaw/[nr]/.
//
// Z tego modułu korzysta zarówno getStaticPaths strony zestawu (generator),
// jak i listy (tabele serii, wycofania) przy decyzji, czy linkować nazwę
// zestawu — dzięki temu link z listy nigdy nie prowadzi w próżnię.
//
// Podstronę dostaje zestaw, który:
//   - jest śledzony w sety.json (pełny hub z redakcyjnym opisem), albo
//   - jest na liście wycofań (każde wycofanie linkuje do szczegółów), albo
//   - ma nazwę (katalog.json) ORAZ cokolwiek do pokazania:
//     cenę z feedu sklepowego lub choć jeden link afiliacyjny.

import sety from '../data/sety.json';
import ofertyFeed from '../data/oferty_feed.json';
import redirects from '../data/redirects.json';
import wycofaniaDane from '../data/wycofania.json';
import { wpisKatalogu } from './katalog.js';

const feed = ofertyFeed?.sety ?? {};
const wycofaniaIdx = new Map(wycofaniaDane.wycofania.map((w) => [w.numer, w]));

const maLinkGdziekolwiek = (nr) =>
  Object.keys(redirects).some((sklep) => redirects[sklep]?.[nr]);

function policzHuby() {
  const numery = new Set([...Object.keys(sety), ...wycofaniaIdx.keys()]);
  const kandydaci = new Set([
    ...Object.keys(feed),
    ...Object.values(redirects).flatMap((mapa) => Object.keys(mapa ?? {})),
  ]);
  for (const nr of kandydaci) {
    if (numery.has(nr)) continue;
    const nazwany = wpisKatalogu(nr) ?? wycofaniaIdx.get(nr);
    if (!nazwany) continue;
    if (feed[nr]?.cena || maLinkGdziekolwiek(nr)) numery.add(nr);
  }
  return numery;
}

/** Zbiór numerów, dla których generujemy /zestaw/[nr]/. */
export const numeryHubow = policzHuby();

export const maHub = (nr) => numeryHubow.has(String(nr));

/** Wpis wycofania dla numeru albo null. */
export const wycofanieSetu = (nr) => wycofaniaIdx.get(String(nr)) ?? null;
