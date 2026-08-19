# Multi-language (i18n)

**The theme ships single-language.** There is no locale routing, no translation
files and no language picker. `site.json` sets one `lang`, which becomes
`<html lang>`.

This document describes how to add i18n, and what in this particular theme needs
attention when you do.

## 1. Turn on Astro's routing

```js
// astro.config.mjs
export default defineConfig({
  site,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: { prefixDefaultLocale: false },
  },
});
```

Then move pages under locale folders — `src/pages/es/services/index.astro` — or
generate them from a `[locale]` dynamic segment. Astro's
[i18n guide](https://docs.astro.build/en/guides/internationalization/) covers
both shapes.

## 2. Translate the UI strings

Two kinds of text live outside the CMS:

**Config strings** — everything in `src/config/site.json` and `menu.json`
(newsletter copy, contact labels, nav labels, footer titles). Split them per
locale:

```
src/config/
  en/site.json  en/menu.json
  es/site.json  es/menu.json
```

and have `Header.astro` / `Footer.astro` / `SeoMeta.astro` take a `locale` prop —
or read `Astro.currentLocale` — and import the right file.

**Inline section copy** — headings, paragraphs and button labels sit directly in
the page markup, because they came from a Webflow export. This is the bulk of
the work. Two options:

- Duplicate the page per locale and translate in place. Simple, and fine for a
  handful of pages.
- Extract the strings into `src/i18n/<locale>.json` and reference them
  (`{t.services.heading}`). More upfront work, much better for more than two
  locales.

There is no half-measure that avoids touching the pages.

## 3. Localise the collections

`src/lib/content.ts` has no locale concept. Add one at the boundary so pages stay
unchanged:

**With the bundled JSON** — keep `src/data/<locale>/services.json` and pick the
directory in `content.ts`.

**With Strapi** — install the Internationalization plugin, enable it on the three
content types, and pass the locale through:

```ts
url.searchParams.set('locale', locale);
```

in `src/lib/strapi.ts`. Strapi returns the localised entry, or the default-locale
one when no translation exists.

Slugs are usually localised too, so `getStaticPaths` must emit a path per locale
and the `related()` helper must filter within a locale.

## 4. Language switcher

Add it to `Header.astro` next to the CTA. Style it with the existing dropdown
classes (`w-dropdown`, `w-dropdown-toggle`, `w-dropdown-list`) so `webflow.js`
handles the open/close behaviour for free.

## 5. Per-locale SEO

`SeoMeta.astro` emits one canonical link. For a multi-language site add
`hreflang` alternates:

```astro
{locales.map((l) => (
  <link rel="alternate" hreflang={l} href={new URL(pathFor(l), Astro.site).href} />
))}
```

and set `<html lang>` from the active locale rather than `site.json`.

## What to watch out for in this theme

- **RTL** is not supported. The Webflow stylesheet uses physical properties
  (`margin-left`, `left`) throughout, so an RTL locale needs a companion
  stylesheet — not just `dir="rtl"`.
- **Fonts.** Generalsans and Geist have limited script coverage. Check your
  target languages and add a fallback face if needed
  ([styling-and-theming.md](./styling-and-theming.md)).
- **`wfPageId`.** Locale variants of a page can share the same id; it only feeds
  the Webflow form attributes.
- **Dates.** `formatDate()` in `src/lib/content.ts` hardcodes `'en-US'`. Pass the
  locale in when you localise.
