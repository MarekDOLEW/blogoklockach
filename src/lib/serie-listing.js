// Listing serii: podział na aktualne i archiwalne + kafle z fotkami.
//
// Decyzja Marka 15.09.2026: serie archiwalne nie wchodzą do głównego listingu
// /serie/ („zaburza to odbiór”) — mają własną stronę /serie/archiwalne/, do
// której prowadzi przycisk przy nagłówku. Archiwalna = seria, której nie ma na
// listingu lego.pl, czyli bez ani jednego zestawu ze statusem `dostepny`
// w katalog.json (statusy z lego.com, audyt 13.09; cotygodniowy zaciąg lego.pl
// będzie je odświeżał). Wyjątek: seria z zestawami śledzonymi w sety.json liczy
// się jako aktualna, nawet gdy katalog jeszcze jej nie zna.

import sety from '../data/sety.json';
import katalog from '../data/katalog.json';
import ofertyFeed from '../data/oferty_feed.json';
import { urlZdjecia } from './media.js';

const feed = ofertyFeed?.sety ?? {};
const LICZBA_FOTEK = 3;

export const slugSerii = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');

/** „1 zestaw", „3 zestawy", „21 zestawów" – polska odmiana liczebnika */
export const odmienZestaw = (n) => {
  if (n === 1) return 'zestaw';
  const dziesiatki = n % 100;
  const jednosci = n % 10;
  return jednosci >= 2 && jednosci <= 4 && !(dziesiatki >= 12 && dziesiatki <= 14) ? 'zestawy' : 'zestawów';
};

const wszystkieSerie = () => {
  const zSetow = Object.values(sety).map((s) => s.seria).filter(Boolean);
  const zKatalogu = Object.keys(katalog).filter((k) => k !== '_meta');
  return [...new Set([...zSetow, ...zKatalogu])].sort((a, b) => a.localeCompare(b, 'pl'));
};

/** Czy seria jest archiwalna: brak zestawów w ofercie lego.pl i brak śledzonych w sety.json. */
export function seriaArchiwalna(seria) {
  const wSetach = Object.values(sety).some((s) => s.seria === seria);
  if (wSetach) return false;
  const lista = katalog[seria] ?? [];
  return !lista.some((s) => s.status === 'dostepny');
}

const sledzone = (seria) =>
  Object.entries(sety)
    .filter(([, s]) => s.seria === seria)
    .map(([nr, s]) => ({ nr, premiera: s.premiera ?? '' }))
    .sort((a, b) => b.premiera.localeCompare(a.premiera));

// Kafel serii pokazuje zdjęcia jej najświeższych zestawów – obrazek mówi
// o serii więcej niż sama nazwa. Kolejność kandydatów: najpierw zestawy
// śledzone cenowo, potem reszta katalogu po roku (dla serii archiwalnych
// także wycofane – innych nie ma). Bierzemy tylko te ze zdjęciem.
const zKatalogu = (seria, archiwalna) =>
  (katalog[seria] ?? [])
    .filter((s) => archiwalna || s.status !== 'eol')
    .slice()
    .sort((a, b) => (b.rok ?? 0) - (a.rok ?? 0))
    .map((s) => ({ nr: s.numer, premiera: String(s.rok ?? '') }));

/** Kafle do listingu: `archiwalne=false` → serie aktualne, `true` → archiwalne. */
export function kafleSerii(archiwalne = false) {
  return wszystkieSerie()
    .filter((seria) => seriaArchiwalna(seria) === archiwalne)
    .map((seria) => {
      const kandydaci = [...sledzone(seria), ...zKatalogu(seria, archiwalne)];
      const foty = [];
      const uzyte = new Set();
      for (const k of kandydaci) {
        if (foty.length >= LICZBA_FOTEK || uzyte.has(k.nr)) continue;
        const url = urlZdjecia(k.nr, { sety, feed });
        if (!url) continue;
        uzyte.add(k.nr);
        foty.push(url);
      }
      const liczba = (katalog[seria] ?? []).length || Object.values(sety).filter((s) => s.seria === seria).length;
      const lata = (katalog[seria] ?? []).map((s) => s.rok).filter(Boolean);
      return { seria, url: `/serie/${slugSerii(seria)}/`, foty, liczba, rokOd: lata.length ? Math.min(...lata) : null, rokDo: lata.length ? Math.max(...lata) : null };
    });
}
