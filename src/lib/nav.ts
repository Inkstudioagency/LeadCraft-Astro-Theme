/**
 * Webflow flags the link that points at the page you are on with
 * `aria-current="page"` and a `w--current` class. These helpers reproduce that
 * from Astro's `Astro.url.pathname`.
 */
const normalise = (path: string) => (path === '/' ? '/' : path.replace(/\/+$/, ''));

export const isCurrent = (href: string, pathname: string) =>
  normalise(href) === normalise(pathname);

/** `class` value for a nav link, with Webflow's current-page modifier appended. */
export const currentClass = (base: string, href: string, pathname: string) =>
  isCurrent(href, pathname) ? `${base} w--current` : base;

/** `aria-current` value, or undefined so the attribute is omitted entirely. */
export const currentAria = (href: string, pathname: string) =>
  isCurrent(href, pathname) ? 'page' : undefined;
