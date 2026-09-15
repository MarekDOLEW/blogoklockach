// Budowa wiersza tabeli zestawów (TabelaSetow) z wpisu wycofania.
// Jedna implementacja dla /wycofania/ i dla rankingu wycofań na stronie głównej,
// żeby ta sama pozycja wszędzie miała identyczną cenę, link i status.

import { najlepszaOferta, linkAfiliacyjny, cenaKatalogowaSetu } from './oferty.js';
import { rokSetu, wpisKatalogu } from './katalog.js';
import { urlZdjecia } from './media.js';
import { maHub } from './huby.js';
import { statusListingu } from './status.js';

export function wierszWycofania(w, { sety = {}, feed = {} } = {}) {
  const sklepowa = najlepszaOferta(w.numer, { sety, feed });
  const cenaKat = cenaKatalogowaSetu(w.numer, { sety });
  const status = statusListingu(w.numer, { maOferte: Boolean(sklepowa && sklepowa.sklep !== 'lego') });
  // Brak ofert sklepów: dopóki LEGO sprzedaje, pokazujemy cenę katalogową
  // z linkiem do LEGO.com. Po EOL w LEGO nie dokładamy już żadnego linku
  // „na ślepo" (wyszukiwarki sklepów bywają wtedy puste) – wiersz mówi
  // wprost „brak w sprzedaży".
  let oferta = sklepowa;
  if (!oferta && cenaKat && !status.eolLego) oferta = { sklep: 'lego', cena: cenaKat, data: null };
  const link = oferta ? linkAfiliacyjny(oferta.sklep, w.numer) : null;
  return {
    numer: w.numer,
    nazwa: w.nazwa,
    opis: w.uwagi,
    seria: w.seria,
    rok: rokSetu(w.numer),
    elementy: w.elementy,
    zdjecie: urlZdjecia(w.numer, { sety, feed }),
    hub: maHub(w.numer),
    status: status.badge,
    eolLego: status.eolLego,
    kiedy: status.kiedy,
    oferta,
    link,
    cenaKatalogowa: cenaKat,
  };
}

/**
 * Wiersz TabelaSetow z samego numeru – dla list budowanych z katalogu i sety.json
 * (np. /ekskluzywne/). Nazwa, seria, rok i liczba elementów z katalogu, gdy
 * sety.json ich nie ma. Cena: najlepsza oferta śledzonych sklepów, a gdy jej nie
 * ma i LEGO jeszcze sprzedaje – cena katalogowa z linkiem do LEGO.com.
 */
export function wierszZNumeru(nr, { sety = {}, feed = {}, opis = null } = {}) {
  const numer = String(nr);
  const s = sety[numer] ?? null;
  const kat = wpisKatalogu(numer);
  const sklepowa = najlepszaOferta(numer, { sety, feed });
  const cenaKat = cenaKatalogowaSetu(numer, { sety });
  const status = statusListingu(numer, { maOferte: Boolean(sklepowa && sklepowa.sklep !== 'lego') });
  let oferta = sklepowa;
  if (!oferta && cenaKat && !status.eolLego) oferta = { sklep: 'lego', cena: cenaKat, data: null };
  const link = oferta ? linkAfiliacyjny(oferta.sklep, numer) : null;
  return {
    numer,
    nazwa: s?.nazwa ?? kat?.nazwa ?? `Zestaw ${numer}`,
    opis,
    seria: s?.seria ?? kat?.seria ?? null,
    rok: rokSetu(numer) ?? (s?.premiera ? Number(s.premiera.slice(0, 4)) : null),
    elementy: s?.elementy ?? kat?.elementy ?? null,
    zdjecie: urlZdjecia(numer, { sety, feed }),
    hub: maHub(numer),
    status: status.badge,
    eolLego: status.eolLego,
    kiedy: status.kiedy,
    oferta,
    link,
    cenaKatalogowa: cenaKat,
  };
}
