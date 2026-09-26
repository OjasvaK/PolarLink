import Link from "next/link";
import { auth } from "@/auth";
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
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            PolarLink
          </Link>
          <nav aria-label="Archive" className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
            {archiveNav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
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
