# Site settings, navigation and SEO

Three JSON files in `src/config/` plus `.env` cover everything you would
normally rebrand.

## `src/config/site.json`

| Key             | Used by                                                        |
| --------------- | -------------------------------------------------------------- |
| `name`          | Footer wordmark                                                  |
| `title`         | Default `<title>` and `og:title`                                 |
| `description`   | Default meta description, `og:description`, `twitter:description` |
| `lang`          | `<html lang>`                                                    |
| `ogImage`       | Default social share image (`/images/og-image.webp`)             |
| `logo`          | Header logo `src` and `alt`                                      |
| `footerLogo`    | Footer wordmark image                                            |
| `newsletter`    | Footer form heading, placeholder, button, success/error strings  |
| `footerSummary` | Paragraph under the footer logo                                  |
| `contact`       | Footer email / phone / address, with their `href`s and labels     |
| `social`        | The four footer icon links                                       |
| `copyright`     | Footer bottom bar                                                |
| `author`        | Nav dropdown footer — `label` (link text), `url`, `themes`, `customization` |

Rebranding is: replace the two logo files in `public/images/`, swap `name`,
`title`, `description`, `contact`, `social`, `copyright` and `author`, then
re-skin via [styling-and-theming.md](./styling-and-theming.md).

### Placeholder links

Everything outward-facing ships as a placeholder, because the Astro theme
catalogue rejects listings that carry personal or real-world content:

- URLs and emails use `example.com`
- social icons point at bare root domains (`https://github.com`, not a profile)
- the phone number and address are dummy values

Swap them for real values when you deploy your own site — but if you are
publishing a *demo* for a catalogue submission, leave them as they are.

## `src/config/menu.json`

```json
{
  "brand": "/home-v1",
  "main":     [{ "label": "Home", "href": "/home-v1" }],
  "dropdown": [{ "title": "Main pages", "links": [ … ] }],
  "contact":  { "label": "Contact", "href": "/contact-v1" },
  "cta":      { "label": "Get Started", "href": "/contact-v1" },
  "footer":   [{ "title": "Main Pages", "links": [ … ] }]
}
```

- `main` — the inline header links, before the Pages dropdown
- `dropdown` — the three columns inside it; add or remove columns freely
- `footer` — the footer link columns; the Contact column is rendered from
  `site.json` and is not listed here
- A footer link may carry `"break": true`, which appends the `<br>` the original
  export had on that item

Highlighting is automatic: any link whose `href` equals the current path gets
`aria-current="page"` and `w--current`. Matching is exact, so `/services/foo`
does not highlight the `/services` link — same as the Webflow original.

## `src/config/collections.json`

How many items each collection section renders. See
[content-management.md](./content-management.md).

## SEO

`components/SeoMeta.astro` produces title, description, Open Graph, Twitter card
and `<link rel="canonical">`. Per-page overrides are `BaseLayout` props:

```astro
<BaseLayout
  title="Services || Consulting Website Astro Theme"
  description="…"
  ogImage={service.bannerImage}
  ogType="article"
>
```

Detail pages already set all four from the CMS entry.

### Structured data

Pass a plain object as `jsonLd` and it is serialised into an
`application/ld+json` script. The two documents that ship with the theme live in
`src/data/jsonld/` (`preview.json` for `/`, `home-v1.json` for `/home-v1`) —
update the service list and URLs there if you change the offering.

### Canonical URLs and the sitemap

Both come from `site` in `astro.config.mjs`, which reads `SITE_URL`:

```sh
# .env
SITE_URL="https://your-domain.com"
```

`@astrojs/sitemap` writes `sitemap-index.xml` at build. Update the `Sitemap:`
line in `public/robots.txt` to match your domain.

## Environment variables

| Variable       | Required | Purpose                                         |
| -------------- | -------- | ----------------------------------------------- |
| `SITE_URL`     | for prod | Canonical links, Open Graph URLs, sitemap        |
| `STRAPI_URL`   | no       | Load content from Strapi instead of `src/data/` |
| `STRAPI_TOKEN` | no       | Only if the Strapi collections are not public    |

Copy `.env.example` to `.env` to get started.
