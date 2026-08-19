# Components

The theme keeps page markup inline and componentises only what is genuinely
shared. That is deliberate: the sections came from a Webflow export where nearly
every card has a layout variant, so abstracting them all would cost more than it
saves. Copy a section, bind the data, move on.

## `layouts/BaseLayout.astro`

The document shell — `<head>`, stylesheets, Webflow runtime, `<Header />`,
`<slot />`, `<Footer />`. Props are documented in
[adding-new-pages.md](./adding-new-pages.md).

The slot receives the page's own `<main class="main-wrapper">` element, so a page
controls its own top-level wrapper.

## `components/Header.astro`

Takes no props. Renders the navbar from `src/config/menu.json` and marks the
current page with `aria-current="page"` + `w--current`, matching what Webflow's
exporter produced.

To change links, edit `menu.json` — see
[page-configuration.md](./page-configuration.md). To change structure (an extra
dropdown column, a different CTA), edit the component; the `data-*` attributes on
`.navbar`, `.w-nav-menu`, `.w-dropdown` and `.w-nav-button` are what `webflow.js`
binds to, so keep them.

## `components/Footer.astro`

```astro
<Footer wfPageId="6a84225ef14a6cfa777048b7" />
```

`wfPageId` is stamped on the newsletter form, as in the export. `BaseLayout`
passes its own `wfPageId` through, so pages never render `<Footer />` directly.

Content comes from `site.json` (newsletter copy, summary, contact block, social
links, copyright) and `menu.json` (`footer` link columns).

## `components/SeoMeta.astro`

```astro
<SeoMeta title="…" description="…" ogImage="/images/og-image.webp" ogType="article" />
```

Emits title, description, Open Graph, Twitter card and canonical tags. Every prop
falls back to `site.json`. The canonical and image URLs are resolved against
`Astro.site`, so set `SITE_URL` before building for production.

Rendered by `BaseLayout`; use it directly only if you write a layout of your own.

## `components/cards/BlogCard.astro`

```astro
<BlogCard post={post} variant="v1" animate="to-top-4" titleHover />
```

| Prop         | Default     | Purpose                                                   |
| ------------ | ----------- | --------------------------------------------------------- |
| `post`       | —           | A `Blog` from `src/lib/content.ts`                        |
| `variant`    | `'default'` | `'default'` full-width card, `'v1'` staggered desktop rail |
| `animate`    | —           | IX2 trigger attribute to put on the anchor (`to-top-2`, …) |
| `titleHover` | `false`     | Adds `title-hover` to the heading                          |

Only the two anchor-rooted layouts are covered. The `-v2` and `-v3` blog cards
have a different DOM (a `<div>` root with a hover panel), so those pages keep
their markup inline.

## Writing a new component

- Take the markup from the page you are replacing, unchanged.
- Keep every `class`, `data-w-*`, `role` and `to-top-*` attribute. `webflow.js`
  and the pre-hide CSS in `BaseLayout` both select on them.
- Dynamic attribute names go through a spread:
  `const animation = animate ? { [animate]: '' } : {}` then `<a {...animation}>`.
- Rich-text fields are HTML — render with `set:html`, never `{value}`.
- Run `npm run check` afterwards; it catches template and type mistakes.

## Helpers

From `src/lib/content.ts`:

- `formatDate(iso)` → `August 18, 2026`
- `detailsImages(service)` → the multi-image field split into an array
- `related(items, slug, limit)` → other entries, for "related" rails
- `blogCategories(posts)` → sorted distinct categories, used by the `/blog` tabs

From `src/lib/nav.ts`:

- `isCurrent(href, pathname)`
- `currentClass(base, href, pathname)` → appends `w--current`
- `currentAria(href, pathname)` → `'page'` or `undefined`
