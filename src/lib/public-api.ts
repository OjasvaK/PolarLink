import "server-only";

import { prisma } from "@/lib/db";
import { siteOrigin } from "@/lib/generator/source";

// Read-only public API (spec section 8.8). Only PUBLISHED rows, only the
// fields below: no submitter, reviewer or other personal data ever leaves
// through here.

// --- Rate limiting ---------------------------------------------------------
// A fixed-window counter per client IP, in memory. Good enough for a single
// instance at hackathon scale; each serverless instance keeps its own window.

const WINDOW_MS = 60_000;
const LIMIT = 60;
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    if (hits.size > 10_000) {
      for (const [key, value] of hits) if (value.resetAt <= now) hits.delete(key);
    }
    return { ok: true as const, remaining: LIMIT - 1, resetAt: now + WINDOW_MS };
  }
  entry.count += 1;
  return entry.count > LIMIT
    ? { ok: false as const, remaining: 0, resetAt: entry.resetAt }
    : { ok: true as const, remaining: LIMIT - entry.count, resetAt: entry.resetAt };
}

export const publicHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
};

export function tooManyRequests(resetAt: number) {
  return Response.json(
    { error: "Too many requests. Try again shortly." },
    {
      status: 429,
      headers: {
        ...publicHeaders,
        "Cache-Control": "no-store",
        "Retry-After": String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))),
      },
    }
  );
}

// --- Collections -------------------------------------------------------------

export const publicCollections = ["expeditions", "datasets", "publications", "media", "activities"] as const;
export type PublicCollection = (typeof publicCollections)[number];

export function isPublicCollection(value: string): value is PublicCollection {
  return (publicCollections as readonly string[]).includes(value);
}

const archiveSlug: Record<PublicCollection, string> = {
  expeditions: "expedition",
  datasets: "dataset",
  publications: "publication",
  media: "media",
  activities: "activity",
};

const published = { status: "PUBLISHED" as const };
const expeditionRef = { select: { id: true, name: true, status: true } };
const iso = (date: Date | null | undefined) => date?.toISOString() ?? null;

type Page = { page: number; pageSize: number };

export async function listCollection(collection: PublicCollection, { page, pageSize }: Page) {
  const origin = await siteOrigin();
  const skip = (page - 1) * pageSize;
  const links = (id: string) => ({
    url: `${origin}/archive/${archiveSlug[collection]}/${id}`,
    shareImageUrl: `${origin}/archive/${archiveSlug[collection]}/${id}/opengraph-image`,
  });
  const linkedExpedition = (e: { id: string; name: string; status: string } | null) =>
    e && e.status === "PUBLISHED" ? { id: e.id, name: e.name } : null;

  switch (collection) {
    case "expeditions": {
      const [total, rows] = await Promise.all([
        prisma.expedition.count({ where: published }),
        prisma.expedition.findMany({ where: published, orderBy: { startDate: "desc" }, skip, take: pageSize }),
      ]);
      return {
        total,
        items: rows.map((e) => ({
          id: e.id,
          name: e.name,
          program: e.program,
          station: e.station,
          startDate: iso(e.startDate),
          endDate: iso(e.endDate),
          summary: e.summary,
          reportUrl: e.reportFileUrl,
          publishedAt: iso(e.publishedAt),
          ...links(e.id),
        })),
      };
    }
    case "datasets": {
      const [total, rows] = await Promise.all([
        prisma.dataset.count({ where: published }),
        prisma.dataset.findMany({ where: published, orderBy: { publishedAt: "desc" }, skip, take: pageSize, include: { linkedExpedition: expeditionRef } }),
      ]);
      return {
        total,
        items: rows.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          tags: d.tags,
          collectionDate: iso(d.collectionDate),
          format: d.format,
          fileUrl: d.fileUrl,
          externalUrl: d.externalUrl,
          license: d.license,
          expedition: linkedExpedition(d.linkedExpedition),
          publishedAt: iso(d.publishedAt),
          ...links(d.id),
        })),
      };
    }
    case "publications": {
      const [total, rows] = await Promise.all([
        prisma.publication.count({ where: published }),
        prisma.publication.findMany({ where: published, orderBy: [{ year: "desc" }, { publishedAt: "desc" }], skip, take: pageSize, include: { linkedExpedition: expeditionRef } }),
      ]);
      return {
        total,
        items: rows.map((p) => ({
          id: p.id,
          title: p.title,
          authors: p.authors,
          year: p.year,
          abstract: p.abstract,
          doiOrUrl: p.doiOrUrl,
          expedition: linkedExpedition(p.linkedExpedition),
          publishedAt: iso(p.publishedAt),
          ...links(p.id),
        })),
      };
    }
    case "media": {
      const [total, rows] = await Promise.all([
        prisma.mediaAsset.count({ where: published }),
        prisma.mediaAsset.findMany({ where: published, orderBy: { publishedAt: "desc" }, skip, take: pageSize, include: { linkedExpedition: expeditionRef } }),
      ]);
      return {
        total,
        items: rows.map((m) => ({
          id: m.id,
          type: m.type,
          mediaUrl: m.url,
          caption: m.caption,
          altText: m.altText,
          tags: m.tags,
          expedition: linkedExpedition(m.linkedExpedition),
          publishedAt: iso(m.publishedAt),
          ...links(m.id),
        })),
      };
    }
    case "activities": {
      const [total, rows] = await Promise.all([
        prisma.institutionalActivity.count({ where: published }),
        prisma.institutionalActivity.findMany({ where: published, orderBy: { date: "desc" }, skip, take: pageSize }),
      ]);
      return {
        total,
        items: rows.map((a) => ({
          id: a.id,
          title: a.title,
          date: iso(a.date),
          description: a.description,
          coverImageUrl: a.coverImageUrl,
          publishedAt: iso(a.publishedAt),
          ...links(a.id),
        })),
      };
    }
  }
}

// --- Feed ------------------------------------------------------------------------

export type FeedItem = { title: string; link: string; pubDate: Date; description: string; category: string };

// Newest published content across all types. Uses an editor-published
// Content Generator blurb as the description when one exists.
export async function feedItems(limit = 50): Promise<FeedItem[]> {
  const origin = await siteOrigin();
  const recent = { where: published, orderBy: { publishedAt: "desc" as const }, take: limit };
  const [expeditions, datasets, publications, media, activities, blurbs] = await Promise.all([
    prisma.expedition.findMany(recent),
    prisma.dataset.findMany(recent),
    prisma.publication.findMany(recent),
    prisma.mediaAsset.findMany(recent),
    prisma.institutionalActivity.findMany(recent),
    prisma.generatedContent.findMany({
      where: { status: "PUBLISHED", kind: "WEBSITE_BLURB" },
      orderBy: { updatedAt: "desc" },
      select: { sourceType: true, sourceId: true, draftText: true, editedText: true },
    }),
  ]);

  const blurb = new Map<string, string>();
  for (const b of blurbs) {
    const key = `${b.sourceType}:${b.sourceId}`;
    if (!blurb.has(key)) blurb.set(key, b.editedText ?? b.draftText);
  }
  const item = (slug: string, id: string, title: string, fallback: string, date: Date | null, category: string): FeedItem => ({
    title,
    link: `${origin}/archive/${slug}/${id}`,
    pubDate: date ?? new Date(0),
    description: blurb.get(`${slug}:${id}`) ?? fallback,
    category,
  });

  return [
    ...expeditions.map((e) => item("expedition", e.id, e.name, e.summary, e.publishedAt, "Expedition")),
    ...datasets.map((d) => item("dataset", d.id, d.title, d.description, d.publishedAt, "Dataset")),
    ...publications.map((p) => item("publication", p.id, p.title, p.abstract, p.publishedAt, "Publication")),
    ...media.map((m) => item("media", m.id, m.caption || m.altText, m.altText, m.publishedAt, "Media")),
    ...activities.map((a) => item("activity", a.id, a.title, a.description, a.publishedAt, "Institutional activity")),
  ]
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, limit);
}
