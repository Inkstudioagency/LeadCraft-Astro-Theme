import fs from 'node:fs/promises';
import path from 'node:path';
import { parseCsv } from './csv.mjs';

export const CMS_DIR = new URL('../../cms-export/', import.meta.url);
export const ASSET_DIR = new URL('../../public/images/cms/', import.meta.url);
export const DATA_DIR = new URL('../../src/data/', import.meta.url);

/** Public path the downloaded CMS media is served from. */
export const ASSET_BASE = '/images/cms';

// Parentheses are left in the class on purpose: Webflow keeps them literal in
// filenames such as `Company logo (3).svg`. Quotes, commas and semicolons are
// the real delimiters in both the CSV fields and the embedded rich text.
const CDN = /https:\/\/cdn\.prod\.website-files\.com\/[^\s"'<>,;]+/g;

/** Turn a Webflow CDN url into a stable, filesystem-safe local filename. */
export function assetFilename(url) {
  const clean = url.split('?')[0].replace(/;$/, '');
  const raw = decodeURIComponent(path.posix.basename(clean));
  // Webflow prefixes every asset with its 24-char id. The human part alone is
  // not unique ("Service Banner Image 1" vs "Service Banner Image-1"), so keep
  // the last 6 characters of the id as a disambiguating suffix.
  const [, id = '', named = raw] = raw.match(/^([0-9a-f]{24})_(.*)$/) ?? [];
  const ext = path.posix.extname(named);
  const stem = named
    .slice(0, named.length - ext.length)
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  return id ? `${stem}-${id.slice(-6)}${ext.toLowerCase()}` : `${stem}${ext.toLowerCase()}`;
}

/** Collect every distinct CDN url used anywhere in the parsed rows. */
export function collectAssets(rows) {
  const urls = new Set();
  for (const row of rows) {
    for (const value of Object.values(row)) {
      if (typeof value !== 'string') continue;
      for (const match of value.match(CDN) ?? []) urls.add(match.replace(/;$/, ''));
    }
  }
  return [...urls];
}

/** Rewrite every CDN url in a string to its local `/images/cms/...` equivalent. */
export function localiseAssets(value) {
  if (typeof value !== 'string' || !value) return value;
  return value.replace(CDN, (url) => `${ASSET_BASE}/${assetFilename(url)}`);
}

export async function downloadAssets(urls, { quiet = false } = {}) {
  await fs.mkdir(ASSET_DIR, { recursive: true });
  let downloaded = 0;
  let skipped = 0;

  for (const url of urls) {
    const target = new URL(assetFilename(url), ASSET_DIR);
    try {
      await fs.access(target);
      skipped++;
      continue;
    } catch {
      /* not cached yet */
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download ${url} (${res.status})`);
    await fs.writeFile(target, Buffer.from(await res.arrayBuffer()));
    downloaded++;
    if (!quiet) console.log(`  downloaded ${assetFilename(url)}`);
  }

  return { downloaded, skipped };
}

/** Webflow exports dates as `Fri May 22 2026 10:48:46 GMT+0000 (...)`. */
function toIso(value) {
  if (!value) return null;
  const date = new Date(value.replace(/\s*\([^)]*\)\s*$/, ''));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function readCollection(fileMatch) {
  const files = await fs.readdir(CMS_DIR);
  const name = files.find((f) => f.includes(fileMatch) && f.endsWith('.csv'));
  if (!name) throw new Error(`No CSV in CMS/ matching "${fileMatch}"`);
  return parseCsv(await fs.readFile(new URL(name, CMS_DIR), 'utf8'));
}

const live = (rows) => rows.filter((r) => r.Archived !== 'true' && r.Draft !== 'true');

export async function loadServices() {
  const rows = live(await readCollection('- Services -'));
  return rows.map((r) => ({
    title: r['Service Title'],
    slug: r.Slug,
    summary: r['Service Summary'],
    thumbnail: localiseAssets(r['Service Thumbnail']),
    detailsTitle: localiseAssets(r['Service Details Title']),
    bannerImage: localiseAssets(r['Service Banner Image']),
    pricingContent: localiseAssets(r['Service Pricing Content']),
    detailsTextOne: localiseAssets(r['Service Details Text One']),
    detailsImage: localiseAssets(r['Service Details Image']),
    detailsTextTwo: localiseAssets(r['Service Details Text Two']),
    resultStatOne: localiseAssets(r['Result Stat One']),
    resultStatTwo: localiseAssets(r['Result Stat Two']),
    resultStatThree: localiseAssets(r['Result Stat Three']),
    resultStatFour: localiseAssets(r['Result Stat Four']),
    publishedAt: toIso(r['Published On'] || r['Created On']),
  }));
}

export async function loadCaseStudies() {
  const rows = live(await readCollection('- Case Studies -'));
  return rows.map((r) => ({
    title: r['Case Study Title'],
    slug: r.Slug,
    thumbnail: localiseAssets(r['Case Study Thumbnail']),
    logo: localiseAssets(r['Case Study Logo']),
    pipelineGrowth: r['Pipeline Growth'],
    revenueGrowth: r['Revenue Growth'],
    bannerImage: localiseAssets(r['Case Study Banner Image']),
    detailsTitle: localiseAssets(r['Case Study Details Title']),
    primaryFocus: r['Primary Focus'],
    teamSize: r['Team Size'],
    company: r.Company,
    services: r.Services,
    detailsText: localiseAssets(r['Case Study Details Text']),
    impactStatOne: localiseAssets(r['Impact Stat One']),
    impactStatTwo: localiseAssets(r['Impact Stat Two']),
    impactStatThree: localiseAssets(r['Impact Stat Three']),
    publishedAt: toIso(r['Published On'] || r['Created On']),
  }));
}

export async function loadBlogs() {
  const rows = live(await readCollection('- Blogs -'));
  return rows.map((r) => ({
    title: r['Blog Title'],
    slug: r.Slug,
    thumbnail: localiseAssets(r['Blog Thumbnail']),
    detailsTitle: localiseAssets(r['Blog Details Title']),
    bannerImage: localiseAssets(r['Blog Banner Image']),
    detailsText: localiseAssets(r['Blog Details Text']),
    category: r['Blog Category'],
    readTime: r['Read Time'],
    publishedAt: toIso(r['Published On'] || r['Created On']),
  }));
}

export async function loadAll() {
  return {
    services: await loadServices(),
    caseStudies: await loadCaseStudies(),
    blogs: await loadBlogs(),
  };
}

export async function rawRows() {
  return [
    ...(await readCollection('- Services -')),
    ...(await readCollection('- Case Studies -')),
    ...(await readCollection('- Blogs -')),
  ];
}

