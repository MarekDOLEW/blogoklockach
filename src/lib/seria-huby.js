// Huby zestawów pogrupowane po serii – do sekcji „Inne zestawy z serii"
// na /zestaw/<nr>/ (linkowanie wewnętrzne między hubami tej samej serii).
//
// Kolejność w serii: najpierw huby indeksowalne (src/lib/seo.js) – to do nich
// chcemy prowadzić robota – dalej te z aktualną ofertą, a w obrębie grupy
// nowsze numery katalogowe pierwsze. Mapa liczy się raz na build.

import sety from '../data/sety.json';
import ofertyFeed from '../data/oferty_feed.json';
import { numeryHubow, wycofanieSetu } from './huby.js';
import { wpisKatalogu } from './katalog.js';
import { najlepszaOferta } from './oferty.js';
import { hubIndeksowalny } from './seo.js';

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
    const wpis = { nr, nazwa, seria, indeksowalny: hubIndeksowalny(nr), cena: oferta?.cena ?? null };
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
