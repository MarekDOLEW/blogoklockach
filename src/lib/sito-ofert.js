// Sito ofert — jedno źródło reguł dla hubów (src/lib/oferty.js, w grafie Astro) i dla
// tabel cen w artykułach (scripts/remark-ceny.mjs, plugin poza grafem modułów).
// Moduł nie importuje danych: dostaje je w argumentach, więc działa w obu światach.
// Od 06.11.2026 (Marek: „tabele w artykułach powinny brać te same rzeczy i tak samo
// często co huby”) — wcześniej remark-ceny miał własną, uboższą kopię reguł: bez
// sita 14 dni, bez „podejrzanego rynku” i z jedną datą feedu dla wszystkich sklepów,
// przez co artykuł BW3 pokazywał 43303 za 19,99 zł, które hub ukrywał.

export const MAX_WIEK_OFERTY_DNI = 14;
export const PROG_PODEJRZANEGO_RYNKU = 0.5;
export const DNI_LISTINGU = 14;
/** Sklepy wyłączone ze strony (Ceneo: decyzja Marka 06.11.2026, D1). Dane zostają. */
export const SKLEPY_WYLACZONE = new Set(['ceneo']);

/** Świeża oferta: `wazne_do` rządzi, gdy jest; inaczej najwyżej 14 dni od `data`. */
export function ofertaAktualna(o, terazMs = Date.now()) {
  if (o?.wazne_do) {
    const koniec = Date.parse(o.wazne_do);
    if (!Number.isNaN(koniec)) return terazMs <= koniec + 864e5;
  }
  if (!o?.data) return true;
  const ms = Date.parse(o.data);
  return Number.isNaN(ms) || (terazMs - ms) / 864e5 <= MAX_WIEK_OFERTY_DNI;
}

/** Powód „podejrzanego rynku” (cena < 50% potwierdzonej katalogowej bez potwierdzenia) albo null. */
export function powodPodejrzanegoRynku(o, nr, { rrpPotwierdzone = {}, dealePotwierdzone = {} } = {}) {
  const klucz = String(nr ?? '');
  const rrp = rrpPotwierdzone[klucz]?.cena;
  if (!rrp || !(o?.cena > 0) || o.cena >= PROG_PODEJRZANEGO_RYNKU * rrp) return null;
  const p = dealePotwierdzone.potwierdzone?.[klucz];
  if (p && o.cena >= p.cena - 0.01) return null;
  return `${Math.round(100 * (1 - o.cena / rrp))}% poniżej potwierdzonej ceny katalogowej (${rrp} zł) bez potwierdzenia w deale_potwierdzone.json`;
}

/** LEGO.com ma zestaw chwilowo wyprzedany (świeża etykieta listingu, zestaw nie jest EOL). */
export function wyprzedaneWLegoZ(wpisKatalogu, eol, terazMs = Date.now()) {
  if (wpisKatalogu?.lego_pl_etykieta !== 'niedostepne' || eol) return false;
  const ms = Date.parse(wpisKatalogu?.lego_pl_widziano ?? '');
  return !Number.isNaN(ms) && (terazMs - ms) / 864e5 <= DNI_LISTINGU;
}

/** Surowe oferty z wpisu oferty_feed.json — data per sklep (`daty`), inaczej wspólna `data`. */
export function suroweZFeedu(wpis) {
  if (!wpis) return [];
  const { data } = wpis;
  const daty = wpis.daty && typeof wpis.daty === 'object' ? wpis.daty : {};
  if (wpis.oferty && typeof wpis.oferty === 'object')
    return Object.entries(wpis.oferty)
      .filter(([, cena]) => typeof cena === 'number' && cena > 0)
      .map(([sklep, cena]) => ({ sklep, cena, data: daty[sklep] ?? data }));
  return wpis.cena ? [{ sklep: wpis.sklep, cena: wpis.cena, data }] : [];
}

/** Jeden wiersz na sklep — przy dublu wygrywa niższa cena. */
export function najtanszaPerSklep(lista) {
  const perSklep = new Map();
  for (const o of lista) {
    const stara = perSklep.get(o.sklep);
    if (!stara || o.cena < stara.cena) perSklep.set(o.sklep, o);
  }
  return [...perSklep.values()];
}

/** Aktywny kod rabatowy, który sklep wlicza w pokazywaną cenę (±1 zł), albo null. */
export function kodRabatowyZ(kodyRabatowe, sklep, nr, cena, dzis = new Date().toISOString().slice(0, 10)) {
  for (const k of kodyRabatowe?.[sklep] ?? []) {
    if (k.do < dzis) continue;
    const zKodem = k.zestawy?.[String(nr)];
    if (zKodem != null && (cena == null || Math.abs(Number(cena) - zKodem) <= 1)) return { kod: k.kod, do: k.do, koniecZnany: k.koniec_znany !== false };
  }
  return null;
}

/** Listing lego.pl pokazał zestaw w ostatnich `dni` dniach (pole katalogu `lego_pl_widziano`). */
export function widzianyNaListinguZ(wpisKatalogu, dni = DNI_LISTINGU, terazMs = Date.now()) {
  const ms = Date.parse(wpisKatalogu?.lego_pl_widziano ?? '');
  return !Number.isNaN(ms) && (terazMs - ms) / 864e5 <= dni;
}

/**
 * EOL w LEGO — ta sama reguła co eolWLego w src/lib/status.js: wpis „wycofany” z listy wycofań,
 * chyba że listing lego.pl widział zestaw w ostatnich 14 dniach (wtedy LEGO wciąż sprzedaje);
 * wpis odwołany się nie liczy; bez wpisu rozstrzyga status `eol` w katalogu.
 */
export function eolWLegoZ(wpisWycofania, wpisKatalogu, terazMs = Date.now()) {
  const w = wpisWycofania && wpisWycofania.kiedy !== 'odwołane' ? wpisWycofania : null;
  if (w) return w.kiedy === 'wycofany' && !widzianyNaListinguZ(wpisKatalogu, DNI_LISTINGU, terazMs);
  return wpisKatalogu?.status === 'eol';
}
