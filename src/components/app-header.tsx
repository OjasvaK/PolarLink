import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Role } from "@/generated/prisma/enums";
import { hasRole } from "@/lib/auth-guard";

const nav: { href: string; label: string; minimum: Role }[] = [
  { href: "/dashboard", label: "Dashboard", minimum: "PUBLIC" },
  { href: "/submissions", label: "My Submissions", minimum: "RESEARCHER" },
  { href: "/review", label: "Review Queue", minimum: "EDITOR" },
  { href: "/admin/researchers", label: "Researcher requests", minimum: "ADMIN" },
];

// Header for signed-in pages. Links are filtered by role for convenience
// only; each page enforces its own access with requireRole.
export async function AppHeader() {
  const session = await auth();
  const role = session?.user?.role ?? "PUBLIC";

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            PolarLink
          </Link>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
            {nav
              .filter((item) => hasRole(role, item.minimum))
              .map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
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
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
