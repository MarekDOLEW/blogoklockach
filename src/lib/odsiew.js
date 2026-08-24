// Odsiew ofert podszywających się pod zestaw — czysta logika, bez importów
// danych, żeby korzystał z niej zarówno serwis (Astro), jak i skrypt kontrolny
// uruchamiany zwykłym Node'em. Dzięki temu raport i strona nigdy nie rozjadą
// się progami.
//
// Skąd problem: feedy marketplace'ów dopasowują ofertę po numerze zestawu
// w tytule aukcji, więc pod numer setu trafiają rzeczy, które zestawem nie są.
// Zweryfikowane przypadki (2026-08-24, po otwarciu każdej aukcji):
//   21315  5,00 zł   — „LEGO Ideas 21315 książka instrukcja" (sama instrukcja)
//   42156 50,00 zł   — mocowanie ścienne do modelu, bez klocków
//   43247 45,00 zł   — zestaw oświetlenia „bez klocków"
//   76419 149,90 zł  — akrylowa gablota
//   60198 45,01 zł   — zbiorcza aukcja z siedmioma innymi numerami w tytule
//   75372 29,99 zł   — pojedynczy droid wyjęty z zestawu
// Taka pozycja jest zawsze radykalnie tańsza od zestawu i wchodziła nam do
// tabel jako „najtańsza oferta", której nie da się kupić.
//
// JEDNA reguła: oferta poniżej 28% ceny katalogowej. Na bieżących danych łapie
// wszystkie 11 potwierdzonych podszywek i zero prawdziwych ofert.
//
// Dlaczego NIE porównujemy między sklepami (odrzucona wersja tej reguły):
// wydawało się naturalne odrzucać ofertę radykalnie tańszą od pozostałych
// sklepów, ale sprawdzenie linków pokazało, że to kasuje przede wszystkim
// PRAWDZIWE okazje. Punktem odniesienia bywa oferta zawyżona: polybagi mają
// katalogowo 16,99 zł, na Allegro schodzą po 8–10 zł, a w innym sklepie stoją
// po 24,99 zł — czyli powyżej ceny katalogowej. Reguła międzysklepowa
// odrzucała wtedy tę uczciwą, a zostawiała zawyżoną. Podobnie z wycofanymi
// seriami (VIDIYO, DOTS), wyprzedawanymi po ułamku ceny. Cena katalogowa jest
// jedynym stabilnym punktem odniesienia i tylko jej używamy.
//
// Sety bez znanej ceny katalogowej (ok. 6,7 tys. z 8 tys. w feedzie) nie są
// filtrowane wcale — świadomie. Lepiej pokazać tanią ofertę, która okaże się
// akcesorium, niż ukryć realną okazję; ryzyko domyka backfill cen katalogowych.
//
// Próg jest celowo ostrożny: nowy, zafoliowany zestaw w polskiej sprzedaży nie
// schodzi poniżej ~28% ceny katalogowej. Realne wyprzedaże (-40, -60%) i
// wycofane serie przechodzą bez zmian.

export const PROG_WZGLEDEM_KATALOGU = 0.28;

/**
 * Powód odrzucenia oferty albo null, gdy oferta jest wiarygodna.
 * @param {{sklep: string, cena: number}} oferta
 * @param {number|null} rrp cena katalogowa; bez niej nie filtrujemy
 */
export function powodOdrzucenia(oferta, rrp) {
  if (!rrp) return null;
  if (oferta.cena < PROG_WZGLEDEM_KATALOGU * rrp) {
    return `${Math.round(100 * (1 - oferta.cena / rrp))}% poniżej ceny katalogowej (${rrp} zł)`;
  }
  return null;
}

/** Oferty, które przeszły odsiew. */
export const odsiej = (oferty, rrp) => oferty.filter((o) => powodOdrzucenia(o, rrp) === null);
