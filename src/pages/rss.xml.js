// Feed RSS serwisu: 30 najnowszych tekstów z artykułów, prezentowników i deali.
//
// Po co: Google Discover i czytniki RSS dostają jasny sygnał „to jest nowe"
// niezależnie od budżetu crawlowania sitemapy; przy młodej domenie to szybsza
// droga do ruchu niż klasyczne wyniki wyszukiwania. Adres: /rss.xml,
// zadeklarowany w <head> każdej strony (Base.astro) i w stopce.
//
// Lista pochodzi z tego samego indeksu co sitemapy sekcyjne (src/lib/teksty.js),
// więc nowy tekst wchodzi do feedu sam, bez edycji tego pliku.
import rss from '@astrojs/rss';
import { teksty } from '../lib/teksty.js';

const STRONA = 'https://tylkoklocki.pl';
const ILE = 30;

export function GET(context) {
  const site = context.site ?? new URL(STRONA);
  const wpisy = teksty()
    .filter((t) => t.data)
    .slice(0, ILE)
    .map((t) => ({
      title: t.tytul,
      description: t.opis,
      link: t.url,
      pubDate: new Date(`${t.data}T06:00:00+02:00`),
      categories: [t.kategoria, ...t.tagi].filter(Boolean),
    }));

  return rss({
    title: 'tylkoklocki.pl',
    description:
      'Prawdziwe promocje na zestawy LEGO liczone od cen katalogowych, recenzje, prezentowniki i premiery – bez pseudopromocji.',
    site,
    items: wpisy,
    customData: [
      '<language>pl-pl</language>',
      `<image><url>${STRONA}/og.png</url><title>tylkoklocki.pl</title><link>${STRONA}/</link></image>`,
    ].join(''),
  });
}
