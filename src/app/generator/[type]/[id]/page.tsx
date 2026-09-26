import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth-guard";
import { contentTypes } from "@/lib/content/types";
import { prisma } from "@/lib/db";
import { isGeneratorSourceType, loadGeneratorSource } from "@/lib/generator/source";
import { generateDrafts, updateGenerated } from "../../actions";
import { DraftEditor } from "./draft-editor";

export const metadata: Metadata = {
  title: "Content Generator | PolarLink",
};

const kinds = [
  { kind: "WEBSITE_BLURB", heading: "Website blurb", limit: undefined },
  { kind: "SOCIAL_CAPTION", heading: "Social caption", limit: 280 },
] as const;

export default async function GeneratorSourcePage({ params }: PageProps<"/generator/[type]/[id]">) {
  const { type, id } = await params;
  if (!isGeneratorSourceType(type)) notFound();
  await requireRole("EDITOR", `/generator/${type}/${id}`);

  const loaded = await loadGeneratorSource(type, id);
  if (!loaded) notFound();

  const rows = await prisma.generatedContent.findMany({
    where: { sourceType: type, sourceId: id },
    orderBy: { updatedAt: "desc" },
  });
  const archivePath = `/archive/${type}/${id}`;
  const shareImage = `${archivePath}/opengraph-image`;

  return (
    <div className="min-h-svh bg-background">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/generator" className="text-sm text-muted-foreground hover:text-foreground">
          Back to Content Generator
        </Link>
        <p className="mt-4 text-sm text-muted-foreground">{contentTypes[type].label}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{loaded.title}</h1>
        <Link href={archivePath} className="mt-2 inline-block text-sm underline underline-offset-4">
          View the archive entry
        </Link>

        <form action={generateDrafts} className="mt-8 flex flex-wrap items-center gap-4 rounded-lg border bg-muted/40 p-4">
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="id" value={id} />
          <Button type="submit" size="sm">
            {rows.length ? "Regenerate drafts" : "Generate drafts"}
          </Button>
          <p className="text-sm text-muted-foreground">
            {rows.length
              ? "Regenerating rebuilds both drafts from the current metadata and discards unpublished edits."
              : "Builds a website blurb and a social caption from this item's stored metadata."}
          </p>
        </form>

        {rows.length > 0 && (
          <section className="mt-10 grid gap-6">
            {kinds.map(({ kind, heading, limit }) =>
              rows
                .filter((row) => row.kind === kind)
                .map((row) => (
                  <DraftEditor
                    key={row.id}
                    id={row.id}
                    heading={heading}
                    text={row.editedText ?? row.draftText}
                    published={row.status === "PUBLISHED"}
                    method={row.method}
                    limit={limit}
                    action={updateGenerated.bind(null, row.id)}
                  />
                ))
            )}
          </section>
        )}

        <section className="mt-12">
          <h2 className="text-lg font-semibold">Share image</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Used automatically when the archive link is shared, and downloadable for posts.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shareImage}
            alt={`Share card for ${loaded.title}`}
            width={1200}
            height={630}
            className="mt-4 h-auto w-full rounded-lg border"
          />
          <Button asChild variant="outline" size="sm" className="mt-3">
            <a href={shareImage} download={`polarlink-${type}-${id}.png`}>
              Download share image
            </a>
          </Button>
        </section>
      </main>
    </div>
  );
}
