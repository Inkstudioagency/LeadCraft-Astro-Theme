# Managing content

The theme has three collections: **services**, **case studies** and **blogs**.
They are not Astro content collections and there is no markdown — the content
came from a Webflow CMS export, so it is structured data with HTML-valued rich
text fields.

## Where content comes from

`src/lib/content.ts` exposes `getServices()`, `getCaseStudies()` and `getBlogs()`.
Which backend answers depends on one environment variable:

| `STRAPI_URL` | Source                                      |
| ------------ | ------------------------------------------- |
| unset        | `src/data/services.json` etc. (ships with the theme) |
| set          | `GET {STRAPI_URL}/api/services?populate=*` etc.      |

Both return the same shape, so pages never branch on the backend.

## Editing the bundled JSON

Open `src/data/blogs.json`, add an object, rebuild. Nothing else is needed —
routes come from the data, so a new entry creates `/blog/<slug>` automatically.

```json
{
  "title": "How to price a retainer",
  "slug": "how-to-price-a-retainer",
  "thumbnail": "/images/cms/blog-thumbnail-9-704b65.jpg",
  "detailsTitle": "<h1>How to Price <em>a Retainer</em></h1>",
  "bannerImage": "/images/cms/blog-banner-image-9-704b66.webp",
  "detailsText": "<h2>Lead</h2><p>Body copy…</p>",
  "category": "Guidance",
  "readTime": "6 min",
  "publishedAt": "2026-08-18T09:28:59.000Z"
}
```

Images go in `public/images/cms/` and are referenced by absolute path.

### Fields

**Service** — `title`, `slug`, `summary`, `thumbnail`, `detailsTitle`,
`bannerImage`, `pricingContent`, `detailsTextOne`, `detailsImage`,
`detailsTextTwo`, `resultStatOne`…`Four`, `publishedAt`.
`detailsImage` holds several paths separated by `; ` — read it with
`detailsImages(service)`.

**CaseStudy** — `title`, `slug`, `thumbnail`, `logo`, `pipelineGrowth`,
`revenueGrowth`, `bannerImage`, `detailsTitle`, `primaryFocus`, `teamSize`,
`company`, `services` (the slug of the related service), `detailsText`,
`impactStatOne`…`Three`, `publishedAt`.

**Blog** — `title`, `slug`, `thumbnail`, `detailsTitle`, `bannerImage`,
`detailsText`, `category`, `readTime`, `publishedAt`.

Fields whose names end in `Title`, `Text`, `Content` or `Stat` hold **HTML**, and
are rendered with `set:html`. The counter animation reads the first number it
finds inside a `_wf-counter` element, so keep stats in the
`<h4>3x</h4><p>Label</p>` shape.

`category` drives the tabs on `/blog` — one tab per distinct value, plus "All".
Adding a new category adds a tab automatically.

## Using Strapi instead

```sh
# .env
STRAPI_URL="http://localhost:1337"
STRAPI_TOKEN=""     # only if the collections are not publicly readable
```

See the **Wiring up Strapi** section of the README for the collection types and field names the loaders expect. Content is pulled
at build time, so rebuild the site after editing in the CMS.

## Rendering a collection in a page

Keep Webflow's list classes and wrap the item in a `.map()`:

```astro
<div class="blog-collection-block w-dyn-list">
  <div role="list" class="blog-collection-list w-dyn-items">
    {posts.map((post) => (
    <div role="listitem" class="blog-collection-item w-dyn-item">
      <BlogCard post={post} titleHover />
    </div>
    ))}
  </div>
  {posts.length === 0 && (
  <div class="w-dyn-empty">
    <div>No items found.</div>
  </div>
  )}
</div>
```

`w-dyn-list`, `w-dyn-items`, `w-dyn-item` and `w-dyn-empty` carry layout styling
— dropping them breaks the grid.

How many items a section shows lives in `src/config/collections.json`:

```json
{
  "home":    { "services": 4, "caseStudies": 4, "blogs": 3 },
  "about":   { "blogs": 3 },
  "related": { "services": 3, "caseStudies": 3, "blogs": 3 }
}
```

Some home layouts render one collection through several single-item lists
(`blog-collection-block is-1 / is-2 / is-3`) to stagger the scroll animation.
Those use `posts.slice(0, 1)`, `.slice(1, 2)` and so on — keep the slices in
order if you change the count.
