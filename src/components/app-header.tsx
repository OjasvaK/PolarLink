import Link from "next/link";
import { auth, signOut } from "@/auth";
import { NavLink } from "@/components/nav-link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Role } from "@/generated/prisma/enums";
import { hasRole } from "@/lib/auth-guard";

const nav: { href: string; label: string; minimum: Role }[] = [
  { href: "/dashboard", label: "Dashboard", minimum: "PUBLIC" },
  { href: "/submissions", label: "My Submissions", minimum: "RESEARCHER" },
  { href: "/review", label: "Review Queue", minimum: "EDITOR" },
  { href: "/generator", label: "Content Generator", minimum: "EDITOR" },
  { href: "/admin/researchers", label: "Researcher Requests", minimum: "ADMIN" },
];

// Header for signed-in pages. Links are filtered by role for convenience
// only; each page enforces its own access with requireRole.
export async function AppHeader() {
  const session = await auth();
  const role = session?.user?.role ?? "PUBLIC";

  return (
    <header className="relative border-b">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2 max-sm:w-full">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            PolarLink
          </Link>
          <nav className="-mx-6 flex w-[calc(100%+3rem)] items-center gap-x-5 overflow-x-auto px-6 pb-1 text-sm whitespace-nowrap text-muted-foreground sm:mx-0 sm:w-auto sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 sm:whitespace-normal">
            {nav
              .filter((item) => hasRole(role, item.minimum))
              .map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="outline" size="sm">
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
