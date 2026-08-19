# Styling and theming

There is no Tailwind and no CSS build step. The theme ships three stylesheets in
`public/`, loaded in order by `BaseLayout.astro`:

| File                                        | Role                                        |
| ------------------------------------------- | ------------------------------------------- |
| `public/css/normalize.css`                  | Reset                                       |
| `public/css/webflow.css`                    | Webflow's `w-*` layout and widget primitives |
| `public/css/leadcraft-astro-theme.webflow.css` | Design tokens + every theme class          |

Astro does not process them, so edits appear on refresh with no rebuild.

## Design tokens

The theme file opens with `@font-face` declarations and a `:root` block of ~128
custom properties. Change these to re-skin the theme without touching a single
component.

```css
:root {
  --_color---bg-color-1: #1e1e1e;
  --_color---bg-color-2: #252525;
  --_color---bg-color-3: #1a1a1a;
  --_color---primary-color--400: #85acfa;
  --_color---primary-color--500: #4f88f8;
  --_color---primary-color--600: #0c5eff;
  --_color---primary-color--700: #07193c;
  --_color---gray-color--300: #e6e6e6;
  --_color---gray-color--400: #8f8f8f;
  --_color---gray-color--900: #0a0a0a;
  --_color---white-color--900: white;      /* plus 100–800 alpha steps */
  --_color---strock-color-1: #575757;

  --_typography---font-family--body-font-family: Geist, sans-serif;
  --_typography---font-family--heading-font-family: Generalsans, Arial, sans-serif;
  --_typography---typography--h1: 4rem;    /* h1–h6 and paragraph-1…4 */

  --spacers--spacer-4xs: .5rem;            /* 4xs … 4xl */
  --redius--redius-xs: .25rem;             /* xs, sm, main, xl, none */
  --container-sizes--container-main: 60rem;
  --blur--backdrop-blur: 2rem;
}
```

Naming follows the Webflow variable groups: `--_color---*`, `--_typography---*`,
`--spacers--*`, `--redius--*` (sic), `--container-sizes--*`, `--sizes--*`,
`--blur--*`.

Three quick recipes:

- **Accent colour** — change the four `--_color---primary-color--*` values.
- **Dark to light** — swap `--_color---bg-color-1/2/3` and the `white`/`gray`
  ramps. The theme is dark by design; there is no light/dark toggle.
- **Type scale** — change `--_typography---typography--h1` … `h6` and
  `paragraph-1` … `4`. Utility classes (`heading-style-1`, `text-size-regular`,
  `text-size-small`) read from those.

## Fonts

- **Generalsans** — headings, self-hosted from `public/fonts/*.otf` via
  `@font-face` at the top of the theme stylesheet.
- **Geist** and **Instrument Serif** — loaded from Google Fonts by the WebFont
  loader in `BaseLayout.astro`.

To swap a Google font, edit the `WebFont.load` call in `BaseLayout.astro` and the
matching `--_typography---font-family--*` token. To swap the self-hosted font,
drop the files into `public/fonts/` and update the `@font-face` blocks.

## Breakpoints

Webflow's four: `991px`, `767px` and `479px` max-width blocks, plus `1280px`,
`1440px` and `1920px` min-width blocks near the end of the file. Follow the same
pattern when adding responsive rules.

## Utility classes worth knowing

- Headings: `heading-style-1` … `heading-style-6`
- Body: `text-size-large`, `text-size-regular`, `text-size-small`,
  `paragraph-small`, `paragraph-xsmall`
- Colour: `text-color-white`, `text-color-white-800`, `text-color-gray-600`,
  `text-color-primary-900`
- Alignment: `text-align-center`, `text-align-middle`
- Layout: `container-main w-container`, `section-gap`, `max-width-*`,
  `overflow-hidden`
- Sections: every top-level block is `section_<name>`

`/style-guide` renders all of them — the fastest way to see what a token change
did.

## Class names are behaviour

`public/js/webflow.js` selects on classes and `data-w-*` attributes to run the
navbar, dropdowns, tabs, lightboxes, sliders and the IX2 scroll animations.
Renaming or dropping them silently breaks interactions.

Load-bearing, non-exhaustive:

- `w-nav`, `w-nav-menu`, `w-nav-button`, `w-dropdown`, `w-dropdown-toggle`,
  `w-dropdown-list`
- `w-tabs`, `w-tab-menu`, `w-tab-link`, `w-tab-pane`, `data-w-tab`
- `w-lightbox` and its sibling `<script type="application/json" class="w-json">`
- `w-dyn-list`, `w-dyn-items`, `w-dyn-item`, `w-dyn-empty`
- `to-top-0`, `to-top-2`, `to-top-4`, `to-top-6`, `to-top-8` and the `…s`
  variants — IX2 scroll triggers
- `_wf-counter` — the count-up animation in `BaseLayout`
- `title-animation`, `title-hover`, `title-hover-v1`, `title-hover-v2`

Add your own styling hooks as extra classes; do not repurpose these.

## The pre-hide style

`BaseLayout` renders

```css
html.w-mod-js:not(.w-mod-ix3) :is(<selectors>) { visibility: hidden !important; }
```

from the page's `hidden` prop. It keeps elements that animate in from flashing at
their end state before the runtime boots. If something on a new page flickers on
load, add its selector to that page's `hidden` list.

## Adding your own CSS

Put a stylesheet in `public/css/` and add a `<link>` after the theme file in
`BaseLayout.astro`, or use a scoped `<style>` block inside a component — Astro
scopes those automatically, so they cannot collide with Webflow's classes.

Avoid editing `leadcraft-astro-theme.webflow.css` beyond the `:root` block: it is
generated output, and keeping your changes separate makes a future re-export
merge-able.
