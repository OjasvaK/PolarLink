import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/landing/site-header";
import { CinematicHero } from "@/components/landing/cinematic-hero";
import { ProgramSection } from "@/components/landing/program-section";
import { stats, featured, footerLinks, programSections } from "@/lib/mock-landing-data";
import { programSlideshows } from "@/lib/image-credits";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <CinematicHero />

        {programSections.map((program) => (
          <ProgramSection
            key={program.key}
            eyebrow={program.eyebrow}
            title={program.title}
            description={program.description}
            overlayFrom={program.overlayFrom}
            images={programSlideshows[program.key as keyof typeof programSlideshows]}
          />
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

        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-xl font-semibold">Recently published</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {featured.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <Badge variant="outline" className="w-fit">{item.kind}</Badge>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.summary}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
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
