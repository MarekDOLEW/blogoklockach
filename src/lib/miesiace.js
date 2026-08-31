// Polskie nazwy miesięcy i slugi podstron /nowosci/<miesiac>-<rok>/.
//
// Slug jest bez znaków diakrytycznych („pazdziernik-2026"), bo adres ma się
// dać przepisać i wkleić bez kodowania procentowego. Nazwa wyświetlana ma
// pełną polszczyznę i odmianę – nagłówek brzmi „Premiery LEGO we wrześniu
// 2026", nie „Premiery LEGO wrzesień 2026".

// Miesiąc z mniejszą liczbą premier nie dostaje własnego adresu – cienka
// podstrona z dwoma zestawami szkodzi w wyszukiwarce bardziej, niż pomaga.
export const PROG_SETOW = 3;

const MIESIACE = [
  { slug: 'styczen', mianownik: 'styczeń', wMiesiacu: 'w styczniu' },
  { slug: 'luty', mianownik: 'luty', wMiesiacu: 'w lutym' },
  { slug: 'marzec', mianownik: 'marzec', wMiesiacu: 'w marcu' },
  { slug: 'kwiecien', mianownik: 'kwiecień', wMiesiacu: 'w kwietniu' },
  { slug: 'maj', mianownik: 'maj', wMiesiacu: 'w maju' },
  { slug: 'czerwiec', mianownik: 'czerwiec', wMiesiacu: 'w czerwcu' },
  { slug: 'lipiec', mianownik: 'lipiec', wMiesiacu: 'w lipcu' },
  { slug: 'sierpien', mianownik: 'sierpień', wMiesiacu: 'w sierpniu' },
  { slug: 'wrzesien', mianownik: 'wrzesień', wMiesiacu: 'we wrześniu' },
  { slug: 'pazdziernik', mianownik: 'październik', wMiesiacu: 'w październiku' },
  { slug: 'listopad', mianownik: 'listopad', wMiesiacu: 'w listopadzie' },
  { slug: 'grudzien', mianownik: 'grudzień', wMiesiacu: 'w grudniu' },
];

/** "2026-09" -> { slug, mianownik, wMiesiacu, rok, ym } */
export function miesiac(ym) {
  const [rok, mm] = ym.split('-');
  const m = MIESIACE[Number(mm) - 1];
  if (!m) return null;
  return { ...m, rok: Number(rok), ym, sciezka: `/nowosci/${m.slug}-${rok}/` };
}

/** "wrzesien-2026" -> "2026-09" (null, gdy slug nie jest miesiącem) */
export function ymZeSlugu(slug) {
  const m = /^([a-z]+)-(\d{4})$/.exec(slug);
  if (!m) return null;
  const i = MIESIACE.findIndex((x) => x.slug === m[1]);
  return i < 0 ? null : `${m[2]}-${String(i + 1).padStart(2, '0')}`;
}
