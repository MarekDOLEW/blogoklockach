// Data premiery zestawu – jedno źródło dla huba i pluginów.
//
// Po co osobny moduł: zestaw zapowiedziany, ale jeszcze nieobecny w sklepach,
// nie może dostać tabeli „aktualnych cen" z przyciskiem „Sprawdź w sklepie",
// bo taki przycisk prowadzi donikąd. Żeby to rozstrzygnąć, trzeba znać datę
// premiery – a ta bywa w trzech różnych miejscach, zależnie od tego, jak
// daleko zestaw jest w naszym procesie redakcyjnym.
//
// Kolejność źródeł:
//   1. sety.json  -> pole `premiera` ("2027-01"), najpewniejsze,
//   2. karta redakcyjna -> metryka „Premiera" ("1 stycznia 2027"),
//   3. katalog -> sam rocznik; wtedy wiemy tylko, czy to przyszły rok.

import sety from '../data/sety.json';
import karty from '../data/karty_setow.json';
import katalogCaly from '../data/katalog.json';

const katalogIdx = new Map();
for (const [seria, lista] of Object.entries(katalogCaly)) {
  if (seria === '_meta' || !Array.isArray(lista)) continue;
  for (const s of lista) katalogIdx.set(s.numer, s);
}

const MIESIACE = {
  stycznia: '01', lutego: '02', marca: '03', kwietnia: '04', maja: '05', czerwca: '06',
  lipca: '07', sierpnia: '08', września: '09', października: '10', listopada: '11', grudnia: '12',
};

const dzis = new Date();
/** Bieżący miesiąc w formacie „2026-09" – do porównań z datą premiery. */
export const BIEZACY_MIESIAC = `${dzis.getFullYear()}-${String(dzis.getMonth() + 1).padStart(2, '0')}`;

/** Premiera jako „RRRR-MM" albo null. */
export function premieraSetu(nr) {
  const klucz = String(nr);
  if (sety[klucz]?.premiera) return sety[klucz].premiera;

  const zKarty = karty[klucz]?.metryka?.Premiera ?? '';
  const dopasowanie = /([a-ząćęłńóśźż]+)\s+(\d{4})/i.exec(zKarty);
  const miesiac = dopasowanie && MIESIACE[dopasowanie[1].toLowerCase()];
  if (miesiac) return `${dopasowanie[2]}-${miesiac}`;

  const rok = katalogIdx.get(klucz)?.rok;
  // sam rocznik nie mówi o miesiącu – przyszły rok traktujemy jako styczeń,
  // bieżący i wcześniejsze zostawiamy bez daty, żeby nie zgadywać wstecz
  return typeof rok === 'number' && rok > dzis.getFullYear() ? `${rok}-01` : null;
}

/** Czy zestaw jest zapowiedzią – premiera w przyszłym miesiącu lub później. */
export function zapowiedz(nr) {
  const premiera = premieraSetu(nr);
  return Boolean(premiera && premiera > BIEZACY_MIESIAC);
}
