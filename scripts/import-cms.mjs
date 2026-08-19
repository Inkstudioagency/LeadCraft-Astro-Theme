/**
 * Imports the Webflow CSV exports in `CMS/` into:
 *   - `public/images/cms/`  every referenced media file, downloaded once
 *   - `src/data/*.json`     normalised collection data
 *
 * The JSON is what the theme renders when Strapi is not configured, and what
 * `Strapi/scripts/seed.mjs` pushes into Strapi when it is.
 *
 *   npm run import:cms
 */
import fs from 'node:fs/promises';
import { DATA_DIR, collectAssets, downloadAssets, loadAll, rawRows } from './lib/transform.mjs';

const assets = collectAssets(await rawRows());
console.log(`Found ${assets.length} media files referenced by the CSV exports.`);

const { downloaded, skipped } = await downloadAssets(assets);
console.log(`Media: ${downloaded} downloaded, ${skipped} already cached.`);

const data = await loadAll();
await fs.mkdir(DATA_DIR, { recursive: true });

for (const [name, rows] of Object.entries({
  services: data.services,
  'case-studies': data.caseStudies,
  blogs: data.blogs,
})) {
  await fs.writeFile(new URL(`${name}.json`, DATA_DIR), `${JSON.stringify(rows, null, 2)}\n`);
  console.log(`Wrote src/data/${name}.json (${rows.length} items).`);
}
