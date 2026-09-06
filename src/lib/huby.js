// Jedno źródło prawdy: dla których numerów istnieje podstrona /zestaw/[nr]/.
//
// Z tego modułu korzysta zarówno getStaticPaths strony zestawu (generator),
// jak i listy (tabele serii, wycofania) przy decyzji, czy linkować nazwę
// zestawu – dzięki temu link z listy nigdy nie prowadzi w próżnię.
//
// Podstronę dostaje zestaw, który:
//   - jest śledzony w sety.json (pełny hub z redakcyjnym opisem), albo
//   - jest na liście wycofań (każde wycofanie linkuje do szczegółów), albo
//   - ma nazwę (katalog.json) ORAZ cokolwiek do pokazania:
//     cenę z feedu sklepowego, choć jeden link afiliacyjny, albo – dla setów
//     w sprzedaży – cenę katalogową LEGO (wiersz LEGO.com z linkiem do sklepu).

import sety from '../data/sety.json';
import ofertyFeed from '../data/oferty_feed.json';
import redirects from '../data/redirects.json';
import wycofaniaDane from '../data/wycofania.json';
import katalogCaly from '../data/katalog.json';
import rrpPotwierdzone from '../data/rrp_potwierdzone.json';
import karty from '../data/karty_setow.json';
import { wpisKatalogu } from './katalog.js';

const feed = ofertyFeed?.sety ?? {};
const wycofaniaIdx = new Map(wycofaniaDane.wycofania.map((w) => [w.numer, w]));

const maLinkGdziekolwiek = (nr) =>
  Object.keys(redirects).some((sklep) => redirects[sklep]?.[nr]);

// cena w starym formacie (pole cena) albo nowym (mapa oferty per sklep)
const maCeneZFeedu = (wpis) =>
  Boolean(wpis?.cena || Object.values(wpis?.oferty ?? {}).some((c) => c > 0));

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
    if (maCeneZFeedu(feed[nr]) || maLinkGdziekolwiek(nr)) numery.add(nr);
  }
  // sety w sprzedaży ze znaną ceną katalogową – hub pokaże przynajmniej
  // wiersz LEGO.com (backfill cen katalogowych poszerza tę pulę z każdą partią).
  // Cena z rejestru potwierdzonych liczy się tak samo jak ta z katalogu: to
  // nadal znana cena katalogowa, tylko wprowadzona ręcznie, a bez tego zestaw
  // z potwierdzonym RRP zostawał bez podstrony (przypadek 40862/40865/40866).
  for (const [seria, lista] of Object.entries(katalogCaly)) {
    if (seria === '_meta' || !Array.isArray(lista)) continue;
    for (const s of lista) {
      if (s.status === 'dostepny' && (s.cena_katalogowa || rrpPotwierdzone[s.numer]?.cena)) numery.add(s.numer);
      // karta redakcyjna to gotowa tresc – zestaw z karta dostaje podstrone
      // niezaleznie od ceny i statusu, bo inaczej opis nie ma sie gdzie pokazac
      if (karty[s.numer]) numery.add(s.numer);
    }
  }
  return numery;
}

/** Zbiór numerów, dla których generujemy /zestaw/[nr]/. */
export const numeryHubow = policzHuby();

export const maHub = (nr) => numeryHubow.has(String(nr));

/** Wpis wycofania dla numeru albo null. */
export const wycofanieSetu = (nr) => wycofaniaIdx.get(String(nr)) ?? null;
