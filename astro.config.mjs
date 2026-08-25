import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkGaleria from './scripts/remark-galeria.mjs';

// ── Które podstrony zestawów zgłaszamy Google ────────────────────────────────
//
// Powód (ustalone 24.08.2026 na danych z Search Console): 4 812 z 4 873 adresów
// w sitemapie to były huby /zestaw/, a Google nie zaindeksował ani jednego
// adresu poza stroną główną — wszystko inne miało status „wykryta, obecnie
// niezindeksowana", z datą ostatniego crawla NIGDY. Dwa sąsiednie huby bez
// opisu redakcyjnego mają ~260 słów, z czego 82% wspólnych: dla Google to nie
// są osobne strony, tylko jeden szablon w tysiącach wariantów.
//
// Zgłaszamy więc tylko te, które mają czytelnikowi co dać:
//   A. hub z redakcyjnym opisem w sety.json,
//   B. hub bez opisu, ale z ceną z co najmniej DWÓCH sklepów — czyli realne
//      porównanie cen, a nie pojedyncza oferta podana jako „porównanie".
//
// Pozostałe huby dalej istnieją, są linkowane wewnętrznie z tabel serii
// i z wyszukiwarki — po prostu ich nie zgłaszamy. Filtr przelicza się przy
// każdym buildzie, więc gdy Łowca dorzuci drugi sklep, hub wraca do sitemapy
// sam; gdy oferta zniknie, sam z niej wypada.
const czytaj = (plik) => JSON.parse(readFileSync(new URL(`./src/data/${plik}`, import.meta.url)));
const setyDane = czytaj('sety.json');
const feedDane = czytaj('oferty_feed.json').sety ?? {};

const MIN_SKLEPOW = 2;
function zglaszamyHub(nr) {
  if (setyDane[nr]?.opis) return true;
  const oferty = feedDane[nr]?.oferty ?? {};
  return Object.values(oferty).filter((cena) => typeof cena === 'number' && cena > 0).length >= MIN_SKLEPOW;
}

function doSitemapy(adres) {
  const hub = /\/zestaw\/(\d{4,7})\/?$/.exec(new URL(adres).pathname);
  return hub ? zglaszamyHub(hub[1]) : true;
}

export default defineConfig({
  site: 'https://tylkoklocki.pl',
  // Sitemapa bez lastmod — świadomie.
  //
  // Wcześniej każdy adres dostawał `lastmod` = moment builda. Ponieważ runnery
  // pushują dane kilka razy dziennie, Google dostawał sitemapę mówiącą, że
  // wszystkie 4 873 adresy zmieniły się kilka godzin temu — i tak codziennie,
  // także artykuły nietknięte od tygodnia. Dokumentacja Google mówi wprost, że
  // przy niewiarygodnym `lastmod` przestaje ufać temu polu w całej witrynie.
  // Lepiej nie deklarować daty niż deklarować nieprawdziwą; wrócimy do niej,
  // gdy będziemy umieli podać realną datę zmiany per typ strony.
  integrations: [sitemap({ filter: doSitemapy })],
  // Znacznik <div class="galeria-setow" data-sety="…"> w markdownie zamienia się
  // przy budowaniu na slajder zdjęć zestawów (scripts/remark-galeria.mjs).
  markdown: { remarkPlugins: [remarkGaleria] },
  build: { inlineStylesheets: 'auto' }
});
