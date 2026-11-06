// Domyślne limity kart Firecrawla zależne od daty (decyzja Marka 06.11.2026, D2 „tnij”).
//
// Audyt 06.11: 3 081 kredytów i zużycie ok. 190 dziennie — pula schodziła do zera
// ok. 22.11, pięć dni przed Black Friday. Zamiast dokupować pakiet tniemy dwa
// największe codzienne zużycia (Weryfikacja ofert i karty Media Expertu w Łowcy):
//   do 20.11        — oszczędnie (ok. 1/3 pełnego limitu),
//   21–30.11        — pełny limit (tydzień Black Friday i Cyber Monday),
//   od 01.12        — połowa pełnego limitu.
// Jawne `--limit N` w wywołaniu zawsze wygrywa.

const OKNA = [
  { do: '2026-11-20', mnoznik: 0.375 },
  { do: '2026-11-30', mnoznik: 1 },
];
const PO_SEZONIE = 0.5;

export function limitDomyslny(pelny, dzis = new Date().toISOString().slice(0, 10)) {
  const okno = OKNA.find((o) => dzis <= o.do);
  return Math.max(1, Math.round(pelny * (okno ? okno.mnoznik : PO_SEZONIE)));
}
