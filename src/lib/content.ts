/**
 * The theme's single source of content.
 *
 * Every page imports from here rather than reading JSON or calling Strapi
 * directly, so switching between the bundled sample data and a live Strapi
 * instance is a matter of setting `STRAPI_URL` in `.env`.
 */
import servicesJson from '../data/services.json';
import caseStudiesJson from '../data/case-studies.json';
import blogsJson from '../data/blogs.json';
import { fetchCollection, mediaUrl, strapiEnabled, type StrapiMedia } from './strapi';

export interface Service {
  title: string;
  slug: string;
  summary: string;
  thumbnail: string;
  detailsTitle: string;
  bannerImage: string;
  pricingContent: string;
  detailsTextOne: string;
  /** Semicolon-separated in the CSV export; use `detailsImages()` to read it. */
  detailsImage: string;
  detailsTextTwo: string;
  resultStatOne: string;
  resultStatTwo: string;
  resultStatThree: string;
  resultStatFour: string;
  publishedAt: string;
}

export interface CaseStudy {
  title: string;
  slug: string;
  thumbnail: string;
  logo: string;
  pipelineGrowth: string;
  revenueGrowth: string;
  bannerImage: string;
  detailsTitle: string;
  primaryFocus: string;
  teamSize: string;
  company: string;
  /** Slug of the related service. */
  services: string;
  detailsText: string;
  impactStatOne: string;
  impactStatTwo: string;
  impactStatThree: string;
  publishedAt: string;
}

export interface Blog {
  title: string;
  slug: string;
  thumbnail: string;
  detailsTitle: string;
  bannerImage: string;
  detailsText: string;
  category: string;
  readTime: string;
  publishedAt: string;
}

/**
 * What Strapi actually returns: media as objects, the service reference as a
 * populated relation, and the editorial date in its own `publishedDate` field
 * (Strapi's own `publishedAt` is the CMS publish timestamp, not the byline).
 */
type Remote<T> = Omit<T, 'thumbnail' | 'bannerImage' | 'logo' | 'detailsImage' | 'services'> & {
  thumbnail?: StrapiMedia;
  bannerImage?: StrapiMedia;
  logo?: StrapiMedia;
  detailsImage?: StrapiMedia[] | StrapiMedia;
  services?: string;
  service?: { slug?: string } | null;
  publishedDate?: string | null;
};

const text = (value: unknown): string => (typeof value === 'string' ? value : '');

/** Prefer the editorial date; fall back to the CMS publish timestamp. */
const publishDate = (entry: { publishedDate?: string | null; publishedAt?: string }): string =>
  entry.publishedDate ?? entry.publishedAt ?? '';

function normaliseMediaList(value: StrapiMedia[] | StrapiMedia | string | undefined): string {
  if (Array.isArray(value)) return value.map(mediaUrl).filter(Boolean).join('; ');
  return mediaUrl(value ?? null);
}

/** Split a multi-image field into individual urls. */
export function detailsImages(service: Pick<Service, 'detailsImage'>): string[] {
  return service.detailsImage
    .split(';')
    .map((url) => url.trim())
    .filter(Boolean);
}

const byNewest = <T extends { publishedAt: string }>(a: T, b: T) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

async function collection<T extends { publishedAt: string }>(
  plural: string,
  local: T[],
  normalise: (entry: Remote<T>) => T,
): Promise<T[]> {
  if (!strapiEnabled) return [...local].sort(byNewest);
  const remote = await fetchCollection<Remote<T>>(plural);
  return remote.map(normalise).sort(byNewest);
}

export const getServices = (): Promise<Service[]> =>
  collection<Service>('services', servicesJson as Service[], (entry) => ({
    ...(entry as unknown as Service),
    thumbnail: mediaUrl(entry.thumbnail ?? null),
    bannerImage: mediaUrl(entry.bannerImage ?? null),
    detailsImage: normaliseMediaList(entry.detailsImage),
    publishedAt: publishDate(entry),
  }));

export const getCaseStudies = (): Promise<CaseStudy[]> =>
  collection<CaseStudy>('case-studies', caseStudiesJson as CaseStudy[], (entry) => ({
    ...(entry as unknown as CaseStudy),
    thumbnail: mediaUrl(entry.thumbnail ?? null),
    bannerImage: mediaUrl(entry.bannerImage ?? null),
    logo: mediaUrl(entry.logo ?? null),
    // The CSV export carries a slug string; Strapi carries a populated relation.
    services: entry.services ?? entry.service?.slug ?? '',
    publishedAt: publishDate(entry),
  }));

export const getBlogs = (): Promise<Blog[]> =>
  collection<Blog>('blogs', blogsJson as Blog[], (entry) => ({
    ...(entry as unknown as Blog),
    thumbnail: mediaUrl(entry.thumbnail ?? null),
    bannerImage: mediaUrl(entry.bannerImage ?? null),
    publishedAt: publishDate(entry),
  }));

/** Distinct blog categories, in the order the tabs on `/blog` expect them. */
export function blogCategories(blogs: Blog[]): string[] {
  return [...new Set(blogs.map((post) => text(post.category)).filter(Boolean))].sort();
}

/** Other entries in the same collection, used by the "related" sections. */
export function related<T extends { slug: string }>(items: T[], slug: string, limit: number): T[] {
  return items.filter((item) => item.slug !== slug).slice(0, limit);
}

/** Webflow rendered dates as e.g. `May 22, 2026`. */
export function formatDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
