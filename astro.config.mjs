import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://tylkoklocki.pl',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' }
});
