# Project architecture

LeadCraft is a static Astro 7 site. There is no UI framework, no island
hydration and no build-time CSS pipeline — every route renders to plain HTML at
build time.

## Where things live

```
Astro/
├── astro.config.mjs          site URL + sitemap integration
├── .env / .env.example       SITE_URL, STRAPI_URL, STRAPI_TOKEN
├── public/                   served verbatim at the site root
│   ├── css/                  normalize.css, webflow.css, the theme stylesheet
│   ├── js/webflow.js         Webflow interaction runtime (IX2)
│   ├── images/               theme artwork
│   ├── images/cms/           collection media, produced by `npm run import:cms`
│   └── fonts/ videos/ documents/
├── scripts/
│   ├── import-cms.mjs        CSV -> JSON + media download
│   └── lib/                  csv.mjs (parser), transform.mjs (normalisers)
└── src/
    ├── components/           Header, Footer, SeoMeta, cards/BlogCard
    ├── config/               site.json, menu.json, collections.json
    ├── data/                 services.json, case-studies.json, blogs.json, jsonld/
    ├── layouts/BaseLayout.astro
    ├── lib/                  content.ts, strapi.ts, nav.ts
    └── pages/                routes
```

## Data flow

```
cms-export/*.csv ──(npm run import:cms)──► src/data/*.json  +  public/images/cms/
                                          │
                                          ├──► src/lib/content.ts ──► pages
                                          │
                                          └──(your own seed script)─────► Strapi
                                                                            │
                                                     src/lib/strapi.ts ◄────┘
                                                            │
                                                            └► src/lib/content.ts
```

`src/lib/content.ts` is the only module pages import for content. It decides at
build time which backend to use:

- `STRAPI_URL` unset → returns the bundled `src/data/*.json`
- `STRAPI_URL` set → fetches `/api/services`, `/api/case-studies`, `/api/blogs`
  with `populate=*`, normalises Strapi's media objects to plain URL strings, and
  returns the identical shape

Because both paths return the same `Service` / `CaseStudy` / `Blog` types, no
page knows or cares which backend is live.

## Rendering shell

Every page is:

```astro
<BaseLayout wfPageId="…" title="…" hidden="…">
  <main class="main-wrapper"> … page sections … </main>
</BaseLayout>
```

`BaseLayout.astro` owns the `<head>`, the three Webflow stylesheets, the runtime
`<script>` tags, `<Header />` and `<Footer />`. The slot receives the page's own
`<main>` element (the 404 page passes a `<div>` and `wrapper="utility-page-wrapper"`).

## The Webflow runtime

`public/js/webflow.js` reads class names and `data-w-*` attributes out of the DOM
to drive the navbar, dropdowns, tabs, lightboxes, sliders and every scroll
animation. Those attributes are behaviour, not decoration — see
[styling-and-theming.md](./styling-and-theming.md) before editing markup.

The `hidden` prop on `BaseLayout` carries the pre-hide selector list Webflow
emits per page, so elements that animate in are not visible in their end state
before the runtime boots.

## Related

- [adding-new-pages.md](./adding-new-pages.md)
- [component-usage.md](./component-usage.md)
- [content-management.md](./content-management.md)
- [page-configuration.md](./page-configuration.md)
- [script-usage.md](./script-usage.md)
- [styling-and-theming.md](./styling-and-theming.md)
- [i18n-guidance.md](./i18n-guidance.md)
