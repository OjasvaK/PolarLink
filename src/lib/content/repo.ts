import "server-only";

import type { ContentStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { contentSlugs, contentTypes, type ContentSlug } from "./types";

// The five content models share the same workflow columns (status,
// publishedAt, an owner column), so the workflow code talks to them through
// this narrow structural interface instead of five copies of each query.
export type ContentRow = Record<string, unknown> & {
  id: string;
  status: ContentStatus;
  updatedAt: Date;
  publishedAt: Date | null;
};

type Delegate = {
  findUnique(args: { where: { id: string } }): Promise<ContentRow | null>;
  findMany(args: {
    where: Record<string, unknown>;
    orderBy?: Record<string, "asc" | "desc">;
    select?: Record<string, boolean>;
  }): Promise<ContentRow[]>;
  create(args: { data: Record<string, unknown> }): Promise<ContentRow>;
  update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<ContentRow>;
  updateMany(args: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }): Promise<{ count: number }>;
  delete(args: { where: { id: string } }): Promise<ContentRow>;
};

type Db = Pick<
  typeof prisma,
  "expedition" | "dataset" | "publication" | "mediaAsset" | "institutionalActivity"
>;

// Accepts a transaction client too, so status changes can be committed
// atomically with their Review/AuditLog rows.
export function delegatesFor(db: Db): Record<ContentSlug, Delegate> {
  return {
    expedition: db.expedition as unknown as Delegate,
    dataset: db.dataset as unknown as Delegate,
    publication: db.publication as unknown as Delegate,
    media: db.mediaAsset as unknown as Delegate,
    activity: db.institutionalActivity as unknown as Delegate,
  };
}

export const delegates = delegatesFor(prisma);

export type ListItem = {
  slug: ContentSlug;
  id: string;
  title: string;
  status: ContentStatus;
  updatedAt: Date;
  ownerId: string;
};

async function listAcrossTypes(where: (slug: ContentSlug) => Record<string, unknown>) {
  const perType = await Promise.all(
    contentSlugs.map(async (slug) => {
      const type = contentTypes[slug];
      const rows = await delegates[slug].findMany({
        where: where(slug),
        orderBy: { updatedAt: "desc" },
        select: { id: true, status: true, updatedAt: true, [type.titleField]: true, [type.ownerField]: true },
      });
      return rows.map<ListItem>((row) => ({
        slug,
        id: row.id,
        title: String(row[type.titleField]),
        status: row.status,
        updatedAt: row.updatedAt,
        ownerId: String(row[type.ownerField]),
      }));
    })
  );
  return perType.flat().sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export function listSubmissionsBy(userId: string) {
  return listAcrossTypes((slug) => ({ [contentTypes[slug].ownerField]: userId }));
}

export function listPending() {
  return listAcrossTypes(() => ({ status: "PENDING" }));
}

export function getContent(slug: ContentSlug, id: string) {
  return delegates[slug].findUnique({ where: { id } });
}

export function ownerOf(slug: ContentSlug, row: ContentRow) {
  return String(row[contentTypes[slug].ownerField]);
}

export function latestReview(slug: ContentSlug, id: string) {
  return prisma.review.findFirst({
    where: { targetType: slug, targetId: id },
    orderBy: { createdAt: "desc" },
    include: { reviewer: { select: { name: true } } },
  });
}

export function publishedExpeditionOptions() {
  return prisma.expedition.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { startDate: "desc" },
    select: { id: true, name: true },
  });
}

export async function expeditionName(id: unknown) {
  if (typeof id !== "string") return null;
  const expedition = await prisma.expedition.findUnique({ where: { id }, select: { name: true } });
  return expedition?.name ?? null;
}
