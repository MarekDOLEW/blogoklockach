// Indeks wyszukiwarki globalnej — jeden plik dla całego serwisu.
//
// Zawiera wyłącznie zestawy, które mają własną podstronę (`numeryHubow`),
// więc każdy wynik ma dokąd prowadzić. Format jest celowo tablicowy
// ([numer, nazwa, seria]) zamiast obiektowego: przy ~4900 pozycjach to
// różnica rzędu 100 kB, a plik i tak pobiera się dopiero przy pierwszym
// otwarciu wyszukiwarki, nie przy wejściu na stronę.
//
// Nazwa i seria idą tą samą ścieżką co na stronie zestawu: redakcyjne
// sety.json mają pierwszeństwo, potem katalog, na końcu lista wycofań.

import sety from '../data/sety.json';
import { numeryHubow, wycofanieSetu } from '../lib/huby.js';
import { wpisKatalogu } from '../lib/katalog.js';

export function GET() {
  const rekordy = [...numeryHubow]
    .map((nr) => {
      const s = sety[nr];
      const k = wpisKatalogu(nr);
      const w = wycofanieSetu(nr);
      const nazwa = s?.nazwa ?? k?.nazwa ?? w?.nazwa ?? '';
      const seria = s?.seria ?? k?.seria ?? w?.seria ?? '';
      return nazwa ? [nr, nazwa, seria] : null;
    })
    .filter(Boolean)
    .sort((a, b) => a[1].localeCompare(b[1], 'pl'));

  return new Response(JSON.stringify(rekordy), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
