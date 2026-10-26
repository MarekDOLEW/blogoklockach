// Które oferty mogą wejść do slajdera i listy „Dziś w dobrej cenie” na stronie głównej
// oraz do slajdera /promocje-lego/ (decyzja Marka 26.10.2026).
//
// Powód: ceny Empiku i x-komu czytamy raz w tygodniu z ręcznego zrzutu, Ceneo, LEGO.com
// i Smyka we wtorek. Krótka promocja z takiego zrzutu (43303 w x-kom: 24,99 zł rano,
// 46,90 zł kilka godzin później) wisiała w banerze jako „okazja dnia”, choć sklep jej
// już nie miał. Dlatego te miejsca biorą tylko:
//   1. oferty sklepów, których ceny Łowca ściąga codziennie z feedów (Media Expert,
//      Allegro, Planeta Klocków) — sprawdzanie ich kart drugi raz to strata kredytów;
//   2. oferty potwierdzone dziś albo wczoraj na karcie produktu przez
//      `scripts/weryfikacja-ofert.mjs` (Firecrawl, 1 kredyt na kartę), z tą samą ceną;
//   3. ceny z aktywnego kodu w kody_rabatowe.json — te sprawdza człowiek albo sesja
//      Code na karcie produktu przy dopisywaniu kodu.
// Tabele cen na stronach zestawów i listing /promocje-lego/ pokazują dalej wszystkie
// oferty z datą odczytu; reguła dotyczy wyłącznie wyróżnionych miejsc.

import weryfikacja from '../data/weryfikacja_ofert.json';
import kodyRabatowe from '../data/kody_rabatowe.json';

export const SKLEPY_CODZIENNE = new Set(['mediaexpert', 'allegro', 'planetaklockow']);

const DZIEN_MS = 864e5;
const dzis = new Date().toISOString().slice(0, 10);
const wczoraj = new Date(Date.now() - DZIEN_MS).toISOString().slice(0, 10);
const taSamaCena = (a, b) => Math.abs(Number(a) - Number(b)) < 0.011;

export const kluczWeryfikacji = (nr, sklep) => `${nr}|${sklep}`;

function zKodu(nr, o) {
  return (kodyRabatowe[o.sklep] ?? []).some(
    (k) => k.do >= dzis && k.zestawy?.[nr] !== undefined && taSamaCena(k.zestawy[nr], o.cena),
  );
}

/** Czy oferta może stanąć w slajderze albo w „Dziś w dobrej cenie”. */
export function ofertaPewna(nr, o) {
  if (!o) return false;
  if (SKLEPY_CODZIENNE.has(o.sklep)) return true;
  if (zKodu(String(nr), o)) return true;
  const w = weryfikacja.oferty?.[kluczWeryfikacji(nr, o.sklep)];
  return Boolean(
    w && (w.status === 'ok' || w.status === 'zmiana') && w.sprawdzono >= wczoraj && taSamaCena(w.cena, o.cena),
  );
}

/** Zestaw z ofertami okrojonymi do pewnych (do slajderów); null, gdy nie zostaje żadna. */
export function tylkoPewne(s) {
  const oferty = (s.oferty ?? []).filter((o) => ofertaPewna(s.nr, o));
  return oferty.length ? { ...s, oferty } : null;
}
