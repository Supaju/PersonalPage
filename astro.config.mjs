import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Set `site` to the real URL once the host is chosen (needed for sitemap + OG tags).
export default defineConfig({
  site: 'https://yourname.github.io',
  integrations: [sitemap()],
});
