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
import rrpPotwierdzone from '../data/rrp_potwierdzone.json';
import setyDane from '../data/sety.json';
import { wpisKatalogu } from './katalog.js';

// Odsiew ofert, które niemal na pewno dotyczą czegoś innego niż zestaw
// (akcesoria, gabloty, instrukcje, zbiorcze aukcje). Reguły i progi mieszkają
// w odsiew.js, żeby serwis i skrypt kontrolny liczyły dokładnie to samo —
// listę odrzuconych z linkami do aukcji wypisuje `node scripts/kontrola-ofert.mjs`.
import { odsiej } from './odsiew.js';

/**
 * Cena katalogowa na potrzeby odsiewu — dokładnie ta sama, którą pokazuje strona.
 *
 * Musi iść pełnym łańcuchem źródeł z cenaKatalogowaSetu (rrp_potwierdzone ->
 * sety -> ceny_baza -> katalog). Wcześniej pomijała dwa pierwsze i czytała
 * tylko źródła generowane, więc dla setu z ręcznie poprawionym RRP filtr liczył
 * próg od starej ceny z backfillu, a strona pokazywała nową — odsiew mógł
 * przepuścić podszywkę albo (gorzej) uciąć prawdziwą ofertę.
 */
const katalogowaDoOdsiewu = (nr) => cenaKatalogowaSetu(nr, { sety: setyDane });

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
 *
 * Cena katalogowa nie zmienia się w czasie — raz poprawnie ustalona zostaje
 * na zawsze. Dlatego pierwszeństwo ma rejestr `rrp_potwierdzone.json`:
 * ceny sprawdzone u źródła przez człowieka, których żaden backfill ani runner
 * nie nadpisze. Dopiero pod nim stoją źródła generowane.
 *
 * Kolejność źródeł:
 *   1. rrp_potwierdzone.json — potwierdzone przez człowieka (write-once)
 *   2. sety.json            — redakcyjne, weryfikowane ręcznie
 *   3. ceny_baza.json       — baza Łowcy, zrekonstruowana z sety.json
 *   4. katalog.json         — backfill historyczny, wypełniany partiami per
 *                             seria; najmniej pewny, bo powstawał z Bricksetu
 *                             (GBP/USD/EUR), a polski cennik ma własną drabinę
 */
export function cenaKatalogowaSetu(nr, { sety = {} } = {}) {
  const klucz = String(nr);
  return (
    rrpPotwierdzone[klucz]?.cena ??
    sety[klucz]?.cena_katalogowa ??
    cenyBaza[klucz]?.cena_katalogowa ??
    wpisKatalogu(klucz)?.cena_katalogowa ??
    null
  );
}

/**
 * Sklepy, dla których worker potrafi zbudować link z samego numeru zestawu,
 * bez wpisu w redirects.json (patrz trasa /idz/ w src/worker.js):
 *   lego     — bezpośredni adres produktu na lego.com,
 *   xkom     — wyszukiwarka x-kom z uniwersalnym kodem SalesMasters,
 *   allegro  — link kampanii afiliacyjnej,
 *   smyk     — deeplink Adtraction na kategorię LEGO,
 *   empik    — deeplink Tradedoubler na wyszukiwarkę numeru,
 *   ceneo    — deeplink Tradedoubler na wyszukiwarkę numeru.
 * Lista musi zostać zgodna z workerem — inaczej strona pominie sklep, do
 * którego i tak umiałaby wysłać czytelnika (albo zalinkuje w próżnię).
 */
const SKLEPY_Z_LINKIEM_Z_WORKERA = new Set(['lego', 'xkom', 'allegro', 'smyk', 'empik', 'ceneo']);

/** Ścieżka przekierowania afiliacyjnego albo null, gdy nie mamy linku do sklepu. */
export function linkAfiliacyjny(sklep, nr) {
  if (!sklep) return null;
  const klucz = String(nr);
  // wpis z feedu (bezpośredni link produktowy) ma pierwszeństwo
  if (redirectsMapa?.[sklep]?.[klucz]) return `/idz/${sklep}/${klucz}`;
  // reszta: worker zbuduje link sam, o ile zna ten sklep i numer jest setem
  if (SKLEPY_Z_LINKIEM_Z_WORKERA.has(sklep) && /^\d{4,7}$/.test(klucz)) {
    return `/idz/${sklep}/${klucz}`;
  }
  return null;
}

// Sklepy, do których linkujemy BEZ prowizji — `rel` nie może wtedy mówić
// „sponsored", bo link nie jest opłacony.
//   lego  — LEGO.com nie ma programu w naszym miksie, linkujemy wprost.
//   smyk  — program w Adtraction jest aktywny, ale deeplink nie dowozi na
//           produkt (Adtraction gubi docelowy adres w handoffie do
//           netSalesMedia i klient ląduje na stronie głównej). Od 28.08.2026
//           linkujemy wprost na kartę produktu i świadomie rezygnujemy z
//           prowizji. Gdy deeplink zacznie działać, usunąć 'smyk' z tego zbioru.
const SKLEPY_BEZ_PROWIZJI = new Set(['lego', 'smyk']);

/** Wartość atrybutu rel dla linku do sklepu — „sponsored" tylko gdy zarabiamy. */
export function relLinku(sklep, nr) {
  if (SKLEPY_BEZ_PROWIZJI.has(sklep)) return 'nofollow';
  return linkAfiliacyjny(sklep, nr) ? 'sponsored nofollow' : 'nofollow';
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
