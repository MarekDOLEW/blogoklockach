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
import cenyBaza from '../data/ceny_baza.json';
import { wpisKatalogu } from './katalog.js';

// Odsiew ofert, które niemal na pewno dotyczą czegoś innego niż zestaw
// (akcesoria, gabloty, instrukcje, zbiorcze aukcje). Reguły i progi mieszkają
// w odsiew.js, żeby serwis i skrypt kontrolny liczyły dokładnie to samo —
// listę odrzuconych z linkami do aukcji wypisuje `node scripts/kontrola-ofert.mjs`.
import { odsiej } from './odsiew.js';

/** Cena katalogowa na potrzeby odsiewu — bez sety.json, żeby nie ciągnąć go tutaj. */
const katalogowaDoOdsiewu = (nr) =>
  cenyBaza[String(nr)]?.cena_katalogowa ?? wpisKatalogu(String(nr))?.cena_katalogowa ?? null;

/**
 * Oferty sklepowe z migawki feedów dla jednego setu.
 * Obsługuje oba formaty wpisu: nowy `oferty: {sklep: cena}` (per sklep,
 * wypełnia go Łowca od 2026-08-15) i starszy pojedynczy `cena`+`sklep`.
 *
 * `nr` jest opcjonalny wyłącznie dla zgodności wstecznej — bez niego działa
 * tylko reguła A odsiewu, więc wszystkie wywołania w serwisie go podają.
 */
export function ofertyZFeedu(wpisFeedu, nr = null) {
  if (!wpisFeedu) return [];
  const { data } = wpisFeedu;
  const surowe =
    wpisFeedu.oferty && typeof wpisFeedu.oferty === 'object'
      ? Object.entries(wpisFeedu.oferty)
          .filter(([, cena]) => typeof cena === 'number' && cena > 0)
          .map(([sklep, cena]) => ({ sklep, cena, data }))
      : wpisFeedu.cena
        ? [{ sklep: wpisFeedu.sklep, cena: wpisFeedu.cena, data }]
        : [];
  return odsiej(surowe, katalogowaDoOdsiewu(nr));
}

/**
 * Pełna lista ofert do tabeli cen: redakcyjne z sety.json + feedowe,
 * jeden wiersz na sklep — przy dublu wygrywa niższa cena (jak w najlepszaOferta).
 */
export function polaczOferty(ofertySetu = [], wpisFeedu = null, nr = null) {
  const perSklep = new Map();
  for (const o of [...ofertySetu, ...ofertyZFeedu(wpisFeedu, nr)]) {
    const stara = perSklep.get(o.sklep);
    if (!stara || o.cena < stara.cena) perSklep.set(o.sklep, o);
  }
  return [...perSklep.values()];
}

/**
 * Najniższa aktualna oferta zestawu albo null. Zwraca { sklep, cena, data }.
 *
 * Pomija Ceneo: to porównywarka, a nie sklep — jej cena jest najniższą ofertą
 * rynkową (często ze sklepu, do którego sami nie linkujemy), więc na listach
 * z ceną "od" wprowadzałaby w błąd. Ceneo pokazujemy wyłącznie jako ostatni
 * wiersz pełnej tabeli cen (TabelaCen.astro).
 */
export function najlepszaOferta(nr, { sety = {}, feed = {} } = {}) {
  const klucz = String(nr);
  const kandydaci = [...(sety[klucz]?.oferty ?? []), ...ofertyZFeedu(feed[klucz], klucz)].filter(
    (o) => o.sklep !== 'ceneo',
  );
  return kandydaci.reduce((a, o) => (a === null || o.cena < a.cena ? o : a), null);
}

/**
 * Oficjalna cena katalogowa LEGO albo null.
 * Kolejność źródeł: sety.json (redakcyjne) -> ceny_baza.json (Łowca)
 * -> katalog.json (backfill historyczny, wypełniany partiami per seria).
 */
export function cenaKatalogowaSetu(nr, { sety = {} } = {}) {
  const klucz = String(nr);
  return (
    sety[klucz]?.cena_katalogowa ??
    cenyBaza[klucz]?.cena_katalogowa ??
    wpisKatalogu(klucz)?.cena_katalogowa ??
    null
  );
}

/** Ścieżka przekierowania afiliacyjnego albo null, gdy nie mamy linku do sklepu. */
export function linkAfiliacyjny(sklep, nr) {
  if (!sklep) return null;
  // LEGO.com obsługuje worker dynamicznie (bezpośredni link z numeru zestawu)
  if (sklep === 'lego') return `/idz/lego/${nr}`;
  return redirectsMapa?.[sklep]?.[String(nr)] ? `/idz/${sklep}/${nr}` : null;
}

/**
 * Link „gdzie kupić" dla zestawu bez znanej ceny — bierzemy pierwszy sklep,
 * który w ogóle ma ten numer w redirects.json.
 */
export function jakikolwiekLink(nr) {
  const klucz = String(nr);
  // Ceneo na końcu kolejki — link do porównywarki jest lepszy niż brak linku,
  // ale zawsze ustępuje bezpośredniemu linkowi do sklepu.
  const sklepy = Object.keys(redirectsMapa).filter((s) => s !== 'ceneo');
  for (const sklep of [...sklepy, 'ceneo']) {
    if (redirectsMapa[sklep]?.[klucz]) return { sklep, url: `/idz/${sklep}/${klucz}` };
  }
  return null;
}

export const nazwaSklepu = (sklep) => sklepyMapa?.[sklep]?.nazwa ?? sklep;

export const fmtCena = (c) =>
  Number(c).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';

export const fmtElementy = (n) => Number(n).toLocaleString('pl-PL');
