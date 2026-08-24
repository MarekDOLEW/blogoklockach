// Wspólne dane zajawek artykułów: jedna karta na stronie głównej,
// w /artykuly/ i w /prezentownikach/ — ten sam kształt danych,
// ten sam komponent, więc listingi nie rozjeżdżają się między sobą.
//
// Okładkę wyliczamy z samego tekstu, żeby nie utrzymywać osobnego pola
// w każdym frontmatterze. Kolejność źródeł:
//   1. frontmatter.okladka — ręczne nadpisanie (ścieżka /img/… albo numer setu),
//   2. pierwszy obrazek w treści: ![alt](/img/…),
//   3. pierwszy zestaw ze slajdera galerii: <div class="galeria-setow" data-sety="…">,
//   4. pierwszy link do huba zestawu (/zestaw/<nr>/) lub do sklepu (/idz/<sklep>/<nr>),
//   5. numer zestawu z tytułu, np. „LEGO 21372 La Catrina…".
// Numery zestawów przepuszczamy przez urlZdjecia(): bez wpisu w naszych danych
// worker odda na /img/<nr>.jpg czterysta cztery, a karta pokazałaby zepsuty obrazek.

import sety from '../data/sety.json';
import ofertyFeed from '../data/oferty_feed.json';
import { urlZdjecia } from './media.js';

const feed = ofertyFeed?.sety ?? {};
const zdjecieSetuLubNic = (nr) => (nr ? urlZdjecia(nr, { sety, feed }) : null);

/** Surowy markdown artykułu; starsze/nietypowe moduły mogą go nie mieć. */
function tresc(modul) {
  try {
    return typeof modul.rawContent === 'function' ? modul.rawContent() : '';
  } catch {
    return '';
  }
}

/** Wartość pola `okladka`: numer zestawu albo gotowa ścieżka do zdjęcia. */
function zdjecieZWartosci(wartosc) {
  if (!wartosc) return null;
  const t = String(wartosc);
  return /^\d{4,7}$/.test(t) ? zdjecieSetuLubNic(t) : t;
}

function okladka(modul) {
  const f = modul.frontmatter ?? {};
  const raw = tresc(modul);

  const zPola = zdjecieZWartosci(f.okladka);
  if (zPola) return { url: zPola, alt: f.okladka_alt ?? f.title };

  const wTresci = /!\[([^\]]*)\]\((\/img\/[^)\s]+)\)/.exec(raw);
  if (wTresci) return { url: wTresci[2], alt: wTresci[1] || f.title };

  const zeSlajdera = /data-sety="(\d{4,7})/.exec(raw);
  const zHubu = /\/zestaw\/(\d{4,7})\//.exec(raw);
  const zeSklepu = /\/idz\/[a-z0-9-]+\/(\d{4,7})/.exec(raw);
  const zTytulu = /\b(\d{4,7})\b/.exec(f.title ?? '');

  for (const trafienie of [zeSlajdera, zHubu, zeSklepu, zTytulu]) {
    const url = zdjecieSetuLubNic(trafienie?.[1]);
    if (url) {
      const nr = trafienie[1];
      const nazwa = sety[nr]?.nazwa;
      return { url, alt: nazwa ? `LEGO ${nr} ${nazwa}` : f.title };
    }
  }

  return null;
}

/**
 * Zajawka jednego artykułu.
 * @param {object} modul       moduł z import.meta.glob (eager)
 * @param {boolean} opcje.karty  brać krótsze warianty z frontmattera (karta_*),
 *                               używane na listingu prezentowników
 */
export function zajawkaArtykulu(modul, { karty = false } = {}) {
  const f = modul.frontmatter ?? {};
  const foto = okladka(modul);
  return {
    url: modul.url + '/',
    data: f.data,
    kategoria: (karty ? f.karta_znacznik : null) ?? f.kategoria,
    tytul: (karty ? f.karta_tytul : null) ?? f.title,
    opis: (karty ? f.karta_opis : null) ?? f.opis,
    foto: foto?.url ?? null,
    fotoAlt: foto?.alt ?? f.title,
  };
}

/** Lista zajawek, najnowsze pierwsze. */
export function zajawkiArtykulow(moduly, opcje) {
  return moduly.map((m) => zajawkaArtykulu(m, opcje));
}

/**
 * Zajawka strony, która nie jest markdownem — prezentowniki serii to .astro
 * i zamiast frontmattera eksportują `meta`. Zdjęcie wskazuje pole `okladka`
 * (numer zestawu albo ścieżka), bo treści takiej strony nie da się przeszukać
 * regexpem jak markdownu.
 */
export function zajawkaZMeta(meta) {
  return {
    url: meta.url,
    data: meta.data,
    kategoria: meta.znacznik,
    tytul: meta.tytul,
    opis: meta.opis,
    foto: zdjecieZWartosci(meta.okladka),
    fotoAlt: meta.okladka_alt ?? meta.tytul,
  };
}
