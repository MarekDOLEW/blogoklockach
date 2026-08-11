import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://blogoklockach.pl',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' }
});
