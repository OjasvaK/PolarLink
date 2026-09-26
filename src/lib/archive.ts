import "server-only";

import type { Program } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import type { ContentSlug } from "@/lib/content/types";

// Read side of the public archive (spec section 8.3). Everything here only
// ever returns PUBLISHED rows and no submitter identity.

export const programs: { value: Program; label: string }[] = [
  { value: "ANTARCTIC", label: "Antarctic" },
  { value: "ARCTIC", label: "Arctic" },
  { value: "HIMALAYAN", label: "Himalayan" },
];

export function programLabel(program: Program | null | undefined) {
  return programs.find((p) => p.value === program)?.label ?? null;
}

export type ArchiveFilters = {
  q?: string;
  type?: ContentSlug;
  program?: Program;
  year?: number;
  tag?: string;
};

export type ArchiveResult = {
  slug: ContentSlug;
  id: string;
  title: string;
  excerpt: string;
  program: Program | null;
  date: Date | null;
  year: number | null;
  imageUrl: string | null;
  mediaType?: "PHOTO" | "VIDEO";
};

const PER_TYPE_LIMIT = 60;

const contains = (q: string) => ({ contains: q, mode: "insensitive" as const });

function yearRange(year: number) {
  return { gte: new Date(Date.UTC(year, 0, 1)), lt: new Date(Date.UTC(year + 1, 0, 1)) };
}

function excerpt(text: string | null | undefined, length = 220) {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length).replace(/\s+\S*$/, "")}...` : clean;
}

// Prisma can only match whole array elements, so partial matches inside
// authors/tags arrays (e.g. "sharma" in "Sharma, A.") use a small raw query.
async function arrayMatches(q: string) {
  const pattern = `%${q.replace(/[\\%_]/g, (c) => "\\" + c)}%`;
  const [publications, datasets, media] = await Promise.all([
    prisma.$queryRaw<{ id: string }[]>`SELECT id FROM "Publication" WHERE status = 'PUBLISHED' AND array_to_string(authors, ' ') ILIKE ${pattern}`,
    prisma.$queryRaw<{ id: string }[]>`SELECT id FROM "Dataset" WHERE status = 'PUBLISHED' AND array_to_string(tags, ' ') ILIKE ${pattern}`,
    prisma.$queryRaw<{ id: string }[]>`SELECT id FROM "MediaAsset" WHERE status = 'PUBLISHED' AND array_to_string(tags, ' ') ILIKE ${pattern}`,
  ]);
  const ids = (rows: { id: string }[]) => rows.map((row) => row.id);
  return { publications: ids(publications), datasets: ids(datasets), media: ids(media) };
}

export async function searchArchive(filters: ArchiveFilters): Promise<ArchiveResult[]> {
  const { q, type, program, year, tag } = filters;
  const inArrays = q ? await arrayMatches(q) : { publications: [], datasets: [], media: [] };
  const wants = (slug: ContentSlug) => !type || type === slug;
  const linked = program ? { linkedExpedition: { program } } : {};
  const published = { status: "PUBLISHED" as const };

  const [expeditions, datasets, publications, media, activities] = await Promise.all([
    wants("expedition") && !tag
      ? prisma.expedition.findMany({
          where: {
            ...published,
            ...(program ? { program } : {}),
            ...(year ? { startDate: yearRange(year) } : {}),
            ...(q ? { OR: [{ name: contains(q) }, { station: contains(q) }, { summary: contains(q) }] } : {}),
          },
          orderBy: { startDate: "desc" },
          take: PER_TYPE_LIMIT,
        })
      : [],
    wants("dataset")
      ? prisma.dataset.findMany({
          where: {
            ...published,
            ...linked,
            ...(year ? { collectionDate: yearRange(year) } : {}),
            ...(tag ? { tags: { has: tag } } : {}),
            ...(q ? { OR: [{ title: contains(q) }, { description: contains(q) }, { id: { in: inArrays.datasets } }] } : {}),
          },
          include: { linkedExpedition: { select: { program: true } } },
          orderBy: { publishedAt: "desc" },
          take: PER_TYPE_LIMIT,
        })
      : [],
    wants("publication") && !tag
      ? prisma.publication.findMany({
          where: {
            ...published,
            ...linked,
            ...(year ? { year } : {}),
            ...(q ? { OR: [{ title: contains(q) }, { abstract: contains(q) }, { id: { in: inArrays.publications } }] } : {}),
          },
          include: { linkedExpedition: { select: { program: true } } },
          orderBy: { year: "desc" },
          take: PER_TYPE_LIMIT,
        })
      : [],
    wants("media")
      ? prisma.mediaAsset.findMany({
          where: {
            ...published,
            ...linked,
            ...(year ? { publishedAt: yearRange(year) } : {}),
            ...(tag ? { tags: { has: tag } } : {}),
            ...(q ? { OR: [{ caption: contains(q) }, { altText: contains(q) }, { id: { in: inArrays.media } }] } : {}),
          },
          include: { linkedExpedition: { select: { program: true } } },
          orderBy: { publishedAt: "desc" },
          take: PER_TYPE_LIMIT,
        })
      : [],
    // Activities aren't tied to a program or tags, so those filters exclude them.
    wants("activity") && !program && !tag
      ? prisma.institutionalActivity.findMany({
          where: {
            ...published,
            ...(year ? { date: yearRange(year) } : {}),
            ...(q ? { OR: [{ title: contains(q) }, { description: contains(q) }] } : {}),
          },
          orderBy: { date: "desc" },
          take: PER_TYPE_LIMIT,
        })
      : [],
  ]);

  const results: ArchiveResult[] = [
    ...expeditions.map((e) => ({
      slug: "expedition" as const,
      id: e.id,
      title: e.name,
      excerpt: excerpt(e.summary),
      program: e.program,
      date: e.startDate,
      year: e.startDate.getUTCFullYear(),
      imageUrl: null,
    })),
    ...datasets.map((d) => ({
      slug: "dataset" as const,
      id: d.id,
      title: d.title,
      excerpt: excerpt(d.description),
      program: d.linkedExpedition?.program ?? null,
      date: d.collectionDate ?? d.publishedAt,
      year: (d.collectionDate ?? d.publishedAt)?.getUTCFullYear() ?? null,
      imageUrl: null,
    })),
    ...publications.map((p) => ({
      slug: "publication" as const,
      id: p.id,
      title: p.title,
      excerpt: excerpt(p.abstract),
      program: p.linkedExpedition?.program ?? null,
      date: null,
      year: p.year,
      imageUrl: null,
    })),
    ...media.map((m) => ({
      slug: "media" as const,
      id: m.id,
      title: m.caption || m.altText,
      excerpt: excerpt(m.altText, 140),
      program: m.linkedExpedition?.program ?? null,
      date: m.publishedAt,
      year: m.publishedAt?.getUTCFullYear() ?? null,
      imageUrl: m.url,
      mediaType: m.type,
    })),
    ...activities.map((a) => ({
      slug: "activity" as const,
      id: a.id,
      title: a.title,
      excerpt: excerpt(a.description),
      program: null,
      date: a.date,
      year: a.date.getUTCFullYear(),
      imageUrl: a.coverImageUrl,
    })),
  ];

  // Newest first across types; items without a date sort by year.
  const sortKey = (r: ArchiveResult) => r.date?.getTime() ?? (r.year ? Date.UTC(r.year, 0, 1) : 0);
  return results.sort((a, b) => sortKey(b) - sortKey(a));
}

// Tags in use on published datasets and media, for the tag facet.
export async function publishedTags() {
  const [datasets, media] = await Promise.all([
    prisma.dataset.findMany({ where: { status: "PUBLISHED" }, select: { tags: true } }),
    prisma.mediaAsset.findMany({ where: { status: "PUBLISHED" }, select: { tags: true } }),
  ]);
  const counts = new Map<string, number>();
  for (const row of [...datasets, ...media]) {
    for (const tag of row.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([tag]) => tag);
}

// Real row counts for the landing page stats block (spec section 8.1).
export async function archiveCounts() {
  const where = { status: "PUBLISHED" as const };
  const [expeditions, datasets, publications, media] = await Promise.all([
    prisma.expedition.count({ where }),
    prisma.dataset.count({ where }),
    prisma.publication.count({ where }),
    prisma.mediaAsset.count({ where }),
  ]);
  return { expeditions, datasets, publications, media };
}

export async function latestPublished() {
  const where = { status: "PUBLISHED" as const };
  const orderBy = { publishedAt: "desc" as const };
  const [expedition, dataset, media] = await Promise.all([
    prisma.expedition.findFirst({ where, orderBy }),
    prisma.dataset.findFirst({ where, orderBy }),
    prisma.mediaAsset.findFirst({ where, orderBy }),
  ]);
  return { expedition, dataset, media };
}

// Published Content Generator blurbs, keyed by "type:id", for surfacing on
// the landing page's featured strip (spec section 8.5).
export async function publishedBlurbs(sources: { type: string; id: string }[]) {
  if (sources.length === 0) return new Map<string, string>();
  const rows = await prisma.generatedContent.findMany({
    where: {
      status: "PUBLISHED",
      kind: "WEBSITE_BLURB",
      OR: sources.map((s) => ({ sourceType: s.type, sourceId: s.id })),
    },
    orderBy: { updatedAt: "desc" },
  });
  const blurbs = new Map<string, string>();
  for (const row of rows) {
    const key = `${row.sourceType}:${row.sourceId}`;
    if (!blurbs.has(key)) blurbs.set(key, row.editedText ?? row.draftText);
  }
  return blurbs;
}
