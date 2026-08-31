// Wspólna logika wyszukiwarki globalnej: pobranie indeksu, dopasowanie
// i podświetlanie trafień. Używa jej panel w nagłówku (SzukajGlobalne.astro)
// i strona /szukaj/ — jedno dopasowanie, jedno miejsce na poprawki.

/** bez polskich znaków i wielkości liter; długość zachowana, żeby pozycje
 *  trafienia zgadzały się 1:1 z oryginalnym tekstem przy podświetlaniu */
export const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l');

let cache = null;

/** Indeks [{ nr, nazwa, seria, n }] — pobierany raz na wizytę. */
export function pobierzIndeks() {
  if (!cache) {
    cache = fetch('/szukaj-indeks.json')
      .then((r) => {
        if (!r.ok) throw new Error(`indeks: ${r.status}`);
        return r.json();
      })
      .then((dane) => dane.map(([nr, nazwa, seria]) => ({ nr, nazwa, seria, n: norm(nazwa) })))
      .catch((e) => {
        cache = null; // kolejne otwarcie spróbuje jeszcze raz
        throw e;
      });
  }
  return cache;
}

// Kolejność wyników: dokładny numer, potem początek numeru, potem nazwa
// od początku, na końcu nazwa w środku. Numer z pudełka ma trafiać w jedynkę.
const RANGA = { numerDokladny: 0, numerPoczatek: 1, nazwaPoczatek: 2, nazwaSrodek: 3 };

function ranga(w, q) {
  if (w.nr === q) return RANGA.numerDokladny;
  if (w.nr.startsWith(q)) return RANGA.numerPoczatek;
  if (w.n.startsWith(q)) return RANGA.nazwaPoczatek;
  if (w.n.includes(q)) return RANGA.nazwaSrodek;
  return -1;
}

/** Trafienia posortowane wg rangi; `limit` obcina listę podpowiedzi. */
export function szukaj(indeks, fraza, limit = Infinity) {
  const q = norm(String(fraza).trim());
  if (!q) return [];
  const trafienia = [];
  for (const w of indeks) {
    const r = ranga(w, q);
    if (r >= 0) trafienia.push({ ...w, r });
  }
  trafienia.sort((a, b) => a.r - b.r || a.nazwa.localeCompare(b.nazwa, 'pl'));
  return limit === Infinity ? trafienia : trafienia.slice(0, limit);
}

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (z) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[z]);

/** Tekst z zaznaczonym fragmentem, gotowy do wstawienia jako HTML. */
export function podswietl(tekst, znormalizowany, fraza) {
  const q = norm(String(fraza).trim());
  const i = q ? znormalizowany.indexOf(q) : -1;
  if (i < 0) return esc(tekst);
  return (
    esc(tekst.slice(0, i)) + '<mark>' + esc(tekst.slice(i, i + q.length)) + '</mark>' + esc(tekst.slice(i + q.length))
  );
}

/** Jedna pozycja listy wyników — ten sam wygląd w panelu i na /szukaj/. */
export function wierszHTML(w, fraza) {
  return (
    `<span class="sg-nr">${podswietl(w.nr, w.nr, fraza)}</span>` +
    `<span class="sg-nazwa">${podswietl(w.nazwa, w.n, fraza)}</span>` +
    (w.seria ? `<span class="sg-seria">${esc(w.seria)}</span>` : '')
  );
}
