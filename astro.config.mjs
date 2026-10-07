import { defineConfig, fontProviders } from 'astro/config';
import remarkGaleria from './scripts/remark-galeria.mjs';
import remarkCeny from './scripts/remark-ceny.mjs';
import remarkNazwySetow from './scripts/remark-nazwy-setow.mjs';
import remarkLinkiSklepow from './scripts/remark-linki-sklepow.mjs';

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
  // Przekierowania: od 29.09.2026 wyłącznie public/_redirects (prawdziwe 301
  // z Cloudflare). `redirects` Astro przy stronie statycznej dawało 200 + meta refresh.
  // Znacznik <div class="galeria-setow" data-sety="…"> w markdownie zamienia się
  // przy budowaniu na slajder zdjęć zestawów (scripts/remark-galeria.mjs).
  // remarkNazwySetow stoi na końcu: pracuje na tekście, a dwa poprzednie
  // wstawiają gotowy HTML, którego nie rusza.
  // remarkLinkiSklepow: ręczne linki /idz/ w markdownie dostają nową kartę + noopener.
  markdown: { remarkPlugins: [remarkGaleria, remarkCeny, remarkNazwySetow, remarkLinkiSklepow] },
  // CSS wspólny (16 KB) wkładamy do HTML-a: osobny plik blokował pierwszy
  // render o jedną rundę sieci (~700 ms na 4G); dla ruchu z Google, gdzie
  // większość wizyt to jedna strona, to wygrana netto (audyt PageSpeed 7.10.2026).
  build: { inlineStylesheets: 'always' },
  // Archivo przez Fonts API: pliki z preloadem, zastępcza czcionka systemowa
  // z dopasowanymi metrykami (bez przesunięć przy podmianie kroju). Zmienna
  // --font-archivo trafia do --font-display w global.css.
  experimental: {
    fonts: [
      {
        provider: fontProviders.fontsource(),
        name: 'Archivo',
        cssVariable: '--font-archivo',
        weights: [700, 800],
        styles: ['normal'],
        subsets: ['latin', 'latin-ext'],
        fallbacks: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    ],
  },
});
