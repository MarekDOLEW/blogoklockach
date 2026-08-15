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

/** Zdjęcie zestawu z fallbackiem. Zwraca { url, zrodlo } albo null. */
export function zdjecieSetu(nr, { sety = {}, feed = {} } = {}) {
  const klucz = String(nr);

  const zHubu = sety[klucz]?.zdjecia?.glowne;
  if (zHubu) return { url: zHubu, zrodlo: sety[klucz]?.zdjecia?.zrodlo ?? null };

  const zFeedu = feed[klucz]?.zdjecie;
  if (zFeedu) return { url: zFeedu, zrodlo: feed[klucz]?.sklep ?? null };

  const zMapy = zdjeciaMapa[klucz];
  if (zMapy?.url) return { url: zMapy.url, zrodlo: zMapy.zrodlo ?? null };

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
