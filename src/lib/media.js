// Wspólne źródło zdjęć i opisów zestawów.
//
// Kolejność priorytetów przy zdjęciu:
//   1. sety.json  -> pole `zdjecia.glowne` (najświeższe; aktualizuje je Łowca Promocji z feedów)
//   2. oferty_feed.json -> migawka feedów sklepowych
//   3. zdjecia.json -> mapa zbiorcza (Planeta Klocków / Media Expert / Rebrickable)
//
// Opisy (opisy.json) są generowane z danych katalogu własnymi słowami – używamy ich
// tylko tam, gdzie nie ma redakcyjnego opisu w sety.json, żeby nie nadpisywać tekstów
// pisanych ręcznie.

import zdjeciaMapa from '../data/zdjecia.json';
import opisyMapa from '../data/opisy.json';
import wycofaniaDane from '../data/wycofania.json';
import { wpisKatalogu } from './katalog.js';

const wycofaniaFoto = new Map(
  (wycofaniaDane.wycofania ?? []).filter((w) => w.zdjecie).map((w) => [w.numer, w.zdjecie]),
);

/**
 * Zdjęcie zestawu z fallbackiem. Zwraca { url, zrodlo } albo null.
 * URL wskazuje NASZĄ trasę /img/<numer>.jpg – worker serwuje kopię z cache
 * Cloudflare zamiast hotlinkować do sklepów (mapę numer->źródło buduje
 * scripts/generuj-obrazy.mjs z tych samych priorytetów).
 */
// Klucze, które worker umie podać pod /img/ — ten sam wzorzec co w src/worker.js
// (od 27.09.2026 także literowe i warianty: 850, ARENDELLE, 4496-2). Klucz spoza
// wzorca dostałby 404, więc wtedy null i zastępczy klocek zamiast zepsutego obrazka.
const KLUCZ_WORKERA = /^[A-Za-z0-9]{1,24}(?:-[0-9]{1,2})?$/;

export function zdjecieSetu(nr, { sety = {}, feed = {} } = {}) {
  const klucz = String(nr);
  if (!KLUCZ_WORKERA.test(klucz)) return null;

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

/** Sam URL zdjęcia albo null – skrót tam, gdzie źródło nie jest potrzebne. */
export function urlZdjecia(nr, zrodla) {
  return zdjecieSetu(nr, zrodla)?.url ?? null;
}

// Opisy generowane (opisy.json, 22.09.2026) mają zdania o dostępności i o wieku
// zestawu zapisane w dniu generowania: „Nie ma go już w śledzonych sklepach”,
// „dziś dostępny głównie z drugiej ręki”, „Tegoroczna premiera”. Stały obok żywej
// tabeli cen i jej przeczyły (audyt tekstów 30.09.2026: 60339 „z drugiej ręki”
// obok Empiku −50% na /promocje-lego/). Dostępność pokazuje tabela, więc takie
// zdania wypadają, a każde zdanie o roczniku sprowadzamy do „Zestaw z 2021 roku.” –
// bez ocen („wyraźnie kolekcjonerski”, „Klasyk”) i bez czasu względnego, który
// starzeje się sam. Dane w opisy.json zostają nietknięte (append-only).
const ZDANIA_O_DOSTEPNOSCI = [
  /^Poza bieżącą ofertą/,
  /^Nie ma go już w śledzonych sklepach/,
  /^Wycofany z bieżącej oferty/,
  /^Nie widzimy go w żadnym ze śledzonych feedów/,
  /^Jest w bieżącej ofercie/,
  /^Aktualnie w sprzedaży/,
  /^Wciąż dostępny w sklepach/,
];
const ZDANIE_O_ROCZNIKU =
  /^(Zestaw z \d{4} roku\s*[,–]|Premiera w \d{4} roku|Rocznik \d{4}|Premiera w zeszłym roku|Tegoroczna premiera|Zestaw z bieżącego rocznika|Klasyk z \d{4} roku)/;

/** Oczyszcza opis generowany; `rok` z katalogu dla zdań bez liczby („Tegoroczna premiera”). */
export function oczyscOpisGenerowany(tekst, rok = null) {
  const zdania = String(tekst ?? '').replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/);
  const wynik = [];
  let bylRocznik = false;
  for (let z of zdania) {
    if (!z || ZDANIA_O_DOSTEPNOSCI.some((r) => r.test(z))) continue;
    if (ZDANIE_O_ROCZNIKU.test(z)) {
      const r = z.match(/\b(19[4-9]\d|20\d\d)\b/)?.[1] ?? (rok ? String(rok) : null);
      if (r && !bylRocznik) wynik.push(`Zestaw z ${r} roku.`);
      bylRocznik = true;
      continue;
    }
    // „598 elementów, czyli okolice mediany serii City.” – żargon statystyczny
    z = z.replace(/^(\d[\d  ]*\s+element\S*), czyli okolice mediany (serii|linii) (.+)\.$/, '$1 to rozmiar typowy dla $2 $3.');
    // „Zestaw średniej wielkości – 22 elementy.” – przy małych zestawach absurd
    const sredni = z.match(/^Zestaw średniej wielkości – (\d[\d  ]*)\s+(element\S*)\.$/);
    if (sredni && Number(sredni[1].replace(/\D/g, '')) < 150) z = `Niewielki zestaw: ${sredni[1]} ${sredni[2]}.`;
    wynik.push(z);
  }
  return wynik.join(' ').trim() || null;
}

/** Opis zestawu: redakcyjny z sety.json ma pierwszeństwo nad generowanym. */
export function opisSetu(nr, { sety = {}, rok = null } = {}) {
  const klucz = String(nr);
  const redakcyjny = sety[klucz]?.opis;
  if (redakcyjny) return { tekst: redakcyjny, generowany: false };

  const generowany = opisyMapa[klucz];
  if (typeof generowany === 'string' && generowany.trim()) {
    const tekst = oczyscOpisGenerowany(generowany, rok ?? wpisKatalogu(klucz)?.rok ?? null);
    return tekst ? { tekst, generowany: true } : null;
  }

  return null;
}

// ── Warianty skalowane (audyt PageSpeed 7.10.2026) ─────────────────────────
//
// Worker oddaje pod /img/<klucz>.jpg?w=<szerokość> obraz przeskalowany przez
// Cloudflare Image Transformations w formacie AVIF/WebP/JPEG dobranym do
// przeglądarki. Dozwolone szerokości to ta sama lista, co w src/worker.js —
// inna wartość oddałaby oryginał. Adresy spoza /img/ (zewnętrzne) zostają bez
// zmian, bo nie przechodzą przez worker.
export const SZEROKOSCI_OBRAZOW = [130, 260, 440, 600, 880, 1200];

const naszObraz = (url) => typeof url === 'string' && url.startsWith('/img/') && !url.includes('?');

/** Adres wariantu o zadanej szerokości (albo oryginał, gdy nie da się skalować). */
export function wariantObrazu(url, szerokosc) {
  return naszObraz(url) && SZEROKOSCI_OBRAZOW.includes(szerokosc) ? `${url}?w=${szerokosc}` : url;
}

/**
 * Atrybuty <img> dla obrazu o stałym rozmiarze w CSS: `src` w szerokości 1x,
 * `srcset` z wariantem 2x dla ekranów o podwójnej gęstości.
 */
export function obrazStaly(url, szer1x, szer2x) {
  if (!naszObraz(url)) return { src: url };
  return { src: wariantObrazu(url, szer1x), srcset: `${wariantObrazu(url, szer1x)} 1x, ${wariantObrazu(url, szer2x)} 2x` };
}

/**
 * Atrybuty <img> dla obrazu płynnego (szerokość zależna od okna): `srcset`
 * z deskryptorami `w` i podany `sizes`.
 */
export function obrazPlynny(url, szerokosci, sizes) {
  if (!naszObraz(url)) return { src: url };
  return {
    src: wariantObrazu(url, szerokosci[0]),
    srcset: szerokosci.map((w) => `${wariantObrazu(url, w)} ${w}w`).join(', '),
    sizes,
  };
}
