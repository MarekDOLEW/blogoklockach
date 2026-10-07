// Dobór tekstów do bloku „Przeczytaj też" pod artykułem, prezentownikiem
// i postem dealowym (komponent src/components/PowiazaneArtykuly.astro).
//
// Po co: do 09.09.2026 artykuły linkowały wyłącznie do hubów zestawów, nigdy
// do siebie – moc i robot zatrzymywały się na jednym tekście. Cztery statyczne
// linki między tekstami to najtańszy sposób, żeby Google przechodził z jednego
// artykułu do następnego, a czytelnik został na stronie.
//
// Kolejność doboru (skill: seria → wspólne zestawy → najnowsze):
//   +3 za każdy wspólny zestaw (link do tego samego huba),
//   +2 za każdą wspólną serię,
//   +1 za tę samą kategorię,
//   remis rozstrzyga świeższa data.
// Posty dealowe opisują cenę z konkretnego dnia, więc jako kandydaci liczą się
// tylko przez DEAL_DNI od publikacji – link do dealu sprzed miesiąca wprowadza
// czytelnika w błąd (ta sama zasada co w artykuly-setow.js).

import { teksty } from './teksty.js';

export const ILE_DOMYSLNIE = 4;
const DEAL_DNI = 30;

const wspolne = (a, b) => [...a].filter((x) => b.has(x)).length;

const swiezyDeal = (t, dzis) => {
  if (t.sekcja !== 'deale') return true;
  const wiek = (dzis - new Date(t.data)) / 86400000;
  return Number.isFinite(wiek) && wiek <= DEAL_DNI;
};

/**
 * Teksty powiązane z tekstem pod adresem `url` (z ukośnikiem na końcu).
 * Zwraca do `ile` wpisów w kształcie z teksty.js; gdy dopasowań brakuje,
 * dopełnia najnowszymi tekstami (bez bieżącego).
 */
export function powiazane(url, { ile = ILE_DOMYSLNIE, dzis = new Date() } = {}) {
  const wszystkie = teksty();
  const biezacy = wszystkie.find((t) => t.url === url);
  const kandydaci = wszystkie.filter((t) => t.url !== url && swiezyDeal(t, dzis));
  if (!biezacy) return kandydaci.slice(0, ile);

  const ocena = (t) =>
    3 * wspolne(biezacy.sety, t.sety) +
    2 * wspolne(biezacy.serie, t.serie) +
    (t.kategoria === biezacy.kategoria ? 1 : 0);

  return kandydaci
    .map((t) => ({ t, p: ocena(t) }))
    .sort((a, b) => b.p - a.p || (a.t.data < b.t.data ? 1 : a.t.data > b.t.data ? -1 : 0))
    .slice(0, ile)
    .map((x) => x.t);
}
