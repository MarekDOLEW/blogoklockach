// Dobór tekstów do bloku „Przeczytaj też" pod artykułem, prezentownikiem
// i postem dealowym (komponent src/components/PowiazaneArtykuly.astro).
//
// Po co: do 09.09.2026 artykuły linkowały wyłącznie do hubów zestawów, nigdy
// do siebie – moc i robot zatrzymywały się na jednym tekście. Cztery statyczne
// linki między tekstami to najtańszy sposób, żeby Google przechodził z jednego
// artykułu do następnego, a czytelnik został na stronie.
//
// Kolejność doboru (Marek 11.10.2026) — ścisłe priorytety, nie suma punktów:
//   1. wspólna seria GŁÓWNA (`serieGlowne` z teksty.js: frontmatter `seria`
//      albo seria z co najmniej 40% zestawów tekstu),
//   2. ten sam typ (kategoria: Recenzje ↔ Recenzje, Rankingi ↔ Rankingi, Deal ↔ Deal),
//      a przy innej kategorii: tekst redakcyjny woli redakcyjny, deal/aktualność — krótką formę,
//   3. liczba wspólnych zestawów,
//   4. świeższa data.
// Do 10.10 punkty się sumowały (3 × zestaw + 2 × seria + 1 × kategoria), więc
// zbiorczy news o promocji z 64 zestawami z kilkunastu serii wygrywał z każdą
// recenzją: recenzja Yody 75438 linkowała do kodu Media Expert zamiast do
// rankingu Star Wars i historii licencji SW.
// Posty dealowe opisują cenę z konkretnego dnia, więc jako kandydaci liczą się
// tylko przez DEAL_DNI od publikacji – link do dealu sprzed miesiąca wprowadza
// czytelnika w błąd (ta sama zasada co w artykuly-setow.js).

import { teksty } from './teksty.js';

export const ILE_DOMYSLNIE = 4;
const DEAL_DNI = 30;
const KROTKIE = new Set(['Deal', 'Aktualności']);

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

  // typ: ta sama kategoria = 2; ta sama grupa (redakcyjne vs krótkie formy) = 1.
  // Recenzja woli ranking niż post dealowy tej samej serii — deal żyje dni,
  // ranking lata, a blok ma prowadzić do tekstu, który dalej jest aktualny.
  const grupa = (k) => (KROTKIE.has(k) ? 'krotkie' : 'redakcyjne');
  const typ = (t) => (t.kategoria === biezacy.kategoria ? 2 : grupa(t.kategoria) === grupa(biezacy.kategoria) ? 1 : 0);
  const klucz = (t) => [
    wspolne(biezacy.serieGlowne, t.serieGlowne) > 0 ? 1 : 0,
    typ(t),
    wspolne(biezacy.sety, t.sety),
  ];
  const porownaj = (a, b) => {
    for (let i = 0; i < a.k.length; i += 1) if (a.k[i] !== b.k[i]) return b.k[i] - a.k[i];
    return a.t.data < b.t.data ? 1 : a.t.data > b.t.data ? -1 : 0;
  };

  return kandydaci
    .map((t) => ({ t, k: klucz(t) }))
    .sort(porownaj)
    .slice(0, ile)
    .map((x) => x.t);
}
