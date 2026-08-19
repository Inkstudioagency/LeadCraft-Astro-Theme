# LeadCraft — Business Consulting Astro Theme

A conversion-focused consulting and coaching theme: 3 home layouts, 3 about
layouts, 3 contact layouts, plus services, case studies and a blog — all driven
by content you can edit as JSON or serve from Strapi.

Built with **Astro 7**. No UI framework, no build-time CSS pipeline: the theme
ships the compiled stylesheet and the Webflow interaction runtime as static
assets, so pages render as pure HTML.

---

## Quick start

```sh
npm install
npm run dev          # http://localhost:4321
```

```sh
npm run build        # static output in dist/
npm run preview      # serve dist/ locally
npm run check        # astro check — type + template diagnostics
```

Copy `.env.example` to `.env` and set `SITE_URL` before deploying; canonical
links, Open Graph tags and `sitemap-index.xml` are generated from it.

---

## Pages

| Route                  | File                                | Notes                       |
| ---------------------- | ----------------------------------- | --------------------------- |
| `/`                    | `src/pages/index.astro`             | Theme preview / showcase    |
| `/home-v1` … `/home-v3`| `src/pages/home-v*.astro`           | Three homepage layouts      |
| `/about-v1` … `-v3`    | `src/pages/about-v*.astro`          | Three about layouts         |
| `/contact-v1` … `-v3`  | `src/pages/contact-v*.astro`        | Three contact layouts       |
| `/services`            | `src/pages/services/index.astro`    | CMS collection              |
| `/services/[slug]`     | `src/pages/services/[slug].astro`   | CMS detail                  |
| `/case-studies`        | `src/pages/case-studies/index.astro`| CMS collection              |
| `/case-studies/[slug]` | `src/pages/case-studies/[slug].astro`| CMS detail                 |
| `/blog`                | `src/pages/blog/index.astro`        | CMS collection, tab filters |
| `/blog/[slug]`         | `src/pages/blog/[slug].astro`       | CMS detail                  |
| `/style-guide`         | `src/pages/style-guide.astro`       | Typography and components   |
| `/404`                 | `src/pages/404.astro`               | Not found                   |

---

## Content

Three collections — **services**, **case studies** and **blogs**. Every page
reads them through `src/lib/content.ts`, which has two backends:

**Bundled JSON (default).** `src/data/*.json` ships with the theme. Edit it
directly and rebuild — no services to run.

**Strapi.** Set `STRAPI_URL` (and `STRAPI_TOKEN` if the collections are not
public) in `.env` and the same loaders fetch from the CMS instead. Nothing else
in the theme changes.

How many items each section shows is set in `src/config/collections.json`.

### Wiring up Strapi

The theme expects three Strapi 5 collection types whose attribute names match
the fields above:

| Collection  | Endpoint            |
| ----------- | ------------------- |
| Service     | `/api/services`     |
| Case Study  | `/api/case-studies` |
| Blog        | `/api/blogs`        |

Notes on the field design:

- Fields ending in `Title`, `Text`, `Content` or `Stat` hold **HTML**, not
  Markdown — the theme renders them with `set:html`.
- `thumbnail`, `bannerImage`, `logo` are single media; `detailsImage` is
  multiple media.
- Case Study has a `service` relation (many-to-one) back to Service.
- Add a `publishedDate` (date) field — the theme sorts and displays it, so
  editors control the byline independently of Strapi's own `publishedAt`.

`src/lib/strapi.ts` fetches with `populate=*` and normalises media objects to
plain URL strings, so nothing else needs changing.

### Regenerating the sample content

The bundled JSON and the CMS media in `public/images/cms/` are generated from
the Webflow CSV exports in `cms-export/`:

```sh
npm run import:cms
```

It downloads every referenced image once, rewrites the URLs to local paths, and
writes `src/data/{services,case-studies,blogs}.json`.

---

## Configuration

| File                            | What it controls                                   |
| ------------------------------- | -------------------------------------------------- |
| `src/config/site.json`          | Name, SEO defaults, logos, footer copy, contact, social |
| `src/config/menu.json`          | Header nav, dropdown columns, footer link columns   |
| `src/config/collections.json`   | How many items each collection section renders      |
| `astro.config.mjs`              | `site` URL and integrations                         |
| `.env`                          | `SITE_URL`, `STRAPI_URL`, `STRAPI_TOKEN`            |

### Placeholder content

Every outward-facing link, email, phone number and address is a placeholder:
URLs use `example.com`, and the social icons point at bare root domains rather
than profiles. That is deliberate — the Astro theme catalogue rejects listings
carrying personal or real-world content.

Replace them in `src/config/site.json` when you build your own site; leave them
alone if you are deploying this as a catalogue demo.

---

## Project structure

```
public/
  css/       Webflow stylesheets (normalize, webflow, theme)
  js/        Webflow interaction runtime
  images/    Theme artwork; images/cms/ holds the collection media
  fonts/  videos/  documents/
src/
  components/   Header, Footer, SeoMeta, cards/
  config/       site.json, menu.json, collections.json
  data/         Generated collection JSON + JSON-LD documents
  layouts/      BaseLayout.astro
  lib/          content.ts (loaders), strapi.ts (client), nav.ts
  pages/        Routes
scripts/
  import-cms.mjs   CSV -> JSON + media download
```

---

## Styling

Styles live in `public/css/leadcraft-astro-theme.webflow.css`, exported from the
original design. Colours, spacing and typography are CSS custom properties
declared on `:root` near the top of that file — change them there to re-skin the
theme without touching markup.

Class names and `data-w-*` attributes are load-bearing: `public/js/webflow.js`
uses them to drive the navbar, dropdowns, tabs, lightboxes and the scroll
interactions. Keep them when editing markup.

---

## Credits

Third-party scripts loaded at runtime: jQuery, GSAP (with SplitText and
ScrollTrigger) and Lenis. Fonts are Geist and Instrument Serif via Google Fonts.

## License

MIT — see [LICENSE](./LICENSE).
