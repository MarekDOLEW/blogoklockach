// Indeks pełnego katalogu (katalog.json) po numerze zestawu.
//
// Dzięki temu listy, które same nie trzymają roku produkcji (np. wycofania.json),
// mogą pokazać ten sam wiersz meta „seria · rok · elementy" co katalog serii.

import katalog from '../data/katalog.json';

const indeks = new Map();
for (const [seria, lista] of Object.entries(katalog)) {
  if (seria === '_meta' || !Array.isArray(lista)) continue;
  for (const s of lista) {
    if (!indeks.has(s.numer)) indeks.set(s.numer, { ...s, seria });
  }
}

/** Wpis katalogowy { numer, nazwa, rok, elementy, status, seria } albo null. */
export const wpisKatalogu = (nr) => indeks.get(String(nr)) ?? null;

/** Rok premiery zestawu albo null. */
export const rokSetu = (nr) => indeks.get(String(nr))?.rok ?? null;
