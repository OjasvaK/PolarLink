import "server-only";

import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import type { GeneratorSource, GeneratorSourceType } from "./rule-based";

export const generatorSourceTypes: GeneratorSourceType[] = ["expedition", "dataset", "media"];

export function isGeneratorSourceType(value: string): value is GeneratorSourceType {
  return (generatorSourceTypes as string[]).includes(value);
}

const published = { status: "PUBLISHED" as const };

// Loads a published archive item as generator input. Only published items
// can be promoted, so drafts never leak into public-facing copy.
export async function loadGeneratorSource(
  type: GeneratorSourceType,
  id: string
): Promise<{ source: GeneratorSource; title: string } | null> {
  switch (type) {
    case "expedition": {
      const e = await prisma.expedition.findFirst({
        where: { id, ...published },
        include: {
          _count: {
            select: {
              datasets: { where: published },
              publications: { where: published },
              mediaAssets: { where: published },
            },
          },
        },
      });
      if (!e) return null;
      return {
        title: e.name,
        source: {
          type,
          name: e.name,
          program: e.program,
          station: e.station,
          startDate: e.startDate,
          endDate: e.endDate,
          summary: e.summary,
          counts: { datasets: e._count.datasets, publications: e._count.publications, media: e._count.mediaAssets },
        },
      };
    }
    case "dataset": {
      const d = await prisma.dataset.findFirst({
        where: { id, ...published },
        include: { linkedExpedition: { select: { name: true, program: true, status: true } } },
      });
      if (!d) return null;
      const expedition = d.linkedExpedition?.status === "PUBLISHED" ? d.linkedExpedition : null;
      return {
        title: d.title,
        source: {
          type,
          title: d.title,
          description: d.description,
          format: d.format,
          license: d.license,
          collectionDate: d.collectionDate,
          tags: d.tags,
          expedition,
        },
      };
    }
    case "media": {
      const m = await prisma.mediaAsset.findFirst({
        where: { id, ...published },
        include: { linkedExpedition: { select: { name: true, program: true, station: true, status: true } } },
      });
      if (!m) return null;
      const expedition = m.linkedExpedition?.status === "PUBLISHED" ? m.linkedExpedition : null;
      return {
        title: m.caption || m.altText,
        source: {
          type,
          mediaType: m.type,
          caption: m.caption,
          altText: m.altText,
          tags: m.tags,
          expedition,
        },
      };
    }
  }
}

// Absolute site origin for links in social captions. SITE_URL wins when set
// (production); otherwise use the host of the current request.
export async function siteOrigin() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
