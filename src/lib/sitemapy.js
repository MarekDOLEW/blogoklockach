// Sitemapy sekcyjne serwisu – jedno źródło dla endpointów
// src/pages/sitemap-<sekcja>.xml.js i dla indeksu src/pages/sitemap-index.xml.js.
//
// Po co osobne pliki zamiast jednej listy z @astrojs/sitemap (zdjętej 09.09.2026):
//   1. W Search Console każda sekcja ma własny licznik „przesłane / zindeksowane",
//      więc widać, czy Google nie indeksuje artykułów, czy hubów cenowych.
//   2. Każdy adres, dla którego znamy REALNĄ datę zmiany treści, dostaje
//      <lastmod>. Integracja tego nie umiała: albo stemplowała wszystko datą
//      builda (Google przestaje wtedy ufać polu w całej witrynie), albo nic.
//   3. Huby /zestaw/ przechodzą przez hubIndeksowalny() z src/lib/seo.js –
//      w sitemapie są dokładnie te strony, które nie mają noindex.
//
// Skąd lastmod:
//   artykuły, prezentowniki, deale – `zaktualizowano` z frontmattera/meta,
//     a gdy go nie ma, `data` publikacji;
//   huby zestawów – data najnowszego naszego tekstu o zestawie (patrz
//     lastmodHubu); bez tekstu pole pomijamy;
//   serie, nowości, strony stałe – bez lastmod: przeliczają się przy każdym
//     buildzie z danych cenowych i każda data byłaby datą builda, nie zmiany
//     treści. Zgodnie z zasadą z RUNBOOK („Sitemapy i Search Console"):
//     lepiej nie deklarować daty niż deklarować nieprawdziwą.
//
// Bez <priority> i <changefreq> – Google je ignoruje.

import sety from '../data/sety.json';
import katalog from '../data/katalog.json';
import { numeryHubow } from './huby.js';
import { hubIndeksowalny, lastmodHubu, slugSerii } from './seo.js';
import { miesiac, PROG_SETOW } from './miesiace.js';
import { tekstySekcji } from './teksty.js';

export const STRONA = 'https://tylkoklocki.pl';

/** Nazwy sekcji = nazwy plików sitemap-<sekcja>.xml. Kolejność jak w indeksie. */
export const SEKCJE = ['artykuly', 'prezentowniki', 'deale', 'serie', 'nowosci', 'zestawy', 'inne'];

// Serie, dla których strona istnieje w buildzie, ale adres jest przekierowany
// w astro.config.mjs (`redirects`) – zgłoszenie dałoby Google adres 301.
const SERIE_PRZEKIEROWANE = new Set(['tradycyjne-festiwale-chinskie']);

const wpis = (sciezka, lastmod = null) => ({ loc: `${STRONA}${sciezka}`, lastmod: lastmod || null });

// Data nie może być z przyszłości (błąd w frontmatterze nie ma trafić do Google).
const dzisIso = new Date().toISOString().slice(0, 10);
const bezPrzyszlosci = (d) => (d && d > dzisIso ? dzisIso : d);

function zTekstow(sekcja) {
  return tekstySekcji(sekcja).map((t) => wpis(t.url, bezPrzyszlosci(t.lastmod)));
}

function serie() {
  const zSetow = Object.values(sety).map((s) => s.seria);
  const zKatalogu = Object.keys(katalog).filter((k) => k !== '_meta');
  const slugi = [...new Set([...zSetow, ...zKatalogu].filter(Boolean).map(slugSerii))]
    .filter((slug) => !SERIE_PRZEKIEROWANE.has(slug))
    .sort();
  return [wpis('/serie/'), ...slugi.map((slug) => wpis(`/serie/${slug}/`))];
}

function nowosci() {
  // ta sama reguła co getStaticPaths w src/pages/nowosci/[miesiac].astro
  const ile = new Map();
  for (const s of Object.values(sety)) {
    const ym = String(s.premiera ?? '').slice(0, 7);
    if (/^\d{4}-\d{2}$/.test(ym)) ile.set(ym, (ile.get(ym) ?? 0) + 1);
  }
  const miesiace = [...ile]
    .filter(([ym, n]) => n >= PROG_SETOW && ym >= '2026-01')
    .map(([ym]) => ym)
    .sort()
    .map((ym) => wpis(miesiac(ym).sciezka));
  return [wpis('/nowosci/'), ...miesiace];
}

function zestawy() {
  return [...numeryHubow]
    .filter((nr) => hubIndeksowalny(nr))
    .sort((a, b) => Number(a) - Number(b))
    .map((nr) => wpis(`/zestaw/${nr}/`, bezPrzyszlosci(lastmodHubu(nr))));
}

// Strony stałe. Pominięte świadomie: /szukaj/ (noindex, wyniki liczy
// przeglądarka), /polityka-prywatnosci/ (bez wartości dla wyszukiwarki),
// /idz/* (przekierowania afiliacyjne, zablokowane w robots.txt).
function inne() {
  return ['/', '/o-nas/', '/wycofania/', '/kolekcjoner/'].map((s) => wpis(s));
}

/** Wpisy jednej sekcji: [{ loc, lastmod }]. */
export function wpisySekcji(sekcja) {
  switch (sekcja) {
    case 'artykuly':
      return [wpis('/artykuly/'), ...zTekstow('artykuly')];
    case 'prezentowniki':
      return [wpis('/prezentowniki/'), ...zTekstow('prezentowniki')];
    case 'deale':
      return [wpis('/deale/'), ...zTekstow('deale')];
    case 'serie':
      return serie();
    case 'nowosci':
      return nowosci();
    case 'zestawy':
      return zestawy();
    case 'inne':
      return inne();
    default:
      throw new Error(`Nieznana sekcja sitemapy: ${sekcja}`);
  }
}

const escapeXml = (t) =>
  String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** XML <urlset> dla listy wpisów. */
export function urlsetXml(wpisy) {
  const linie = wpisy.map((w) =>
    [
      '  <url>',
      `    <loc>${escapeXml(w.loc)}</loc>`,
      ...(w.lastmod ? [`    <lastmod>${w.lastmod}</lastmod>`] : []),
      '  </url>',
    ].join('\n'),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${linie.join('\n')}\n</urlset>\n`;
}

/** XML <sitemapindex> – lastmod indeksu = najświeższy lastmod w sekcji. */
export function indeksXml() {
  const linie = SEKCJE.map((sekcja) => {
    const najnowszy = wpisySekcji(sekcja)
      .map((w) => w.lastmod)
      .filter(Boolean)
      .reduce((a, b) => (b > a ? b : a), '');
    return [
      '  <sitemap>',
      `    <loc>${STRONA}/sitemap-${sekcja}.xml</loc>`,
      ...(najnowszy ? [`    <lastmod>${najnowszy}</lastmod>`] : []),
      '  </sitemap>',
    ].join('\n');
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${linie.join('\n')}\n</sitemapindex>\n`;
}

/** Odpowiedź endpointu Astro z gotowym XML-em. */
export const odpowiedzXml = (xml) =>
  new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
