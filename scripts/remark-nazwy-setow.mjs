// Numery i nazwy zestawów w treści – wyróżnione i, gdzie się da, linkowane.
//
// Po co: czytelnik skanuje tekst wzrokiem i szuka konkretnego zestawu. Gdy numer
// z nazwą wygląda jak reszta akapitu, musi czytać zdanie po zdaniu. Granatowy
// bold wyłapuje wzrok od razu, a żółte podkreślenie mówi, że stąd da się przejść
// na hub zestawu. To ta sama para kolorów co w tabelach zestawów (.set-nazwa a),
// więc nazwa zestawu wygląda tak samo w całym serwisie.
//
// Zasada ilościowa: linkujemy PIERWSZE wystąpienie danego zestawu w sekcji
// (nagłówek H2 otwiera nową sekcję), a w tabelach każdy wiersz osobno. Bez tego
// tekst o fali premierowej, gdzie ten sam numer pada po sześć razy, zamieniłby
// się w ścianę pogrubień – a wyróżnienie działa tylko wtedy, gdy jest rzadkie.
//
// Czego nie ruszamy: nagłówków, kodu, istniejących linków (te wpisał redaktor
// świadomie) i numerów, po których stoi jednostka – „10000 zł" to kwota, nie
// zestaw, nawet jeśli taki numer istnieje w katalogu.

import { readFileSync } from 'node:fs';

const czytaj = (p) => JSON.parse(readFileSync(new URL(`../src/data/${p}`, import.meta.url)));
const sety = czytaj('sety.json');
const karty = czytaj('karty_setow.json');
const feed = czytaj('oferty_feed.json').sety ?? {};
const redirects = czytaj('redirects.json');
const katalog = czytaj('katalog.json');
const rrpPotwierdzone = czytaj('rrp_potwierdzone.json');
const wycofania = czytaj('wycofania.json').wycofania ?? [];

const katalogIdx = new Map();
for (const [seria, lista] of Object.entries(katalog)) {
  if (seria === '_meta' || !Array.isArray(lista)) continue;
  for (const s of lista) katalogIdx.set(s.numer, { ...s, seria });
}
const wycofaniaIdx = new Map(wycofania.map((w) => [w.numer, w]));

// ── które numery w ogóle są zestawami i jak się nazywają ──
// Nazwa bywa różna w różnych źródłach (katalog vs karta Piotra), więc trzymamy
// wszystkie warianty – dopasowujemy najdłuższy pasujący do tekstu.
const NIEZNANA = '{?}';
const nazwy = new Map();
const dodajNazwe = (nr, nazwa) => {
  if (!nazwa || nazwa === NIEZNANA) return;
  if (!nazwy.has(nr)) nazwy.set(nr, new Set());
  nazwy.get(nr).add(nazwa);
};
for (const [nr, s] of katalogIdx) dodajNazwe(nr, s.nazwa);
for (const [nr, s] of Object.entries(sety)) dodajNazwe(nr, s.nazwa);
for (const [nr, k] of Object.entries(karty)) dodajNazwe(nr, k.nazwa);
for (const [nr, w] of wycofaniaIdx) dodajNazwe(nr, w.nazwa);

const znanyZestaw = (nr) =>
  katalogIdx.has(nr) || Object.hasOwn(sety, nr) || Object.hasOwn(karty, nr) || wycofaniaIdx.has(nr);

// ── te same reguły co src/lib/huby.js (plugin działa poza grafem modułów Astro) ──
const maCeneZFeedu = (w) => Boolean(w?.cena || Object.values(w?.oferty ?? {}).some((c) => c > 0));
const numeryHubow = (() => {
  const numery = new Set([...Object.keys(sety), ...wycofaniaIdx.keys()]);
  const kandydaci = new Set([
    ...Object.keys(feed),
    ...Object.values(redirects).flatMap((mapa) => Object.keys(mapa ?? {})),
  ]);
  for (const nr of kandydaci) {
    if (numery.has(nr)) continue;
    if (!katalogIdx.has(nr) && !wycofaniaIdx.has(nr)) continue;
    if (maCeneZFeedu(feed[nr]) || Object.values(redirects).some((m) => m?.[nr])) numery.add(nr);
  }
  for (const s of katalogIdx.values()) {
    if (s.status === 'dostepny' && (s.cena_katalogowa || rrpPotwierdzone[s.numer]?.cena)) numery.add(s.numer);
  }
  return numery;
})();

// ── rozpoznawanie w tekście ──
// Pięć cyfr wzwyż: roczniki (2026), liczby elementów (6130) i kwoty (1129,99)
// są krótsze, więc odpadają bez dodatkowych reguł.
const NUMER = /\b\d{5,7}\b/g;
// jednostka tuż za liczbą = to nie numer zestawu, tylko wartość
const PO_LICZBIE_JEDNOSTKA = /^\s*(zł|zl|%|el\b|elem|element|szt)/i;
const PRZED_LEGO = /LEGO\s$/;

/** Najdłuższa znana nazwa zestawu, którą zaczyna się `reszta` (albo ''). */
function dopasujNazwe(nr, reszta) {
  const warianty = nazwy.get(nr);
  if (!warianty || !reszta.startsWith(' ')) return '';
  let najlepsza = '';
  for (const nazwa of warianty) {
    if (reszta.slice(1).startsWith(nazwa) && nazwa.length > najlepsza.length) najlepsza = nazwa;
  }
  return najlepsza ? ' ' + najlepsza : '';
}

const wezelSetu = (nr, tekst) =>
  numeryHubow.has(nr)
    ? {
        type: 'link',
        url: `/zestaw/${nr}/`,
        children: [{ type: 'text', value: tekst }],
        data: { hProperties: { className: 'set-ref' } },
      }
    : {
        type: 'strong',
        children: [{ type: 'text', value: tekst }],
        data: { hProperties: { className: 'set-ref' } },
      };

/** Rozbija jeden węzeł tekstowy na kawałki z wyróżnionymi zestawami. */
function rozbij(tekst, uzyte) {
  const wynik = [];
  let ogon = 0;
  NUMER.lastIndex = 0;
  for (let m = NUMER.exec(tekst); m; m = NUMER.exec(tekst)) {
    const nr = m[0];
    const reszta = tekst.slice(m.index + nr.length);
    if (uzyte.has(nr) || !znanyZestaw(nr) || PO_LICZBIE_JEDNOSTKA.test(reszta)) continue;

    const przed = tekst.slice(ogon, m.index);
    const zLego = PRZED_LEGO.test(przed) ? 'LEGO ' : '';
    const nazwa = dopasujNazwe(nr, reszta);
    const etykieta = zLego + nr + nazwa;

    const przedTekst = zLego ? przed.slice(0, -zLego.length) : przed;
    if (przedTekst) wynik.push({ type: 'text', value: przedTekst });
    wynik.push(wezelSetu(nr, etykieta));

    uzyte.add(nr);
    ogon = m.index + nr.length + nazwa.length;
    NUMER.lastIndex = ogon;
  }
  if (!wynik.length) return null;
  if (ogon < tekst.length) wynik.push({ type: 'text', value: tekst.slice(ogon) });
  return wynik;
}

const POMIJANE = new Set(['heading', 'code', 'inlineCode', 'html', 'image', 'imageReference', 'definition', 'yaml']);

export default function remarkNazwySetow() {
  return (drzewo) => {
    let uzyte = new Set();

    const idz = (wezel) => {
      const dzieci = wezel.children;
      if (!Array.isArray(dzieci)) return;

      const nowe = [];
      for (const dziecko of dzieci) {
        // nagłówek sekcji zeruje licznik – każda sekcja linkuje swoje zestawy od nowa
        if (dziecko.type === 'heading' && dziecko.depth <= 2) uzyte = new Set();

        if (dziecko.type === 'link' || dziecko.type === 'linkReference') {
          // ręczny link redaktora zostaje nietknięty, ale liczy się jako wystąpienie
          const trafienie = /\/zestaw\/(\d{4,7})\//.exec(dziecko.url ?? '');
          if (trafienie) uzyte.add(trafienie[1]);
          nowe.push(dziecko);
          continue;
        }
        if (POMIJANE.has(dziecko.type)) {
          nowe.push(dziecko);
          continue;
        }
        // w tabeli każdy wiersz dostaje własny licznik – lista zestawów ma
        // linkować wszystkie pozycje, a nie tylko pierwszą
        if (dziecko.type === 'tableRow') {
          const zewnetrzne = uzyte;
          uzyte = new Set();
          idz(dziecko);
          uzyte = zewnetrzne;
          nowe.push(dziecko);
          continue;
        }
        if (dziecko.type === 'text') {
          const kawalki = rozbij(dziecko.value, uzyte);
          if (kawalki) nowe.push(...kawalki);
          else nowe.push(dziecko);
          continue;
        }
        idz(dziecko);
        nowe.push(dziecko);
      }
      wezel.children = nowe;
    };

    idz(drzewo);
  };
}
