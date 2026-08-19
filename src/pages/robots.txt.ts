import type { APIRoute } from 'astro';

/**
 * Generated from `site` in astro.config.mjs (i.e. the SITE_URL env var), so the
 * sitemap reference is always correct for wherever the theme is deployed.
 */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site).href;

  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
