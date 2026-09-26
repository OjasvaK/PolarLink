import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/landing/site-header";
import { CinematicHero } from "@/components/landing/cinematic-hero";
import { ProgramSection } from "@/components/landing/program-section";
import { programSections } from "@/lib/mock-landing-data";
import { SiteFooter } from "@/components/site-footer";
import { archiveCounts, latestPublished, publishedBlurbs } from "@/lib/archive";
import { StationMap } from "@/components/archive/station-map";
import { SampleBadge } from "@/components/archive/sample-badge";
import {
  AntarcticGallery,
  ArcticGallery,
  HimalayanGallery,
} from "@/components/landing/program-galleries";

const galleries = {
  antarctic: <AntarcticGallery />,
  arctic: <ArcticGallery />,
  himalayan: <HimalayanGallery />,
};

// Stats and "Recently published" come from the database (spec section 8.1).
// Regenerated at most every 5 minutes, and immediately when an editor
// publishes something (see src/app/review/actions.ts).
export const revalidate = 300;

function excerpt(text: string, length = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length).replace(/\s+\S*$/, "")}...` : clean;
}

export default async function Home() {
  const [counts, latest] = await Promise.all([archiveCounts(), latestPublished()]);
  const blurbs = await publishedBlurbs(
    [
      latest.expedition && { type: "expedition", id: latest.expedition.id },
      latest.dataset && { type: "dataset", id: latest.dataset.id },
      latest.media && { type: "media", id: latest.media.id },
    ].filter((source) => !!source)
  );
  // An editor-published blurb, when there is one, replaces the raw excerpt.
  const summaryFor = (type: string, id: string, fallback: string) =>
    excerpt(blurbs.get(`${type}:${id}`) ?? fallback);
  const stats = [
    { label: "Expeditions archived", value: counts.expeditions },
    { label: "Datasets indexed", value: counts.datasets },
    { label: "Publications catalogued", value: counts.publications },
    { label: "Media items", value: counts.media },
  ];
  const featured = [
    latest.expedition && {
      kind: "Expedition",
      href: `/archive/expedition/${latest.expedition.id}`,
      isSample: latest.expedition.isSample,
      title: latest.expedition.name,
      summary: summaryFor("expedition", latest.expedition.id, latest.expedition.summary),
    },
    latest.dataset && {
      kind: "Dataset",
      href: `/archive/dataset/${latest.dataset.id}`,
      isSample: latest.dataset.isSample,
      title: latest.dataset.title,
      summary: summaryFor("dataset", latest.dataset.id, latest.dataset.description),
    },
    latest.media && {
      kind: "Media",
      href: `/archive/media/${latest.media.id}`,
      isSample: latest.media.isSample,
      title: latest.media.caption || latest.media.altText,
      summary: summaryFor("media", latest.media.id, latest.media.altText),
    },
  ].filter((item) => !!item);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <CinematicHero />

        <div id="programs" />
        {programSections.map((program) => (
          <ProgramSection
            key={program.key}
            eyebrow={program.eyebrow}
            title={program.title}
            description={program.description}
          >
            {galleries[program.key]}
          </ProgramSection>
        ))}

        <section className="dark bg-black py-20 text-foreground sm:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Stations</p>
            <h2 className="mt-3 max-w-2xl text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
              From Goa to both poles and the Himalaya
            </h2>
            <div className="mt-12">
              <StationMap showList={false} />
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link href="/stations" className="underline underline-offset-4">All stations</Link>
              <Link href="/timeline" className="underline underline-offset-4">Program timeline since 1981</Link>
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/40">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-14 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-semibold tabular-nums">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {featured.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-semibold">Recently published</h2>
              <Link href="/archive" className="text-sm text-muted-foreground hover:text-foreground">
                Browse the archive
              </Link>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {featured.map((item) => (
                <Card key={item.href} className="relative transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="w-fit">{item.kind}</Badge>
                      {item.isSample && <SampleBadge />}
                    </div>
                    <CardTitle className="text-base">
                      <Link href={item.href} className="after:absolute after:inset-0">
                        {item.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.summary}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
