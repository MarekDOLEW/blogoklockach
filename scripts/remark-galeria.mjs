// Slajder ze zdjęciami zestawów w treści artykułu.
//
// W markdownie wystarczy jednolinijkowy znacznik:
//   <div class="galeria-setow" data-sety="60496,71864,76475"></div>
//        — po jednym zdjęciu z każdego wymienionego zestawu,
//   <div class="galeria-setow" data-set="31168"></div>
//        — wszystkie zdjęcia galerii jednego zestawu (galerie.json).
//
// Plugin zamienia go przy budowaniu na gotowy HTML: obrazki siedzą w źródle
// strony (indeksuje je Google, przewijają się palcem bez JS-a), a skrypt
// w layoucie artykułu dokłada strzałki i kropki.
//
// Zdjęcia bierzemy w tej samej kolejności źródeł co src/lib/media.js — plugin
// działa poza grafem modułów Astro, więc czyta dane wprost z plików.

import { readFileSync } from 'node:fs';

const czytaj = (p) => JSON.parse(readFileSync(new URL(`../src/data/${p}`, import.meta.url)));
const sety = czytaj('sety.json');
const feed = czytaj('oferty_feed.json').sety ?? {};
const zdjeciaMapa = czytaj('zdjecia.json');
const galerie = czytaj('galerie.json');
const redirects = czytaj('redirects.json');
const katalog = czytaj('katalog.json');
const wycofania = czytaj('wycofania.json').wycofania ?? [];

const wycofaniaIdx = new Map(wycofania.map((w) => [w.numer, w]));
const katalogIdx = new Map();
for (const [seria, lista] of Object.entries(katalog)) {
  if (seria === '_meta' || !Array.isArray(lista)) continue;
  for (const s of lista) katalogIdx.set(s.numer, { ...s, seria });
}

const maZdjecie = (nr) =>
  Boolean(
    sety[nr]?.zdjecia?.glowne ||
      feed[nr]?.zdjecie ||
      zdjeciaMapa[nr]?.url ||
      wycofaniaIdx.get(nr)?.zdjecie,
  );

// Te same reguły co src/lib/huby.js — slajder linkuje wyłącznie tam,
// gdzie faktycznie powstaje podstrona /zestaw/<nr>/.
const maLinkGdziekolwiek = (nr) => Object.keys(redirects).some((sklep) => redirects[sklep]?.[nr]);
const maCeneZFeedu = (wpis) =>
  Boolean(wpis?.cena || Object.values(wpis?.oferty ?? {}).some((c) => c > 0));

const numeryHubow = (() => {
  const numery = new Set([...Object.keys(sety), ...wycofaniaIdx.keys()]);
  const kandydaci = new Set([
    ...Object.keys(feed),
    ...Object.values(redirects).flatMap((mapa) => Object.keys(mapa ?? {})),
  ]);
  for (const nr of kandydaci) {
    if (numery.has(nr)) continue;
    if (!katalogIdx.has(nr) && !wycofaniaIdx.has(nr)) continue;
    if (maCeneZFeedu(feed[nr]) || maLinkGdziekolwiek(nr)) numery.add(nr);
  }
  for (const s of katalogIdx.values()) {
    if (s.status === 'dostepny' && s.cena_katalogowa) numery.add(s.numer);
  }
  return numery;
})();

const maHubNaPewno = (nr) => numeryHubow.has(String(nr));

const esc = (t) =>
  String(t ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const nazwaSetu = (nr) => sety[nr]?.nazwa ?? katalogIdx.get(nr)?.nazwa ?? wycofaniaIdx.get(nr)?.nazwa ?? null;

function slajdy({ sety: lista, set }) {
  if (set) {
    const nr = set;
    const ile = galerie[nr]?.length ?? 0;
    const nazwa = nazwaSetu(nr);
    const podpis = `LEGO ${nr}${nazwa ? ` ${nazwa}` : ''}`;
    if (ile > 0) {
      return Array.from({ length: ile }, (_, i) => ({
        nr,
        src: `/img/${nr}-${i + 1}.jpg`,
        alt: `${podpis} — zdjęcie ${i + 1} z ${ile}`,
        podpis,
      }));
    }
    return maZdjecie(nr) ? [{ nr, src: `/img/${nr}.jpg`, alt: podpis, podpis }] : [];
  }

  return lista
    .filter((nr) => maZdjecie(nr))
    .map((nr) => {
      const nazwa = nazwaSetu(nr);
      const podpis = `LEGO ${nr}${nazwa ? ` ${nazwa}` : ''}`;
      return { nr, src: `/img/${nr}.jpg`, alt: podpis, podpis };
    });
}

function html(slajd) {
  // slajder nigdy nie jest największym elementem nad zgięciem — wszystkie
  // zdjęcia ładujemy leniwie, także pierwsze
  const obraz = `<img src="${slajd.src}" alt="${esc(slajd.alt)}" loading="lazy" width="600" height="600" />`;
  const tresc = maHubNaPewno(slajd.nr)
    ? `<a href="/zestaw/${slajd.nr}/">${obraz}</a>`
    : obraz;
  return `<figure class="gs-slajd">${tresc}<figcaption>${esc(slajd.podpis)}</figcaption></figure>`;
}

function slajder(lista) {
  if (lista.length === 0) return '';
  const figury = lista.map(html).join('');
  if (lista.length === 1) {
    return `<div class="galeria-slajder galeria-slajder--jedno">${figury}</div>`;
  }
  const kropki = lista
    .map(
      (s, i) =>
        `<button type="button" class="gs-kropka${i === 0 ? ' gs-kropka--aktywna' : ''}" data-gs-kropka="${i}" aria-label="${esc(s.podpis)}"></button>`,
    )
    .join('');
  return [
    '<div class="galeria-slajder" data-galeria aria-roledescription="karuzela" aria-label="Zdjęcia zestawów">',
    '<div class="gs-okno">',
    `<div class="gs-tor" data-gs-tor tabindex="0">${figury}</div>`,
    '<button type="button" class="gs-strzalka gs-strzalka--wstecz" data-gs="wstecz" aria-label="Poprzednie zdjęcie">‹</button>',
    '<button type="button" class="gs-strzalka gs-strzalka--dalej" data-gs="dalej" aria-label="Następne zdjęcie">›</button>',
    '</div>',
    `<div class="gs-kropki">${kropki}</div>`,
    '</div>',
  ].join('');
}

const ZNACZNIK = /<div\s+class="galeria-setow"\s+data-(sety|set)="([0-9,\s]+)"\s*><\/div>/g;

export default function remarkGaleria() {
  return (drzewo) => {
    const idz = (wezel) => {
      if (wezel.type === 'html' && wezel.value.includes('galeria-setow')) {
        wezel.value = wezel.value.replace(ZNACZNIK, (_, atrybut, wartosc) => {
          const numery = wartosc.split(',').map((n) => n.trim()).filter(Boolean);
          return slajder(
            slajdy(atrybut === 'set' ? { set: numery[0] } : { sety: numery }),
          );
        });
      }
      for (const dziecko of wezel.children ?? []) idz(dziecko);
    };
    idz(drzewo);
  };
}
