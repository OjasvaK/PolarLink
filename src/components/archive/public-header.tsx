import Link from "next/link";
import { auth } from "@/auth";
import { NavLink } from "@/components/nav-link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export const archiveNav = [
  { href: "/archive", label: "Archive" },
  { href: "/archive?type=expedition", label: "Expeditions" },
  { href: "/archive?type=dataset", label: "Datasets" },
  { href: "/archive?type=publication", label: "Publications" },
  { href: "/archive?type=media", label: "Media" },
  { href: "/archive?type=activity", label: "Activities" },
  { href: "/stations", label: "Stations" },
  { href: "/timeline", label: "Timeline" },
];

// Header for public archive pages (the landing page has its own overlay header).
export async function PublicHeader() {
  const session = await auth();

  return (
    <header className="relative border-b bg-background/75 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2 max-sm:w-full">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            PolarLink
          </Link>
          <nav aria-label="Archive" className="-mx-6 flex w-[calc(100%+3rem)] items-center gap-x-5 overflow-x-auto px-6 pb-1 text-sm whitespace-nowrap text-muted-foreground sm:mx-0 sm:w-auto sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 sm:whitespace-normal">
            {archiveNav.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm">
            {session?.user ? <Link href="/dashboard">Dashboard</Link> : <Link href="/signin">Researcher Sign In</Link>}
          </Button>
        </div>
      </div>
    </header>
  );
}
