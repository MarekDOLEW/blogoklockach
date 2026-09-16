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
import legoBezStrony from '../data/lego_strony_brak.json';
import setyDane from '../data/sety.json';
import dealePotwierdzone from '../data/deale_potwierdzone.json';

// ── Które oferty w ogóle pokazujemy (audyt 16.09.2026) ─────────────────────
//
// Dwie reguły, obie przy ODCZYCIE (dane zostają surowe, jak przy odsiewie):
//
// 1. Wiek. Oferta starsza niż MAX_WIEK_OFERTY_DNI nie wchodzi do tabel, meta,
//    JSON-LD ani deali. Powód: 16.09 w sety.json leżało 17 ofert z 12–16.08
//    (sklepy bez feedu: proshop, rozetka, brixani…, plus trzy LEGO.com sprzed
//    listingu) i każda miała normalny przycisk „Sprawdź w sklepie". Sklepy
//    tygodniowe (Ceneo, Empik, Smyk, LEGO.com) mieszczą się w 14 dniach z zapasem.
// 2. Podejrzany rynek. Oferta poniżej PROG_PODEJRZANEGO_RYNKU × RRP, gdy RRP jest
//    POTWIERDZONE przez człowieka (rrp_potwierdzone.json), to najczęściej zaślepka
//    sklepu albo podszywka — odsiew (28%) tego nie łapie. Taka oferta czeka na
//    potwierdzenie w src/data/deale_potwierdzone.json (człowiek otworzył kartę
//    sklepu); do tego czasu jej nie ma. 16.09: 60339, 10423, 76156 — prawdziwe
//    wyprzedaże, potwierdzone przez Marka, stąd ten plik.
export const MAX_WIEK_OFERTY_DNI = 14;
export const PROG_PODEJRZANEGO_RYNKU = 0.5;
const DZIS_MS = Date.now();

/** Czy oferta jest dość świeża, żeby ją pokazać (bez daty = nie oceniamy). */
export function ofertaAktualna(o) {
  if (!o?.data) return true;
  const ms = Date.parse(o.data);
  return Number.isNaN(ms) || (DZIS_MS - ms) / 864e5 <= MAX_WIEK_OFERTY_DNI;
}

/** Powód, dla którego oferta jest „podejrzanym rynkiem", albo null. */
export function podejrzanyRynek(o, nr) {
  const klucz = String(nr ?? '');
  const rrp = rrpPotwierdzone[klucz]?.cena;
  if (!rrp || !(o?.cena > 0) || o.cena >= PROG_PODEJRZANEGO_RYNKU * rrp) return null;
  const p = dealePotwierdzone.potwierdzone?.[klucz];
  if (p && o.cena >= p.cena - 0.01) return null;
  return `${Math.round(100 * (1 - o.cena / rrp))}% poniżej potwierdzonej ceny katalogowej (${rrp} zł) bez potwierdzenia w deale_potwierdzone.json`;
}

/** Oferty do pokazania: świeże i niepodejrzane. Jedyne sito dla sety.json i feedu. */
export const filtrujOferty = (oferty, nr) =>
  (oferty ?? []).filter((o) => ofertaAktualna(o) && podejrzanyRynek(o, nr) === null);
import { wpisKatalogu } from './katalog.js';

// Odsiew ofert, które niemal na pewno dotyczą czegoś innego niż zestaw
// (akcesoria, gabloty, instrukcje, zbiorcze aukcje). Reguły i progi mieszkają
// w odsiew.js, żeby serwis i skrypt kontrolny liczyły dokładnie to samo –
// listę odrzuconych z linkami do aukcji wypisuje `node scripts/kontrola-ofert.mjs`.
import { odsiej } from './odsiew.js';

/**
 * Cena katalogowa na potrzeby odsiewu – dokładnie ta sama, którą pokazuje strona.
 *
 * Musi iść pełnym łańcuchem źródeł z cenaKatalogowaSetu (rrp_potwierdzone ->
 * sety -> ceny_baza -> katalog). Wcześniej pomijała dwa pierwsze i czytała
 * tylko źródła generowane, więc dla setu z ręcznie poprawionym RRP filtr liczył
 * próg od starej ceny z backfillu, a strona pokazywała nową – odsiew mógł
 * przepuścić podszywkę albo (gorzej) uciąć prawdziwą ofertę.
 */
const katalogowaDoOdsiewu = (nr) => cenaKatalogowaSetu(nr, { sety: setyDane });

/**
 * Oferty sklepowe z migawki feedów dla jednego setu.
 * Obsługuje oba formaty wpisu: nowy `oferty: {sklep: cena}` (per sklep,
 * wypełnia go Łowca od 2026-08-15) i starszy pojedynczy `cena`+`sklep`.
 *
 * `nr` jest opcjonalny wyłącznie dla zgodności wstecznej – bez niego działa
 * tylko reguła A odsiewu, więc wszystkie wywołania w serwisie go podają.
 */
export function ofertyZFeedu(wpisFeedu, nr = null) {
  if (!wpisFeedu) return [];
  const { data } = wpisFeedu;
  // Data per sklep (`daty: {lego: '2026-09-15'}`), gdy sklep odświeża się w innym
  // rytmie niż reszta feedu (LEGO.com co tydzień z listingu lego.pl, reszta
  // codziennie od Łowcy); bez wpisu w `daty` obowiązuje wspólna `data`.
  const daty = wpisFeedu.daty && typeof wpisFeedu.daty === 'object' ? wpisFeedu.daty : {};
  const surowe =
    wpisFeedu.oferty && typeof wpisFeedu.oferty === 'object'
      ? Object.entries(wpisFeedu.oferty)
          .filter(([, cena]) => typeof cena === 'number' && cena > 0)
          .map(([sklep, cena]) => ({ sklep, cena, data: daty[sklep] ?? data }))
      : wpisFeedu.cena
        ? [{ sklep: wpisFeedu.sklep, cena: wpisFeedu.cena, data }]
        : [];
  return odsiej(surowe, katalogowaDoOdsiewu(nr));
}

/**
 * Pełna lista ofert do tabeli cen: redakcyjne z sety.json + feedowe,
 * jeden wiersz na sklep – przy dublu wygrywa niższa cena (jak w najlepszaOferta).
 */
export function polaczOferty(ofertySetu = [], wpisFeedu = null, nr = null) {
  const perSklep = new Map();
  for (const o of filtrujOferty([...ofertySetu, ...ofertyZFeedu(wpisFeedu, nr)], nr)) {
    const stara = perSklep.get(o.sklep);
    if (!stara || o.cena < stara.cena) perSklep.set(o.sklep, o);
  }
  return [...perSklep.values()];
}

/**
 * Najniższa aktualna oferta zestawu albo null. Zwraca { sklep, cena, data }.
 *
 * Pomija Ceneo: to porównywarka, a nie sklep – jej cena jest najniższą ofertą
 * rynkową (często ze sklepu, do którego sami nie linkujemy), więc na listach
 * z ceną "od" wprowadzałaby w błąd. Ceneo pokazujemy wyłącznie jako ostatni
 * wiersz pełnej tabeli cen (TabelaCen.astro).
 */
export function najlepszaOferta(nr, { sety = {}, feed = {} } = {}) {
  const klucz = String(nr);
  const kandydaci = filtrujOferty([...(sety[klucz]?.oferty ?? []), ...ofertyZFeedu(feed[klucz], klucz)], klucz).filter(
    (o) => o.sklep !== 'ceneo',
  );
  return kandydaci.reduce((a, o) => (a === null || o.cena < a.cena ? o : a), null);
}

/**
 * Oficjalna cena katalogowa LEGO albo null.
 *
 * Cena katalogowa nie zmienia się w czasie – raz poprawnie ustalona zostaje
 * na zawsze. Dlatego pierwszeństwo ma rejestr `rrp_potwierdzone.json`:
 * ceny sprawdzone u źródła przez człowieka, których żaden backfill ani runner
 * nie nadpisze. Dopiero pod nim stoją źródła generowane.
 *
 * Kolejność źródeł:
 *   1. rrp_potwierdzone.json – potwierdzone przez człowieka (write-once)
 *   2. sety.json            – redakcyjne, weryfikowane ręcznie
 *   3. ceny_baza.json       – baza Łowcy, zrekonstruowana z sety.json
 *   4. katalog.json         – backfill historyczny, wypełniany partiami per
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
 *   lego     – bezpośredni adres produktu na lego.com,
 *   xkom     – wyszukiwarka x-kom z uniwersalnym kodem SalesMasters,
 *   allegro  – link kampanii afiliacyjnej,
 *   smyk     – deeplink Adtraction na kategorię LEGO,
 *   empik    – deeplink Tradedoubler na wyszukiwarkę numeru,
 *   ceneo    – deeplink Tradedoubler na wyszukiwarkę numeru.
 * Lista musi zostać zgodna z workerem – inaczej strona pominie sklep, do
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

// Sklepy, do których linkujemy BEZ prowizji – `rel` nie może wtedy mówić
// „sponsored", bo link nie jest opłacony.
//   lego  – LEGO.com nie ma programu w naszym miksie, linkujemy wprost.
//   smyk  – program w Adtraction jest aktywny, ale deeplink nie dowozi na
//           produkt (Adtraction gubi docelowy adres w handoffie do
//           netSalesMedia i klient ląduje na stronie głównej). Od 28.08.2026
//           linkujemy wprost na kartę produktu i świadomie rezygnujemy z
//           prowizji. Gdy deeplink zacznie działać, usunąć 'smyk' z tego zbioru.
const SKLEPY_BEZ_PROWIZJI = new Set(['lego', 'smyk']);

// Karta produktu na lego.pl po EOL (zasada Marka 16.09.2026). Zestaw wycofany
// zostaje w tabeli z ceną katalogową, linkiem i dopiskiem „brak w sprzedaży",
// bo na lego.pl dalej są zdjęcia, opis i wymiary — czytelnik ma po co tam pójść
// (75377 Niewidzialna ręka: karta żyje, na niej „Produkcja zakończona").
// Link znika dopiero, gdy karty nie ma; takie numery trzyma
// `lego_strony_brak.json`, uzupełniane przez scripts/lego-strony.mjs.
const BEZ_STRONY_LEGO = new Set((legoBezStrony.bez_strony ?? []).map(String));

/** Czy na lego.pl jest jeszcze karta produktu (zdjęcia, opis) tego zestawu. */
export const legoMaStrone = (nr) => !BEZ_STRONY_LEGO.has(String(nr));

/** Wartość atrybutu rel dla linku do sklepu – „sponsored" tylko gdy zarabiamy. */
export function relLinku(sklep, nr) {
  if (SKLEPY_BEZ_PROWIZJI.has(sklep)) return 'nofollow';
  return linkAfiliacyjny(sklep, nr) ? 'sponsored nofollow' : 'nofollow';
}

/**
 * Link „gdzie kupić" dla zestawu bez znanej ceny – bierzemy pierwszy sklep,
 * który w ogóle ma ten numer w redirects.json.
 */
export function jakikolwiekLink(nr) {
  const klucz = String(nr);
  // Ceneo na końcu kolejki – link do porównywarki jest lepszy niż brak linku,
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
