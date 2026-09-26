import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/landing/site-header";
import { CinematicHero } from "@/components/landing/cinematic-hero";
import { ProgramSection } from "@/components/landing/program-section";
import { footerLinks, programSections } from "@/lib/mock-landing-data";
import { archiveCounts, latestPublished } from "@/lib/archive";
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
      title: latest.expedition.name,
      summary: excerpt(latest.expedition.summary),
    },
    latest.dataset && {
      kind: "Dataset",
      href: `/archive/dataset/${latest.dataset.id}`,
      title: latest.dataset.title,
      summary: excerpt(latest.dataset.description),
    },
    latest.media && {
      kind: "Media",
      href: `/archive/media/${latest.media.id}`,
      title: latest.media.caption || latest.media.altText,
      summary: excerpt(latest.media.altText),
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
                    <Badge variant="outline" className="w-fit">{item.kind}</Badge>
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

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <span>{footerLinks.contact}</span>
          <div className="flex items-center gap-4">
            {footerLinks.legal.map((label, index) => (
              <span key={label} className="flex items-center gap-4">
                <Link href="#" className="hover:text-foreground">{label}</Link>
                {index < footerLinks.legal.length - 1 && (
                  <Separator orientation="vertical" className="h-4" />
                )}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
