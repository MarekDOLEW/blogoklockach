import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkGaleria from './scripts/remark-galeria.mjs';

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
  integrations: [sitemap()],
  // Znacznik <div class="galeria-setow" data-sety="…"> w markdownie zamienia się
  // przy budowaniu na slajder zdjęć zestawów (scripts/remark-galeria.mjs).
  markdown: { remarkPlugins: [remarkGaleria] },
  build: { inlineStylesheets: 'auto' }
});
