// Obraz OG konkretnej strony (artykuł, prezentownik) albo undefined.
//
// Obrazy leżą w public/og/<slug>.png i powstają z `python3 scripts/generuj-og.py`
// – commitujemy je, więc build na Cloudflare nie potrzebuje Pythona ani Pillow.
//
// Katalog czytamy raz, przy starcie budowania, i zwracamy undefined dla stron
// bez obrazu. Dzięki temu Base.astro schodzi na swoją domyślkę `/og.png`
// i dodanie tekstu bez wygenerowania obrazu nie daje martwego <meta og:image>.
//
// Strony zestawów /zestaw/<nr>/ nie korzystają z tego modułu – mają własny
// obraz (zdjęcie produktowe przez trasę /img/), a hubów jest ~4870, więc
// komplet wygenerowanych plików ważyłby dziesiątki megabajtów.

import { readdirSync, existsSync } from 'node:fs';

const katalog = new URL('../../public/og/', import.meta.url);
const dostepne = existsSync(katalog)
  ? new Set(readdirSync(katalog).filter((p) => p.endsWith('.png')))
  : new Set();

/** Ścieżka do obrazu OG dla sluga albo undefined (wtedy zadziała domyślka Base). */
export function ogStrony(slug) {
  if (!slug) return undefined;
  return dostepne.has(`${slug}.png`) ? `/og/${slug}.png` : undefined;
}

/** Slug z adresu strony: /artykuly/lego-31168-.../ -> lego-31168-... */
export function slugZeSciezki(pathname) {
  const czesci = String(pathname).split('/').filter(Boolean);
  return czesci[czesci.length - 1];
}
