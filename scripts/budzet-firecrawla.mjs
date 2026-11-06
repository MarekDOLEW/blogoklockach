// Domyślne limity kart Firecrawla zależne od daty.
//
// Historia decyzji:
//   06.11.2026 (D2 „tnij”): audyt liczył, że 3 081 kredytów przy ~190 dziennie skończy się
//   ok. 22.11, przed Black Friday — limity obcięte do ~3/8 do 20.11.
//   06.11.2026 („przywróć”): odczyt konta (C4) pokazał plan Hobby 5 000/mies. z odnowieniem
//   23.11 i Pay-as-you-go do 20 USD/mies. — tydzień Black Friday startuje ze świeżą pulą, więc
//   do 30.11 wracają pełne limity. Od 01.12 zostaje połowa (poza sezonem).
// Jawne `--limit N` w wywołaniu zawsze wygrywa.

const OKNA = [{ do: '2026-11-30', mnoznik: 1 }];
const PO_SEZONIE = 0.5;

export function limitDomyslny(pelny, dzis = new Date().toISOString().slice(0, 10)) {
  const okno = OKNA.find((o) => dzis <= o.do);
  return Math.max(1, Math.round(pelny * (okno ? okno.mnoznik : PO_SEZONIE)));
}
