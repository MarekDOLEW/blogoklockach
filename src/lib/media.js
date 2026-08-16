// Wspólne źródło zdjęć i opisów zestawów.
//
// Kolejność priorytetów przy zdjęciu:
//   1. sety.json  -> pole `zdjecia.glowne` (najświeższe; aktualizuje je Łowca Promocji z feedów)
//   2. oferty_feed.json -> migawka feedów sklepowych
//   3. zdjecia.json -> mapa zbiorcza (Planeta Klocków / Media Expert / Rebrickable)
//
// Opisy (opisy.json) są generowane z danych katalogu własnymi słowami — używamy ich
// tylko tam, gdzie nie ma redakcyjnego opisu w sety.json, żeby nie nadpisywać tekstów
// pisanych ręcznie.

import zdjeciaMapa from '../data/zdjecia.json';
import opisyMapa from '../data/opisy.json';
import wycofaniaDane from '../data/wycofania.json';

const wycofaniaFoto = new Map(
  (wycofaniaDane.wycofania ?? []).filter((w) => w.zdjecie).map((w) => [w.numer, w.zdjecie]),
);

/**
 * Zdjęcie zestawu z fallbackiem. Zwraca { url, zrodlo } albo null.
 * URL wskazuje NASZĄ trasę /img/<numer>.jpg — worker serwuje kopię z cache
 * Cloudflare zamiast hotlinkować do sklepów (mapę numer->źródło buduje
 * scripts/generuj-obrazy.mjs z tych samych priorytetów).
 */
export function zdjecieSetu(nr, { sety = {}, feed = {} } = {}) {
  const klucz = String(nr);

  if (sety[klucz]?.zdjecia?.glowne)
    return { url: `/img/${klucz}.jpg`, zrodlo: sety[klucz]?.zdjecia?.zrodlo ?? null };
  if (feed[klucz]?.zdjecie)
    return { url: `/img/${klucz}.jpg`, zrodlo: feed[klucz]?.sklep ?? null };
  if (zdjeciaMapa[klucz]?.url)
    return { url: `/img/${klucz}.jpg`, zrodlo: zdjeciaMapa[klucz].zrodlo ?? null };
  if (wycofaniaFoto.has(klucz))
    return { url: `/img/${klucz}.jpg`, zrodlo: null };

  return null;
}

/** Sam URL zdjęcia albo null — skrót tam, gdzie źródło nie jest potrzebne. */
export function urlZdjecia(nr, zrodla) {
  return zdjecieSetu(nr, zrodla)?.url ?? null;
}

/** Opis zestawu: redakcyjny z sety.json ma pierwszeństwo nad generowanym. */
export function opisSetu(nr, { sety = {} } = {}) {
  const klucz = String(nr);
  const redakcyjny = sety[klucz]?.opis;
  if (redakcyjny) return { tekst: redakcyjny, generowany: false };

  const generowany = opisyMapa[klucz];
  if (typeof generowany === 'string' && generowany.trim()) {
    return { tekst: generowany, generowany: true };
  }

  return null;
}
