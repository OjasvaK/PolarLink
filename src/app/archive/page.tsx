import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveImage } from "@/components/archive/archive-image";
import { PublicHeader } from "@/components/archive/public-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Program } from "@/generated/prisma/enums";
import { programLabel, programs, publishedTags, searchArchive, type ArchiveFilters, type ArchiveResult } from "@/lib/archive";
import { contentSlugs, contentTypes, isContentSlug } from "@/lib/content/types";

export const metadata: Metadata = {
  title: "Archive | PolarLink",
  description: "Search expedition reports, datasets, publications, media and activities from India's polar research programs.",
};

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

const dateFormat = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "UTC" });

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
}

function parseFilters(params: Record<string, string | string[] | undefined>): ArchiveFilters {
  const type = first(params.type);
  const program = first(params.program);
  const year = Number(first(params.year));
  return {
    q: first(params.q)?.slice(0, 200),
    type: type && isContentSlug(type) ? type : undefined,
    program: programs.some((p) => p.value === program) ? (program as Program) : undefined,
    year: Number.isInteger(year) && year >= 1900 && year <= 2100 ? year : undefined,
    tag: first(params.tag)?.slice(0, 60),
  };
}

export default async function ArchivePage({ searchParams }: PageProps<"/archive">) {
  const filters = parseFilters(await searchParams);
  const [results, tags] = await Promise.all([searchArchive(filters), publishedTags()]);
  const filtered = Object.values(filters).some(Boolean);
  const heading = filters.type ? contentTypes[filters.type].plural : "Archive";

  return (
    <div className="min-h-svh bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-4xl font-extrabold tracking-tight">{heading}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Published expedition reports, datasets, publications, media and
          institutional activities from India&apos;s Antarctic, Arctic and
          Himalayan programs.
        </p>

        <form role="search" className="mt-8 grid gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="grid gap-1.5 sm:col-span-2 lg:col-span-2">
            <Label htmlFor="q">Search</Label>
            <Input id="q" name="q" type="search" defaultValue={filters.q} placeholder="Station, topic, author..." />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="type">Type</Label>
            <select id="type" name="type" defaultValue={filters.type ?? ""} className={selectClass}>
              <option value="">All types</option>
              {contentSlugs.map((slug) => (
                <option key={slug} value={slug}>
                  {contentTypes[slug].plural}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="program">Program</Label>
            <select id="program" name="program" defaultValue={filters.program ?? ""} className={selectClass}>
              <option value="">All programs</option>
              {programs.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="year">Year</Label>
            <Input id="year" name="year" type="number" inputMode="numeric" min={1900} max={2100} defaultValue={filters.year} placeholder="Any" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="tag">Tag</Label>
            <select id="tag" name="tag" defaultValue={filters.tag ?? ""} className={selectClass}>
              <option value="">Any tag</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-6">
            <Button type="submit" size="sm">Apply</Button>
            {filtered && (
              <Link href="/archive" className="text-sm text-muted-foreground hover:text-foreground">
                Clear filters
              </Link>
            )}
          </div>
        </form>

        <p className="mt-8 text-sm text-muted-foreground" aria-live="polite">
          {results.length === 1 ? "1 result" : `${results.length} results`}
        </p>

        {results.length === 0 ? (
          <p className="mt-4 rounded-md border border-dashed p-10 text-center text-muted-foreground">
            {filtered ? "Nothing matches those filters. Try removing one." : "Nothing has been published yet."}
          </p>
        ) : filters.type === "media" ? (
          <ul className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {results.map((result) => (
              <li key={result.id}>
                <MediaTile result={result} />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="mt-4 divide-y border-y">
            {results.map((result) => (
              <li key={`${result.slug}-${result.id}`}>
                <ResultRow result={result} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function ResultRow({ result }: { result: ArchiveResult }) {
  const meta = [
    programLabel(result.program),
    result.date ? dateFormat.format(result.date) : result.year,
  ].filter(Boolean);

  return (
    <Link href={`/archive/${result.slug}/${result.id}`} className="group flex gap-5 py-5">
      {result.imageUrl && result.mediaType !== "VIDEO" && (
        <div className="relative hidden aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-md bg-muted sm:block">
          <ArchiveImage src={result.imageUrl} alt="" sizes="128px" />
        </div>
      )}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{contentTypes[result.slug].label}</Badge>
          {meta.join(" · ")}
        </div>
        <h2 className="mt-2 text-lg font-semibold group-hover:underline">{result.title}</h2>
        {result.excerpt && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{result.excerpt}</p>}
      </div>
    </Link>
  );
}

function MediaTile({ result }: { result: ArchiveResult }) {
  return (
    <Link href={`/archive/media/${result.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
        {result.mediaType === "VIDEO" ? (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">Video</div>
        ) : (
          result.imageUrl && (
            <ArchiveImage
              src={result.imageUrl}
              alt={result.excerpt}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="transition-transform duration-500 group-hover:scale-105"
            />
          )
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-sm">{result.title}</p>
    </Link>
  );
}
