// Budowa wiersza tabeli zestawów (TabelaSetow) z wpisu wycofania.
// Jedna implementacja dla /wycofania/ i dla rankingu wycofań na stronie głównej,
// żeby ta sama pozycja wszędzie miała identyczną cenę, link i status.

import { najlepszaOferta, linkAfiliacyjny, jakikolwiekLink, cenaKatalogowaSetu } from './oferty.js';
import { rokSetu } from './katalog.js';
import { urlZdjecia } from './media.js';
import { maHub } from './huby.js';

export function wierszWycofania(w, { sety = {}, feed = {} } = {}) {
  let oferta = najlepszaOferta(w.numer, { sety, feed });
  const cenaKat = cenaKatalogowaSetu(w.numer, { sety });
  // brak ofert sklepów nie oznacza braku ceny — pokazujemy cenę katalogową
  // z linkiem do LEGO.com; także dla wycofanych, bo czytelnicy chętnie
  // sprawdzają opis na lego.com przed zakupem resztek u innych sprzedawców
  if (!oferta && cenaKat) {
    oferta = { sklep: 'lego', cena: cenaKat, data: null };
  }
  const link = oferta
    ? linkAfiliacyjny(oferta.sklep, w.numer)
    : (jakikolwiekLink(w.numer)?.url ?? `/idz/lego/${w.numer}`);
  return {
    numer: w.numer,
    nazwa: w.nazwa,
    opis: w.uwagi,
    seria: w.seria,
    rok: rokSetu(w.numer),
    elementy: w.elementy,
    zdjecie: urlZdjecia(w.numer, { sety, feed }),
    hub: maHub(w.numer),
    status: w.status === 'potwierdzone' ? 'potwierdzone' : 'przewidywane',
    kiedy: w.kiedy,
    oferta,
    link,
    cenaKatalogowa: cenaKat,
  };
}
