# Scripts

The theme uses npm. Run everything from the project root.

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Dev server on http://localhost:4321           |
| `npm run build`   | Static build into `dist/`                     |
| `npm run preview` | Serve `dist/` locally                         |
| `npm run check`   | `astro check` — type and template diagnostics |
| `npm run astro …` | Raw Astro CLI                                  |

There is no CSS build step and no content pipeline — `npm run build` is the
whole story.

## Seeding a CMS

The theme does not ship a CMS app; it only reads one. If you stand up Strapi,
seed it from the files already in this repo: `src/data/*.json` holds every
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

**Change sample content** — edit `src/data/*.json`, `npm run dev`. Routes come
from the data, so a new entry creates its detail page automatically.

**Add images** — drop them in `public/images/` (or `public/images/cms/` for
collection media) and reference them by absolute path.

**Ship** — set `SITE_URL`, `npm run build`, deploy `dist/`. It is a fully
static directory; any host will do.
