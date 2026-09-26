import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/auth-guard";
import { contentTypes, type ContentSlug } from "@/lib/content/types";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Content Generator | PolarLink",
};

const dateFormat = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" });
const published = { status: "PUBLISHED" as const };
const recent = { orderBy: { publishedAt: "desc" as const }, take: 20 };

export default async function GeneratorPage() {
  await requireRole("EDITOR", "/generator");

  const [expeditions, datasets, media, generated] = await Promise.all([
    prisma.expedition.findMany({ where: published, select: { id: true, name: true, publishedAt: true }, ...recent }),
    prisma.dataset.findMany({ where: published, select: { id: true, title: true, publishedAt: true }, ...recent }),
    prisma.mediaAsset.findMany({ where: published, select: { id: true, caption: true, altText: true, publishedAt: true }, ...recent }),
    prisma.generatedContent.findMany({ orderBy: { updatedAt: "desc" } }),
  ]);

  const sources: { type: ContentSlug; id: string; title: string; publishedAt: Date | null }[] = [
    ...expeditions.map((e) => ({ type: "expedition" as const, id: e.id, title: e.name, publishedAt: e.publishedAt })),
    ...datasets.map((d) => ({ type: "dataset" as const, id: d.id, title: d.title, publishedAt: d.publishedAt })),
    ...media.map((m) => ({ type: "media" as const, id: m.id, title: m.caption || m.altText, publishedAt: m.publishedAt })),
  ].sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));

  const statusFor = (type: string, id: string) => {
    const rows = generated.filter((g) => g.sourceType === type && g.sourceId === id);
    if (rows.length === 0) return null;
    return rows.some((g) => g.status === "PUBLISHED") ? "Published" : "Draft";
  };

  return (
    <div className="min-h-svh bg-background">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">Content Generator</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Turn a published archive entry into a website blurb, a social caption
          and a share image. Drafts are built only from the entry&apos;s stored
          metadata and stay labelled as drafts until you publish them.
        </p>

        {sources.length === 0 ? (
          <p className="mt-10 rounded-md border border-dashed p-8 text-center text-muted-foreground">
            Nothing is published yet. Approve submissions in the Review Queue first.
          </p>
        ) : (
          <Table className="mt-8">
            <TableHeader>
              <TableRow>
                <TableHead>Archive entry</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Generated content</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => {
                const status = statusFor(source.type, source.id);
                return (
                  <TableRow key={`${source.type}-${source.id}`}>
                    <TableCell className="max-w-80 truncate font-medium">
                      <Link href={`/generator/${source.type}/${source.id}`} className="hover:underline">
                        {source.title}
                      </Link>
                    </TableCell>
                    <TableCell>{contentTypes[source.type].label}</TableCell>
                    <TableCell className="tabular-nums">
                      {source.publishedAt ? dateFormat.format(source.publishedAt) : ""}
                    </TableCell>
                    <TableCell>
                      {status ? (
                        <Badge variant={status === "Published" ? "default" : "secondary"}>{status}</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">None yet</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </main>
    </div>
  );
}
