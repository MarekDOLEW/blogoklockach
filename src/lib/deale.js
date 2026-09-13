// Dobór ofert do deali – wspólna reguła dla karuzeli na stronie głównej
// i półek na /deale/.
//
// Allegro wygrywa ceną niemal każdy slot, a deale są wizytówką serwisu i mają
// pokazywać także sklepy z własnym magazynem. Ustalenie Marka (13.09.2026):
// **linki do Allegro nie mogą przekraczać 30% linków w dealach** – w karuzeli
// (5 slotów) to 1 slot, na półce /deale/ (12 pozycji) – 3.
//
// Gdy limit Allegro jest wyczerpany, zestaw dostaje najlepszą ofertę SPOZA
// Allegro – pokazywaną uczciwie z ceną i rabatem tego sklepu, o ile rabat
// nadal jest realny (≥15% od ceny katalogowej; półka może zażądać więcej
// przez `akceptuj`). Zestaw bez takiej oferty odpada z listy – lepiej pokazać
// inny deal niż pseudopromocję.

export const UDZIAL_ALLEGRO = 0.3;
export const MIN_RABAT_ALTERNATYWY = 15;

/** Ile linków do Allegro mieści się w liście o `ile` pozycjach. */
export const limitAllegro = (ile) => Math.floor(UDZIAL_ALLEGRO * ile);

/** Rabat oferty względem ceny katalogowej zestawu, w pełnych procentach. */
export const rabatOferty = (s, o) => Math.round((1 - o.cena / s.cena_katalogowa) * 100);

/** Najtańsza oferta zestawu (opcjonalnie z pominięciem Allegro) albo null. */
export function najtanszaOferta(s, { bezAllegro = false } = {}) {
  return (s.oferty ?? [])
    .filter((o) => o.sklep !== 'ceneo' && (!bezAllegro || o.sklep !== 'allegro'))
    .reduce((a, o) => (a === null || o.cena < a.cena ? o : a), null);
}

/**
 * Przydziela oferty kolejnym kandydatom, pilnując udziału Allegro.
 * `kandydaci` – zestawy z sety.json (z polem `oferty`) w kolejności ważności.
 * Zwraca do `ile` par { set, oferta }.
 */
export function przydzielOferty(kandydaci, { ile, minRabat = MIN_RABAT_ALTERNATYWY, akceptuj = null } = {}) {
  const limit = limitAllegro(ile);
  let uzyte = 0;
  const wynik = [];
  for (const s of kandydaci) {
    if (wynik.length >= ile) break;
    const naj = najtanszaOferta(s);
    if (!naj) continue;
    let oferta = naj;
    if (naj.sklep === 'allegro' && uzyte >= limit) {
      const alt = najtanszaOferta(s, { bezAllegro: true });
      if (!alt || !s.cena_katalogowa || rabatOferty(s, alt) < minRabat) continue;
      if (akceptuj && !akceptuj(s, alt)) continue;
      oferta = alt;
    }
    wynik.push({ set: s, oferta });
    if (oferta.sklep === 'allegro') uzyte += 1;
  }
  return wynik;
}
