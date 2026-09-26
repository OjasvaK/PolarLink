import Link from "next/link";
import type { ReactNode } from "react";
import { archiveNav } from "@/components/archive/public-header";
import { Skeleton } from "@/components/ui/skeleton";

// Instant placeholders shown by each route’s loading.tsx while its data
// (from the database in Sydney) streams in. Headers are static copies of the
// real ones so the page frame doesn’t jump when content arrives.
//
// Routes that can call notFound() (archive and submission detail pages)
// deliberately have no loading.tsx: once streaming starts the status code is
// already 200, so a missing item would no longer return a real 404. For
// the same reason the archive list’s loading.tsx sits in the (index) route
// group, so it doesn’t also wrap /archive/[type]/[id].

function Loading({ children }: { children: ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading…</span>
      {children}
    </div>
  );
}

function PublicHeaderShell() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2 max-sm:w-full">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            PolarLink
          </Link>
          <nav aria-label="Archive" className="-mx-6 flex w-[calc(100%+3rem)] items-center gap-x-5 overflow-x-auto px-6 pb-1 text-sm whitespace-nowrap text-muted-foreground sm:mx-0 sm:w-auto sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 sm:whitespace-normal">
            {archiveNav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <Skeleton className="h-7 w-36" />
      </div>
    </header>
  );
}

function AppHeaderShell() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          PolarLink
        </Link>
        <Skeleton className="h-7 w-24" />
      </div>
    </header>
  );
}

function Heading({ wide = false }: { wide?: boolean }) {
  return (
    <>
      <Skeleton className={wide ? "h-10 w-2/3" : "h-10 w-56"} />
      <Skeleton className="mt-4 h-4 w-full max-w-xl" />
      <Skeleton className="mt-2 h-4 w-4/5 max-w-lg" />
    </>
  );
}

export function ArchiveSkeleton() {
  return (
    <Loading>
      <PublicHeaderShell />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Heading />
        <Skeleton className="mt-8 h-36 w-full rounded-lg sm:h-28" />
        <Skeleton className="mt-8 h-4 w-20" />
        <ul className="mt-4 divide-y border-y">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="flex gap-5 py-5">
              <Skeleton className="hidden aspect-[4/3] w-32 shrink-0 sm:block" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-3 h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-full" />
              </div>
            </li>
          ))}
        </ul>
      </main>
    </Loading>
  );
}


export function StationsSkeleton() {
  return (
    <Loading>
      <PublicHeaderShell />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Heading />
        <Skeleton className="mt-10 aspect-[1000/456] w-full rounded-lg" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      </main>
    </Loading>
  );
}

export function TimelineSkeleton() {
  return (
    <Loading>
      <PublicHeaderShell />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Heading />
        <div className="mt-8 flex gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>
        <div className="mt-12 grid gap-8 border-l pl-8">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i}>
              <Skeleton className="h-7 w-16" />
              <Skeleton className="mt-3 h-24 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </main>
    </Loading>
  );
}

export function ToolSkeleton({ form = false }: { form?: boolean }) {
  return (
    <Loading>
      <AppHeaderShell />
      <main className={form ? "mx-auto max-w-2xl px-6 py-12" : "mx-auto max-w-5xl px-6 py-12"}>
        <Heading />
        {form ? (
          <div className="mt-8 grid gap-6">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="grid gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className={i === 3 ? "h-28 w-full" : "h-8 w-full"} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-3">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}
      </main>
    </Loading>
  );
}
