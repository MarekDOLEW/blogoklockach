// Huby zestawów pogrupowane po serii – do sekcji „Podobne zestawy z serii"
// na /zestaw/<nr>/ (linkowanie wewnętrzne między hubami tej samej serii).
//
// Kolejność w serii: najpierw huby indeksowalne (src/lib/seo.js) – to do nich
// chcemy prowadzić robota – dalej te z aktualną ofertą, a w obrębie grupy
// nowsze numery katalogowe pierwsze. Mapa liczy się raz na build.

import sety from '../data/sety.json';
import ofertyFeed from '../data/oferty_feed.json';
import { numeryHubow, wycofanieSetu } from './huby.js';
import { wpisKatalogu } from './katalog.js';
import { najlepszaOferta, cenaKatalogowaSetu } from './oferty.js';
import { hubIndeksowalny } from './seo.js';
import { urlZdjecia } from './media.js';
import { eolWLego, eolPotwierdzony } from './status.js';

const feed = ofertyFeed?.sety ?? {};

const seriaHubu = (nr) => sety[nr]?.seria ?? wpisKatalogu(nr)?.seria ?? wycofanieSetu(nr)?.seria ?? null;
const nazwaHubu = (nr) => sety[nr]?.nazwa ?? wpisKatalogu(nr)?.nazwa ?? wycofanieSetu(nr)?.nazwa ?? null;

let mapa = null;
function zbuduj() {
  const m = new Map();
  for (const nr of numeryHubow) {
    const seria = seriaHubu(nr);
    const nazwa = nazwaHubu(nr);
    if (!seria || !nazwa) continue;
    const oferta = najlepszaOferta(nr, { sety, feed });
    const wpis = {
      nr,
      nazwa,
      seria,
      indeksowalny: hubIndeksowalny(nr),
      cena: oferta?.cena ?? null,
      cenaKatalogowa: cenaKatalogowaSetu(nr, { sety }),
      zdjecie: urlZdjecia(nr, { sety, feed }),
      eolLego: eolWLego(nr),
      eolPewny: eolPotwierdzony(nr),
    };
    if (!m.has(seria)) m.set(seria, []);
    m.get(seria).push(wpis);
  }
  for (const lista of m.values()) {
    lista.sort(
      (a, b) =>
        Number(b.indeksowalny) - Number(a.indeksowalny) ||
        Number(b.cena !== null) - Number(a.cena !== null) ||
        Number(b.nr) - Number(a.nr),
    );
  }
  return m;
}

/** Do `ile` innych zestawów tej serii (bez `nr`): [{ nr, nazwa, cena, indeksowalny }]. */
export function inneZSerii(seria, nr, ile = 6) {
  if (!seria) return [];
  mapa ??= zbuduj();
  return (mapa.get(seria) ?? []).filter((w) => w.nr !== String(nr)).slice(0, ile);
}

// Generator liczb pseudolosowych z ziarnem (mulberry32) – ten sam, którego
// używa strona główna do rotacji deali. Ziarno = numer zestawu + dzień builda:
// każdy hub ma własny, stabilny w ciągu dnia dobór sąsiadów, a kolejny build
// (runnery pushują codziennie) tasuje go na nowo.
function losZZiarnem(ziarno) {
  let a = ziarno | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const DZIEN = Number(new Date().toISOString().slice(0, 10).replaceAll('-', ''));

/**
 * Losowy dobór 4–6 podobnych zestawów z tej samej serii (bez `nr`).
 *
 * Losujemy najpierw spośród pozycji, które mają zdjęcie i aktualną ofertę
 * (takie kafelki niosą coś czytelnikowi), a dopiero gdy ich brakuje – z reszty.
 * Liczba kafelków (4–6) też jest losowana, żeby sekcja nie wyglądała na
 * szablon. Zestaw bez żadnego sąsiada w serii dostaje pustą listę.
 */
export function podobneZSerii(seria, nr, { min = 4, max = 6 } = {}) {
  if (!seria) return [];
  mapa ??= zbuduj();
  const pula = (mapa.get(seria) ?? []).filter((w) => w.nr !== String(nr));
  if (!pula.length) return [];
  const los = losZZiarnem(Number(nr) * 31 + DZIEN);
  const ile = Math.min(pula.length, min + Math.floor(los() * (max - min + 1)));
  const tasuj = (lista) => {
    const kopia = [...lista];
    for (let i = kopia.length - 1; i > 0; i -= 1) {
      const j = Math.floor(los() * (i + 1));
      [kopia[i], kopia[j]] = [kopia[j], kopia[i]];
    }
    return kopia;
  };
  const pelne = tasuj(pula.filter((w) => w.zdjecie && w.cena !== null));
  const reszta = tasuj(pula.filter((w) => !(w.zdjecie && w.cena !== null)));
  return [...pelne, ...reszta].slice(0, ile);
}
