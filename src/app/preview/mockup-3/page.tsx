import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { heroCopy, stats, featured, footerLinks } from "@/lib/mock-landing-data";
import { RouteDiagram } from "./route-diagram";
import { Entrance } from "./entrance";

export default function Mockup3() {
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
        <Entrance>
          <section className="mx-auto max-w-3xl px-6 py-24 text-center">
            <div data-entrance>
              <Badge variant="secondary" className="mb-6">{heroCopy.eyebrow}</Badge>
            </div>
            <h1 data-entrance className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              {heroCopy.headline}
            </h1>
            <p data-entrance className="mt-4 text-pretty text-lg text-muted-foreground">
              {heroCopy.subheadline}
            </p>
            <div data-entrance className="mt-8 flex items-center justify-center gap-3">
              <Button size="lg">Explore the Archive</Button>
              <Button size="lg" variant="outline">Researcher Sign In</Button>
            </div>
          </section>
        </Entrance>

        <section className="mx-auto max-w-4xl px-6 pb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium text-muted-foreground">
                Research stations — animated route
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RouteDiagram />
            </CardContent>
          </Card>
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
