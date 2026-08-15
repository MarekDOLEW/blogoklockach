// Wspólne źródło najniższej ceny i linków afiliacyjnych.
//
// Jedna implementacja dla wszystkich list zestawów (katalog serii, wycofania),
// żeby ta sama pozycja nie pokazywała dwóch różnych cen na dwóch stronach.
//
// Priorytet danych:
//   1. sety.json -> `oferty` (śledzone sety, dane pewniejsze i weryfikowane ręcznie)
//   2. oferty_feed.json -> migawka feedów sklepowych (reszta katalogu)
// Gdy oba źródła mają cenę, wygrywa niższa.

import redirectsMapa from '../data/redirects.json';
import sklepyMapa from '../data/sklepy.json';

/** Najniższa aktualna oferta zestawu albo null. Zwraca { sklep, cena, data }. */
export function najlepszaOferta(nr, { sety = {}, feed = {} } = {}) {
  const klucz = String(nr);

  const zHubu = (sety[klucz]?.oferty ?? []).reduce(
    (a, o) => (a === null || o.cena < a.cena ? o : a),
    null,
  );

  const f = feed[klucz];
  const zFeedu = f?.cena ? { sklep: f.sklep, cena: f.cena, data: f.data } : null;

  if (zHubu && zFeedu) return zHubu.cena <= zFeedu.cena ? zHubu : zFeedu;
  return zHubu ?? zFeedu;
}

/** Ścieżka przekierowania afiliacyjnego albo null, gdy nie mamy linku do sklepu. */
export function linkAfiliacyjny(sklep, nr) {
  if (!sklep) return null;
  return redirectsMapa?.[sklep]?.[String(nr)] ? `/idz/${sklep}/${nr}` : null;
}

/**
 * Link „gdzie kupić" dla zestawu bez znanej ceny — bierzemy pierwszy sklep,
 * który w ogóle ma ten numer w redirects.json.
 */
export function jakikolwiekLink(nr) {
  const klucz = String(nr);
  for (const sklep of Object.keys(redirectsMapa)) {
    if (redirectsMapa[sklep]?.[klucz]) return { sklep, url: `/idz/${sklep}/${klucz}` };
  }
  return null;
}

export const nazwaSklepu = (sklep) => sklepyMapa?.[sklep]?.nazwa ?? sklep;

export const fmtCena = (c) =>
  Number(c).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';

export const fmtElementy = (n) => Number(n).toLocaleString('pl-PL');
