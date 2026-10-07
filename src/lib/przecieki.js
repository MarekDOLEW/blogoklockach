// Dział /przecieki/ — nieoficjalne zapowiedzi z oceną pewności i tablicą trafności.
// Źródło: src/data/przecieki.json (dopisuje Scout). Przeciek nigdy nie wchodzi do
// huba faktów ani do danych strukturalnych Product — patrz _meta w pliku danych.

import dane from '../data/przecieki.json';
import { maHub } from './huby.js';

export const PEWNOSC = {
  wysoka: { etykieta: 'pewność wysoka', klasa: 'pewnosc pewnosc--wysoka', waga: 0 },
  srednia: { etykieta: 'pewność średnia', klasa: 'pewnosc pewnosc--srednia', waga: 1 },
  niska: { etykieta: 'pewność niska', klasa: 'pewnosc pewnosc--niska', waga: 2 },
};
export const WYNIK = {
  potwierdzony: { etykieta: 'potwierdzony przez LEGO', klasa: 'badge-status badge-status--pewny' },
  zmieniony: { etykieta: 'wszedł, ale inaczej', klasa: 'badge-status badge-status--prognoza' },
  obalony: { etykieta: 'nie wszedł', klasa: 'badge-status badge-status--eol' },
};

const MIESIACE = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
const MIESIACE_M = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];

/** '2027-01' → 'styczeń 2027', '2027' → '2027', null → 'termin nieznany'. */
export function terminPl(t) {
  if (!t) return 'termin nieznany';
  const m = /^(\d{4})-(\d{2})$/.exec(t);
  return m ? `${MIESIACE_M[Number(m[2]) - 1]} ${m[1]}` : String(t);
}
export function dataPl(d) {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(d ?? '');
  if (!m) return d ?? '';
  return m[3] ? `${Number(m[3])} ${MIESIACE[Number(m[2]) - 1]} ${m[1]}` : `${MIESIACE_M[Number(m[2]) - 1]} ${m[1]}`;
}

export const wszystkie = dane.przecieki.map((p) => ({ ...p, hub: p.numer && maHub(p.numer) ? `/zestaw/${p.numer}/` : null }));
export const otwarte = wszystkie
  .filter((p) => !p.rozstrzygniecie)
  .sort((a, b) => PEWNOSC[a.pewnosc].waga - PEWNOSC[b.pewnosc].waga || String(a.premiera_wg_zrodla ?? '9999').localeCompare(String(b.premiera_wg_zrodla ?? '9999')));
export const rozstrzygniete = wszystkie
  .filter((p) => p.rozstrzygniecie)
  .sort((a, b) => String(b.rozstrzygniecie.kiedy).localeCompare(String(a.rozstrzygniecie.kiedy)));

/** Tablica trafności: ile przecieków, ile rozstrzygniętych i z jakim wynikiem. */
export function statystyki() {
  const s = { razem: wszystkie.length, otwarte: otwarte.length, rozstrzygniete: rozstrzygniete.length, potwierdzony: 0, zmieniony: 0, obalony: 0, odKiedy: dane._meta?.zaktualizowano ?? null };
  for (const p of rozstrzygniete) if (p.rozstrzygniecie.wynik in s) s[p.rozstrzygniecie.wynik]++;
  s.trafnosc = s.rozstrzygniete ? Math.round(((s.potwierdzony + s.zmieniony) / s.rozstrzygniete) * 100) : null;
  s.odKiedyPl = wszystkie.length ? dataPl(wszystkie.map((p) => p.dodano).sort()[0]) : null;
  return s;
}
export const meta = dane._meta;
