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
// Skąd lastmod (decyzja Marka 09.09.2026 – data ma być wszędzie, gdzie jest
// prawdziwa):
//   artykuły, prezentowniki, deale – `zaktualizowano` z frontmattera/meta,
//     a gdy go nie ma, `data` publikacji; huby działów /artykuly/ i
//     /prezentowniki/ – najświeższy tekst działu;
//   huby zestawów – max z daty naszego tekstu o zestawie i daty ostatniej
//     oferty sklepowej (tego dnia zmieniła się tabela cen – patrz lastmodHubu);
//   serie – max z lastmod hubów tej serii i tekstów o niej;
//   miesiące nowości – max z lastmod zestawów z premierą w tym miesiącu;
//   strony przeliczane codziennie z cen (/, /deale/, /nowosci/, /serie/,
//     /wycofania/, /kolekcjoner/) – data builda, bo realnie zmieniają się
//     co dzień; /o-nas/ – bez daty (treść stała).
// Data z przyszłości (błąd w frontmatterze) jest przycinana do dzisiejszej.
//
// Bez <priority> i <changefreq> – Google je ignoruje.

import sety from '../data/sety.json';
import katalog from '../data/katalog.json';
import { numeryHubow, wycofanieSetu } from './huby.js';
import { wpisKatalogu } from './katalog.js';
import { hubIndeksowalny, lastmodHubu, slugSerii } from './seo.js';
import { miesiac, PROG_SETOW } from './miesiace.js';
import { teksty, tekstySekcji } from './teksty.js';

export const STRONA = 'https://tylkoklocki.pl';

/** Nazwy sekcji = nazwy plików sitemap-<sekcja>.xml. Kolejność jak w indeksie. */
export const SEKCJE = ['artykuly', 'prezentowniki', 'deale', 'serie', 'nowosci', 'zestawy', 'inne'];

// Serie, dla których strona istnieje w buildzie, ale adres jest przekierowany
// w astro.config.mjs (`redirects`) – zgłoszenie dałoby Google adres 301.
const SERIE_PRZEKIEROWANE = new Set(['tradycyjne-festiwale-chinskie']);

// Data nie może być z przyszłości (błąd w frontmatterze nie ma trafić do Google).
const dzisIso = new Date().toISOString().slice(0, 10);
const bezPrzyszlosci = (d) => (d && d > dzisIso ? dzisIso : d);
const maxData = (daty) => daty.filter(Boolean).reduce((a, b) => (b > a ? b : a), '') || null;

const wpis = (sciezka, lastmod = null) => ({ loc: `${STRONA}${sciezka}`, lastmod: bezPrzyszlosci(lastmod) || null });

// Teksty z korzenia (/kalendarz-promocji-lego/, /zapowiedzi-lego-2027/) mają
// kategorię artykułu, ale adres poza /artykuly/ – idą do sitemap-inne.xml
// (tak są zgłoszone w GSC), a w sitemap-artykuly.xml zostają teksty spod /artykuly/.
const zKorzenia = (t) => !/^\/(artykuly|prezentowniki|deale)\//.test(t.url);

function zTekstow(sekcja) {
  return tekstySekcji(sekcja)
    .filter((t) => !zKorzenia(t))
    .map((t) => wpis(t.url, t.lastmod));
}

const lastmodDzialu = (sekcja) => maxData(tekstySekcji(sekcja).map((t) => t.lastmod));

// Cache lastmod hubów – serie i nowości liczą maksimum po tysiącach zestawów.
const lastmodHubow = new Map();
const lastmodHubuC = (nr) => {
  if (!lastmodHubow.has(nr)) lastmodHubow.set(nr, lastmodHubu(nr));
  return lastmodHubow.get(nr);
};

const seriaHubu = (nr) => sety[nr]?.seria ?? wpisKatalogu(nr)?.seria ?? wycofanieSetu(nr)?.seria ?? null;

function serie() {
  const zSetow = Object.values(sety).map((s) => s.seria);
  const zKatalogu = Object.keys(katalog).filter((k) => k !== '_meta');
  const nazwy = [...new Set([...zSetow, ...zKatalogu].filter(Boolean))];

  // lastmod serii = najświeższy hub tej serii albo tekst o niej
  const perSeria = new Map(nazwy.map((n) => [n, []]));
  for (const nr of numeryHubow) {
    const seria = seriaHubu(nr);
    if (perSeria.has(seria)) perSeria.get(seria).push(lastmodHubuC(nr));
  }
  for (const t of teksty()) for (const seria of t.serie) if (perSeria.has(seria)) perSeria.get(seria).push(t.lastmod);

  const wpisy = new Map();
  for (const nazwa of nazwy) {
    const slug = slugSerii(nazwa);
    if (SERIE_PRZEKIEROWANE.has(slug)) continue;
    // dwie nazwy mogą dać ten sam slug (np. „NINJAGO" i „Ninjago") – bierzemy późniejszą datę
    wpisy.set(slug, maxData([wpisy.get(slug), maxData(perSeria.get(nazwa))]));
  }
  return [
    wpis('/serie/', dzisIso),
    ...[...wpisy.keys()].sort().map((slug) => wpis(`/serie/${slug}/`, wpisy.get(slug))),
  ];
}

function nowosci() {
  // ta sama reguła co getStaticPaths w src/pages/nowosci/[miesiac].astro
  const ile = new Map();
  const daty = new Map();
  for (const [nr, s] of Object.entries(sety)) {
    const ym = String(s.premiera ?? '').slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(ym)) continue;
    ile.set(ym, (ile.get(ym) ?? 0) + 1);
    daty.set(ym, maxData([daty.get(ym), lastmodHubuC(nr)]));
  }
  const miesiace = [...ile]
    .filter(([ym, n]) => n >= PROG_SETOW && ym >= '2026-01')
    .map(([ym]) => ym)
    .sort()
    .map((ym) => wpis(miesiac(ym).sciezka, daty.get(ym)));
  return [wpis('/nowosci/', dzisIso), ...miesiace];
}

function zestawy() {
  return [...numeryHubow]
    .filter((nr) => hubIndeksowalny(nr))
    .sort((a, b) => Number(a) - Number(b))
    .map((nr) => wpis(`/zestaw/${nr}/`, lastmodHubuC(nr)));
}

// Strony stałe i teksty z korzenia. Pominięte świadomie: /szukaj/ (noindex,
// wyniki liczy przeglądarka), /polityka-prywatnosci/ (bez wartości dla
// wyszukiwarki), /idz/* (przekierowania afiliacyjne, zablokowane w robots.txt).
function inne() {
  const korzen = teksty()
    .filter(zKorzenia)
    .map((t) => wpis(t.url, t.lastmod));
  return [
    wpis('/', dzisIso),
    wpis('/wycofania/', dzisIso),
    wpis('/kolekcjoner/', dzisIso),
    wpis('/o-nas/'),
    ...korzen,
  ];
}

/** Wpisy jednej sekcji: [{ loc, lastmod }]. */
export function wpisySekcji(sekcja) {
  switch (sekcja) {
    case 'artykuly':
      return [wpis('/artykuly/', lastmodDzialu('artykuly')), ...zTekstow('artykuly')];
    case 'prezentowniki':
      return [wpis('/prezentowniki/', lastmodDzialu('prezentowniki')), ...zTekstow('prezentowniki')];
    case 'deale':
      // /deale/ ma automatyczną listę gorących deali z cen – zmienia się co dzień
      return [wpis('/deale/', dzisIso), ...zTekstow('deale')];
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
