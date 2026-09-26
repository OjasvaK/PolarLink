import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProgressiveBlur } from "@/components/ui/skiper-ui/skiper41";
import { heroCopy, stats, featured, footerLinks } from "@/lib/mock-landing-data";
import { Reveal } from "./reveal";

export default function Mockup2() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">PolarLink</span>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <Link href="#" className="hover:text-foreground">Archive</Link>
            <Link href="#" className="hover:text-foreground">Datasets</Link>
            <Link href="#" className="hover:text-foreground">Publications</Link>
            <Link href="#" className="hover:text-foreground">About</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm">Researcher Sign In</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden bg-[color-mix(in_oklch,var(--primary),var(--background)_82%)]">
          <div className="relative mx-auto max-w-3xl px-6 py-28 text-center">
            <Badge variant="secondary" className="mb-6">{heroCopy.eyebrow}</Badge>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              {heroCopy.headline}
            </h1>
            <p className="mt-5 text-pretty text-lg text-muted-foreground">
              {heroCopy.subheadline}
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button size="lg">Explore the Archive</Button>
              <Button size="lg" variant="outline">Researcher Sign In</Button>
            </div>
          </div>
          <ProgressiveBlur
            position="bottom"
            height="120px"
            backgroundColor="var(--background)"
          />
        </section>

        <section className="border-y bg-muted/40">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-14 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <Reveal key={stat.label} delayMs={index * 80}>
                <div className="text-center">
                  <div className="text-3xl font-semibold tabular-nums">{stat.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-xl font-semibold">Recently published</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {featured.map((item, index) => (
              <Reveal key={item.title} delayMs={index * 100}>
                <Card className="h-full">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit">{item.kind}</Badge>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.summary}</p>
                  </CardContent>
                </Card>
              </Reveal>
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
        <p className="border-t px-6 py-3 text-center text-xs text-muted-foreground">
          Scroll-reveal effect built with Skiper UI (free tier, attribution required).
        </p>
      </footer>
    </div>
  );
}
