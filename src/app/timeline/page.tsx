import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/archive/public-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/landing/reveal";
import { Badge } from "@/components/ui/badge";
import type { Program } from "@/generated/prisma/enums";
import { programLabel, programs } from "@/lib/archive";
import { prisma } from "@/lib/db";
import { milestones } from "@/lib/milestones";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Program Timeline | PolarLink",
  description: "India’s Antarctic, Arctic and Himalayan research programs from 1981 to today.",
};

type Entry = {
  key: string;
  year: number;
  title: string;
  description: string;
  program: Program | null;
  href?: string;
  kind: "Milestone" | "Expedition";
};

export default async function TimelinePage({ searchParams }: PageProps<"/timeline">) {
  const raw = (await searchParams).program;
  const program = programs.find((p) => p.value === raw)?.value;

  const expeditions = await prisma.expedition.findMany({
    where: { status: "PUBLISHED", ...(program ? { program } : {}) },
    select: { id: true, name: true, program: true, station: true, startDate: true },
    orderBy: { startDate: "asc" },
  });

  const entries: Entry[] = [
    ...milestones
      .filter((m) => !program || m.program === program || m.program === null)
      .map((m) => ({ key: `m-${m.year}-${m.title}`, ...m, kind: "Milestone" as const })),
    ...expeditions.map((e) => ({
      key: `e-${e.id}`,
      year: e.startDate.getUTCFullYear(),
      title: e.name,
      description: `${programLabel(e.program)} program, ${e.station}.`,
      program: e.program,
      href: `/archive/expedition/${e.id}`,
      kind: "Expedition" as const,
    })),
  ].sort((a, b) => a.year - b.year || (a.kind === b.kind ? 0 : a.kind === "Milestone" ? -1 : 1));

  const years = [...new Set(entries.map((e) => e.year))];
  const filters = [{ value: undefined, label: "All programs" }, ...programs];

  return (
    <div className="flex min-h-svh flex-col">
      <PublicHeader />
      <main className="bg-background mx-auto w-full flex-1 max-w-4xl px-6 py-12">
        <h1 className="text-4xl font-extrabold tracking-tight">Program Timeline</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Milestones of India’s polar and Himalayan research since 1981,
          with every expedition published in the archive.
        </p>

        <nav aria-label="Filter by program" className="mt-8 flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = f.value === program;
            return (
              <Link
                key={f.label}
                href={f.value ? `/timeline?program=${f.value}` : "/timeline"}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm transition-colors",
                  active ? "border-foreground bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </Link>
            );
          })}
        </nav>

        <ol className="relative mt-12 border-l pl-8">
          {years.map((year) => (
            <li key={year} className="relative pb-10 last:pb-0">
              <span aria-hidden className="absolute -left-[2.3rem] top-1.5 size-3 rounded-full border-2 border-background bg-primary" />
              <h2 className="text-2xl font-extrabold tabular-nums tracking-tight">{year}</h2>
              <ul className="mt-3 grid gap-3">
                {entries
                  .filter((e) => e.year === year)
                  .map((entry) => (
                    <li key={entry.key}>
                      <Reveal>
                        <div className="rounded-lg border p-4">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant={entry.kind === "Expedition" ? "secondary" : "outline"}>{entry.kind}</Badge>
                            {programLabel(entry.program) ?? "Institutional"}
                          </div>
                          <h3 className="mt-2 font-semibold">
                            {entry.href ? (
                              <Link href={entry.href} className="hover:underline">
                                {entry.title}
                              </Link>
                            ) : (
                              entry.title
                            )}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
                        </div>
                      </Reveal>
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ol>
      </main>
      <SiteFooter />
    </div>
  );
}
