// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// Absolute site URL — used for canonical links, Open Graph tags and the
// sitemap. Set SITE_URL in `.env` (or your host's env) before deploying.
const site = process.env.SITE_URL ?? 'https://example.com';

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [sitemap()],
  // The Webflow runtime ships pre-minified CSS/JS from `public/`, so Astro only
  // has the pages themselves to build.
  build: { format: 'directory' },
});
