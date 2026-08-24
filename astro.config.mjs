import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkGaleria from './scripts/remark-galeria.mjs';

export default defineConfig({
  site: 'https://tylkoklocki.pl',
  // lastmod = data builda: dane cenowe zmieniają się przy każdym deployu,
  // więc data builda uczciwie oddaje świeżość treści
  integrations: [sitemap({ serialize: (item) => ({ ...item, lastmod: new Date().toISOString() }) })],
  // Znacznik <div class="galeria-setow" data-sety="…"> w markdownie zamienia się
  // przy budowaniu na slajder zdjęć zestawów (scripts/remark-galeria.mjs).
  markdown: { remarkPlugins: [remarkGaleria] },
  build: { inlineStylesheets: 'auto' }
});
