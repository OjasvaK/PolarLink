import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArchiveImage } from "@/components/archive/archive-image";
import { CopyButton } from "@/components/archive/copy-button";
import { PublicHeader } from "@/components/archive/public-header";
import { SampleBadge } from "@/components/archive/sample-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { programLabel } from "@/lib/archive";
import { bibtex, plainCitation, publicationLink } from "@/lib/citation";
import { contentTypes, isContentSlug, type ContentSlug } from "@/lib/content/types";
import { prisma } from "@/lib/db";

const dateFormat = new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeZone: "UTC" });
const published = { status: "PUBLISHED" as const };
const expeditionRef = { select: { id: true, name: true, program: true, station: true } };

// Every loader only returns published rows; anything else is a 404.
async function load(slug: ContentSlug, id: string) {
  switch (slug) {
    case "expedition":
      return {
        slug,
        item: await prisma.expedition.findFirst({
          where: { id, ...published },
          include: {
            datasets: { where: published, orderBy: { title: "asc" } },
            publications: { where: published, orderBy: { year: "desc" } },
            mediaAssets: { where: published, orderBy: { publishedAt: "desc" } },
          },
        }),
      } as const;
    case "dataset":
      return { slug, item: await prisma.dataset.findFirst({ where: { id, ...published }, include: { linkedExpedition: expeditionRef } }) } as const;
    case "publication":
      return { slug, item: await prisma.publication.findFirst({ where: { id, ...published }, include: { linkedExpedition: expeditionRef } }) } as const;
    case "media":
      return { slug, item: await prisma.mediaAsset.findFirst({ where: { id, ...published }, include: { linkedExpedition: expeditionRef } }) } as const;
    case "activity":
      return { slug, item: await prisma.institutionalActivity.findFirst({ where: { id, ...published } }) } as const;
  }
}

type Loaded = NonNullable<Awaited<ReturnType<typeof load>>>;

function titleOf(loaded: Loaded) {
  switch (loaded.slug) {
    case "expedition":
      return loaded.item?.name;
    case "media":
      return loaded.item?.caption || loaded.item?.altText;
    default:
      return loaded.item?.title;
  }
}

async function resolve(params: PageProps<"/archive/[type]/[id]">["params"]) {
  const { type, id } = await params;
  if (!isContentSlug(type)) return null;
  const loaded = await load(type, id);
  return loaded.item ? loaded : null;
}

export async function generateMetadata({ params }: PageProps<"/archive/[type]/[id]">): Promise<Metadata> {
  const loaded = await resolve(params);
  return { title: loaded ? `${titleOf(loaded)} | PolarLink` : "Not found | PolarLink" };
}

export default async function ArchiveItemPage({ params }: PageProps<"/archive/[type]/[id]">) {
  const loaded = await resolve(params);
  if (!loaded) notFound();

  return (
    <div className="min-h-svh bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href={`/archive?type=${loaded.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
          All {contentTypes[loaded.slug].plural.toLowerCase()}
        </Link>
        <Detail loaded={loaded} />
      </main>
    </div>
  );
}

function Header({ slug, title, meta, isSample }: { slug: ContentSlug; title: string; meta: (string | null | undefined)[]; isSample: boolean }) {
  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline">{contentTypes[slug].label}</Badge>
        {isSample && <SampleBadge />}
        {meta.filter(Boolean).join(" · ")}
      </div>
      <h1 className="mt-3 text-balance text-4xl font-extrabold tracking-tight">{title}</h1>
      {isSample && (
        <p className="mt-3 max-w-prose text-sm text-muted-foreground">
          This is an illustrative record created to demonstrate the archive. It is
          not an official NCPOR record.
        </p>
      )}
    </>
  );
}

function Facts({ rows }: { rows: [string, ReactNode][] }) {
  const shown = rows.filter(([, value]) => value != null && value !== "");
  return (
    <dl className="mt-8 grid gap-4 rounded-lg border p-5 sm:grid-cols-2">
      {shown.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
          <dd className="mt-1 text-sm">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Prose({ children }: { children: string }) {
  return <div className="mt-8 max-w-prose whitespace-pre-line text-pretty leading-relaxed">{children}</div>;
}

function ExpeditionLink({ expedition }: { expedition: { id: string; name: string } | null }) {
  if (!expedition) return null;
  return (
    <Link href={`/archive/expedition/${expedition.id}`} className="underline underline-offset-4">
      {expedition.name}
    </Link>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Detail({ loaded }: { loaded: Loaded }) {
  switch (loaded.slug) {
    case "expedition": {
      const e = loaded.item!;
      const isPdf = e.reportFileUrl?.toLowerCase().split("?")[0].endsWith(".pdf");
      return (
        <>
          <Header slug="expedition" title={e.name} meta={[programLabel(e.program), e.station]} isSample={e.isSample} />
          <Facts
            rows={[
              ["Program", programLabel(e.program)],
              ["Station", e.station],
              ["Started", dateFormat.format(e.startDate)],
              ["Ended", e.endDate ? dateFormat.format(e.endDate) : "Ongoing or not recorded"],
            ]}
          />
          <Prose>{e.summary}</Prose>

          {e.reportFileUrl && (
            <Section title="Expedition report">
              {isPdf && (
                <iframe
                  src={e.reportFileUrl}
                  title={`${e.name} report`}
                  className="h-[70vh] w-full rounded-lg border"
                />
              )}
              <Button asChild variant="outline" size="sm" className="mt-4">
                <a href={e.reportFileUrl} target="_blank" rel="noreferrer">
                  {isPdf ? "Open or download the report" : "Open the report"}
                </a>
              </Button>
            </Section>
          )}

          {e.datasets.length > 0 && (
            <Section title="Datasets">
              <ul className="divide-y border-y">
                {e.datasets.map((d) => (
                  <li key={d.id} className="py-3">
                    <Link href={`/archive/dataset/${d.id}`} className="font-medium hover:underline">{d.title}</Link>
                    <span className="ml-2 text-sm text-muted-foreground">{d.format}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {e.publications.length > 0 && (
            <Section title="Publications">
              <ul className="divide-y border-y">
                {e.publications.map((p) => (
                  <li key={p.id} className="py-3">
                    <Link href={`/archive/publication/${p.id}`} className="font-medium hover:underline">{p.title}</Link>
                    <span className="ml-2 text-sm text-muted-foreground">{p.year}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {e.mediaAssets.length > 0 && (
            <Section title="Media">
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {e.mediaAssets.map((m) => (
                  <li key={m.id}>
                    <Link href={`/archive/media/${m.id}`} className="group block">
                      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                        {m.type === "PHOTO" ? (
                          <ArchiveImage src={m.url} alt={m.altText} sizes="(min-width: 640px) 33vw, 50vw" className="transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">Video</div>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </>
      );
    }

    case "dataset": {
      const d = loaded.item!;
      return (
        <>
          <Header slug="dataset" title={d.title} meta={[programLabel(d.linkedExpedition?.program), d.format]} isSample={d.isSample} />
          <Facts
            rows={[
              ["Format", d.format],
              ["License", d.license],
              ["Collected", d.collectionDate ? dateFormat.format(d.collectionDate) : null],
              ["Expedition", <ExpeditionLink key="e" expedition={d.linkedExpedition} />],
              ["Tags", d.tags.length ? d.tags.join(", ") : null],
            ]}
          />
          <Prose>{d.description}</Prose>
          <div className="mt-8 flex flex-wrap gap-3">
            {d.fileUrl && (
              <Button asChild size="sm">
                <a href={d.fileUrl} target="_blank" rel="noreferrer">Download data file</a>
              </Button>
            )}
            {d.externalUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={d.externalUrl} target="_blank" rel="noreferrer">View in external repository</a>
              </Button>
            )}
          </div>
        </>
      );
    }

    case "publication": {
      const p = loaded.item!;
      const link = publicationLink(p.doiOrUrl);
      return (
        <>
          <Header slug="publication" title={p.title} meta={[String(p.year), programLabel(p.linkedExpedition?.program)]} isSample={p.isSample} />
          <p className="mt-4 text-muted-foreground">{p.authors.join(", ")}</p>
          <Facts
            rows={[
              ["Year", p.year],
              ["DOI or link", link ? <a key="l" href={link} target="_blank" rel="noreferrer" className="break-all underline underline-offset-4">{p.doiOrUrl}</a> : p.doiOrUrl],
              ["Expedition", <ExpeditionLink key="e" expedition={p.linkedExpedition} />],
            ]}
          />
          <Section title="Abstract">
            <div className="max-w-prose whitespace-pre-line text-pretty leading-relaxed">{p.abstract}</div>
          </Section>
          <Section title="Cite this publication">
            <p className="rounded-lg border bg-muted/40 p-4 text-sm">{plainCitation(p)}</p>
            <pre className="mt-3 overflow-x-auto rounded-lg border bg-muted/40 p-4 text-xs">{bibtex(p)}</pre>
            <div className="mt-3 flex gap-3">
              <CopyButton text={plainCitation(p)} label="Copy citation" />
              <CopyButton text={bibtex(p)} label="Copy BibTeX" />
            </div>
          </Section>
        </>
      );
    }

    case "media": {
      const m = loaded.item!;
      return (
        <>
          <Header slug="media" title={m.caption || m.altText} meta={[m.type === "PHOTO" ? "Photo" : "Video", programLabel(m.linkedExpedition?.program)]} isSample={m.isSample} />
          <figure className="mt-8">
            {m.type === "PHOTO" ? (
              <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-muted">
                <ArchiveImage src={m.url} alt={m.altText} sizes="(min-width: 896px) 848px, 100vw" className="object-contain" priority />
              </div>
            ) : (
              <video src={m.url} controls className="w-full rounded-lg bg-black" aria-label={m.altText} />
            )}
            {m.caption && <figcaption className="mt-3 text-sm text-muted-foreground">{m.caption}</figcaption>}
          </figure>
          <Facts
            rows={[
              ["Description", m.altText],
              ["Expedition", <ExpeditionLink key="e" expedition={m.linkedExpedition} />],
              ["Tags", m.tags.length ? m.tags.join(", ") : null],
              ["Published", m.publishedAt ? dateFormat.format(m.publishedAt) : null],
            ]}
          />
          <p className="mt-4 text-sm text-muted-foreground">
            Contributed to the PolarLink archive{m.linkedExpedition ? ` from ${m.linkedExpedition.name}` : ""}.{" "}
            <a href={m.url} download target="_blank" rel="noreferrer" className="underline underline-offset-4">
              Download original
            </a>
          </p>
        </>
      );
    }

    case "activity": {
      const a = loaded.item!;
      return (
        <>
          <Header slug="activity" title={a.title} meta={[dateFormat.format(a.date)]} isSample={a.isSample} />
          {a.coverImageUrl && (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg bg-muted">
              <ArchiveImage src={a.coverImageUrl} alt="" sizes="(min-width: 896px) 848px, 100vw" priority />
            </div>
          )}
          <Prose>{a.description}</Prose>
        </>
      );
    }
  }
}
