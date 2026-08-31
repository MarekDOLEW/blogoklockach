// Sitemapa priorytetowa – wyłącznie podstrony z realną, autorską treścią:
// artykuły, prezentowniki i te podstrony zestawów, które mają kartę opisową
// (src/data/karty_setow.json: kilka akapitów + FAQ w danych strukturalnych).
//
// Po co osobno: pełna sitemapa serwisu ma ~4800 adresów, z czego większość to
// generowane szablonowo huby cenowe. Google przy takiej proporcji łatwo uznaje
// całość za cienką treść. Ta lista pokazuje robotowi, gdzie treść naprawdę jest,
// i można ją zgłosić w Search Console jako osobną sitemapę.
//
// Plik generuje się przy każdym buildzie, więc nie wymaga utrzymania.
import karty from '../data/karty_setow.json';

const STRONA = 'https://tylkoklocki.pl';

export async function GET() {
  const artykuly = Object.values(
    import.meta.glob('./artykuly/*.md', { eager: true }),
  ).filter((m) => m.frontmatter?.kategoria);
  const prezentowniki = Object.values(
    import.meta.glob('./prezentowniki/*.md', { eager: true }),
  ).filter((m) => m.frontmatter?.kategoria);
  const korzen = Object.values(import.meta.glob('./*.md', { eager: true })).filter(
    (m) => m.frontmatter?.kategoria,
  );

  const teksty = [...artykuly, ...prezentowniki, ...korzen].map((m) => ({
    url: `${STRONA}${m.url}/`,
    lastmod: m.frontmatter.zaktualizowano ?? m.frontmatter.data,
    priorytet: '0.9',
  }));

  const zestawy = Object.keys(karty)
    .filter((nr) => nr !== '_meta')
    .map((nr) => ({
      url: `${STRONA}/zestaw/${nr}/`,
      lastmod: karty._meta?.zaktualizowano ?? new Date().toISOString().slice(0, 10),
      priorytet: '0.8',
    }));

  const wpisy = [...teksty, ...zestawy]
    .map(
      (w) =>
        `  <url>\n    <loc>${w.url}</loc>\n    <lastmod>${w.lastmod}</lastmod>\n    <priority>${w.priorytet}</priority>\n  </url>`,
    )
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${wpisy}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
