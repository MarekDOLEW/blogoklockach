// Jeden indeks wszystkich tekstów redakcyjnych serwisu: artykuły, prezentowniki
// (markdown i .astro), posty dealowe oraz teksty z korzenia (kalendarz,
// zapowiedzi). Korzystają z niego sitemapy sekcyjne, feed RSS, blok
// „Przeczytaj też" i reguła indeksowalności hubów /zestaw/ (src/lib/seo.js).
//
// Po co jedno miejsce: te same globy były dotąd powtarzane w kilku stronach,
// a każda nowa funkcja (RSS, powiązane) powtórzyłaby je po raz kolejny.
// Tu każdy tekst dostaje jeden kształt niezależnie od tego, czy jest
// markdownem z frontmatterem, czy stroną .astro z eksportowanym `meta`.
//
// Kształt wpisu:
//   url            – ścieżka z ukośnikiem na końcu, np. /artykuly/lego-31168-…/
//   sekcja         – 'artykuly' | 'prezentowniki' | 'deale'
//   tytul, opis, data, zaktualizowano (zaktualizowano >= data), kategoria, tagi
//   sety           – Set numerów zestawów, do których tekst odsyła
//   serie          – Set nazw serii tych zestawów (plus znacznik prezentownika,
//                    gdy jest nazwą serii)
//   lastmod        – zaktualizowano ?? data (do sitemapy i RSS)

import { readFileSync } from 'node:fs';
import sety from '../data/sety.json';
import { wpisKatalogu } from './katalog.js';

const md = {
  ...import.meta.glob('../pages/artykuly/*.md', { eager: true }),
  ...import.meta.glob('../pages/prezentowniki/*.md', { eager: true }),
  ...import.meta.glob('../pages/deale/*.md', { eager: true }),
  ...import.meta.glob('../pages/*.md', { eager: true }),
};

// Prezentowniki serii to .astro: eksportują `meta`, a treść czytamy z pliku
// (fs), bo strony .astro nie mają rawContent() jak markdown.
const astro = import.meta.glob('../pages/prezentowniki/*.astro', { eager: true });

const serieZnane = new Set(Object.values(sety).map((s) => s.seria).filter(Boolean));

/** Numery zestawów wymienione w tekście: huby, slajdery, tabele cen, linki sklepowe. */
function numeryZTekstu(tekst) {
  const numery = new Set();
  const wzory = [
    /\/zestaw\/(\d{4,7})\//g,
    /\/idz\/[a-z0-9-]+\/(\d{4,7})/g,
    /data-sety?="([\d,\s]+)"/g,
    /\bnr:\s*['"](\d{4,7})['"]/g,
  ];
  for (const wzor of wzory) {
    for (const m of tekst.matchAll(wzor)) {
      for (const nr of m[1].split(/[\s,]+/)) if (/^\d{4,7}$/.test(nr)) numery.add(nr);
    }
  }
  return numery;
}

const seriaSetu = (nr) => sety[nr]?.seria ?? wpisKatalogu(nr)?.seria ?? null;

function serieZestawow(numery, dodatkowe = []) {
  const serie = new Set();
  for (const nr of numery) {
    const seria = seriaSetu(nr);
    if (seria) serie.add(seria);
  }
  for (const s of dodatkowe) if (s && serieZnane.has(s)) serie.add(s);
  return serie;
}

function sekcjaZeSciezki(sciezka, kategoria) {
  if (kategoria === 'Prezentownik') return 'prezentowniki';
  if (sciezka.includes('/pages/deale/')) return 'deale';
  return 'artykuly';
}

function zMarkdownu(sciezka, modul) {
  const f = modul.frontmatter ?? {};
  if (!f.kategoria) return null; // strony pomocnicze bez treści redakcyjnej
  let surowy = '';
  try {
    surowy = typeof modul.rawContent === 'function' ? modul.rawContent() : '';
  } catch {
    surowy = '';
  }
  const numery = numeryZTekstu(surowy);
  for (const nr of f.zestawy ?? []) numery.add(String(nr));
  const data = f.data ?? '';
  const zaktualizowano = f.zaktualizowano && f.zaktualizowano > data ? f.zaktualizowano : data;
  return {
    url: modul.url + '/',
    sekcja: sekcjaZeSciezki(sciezka, f.kategoria),
    tytul: f.title,
    opis: f.opis ?? '',
    data,
    zaktualizowano,
    lastmod: zaktualizowano || data || null,
    kategoria: f.kategoria,
    tagi: f.tagi ?? [],
    faq: f.faq ?? [],
    sety: numery,
    serie: serieZestawow(numery),
  };
}

function zAstro(sciezka, modul) {
  const meta = modul.meta;
  if (!meta?.url) return null;
  let surowy = '';
  try {
    surowy = readFileSync(new URL(sciezka, import.meta.url), 'utf8');
  } catch {
    surowy = '';
  }
  const numery = numeryZTekstu(surowy);
  const data = meta.data ?? '';
  const zaktualizowano = meta.zaktualizowano && meta.zaktualizowano > data ? meta.zaktualizowano : data;
  return {
    url: meta.url,
    sekcja: 'prezentowniki',
    tytul: meta.tytul,
    opis: meta.opis ?? '',
    data,
    zaktualizowano,
    lastmod: zaktualizowano || data || null,
    kategoria: meta.kategoria ?? 'Prezentownik',
    tagi: meta.tagi ?? [],
    faq: [],
    sety: numery,
    serie: serieZestawow(numery, [meta.znacznik]),
  };
}

// Indeks budujemy LENIWIE, przy pierwszym użyciu, a nie przy imporcie modułu.
// Powód: ten moduł wciąga (import.meta.glob) strony markdownu, a ich layout
// (Artykul.astro) wciąga ten moduł przez blok „Przeczytaj też" – cykl importów.
// Przy budowie w czasie importu strona markdownu nie ma jeszcze frontmattera
// („Cannot access 'frontmatter' before initialization"); w czasie renderowania
// wszystkie moduły są już gotowe.
let indeks = null;

function zbuduj() {
  const lista = [];
  for (const [sciezka, modul] of Object.entries(md)) {
    const wpis = zMarkdownu(sciezka, modul);
    if (wpis) lista.push(wpis);
  }
  for (const [sciezka, modul] of Object.entries(astro)) {
    const wpis = zAstro(sciezka, modul);
    if (wpis) lista.push(wpis);
  }
  // najnowsze pierwsze; przy remisie dat stabilnie po adresie
  return lista.sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : a.url.localeCompare(b.url)));
}

function pobierz() {
  if (!indeks) {
    const lista = zbuduj();
    const poSecie = new Map();
    for (const t of lista) {
      for (const nr of t.sety) {
        if (!poSecie.has(nr)) poSecie.set(nr, []);
        poSecie.get(nr).push(t);
      }
    }
    indeks = { lista, poSecie };
  }
  return indeks;
}

/** Wszystkie teksty redakcyjne, najnowsze pierwsze. */
export const teksty = () => pobierz().lista;

/** Teksty jednej sekcji: 'artykuly' | 'prezentowniki' | 'deale'. */
export const tekstySekcji = (sekcja) => teksty().filter((t) => t.sekcja === sekcja);

/** Tekst pod danym adresem (z ukośnikiem na końcu) albo null. */
export const tekstPodAdresem = (url) => teksty().find((t) => t.url === url) ?? null;

/** Teksty, które wspominają zestaw (dowolna sekcja), najnowsze pierwsze. */
export const tekstyOZestawie = (nr) => pobierz().poSecie.get(String(nr)) ?? [];

/** Czy zestaw występuje w którymś prezentowniku. */
export const wPrezentowniku = (nr) => tekstyOZestawie(nr).some((t) => t.sekcja === 'prezentowniki');
