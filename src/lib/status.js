// Jedno źródło prawdy o statusie sprzedaży zestawu.
//
// Serwis rozróżnia trzy niezależne rzeczy, które wcześniej mieszały się
// na listingach i na hubie:
//
//   1. EOL w LEGO  – Grupa LEGO zakończyła sprzedaż (karta na lego.com ma
//      status „Produkcja zakończona"). To FAKT o producencie, nie o rynku:
//      inne sklepy potrafią sprzedawać zapasy jeszcze miesiącami. Dlatego
//      zestaw z EOL, który ma dziś ofertę w sklepie, dostaje na listingu
//      badge „w sprzedaży" z dopiskiem EOL, a nie „wycofany".
//   2. Wycofanie zapowiedziane – zestaw jest na liście wycofań z terminem
//      w przyszłości. Tu liczy się źródło:
//        · potwierdzone przez LEGO (dział „Ostatnie sztuki", komunikat LEGO),
//        · prognoza rynku (zgodne zapowiedzi branżowe – Brickset, Brick
//          Fanatics, StoneWars – bez potwierdzenia producenta).
//      Jedno i drugie pokazujemy, ale nigdy pod tą samą etykietą.
//   3. Dostępność w sklepach – czy jakikolwiek śledzony sklep ma dziś ofertę.
//      To wynika z ofert (lib/oferty.js), nie z tego modułu.
//
// Reguła utrzymania danych: RUNBOOK.md → „Statusy wycofań i EOL".
//
// Źródła (w tej kolejności):
//   - wycofania.json: `kiedy: "wycofany"` = EOL potwierdzony (LEGO już nie
//     sprzedaje); `kiedy` z terminem = zestaw wciąż w sprzedaży, znika później;
//     `kiedy: "odwołane"` = prognoza, której LEGO zaprzeczyło albo zestaw wrócił
//     do sprzedaży – wpis zostaje w pliku dla historii, ale strona go pomija;
//   - katalog.json: `status: "eol"` = koniec produkcji wg katalogu (backfill,
//     korygowany audytem – patrz materialy/audyt-wycofan-2026-09-13.md).

import { wpisKatalogu } from './katalog.js';
import { wycofanieSetu } from './huby.js';

/** Etykiety statusu wycofania – te same na listingach, hubie i /wycofania/. */
export const ETYKIETY_WYCOFANIA = {
  potwierdzone: 'potwierdzone przez LEGO',
  przewidywane: 'prognoza rynku',
  wycofany: 'wycofany (EOL)',
  // katalog mówi „eol", ale lista wycofań tego nie potwierdza — wiemy tylko tyle,
  // że listing lego.pl zestawu nie pokazuje (decyzja Marka 15.09.2026: nie
  // twierdzimy „koniec produkcji", gdy nikt tego nie sprawdził)
  brakWLego: 'brak w lego.pl',
};

/** EOL potwierdzony: wpis „wycofany" na liście wycofań (kuratorowanej, ze źródłem). */
export function eolPotwierdzony(nr) {
  const w = wycofanieSetu(nr);
  return Boolean(w && w.kiedy === 'wycofany');
}

/** Wpis z listy wycofań, o ile nie został odwołany. */
const wpisAktywny = (nr) => {
  const w = wycofanieSetu(nr);
  return w && w.kiedy !== 'odwołane' ? w : null;
};

/** Czy LEGO zakończyło sprzedaż zestawu (EOL na lego.com). */
export function eolWLego(nr) {
  const w = wpisAktywny(nr);
  if (w?.kiedy === 'wycofany') return true;
  // wpis z terminem w przyszłości: LEGO wciąż sprzedaje, nawet jeśli backfill
  // katalogu zdążył oznaczyć zestaw jako eol – lista wycofań jest kuratorowana
  // co tydzień, katalog był wypełniany hurtowo
  if (w) return false;
  return wpisKatalogu(nr)?.status === 'eol';
}

/**
 * Status wycofania do wyświetlenia albo null, gdy zestawu nie ma na liście.
 *   { etap: 'wycofany' | 'potwierdzone' | 'przewidywane', kiedy, etykieta }
 */
export function statusWycofania(nr) {
  const w = wpisAktywny(nr);
  if (!w) return null;
  const etap = w.kiedy === 'wycofany' ? 'wycofany' : w.status === 'potwierdzone' ? 'potwierdzone' : 'przewidywane';
  return { etap, kiedy: w.kiedy, status: w.status, etykieta: ETYKIETY_WYCOFANIA[etap] };
}

/**
 * Status do kolumny listingu (TabelaSetow).
 *
 * `maOferte` – czy jakikolwiek sklep poza LEGO ma dziś ofertę na ten zestaw.
 * Zwraca { badge, eolLego, kiedy }:
 *   badge   – 'sprzedaz' | 'eol' | 'potwierdzone' | 'przewidywane'
 *   eolLego – true, gdy LEGO już nie sprzedaje (listing dopisuje „EOL" pod
 *             badge'em „w sprzedaży", jeśli inne sklepy jeszcze mają zestaw)
 *   kiedy   – termin z listy wycofań dla zestawów, które dopiero znikną
 */
export function statusListingu(nr, { maOferte = false } = {}) {
  const w = statusWycofania(nr);
  if (w && w.etap !== 'wycofany') return { badge: w.etap, eolLego: false, eolPewny: false, kiedy: w.kiedy };
  if (eolWLego(nr)) return { badge: maOferte ? 'sprzedaz' : 'eol', eolLego: true, eolPewny: eolPotwierdzony(nr), kiedy: null };
  return { badge: 'sprzedaz', eolLego: false, eolPewny: false, kiedy: null };
}

// Nazwy używane przez starsze importy (seo.js liczył kiedyś własny EOL) –
// ta sama funkcja, żeby ocena indeksowalności i listing mówiły to samo.
export const wycofanyZProdukcji = eolWLego;
export const legoEol = eolWLego;
