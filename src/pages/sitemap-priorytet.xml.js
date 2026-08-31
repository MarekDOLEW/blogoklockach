// Sitemapa priorytetowa — szkielet serwisu i wyłącznie strony z autorską treścią.
//
// Po co osobno, obok pełnej sitemapy z astro.config.mjs:
// pełna zgłasza ~1 200 adresów, w większości hubów cenowych złożonych z danych.
// Ta lista pokazuje robotowi cztery rzeczy i nic poza nimi:
//
//   1. stronę główną,
//   2. strony kategorii — /serie/<seria>/ plus huby działów,
//   3. artykuły, prezentowniki i posty dealowe (teksty pisane przez ludzi),
//   4. podstrony zestawów, które mają kartę opisową w karty_setow.json
//      (akapity + FAQ w danych strukturalnych) — nie same tabele cen.
//
// Zgłaszana w Search Console osobno, żeby dało się śledzić indeksację treści
// niezależnie od indeksacji hubów cenowych. Generuje się przy każdym buildzie,
// więc nie wymaga utrzymania: nowa karta zestawu albo nowy artykuł wchodzą same.
import karty from '../data/karty_setow.json';
import sety from '../data/sety.json';
import katalog from '../data/katalog.json';
import { maHub } from '../lib/huby.js';

const STRONA = 'https://tylkoklocki.pl';

// Ten sam slug co w src/pages/serie/[seria].astro — inny dałby adresy w próżnię.
const slug = (t) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');

// Huby działów: strony, które porządkują treść i są celem linkowania wewnętrznego.
const HUBY = ['/artykuly/', '/prezentowniki/', '/deale/', '/serie/', '/nowosci/', '/wycofania/'];

export async function GET() {
  // ── 1. Strona główna i kategorie ──────────────────────────────────────────
  //
  // Bez <lastmod>. Te strony przeliczają się przy każdym buildzie (ceny z feedów),
  // więc każda data byłaby datą builda, a nie datą zmiany treści. Google przy
  // niewiarygodnym lastmod przestaje ufać temu polu w całej witrynie — ta sama
  // decyzja co w astro.config.mjs.
  const serie = [
    ...new Set([
      ...Object.values(sety).map((s) => s.seria),
      ...Object.keys(katalog).filter((k) => k !== '_meta'),
    ]),
  ].filter(Boolean);

  const szkielet = [
    { url: `${STRONA}/`, priorytet: '1.0' },
    ...HUBY.map((sciezka) => ({ url: `${STRONA}${sciezka}`, priorytet: '0.7' })),
    ...serie.map((s) => ({ url: `${STRONA}/serie/${slug(s)}/`, priorytet: '0.7' })),
  ];

  // ── 2. Teksty: markdown (artykuły, deale, prezentowniki, korzeń) ───────────
  //
  // Filtr po polu `kategoria` odsiewa strony pomocnicze bez treści redakcyjnej.
  const zMarkdownu = [
    ...Object.values(import.meta.glob('./artykuly/*.md', { eager: true })),
    ...Object.values(import.meta.glob('./deale/*.md', { eager: true })),
    ...Object.values(import.meta.glob('./prezentowniki/*.md', { eager: true })),
    ...Object.values(import.meta.glob('./*.md', { eager: true })),
  ]
    .filter((m) => m.frontmatter?.kategoria)
    .map((m) => ({
      url: `${STRONA}${m.url}/`,
      lastmod: m.frontmatter.zaktualizowano ?? m.frontmatter.data,
      priorytet: '0.9',
    }));

  // Prezentowniki serii są w .astro i nie mają frontmatteru — datę i adres
  // trzymają w eksportowanym `meta`, tak samo jak czyta je hub /prezentowniki/.
  const zAstro = Object.values(import.meta.glob('./prezentowniki/*.astro', { eager: true }))
    .map((m) => m.meta)
    .filter((meta) => meta?.kategoria && meta?.url)
    .map((meta) => ({
      url: `${STRONA}${meta.url}`,
      lastmod: meta.zaktualizowano ?? meta.data,
      priorytet: '0.9',
    }));

  // ── 3. Zestawy z kartą opisową ────────────────────────────────────────────
  //
  // `maHub` to ten sam zbiór, z którego getStaticPaths buduje /zestaw/<nr>/.
  // Filtr jest tu zabezpieczeniem, nie kosmetyką: karta w karty_setow.json nie
  // gwarantuje podstrony — zestaw nieobecny w katalog.json nie dostaje huba
  // (stan na 31.08: 32 takie karty), a zgłoszony adres byłby dla Google 404.
  const zestawy = Object.keys(karty)
    .filter((nr) => nr !== '_meta' && maHub(nr))
    .map((nr) => ({
      url: `${STRONA}/zestaw/${nr}/`,
      lastmod: karty._meta?.zaktualizowano,
      priorytet: '0.8',
    }));

  const wpisy = [...szkielet, ...zMarkdownu, ...zAstro, ...zestawy]
    .map((w) =>
      [
        '  <url>',
        `    <loc>${w.url}</loc>`,
        ...(w.lastmod ? [`    <lastmod>${w.lastmod}</lastmod>`] : []),
        `    <priority>${w.priorytet}</priority>`,
        '  </url>',
      ].join('\n'),
    )
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${wpisy}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
