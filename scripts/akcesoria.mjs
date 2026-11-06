// Wspólny filtr akcesoriów dla zrzutów sklepów (zrzut-redirects.mjs i zrzut-import.mjs).
// Akcesoria innych firm i nie-zestawy pod numerem zestawu (audyt 06.11.2026: 300 linków
// Empiku prowadziło do gablot Blacked Brick, uchwytów Saures, instrukcji, oświetlenia LED,
// Playmobilu i zamienników — np. /idz/empik/75455 na gablotę zamiast zestawu). Sprawdzamy
// adres karty (slug zawiera nazwę produktu) i nazwę ze zrzutu. Prawdziwe zestawy z podobnymi
// słowami w nazwie (kreatywne pudełko, poduszkowiec, ramka DOTS) przechodzą — dlatego
// lista jest węższa niż GADZETY w zrzut-import.mjs. Decyzja Marka 06.11.2026 (D3).
export const AKCESORIA =
  /(^|[-\s])do[-\s]lego([-\s,]|$)|(^|[-\s])na[-\s]lego([-\s,]|$)|saures|blacked[-\s]brick|briksmax|o[sś]wietlenie|gablot|instrukcj|playmobil|zamiennik|uchwyt|wieszak|mocowan|pojemnik-w-ksztalcie-glowy/i;
export const slug = (url) => decodeURIComponent(String(url ?? '').split('url=').pop()).replace(/^https:\/\/(www\.)?[^/]+\//, '');
