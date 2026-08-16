import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://tylkoklocki.pl',
  // lastmod = data builda: dane cenowe zmieniają się przy każdym deployu,
  // więc data builda uczciwie oddaje świeżość treści
  integrations: [sitemap({ serialize: (item) => ({ ...item, lastmod: new Date().toISOString() }) })],
  build: { inlineStylesheets: 'auto' }
});
