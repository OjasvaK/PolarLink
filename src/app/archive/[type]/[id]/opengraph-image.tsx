import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { Program } from "@/generated/prisma/enums";
import { programLabel } from "@/lib/archive";
import { contentTypes, isContentSlug } from "@/lib/content/types";
import { prisma } from "@/lib/db";
import { imageCredits, type ImageCredit } from "@/lib/image-credits";

// Templated Open Graph card for every archive entry (spec section 8.5): a
// cover photo, the entry’s title and its program/station. Social platforms
// pick it up automatically from the archive page’s metadata, and the
// Content Generator offers it as a download.

export const alt = "PolarLink archive entry";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const published = { status: "PUBLISHED" as const };

// Geist, the site’s own typeface (SIL OFL, see assets/fonts/OFL.txt).
const fonts = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Geist-Regular.ttf")),
  readFile(join(process.cwd(), "assets/fonts/Geist-ExtraBold.ttf")),
]);

// Licensed landing-page photos used when an entry has no photo of its own.
// Their credit is printed on the card, as their licenses require.
const fallbackPhoto: Record<Program | "NONE", ImageCredit> = {
  ANTARCTIC: imageCredits.issAuroraAustralis,
  ARCTIC: imageCredits.polarBearSvalbard,
  HIMALAYAN: imageCredits.gaumukhGangotri,
  NONE: imageCredits.nyAlesundAurora,
};

type Card = { title: string; kind: string; meta: string; photoUrl: string | null; program: Program | null };

async function loadCard(type: string, id: string): Promise<Card | null> {
  if (!isContentSlug(type)) return null;
  const kind = contentTypes[type].label;
  switch (type) {
    case "expedition": {
      const e = await prisma.expedition.findFirst({
        where: { id, ...published },
        include: { mediaAssets: { where: { ...published, type: "PHOTO" }, take: 1, orderBy: { publishedAt: "desc" } } },
      });
      return e && { title: e.name, kind, meta: `${programLabel(e.program)} program · ${e.station}`, photoUrl: e.mediaAssets[0]?.url ?? null, program: e.program };
    }
    case "dataset": {
      const d = await prisma.dataset.findFirst({ where: { id, ...published }, include: { linkedExpedition: true } });
      const program = d?.linkedExpedition?.program ?? null;
      return d && { title: d.title, kind, meta: [programLabel(program), d.format].filter(Boolean).join(" · "), photoUrl: null, program };
    }
    case "publication": {
      const p = await prisma.publication.findFirst({ where: { id, ...published }, include: { linkedExpedition: true } });
      const program = p?.linkedExpedition?.program ?? null;
      return p && { title: p.title, kind, meta: [p.authors.slice(0, 2).join(", "), String(p.year)].filter(Boolean).join(" · "), photoUrl: null, program };
    }
    case "media": {
      const m = await prisma.mediaAsset.findFirst({ where: { id, ...published }, include: { linkedExpedition: true } });
      const program = m?.linkedExpedition?.program ?? null;
      return m && {
        title: m.caption || m.altText,
        kind,
        meta: [programLabel(program), m.linkedExpedition?.station].filter(Boolean).join(" · "),
        photoUrl: m.type === "PHOTO" ? m.url : null,
        program,
      };
    }
    case "activity": {
      const a = await prisma.institutionalActivity.findFirst({ where: { id, ...published } });
      return a && { title: a.title, kind, meta: "National Centre for Polar and Ocean Research", photoUrl: a.coverImageUrl, program: null };
    }
  }
}

// Only fetch from our own Supabase Storage, never an arbitrary submitted
// URL (that would let a link point the server at internal addresses).
const storagePrefix = process.env.SUPABASE_URL
  ? `${process.env.SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/`
  : null;

async function remoteAsDataUri(url: string) {
  if (!storagePrefix || !url.startsWith(storagePrefix)) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok || !/^image\/(jpeg|png)/.test(type)) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 8 * 1024 * 1024) return null;
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

async function localAsDataUri(file: string) {
  const bytes = await readFile(join(process.cwd(), "public", file));
  return `data:image/jpeg;base64,${bytes.toString("base64")}`;
}

export default async function Image({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  const card = (await loadCard(type, id)) ?? {
    title: "PolarLink archive",
    kind: "Archive",
    meta: "India’s polar science, archived and explained",
    photoUrl: null,
    program: null,
  };

  // Only JPEG/PNG can be drawn here; anything else falls back to a
  // credited program photo.
  let photo = !card.photoUrl
    ? null
    : /^\/images\/[\w/-]+\.jpg$/.test(card.photoUrl)
      ? await localAsDataUri(card.photoUrl.slice(1)) // bundled photo (sample data)
      : await remoteAsDataUri(card.photoUrl);
  let credit: string | null = null;
  if (!photo) {
    const fallback = fallbackPhoto[card.program ?? "NONE"];
    photo = await localAsDataUri(fallback.file);
    credit = `Photo: ${fallback.credit} (${fallback.license})`;
  }
  const [regular, extraBold] = await fonts;
  const title = card.title.length > 110 ? `${card.title.slice(0, 107).replace(/\s+\S*$/, "")}…` : card.title;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#000", fontFamily: "Geist" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, width: 1200, height: 630, objectFit: "cover" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", padding: 64, color: "white" }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }}>PolarLink</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 24, textTransform: "uppercase", letterSpacing: 4, color: "rgba(255,255,255,0.7)" }}>
              {card.kind}
            </div>
            <div style={{ display: "flex", marginTop: 16, fontSize: title.length > 60 ? 54 : 68, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }}>
              {title}
            </div>
            {card.meta && (
              <div style={{ display: "flex", marginTop: 20, fontSize: 28, color: "rgba(255,255,255,0.8)" }}>{card.meta}</div>
            )}
          </div>
        </div>
        {credit && (
          <div style={{ position: "absolute", right: 24, bottom: 16, display: "flex", fontSize: 16, color: "rgba(255,255,255,0.6)" }}>
            {credit}
          </div>
        )}
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: extraBold, weight: 800, style: "normal" },
      ],
    }
  );
}
