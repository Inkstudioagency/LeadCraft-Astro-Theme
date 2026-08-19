# Scripts

The theme uses npm, not pnpm. Run everything from the `Astro/` directory.

| Command              | What it does                                            |
| -------------------- | ------------------------------------------------------- |
| `npm run dev`        | Dev server on http://localhost:4321                     |
| `npm run build`      | Static build into `dist/`                               |
| `npm run preview`    | Serve `dist/` locally                                   |
| `npm run check`      | `astro check` — type and template diagnostics           |
| `npm run import:cms` | Rebuild `src/data/*.json` and `public/images/cms/` from the CSV exports |
| `npm run astro …`    | Raw Astro CLI                                            |

## `npm run import:cms`

`scripts/import-cms.mjs`, with helpers in `scripts/lib/`.

1. Parses the three CSVs in `cms-export/` (`scripts/lib/csv.mjs` — a small RFC 4180
   parser, because the exports contain embedded newlines and HTML).
2. Collects every `cdn.prod.website-files.com` URL across all fields, including
   the ones inside rich text.
3. Downloads each into `public/images/cms/`, naming it
   `<original-name>-<last 6 of the Webflow asset id>.<ext>` so two assets that
   share a human name cannot collide. Files already present are skipped, so
   re-running is cheap.
4. Rewrites every URL in the data to `/images/cms/<file>`.
5. Writes `src/data/services.json`, `case-studies.json` and `blogs.json`.

Rows with `Archived` or `Draft` set to `true` are dropped.

**It overwrites those three JSON files.** If you have hand-edited them, back them
up first — or treat the CSVs as the source of truth and edit those.

Adding a collection means adding a `load…()` function in
`scripts/lib/transform.mjs` and a line in `import-cms.mjs`.

## Seeding Strapi

The theme does not ship a Strapi app — it only reads one. If you stand up your
own, seed it from the files already in this repo: `src/data/*.json` holds every
entry and `public/images/cms/` holds every media file, named to match the paths
in the JSON.

A seed script needs to, per collection:

1. upload each referenced file from `public/images/cms/` once and keep its id
2. create the entry with the media ids in place of the path strings
3. split `detailsImage` on `;` for the multi-image field
4. copy `publishedAt` from the JSON into the entry's `publishedDate`
5. resolve a case study's `services` slug to the matching Service relation

Then enable `find` and `findOne` for the public role — or issue a read-only API
token and set `STRAPI_TOKEN`.

See the **Wiring up Strapi** section of the README for the expected collection
types and attribute names.

## Typical flows

**Change sample content** — edit `src/data/*.json`, `npm run dev`.

**Re-import from Webflow** — drop new CSVs into `cms-export/`, then
`npm run import:cms`. Re-seed your Strapi instance afterwards if you use one.

**Ship** — set `SITE_URL`, `npm run build`, deploy `dist/`. It is a fully static
directory; any host will do.
