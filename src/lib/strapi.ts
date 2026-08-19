/**
 * Thin Strapi 5 REST client.
 *
 * The theme runs without Strapi: when `STRAPI_URL` is unset every loader in
 * `src/lib/content.ts` falls back to the JSON in `src/data/`, which is what
 * `npm run import:cms` generates from the CSV exports in `CMS/`.
 */

export const STRAPI_URL = (import.meta.env.STRAPI_URL ?? '').replace(/\/$/, '');
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN ?? '';

export const strapiEnabled = STRAPI_URL !== '';

/** Strapi media fields come back as objects; the theme only needs the url. */
export type StrapiMedia = { url: string; alternativeText?: string | null } | null;

/** Resolve a Strapi media object (or a plain path) to a browser-usable url. */
export function mediaUrl(media: StrapiMedia | string | undefined | null): string {
  if (!media) return '';
  const url = typeof media === 'string' ? media : media.url;
  if (!url) return '';
  return /^(https?:)?\/\//.test(url) || url.startsWith('/images/') ? url : `${STRAPI_URL}${url}`;
}

/**
 * Fetch every entry of a collection type, following pagination.
 * `populate=*` pulls the media fields alongside the scalar ones.
 */
export async function fetchCollection<T>(plural: string): Promise<T[]> {
  const all: T[] = [];
  let page = 1;

  for (;;) {
    const url = new URL(`/api/${plural}`, `${STRAPI_URL}/`);
    url.searchParams.set('populate', '*');
    url.searchParams.set('pagination[page]', String(page));
    url.searchParams.set('pagination[pageSize]', '100');

    const res = await fetch(url, {
      headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {},
    });

    if (!res.ok) {
      throw new Error(
        `Strapi request failed: ${res.status} ${res.statusText} — ${url.pathname}\n` +
          'Check STRAPI_URL / STRAPI_TOKEN, and that the collection has public find permission.',
      );
    }

    const body = (await res.json()) as { data: T[]; meta?: { pagination?: { pageCount: number } } };
    all.push(...body.data);

    const pageCount = body.meta?.pagination?.pageCount ?? 1;
    if (page >= pageCount) break;
    page++;
  }

  return all;
}
