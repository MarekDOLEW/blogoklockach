// Losowanie powtarzalne w obrębie dnia – do karuzel „Nasze propozycje".
//
// Strona jest statyczna, więc „losowo" znaczy: przy każdym buildzie z ziarnem
// zależnym od klucza (seria, widok) i daty. W ciągu dnia wybór jest stały – nic
// nie przeskakuje po odświeżeniu i nie trzeba skryptu po stronie czytelnika –
// a następnego dnia kolejny build losuje od nowa.

/** Generator liczb [0, 1) z ziarna tekstowego (FNV-1a + mulberry32). */
export function generator(klucz) {
  let a = [...String(klucz)].reduce((h, z) => Math.imul(h ^ z.charCodeAt(0), 16777619), 2166136261) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Do `ile` pozycji z puli w kolejności wylosowanej na dziś, przycięte do
 * wielokrotności `krok` (karuzela przewija trójkami – niepełna trójka wygląda
 * jak błąd). Pula mniejsza niż `krok` daje pustą listę.
 *
 * `najpierw` (opcjonalnie) – warunek pierwszeństwa: pozycje go spełniające idą
 * na początek (w wylosowanej kolejności), reszta tylko dopełnia brakujące
 * miejsca. Od 12.10.2026 karuzele dają pierwszeństwo hubom indeksowalnym –
 * audyt: 59 z 336 kart prowadziło na strony z noindex.
 */
export function propozycjeDnia(pula, klucz, { ile = 9, krok = 3, dzien = new Date(), najpierw = null } = {}) {
  const losuj = generator(`${klucz}|${dzien.toISOString().slice(0, 10)}`);
  const lista = [...pula];
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(losuj() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  if (najpierw) lista.sort((x, y) => Number(Boolean(najpierw(y))) - Number(Boolean(najpierw(x))));
  const n = Math.min(lista.length, ile);
  return lista.slice(0, n - (n % krok));
}
