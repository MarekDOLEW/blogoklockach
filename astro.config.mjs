import { defineConfig } from 'astro/config';
import remarkGaleria from './scripts/remark-galeria.mjs';
import remarkCeny from './scripts/remark-ceny.mjs';
import remarkNazwySetow from './scripts/remark-nazwy-setow.mjs';

// ── Sitemapy ─────────────────────────────────────────────────────────────────
//
// Integracja @astrojs/sitemap zdjęta 09.09.2026. Powód: dawała jeden plik
// sitemap-0.xml bez <lastmod> (jedyną datą, jaką umiała podać, była data
// builda – a runnery budują serwis kilka razy dziennie), a filtr „opis albo
// dwa sklepy" przepuszczał już 3 418 hubów /zestaw/ przy 20 artykułach.
//
// Teraz sitemapy generują własne endpointy: src/pages/sitemap-index.xml.js
// (ten sam adres co dotąd, wpisany w robots.txt) wskazuje siedem sitemap
// sekcyjnych src/pages/sitemap-<sekcja>.xml.js. Listę adresów, lastmod
// i regułę, które huby zgłaszamy (ta sama, która nadaje noindex),
// trzymają src/lib/sitemapy.js i src/lib/seo.js.

export default defineConfig({
  site: 'https://tylkoklocki.pl',
  // /kalendarz-redakcyjny/ byl przez chwile publiczny (28.08.2026) — plan
  // redakcyjny to material wewnetrzny, nie tresc dla czytelnika. Adres zdjety;
  // przekierowanie zostaje, zeby ewentualny odsylacz z zewnatrz nie trafial
  // w 404. Plan mieszka teraz w redakcja/plan-redakcyjny.json (poza buildem).
  redirects: {
    '/kalendarz-redakcyjny': '/artykuly/',
    // 80120 i 80121 przeniesione do Seasonal (decyzja Marka, 28.08.2026), przez co
    // seria "Tradycyjne festiwale chinskie" zostala bez zestawow i jej strona znikla.
    '/serie/tradycyjne-festiwale-chinskie': '/serie/seasonal/',
  },
  // Znacznik <div class="galeria-setow" data-sety="…"> w markdownie zamienia się
  // przy budowaniu na slajder zdjęć zestawów (scripts/remark-galeria.mjs).
  // remarkNazwySetow stoi na końcu: pracuje na tekście, a dwa poprzednie
  // wstawiają gotowy HTML, którego nie rusza.
  markdown: { remarkPlugins: [remarkGaleria, remarkCeny, remarkNazwySetow] },
  build: { inlineStylesheets: 'auto' }
});
