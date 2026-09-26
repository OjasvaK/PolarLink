import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Role } from "@/generated/prisma/enums";
import { hasRole, requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { RequestAccessForm } from "./request-access-form";

export const metadata: Metadata = {
  title: "Dashboard | PolarLink",
};

const roleLabels: Record<Role, string> = {
  PUBLIC: "Public",
  RESEARCHER: "Researcher",
  EDITOR: "Editor",
  ADMIN: "Admin",
};

// Tools each role unlocks (spec section 8.2). Tools without an href aren't
// built yet (build plan step 6 onward), so they're listed without links
// rather than pointing at pages that don't exist.
const tools: { title: string; description: string; minimum: Role; href?: string }[] = [
  {
    title: "My Submissions",
    description: "Submit expedition reports, dataset metadata, and media, and track their review status.",
    minimum: "RESEARCHER",
  },
  {
    title: "Review Queue",
    description: "Approve, reject, or request changes on pending submissions.",
    minimum: "EDITOR",
  },
  {
    title: "Content Generator",
    description: "Draft website blurbs and social captions from archive entries.",
    minimum: "EDITOR",
  },
  {
    title: "Researcher requests",
    description: "Approve or reject pending requests for researcher access.",
    minimum: "ADMIN",
    href: "/admin/researchers",
  },
  {
    title: "Admin Console",
    description: "Users, role assignment, audit log, and analytics.",
    minimum: "ADMIN",
  },
];

const dateFormat = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" });

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const sessionUser = await requireUser("/dashboard");
  const { denied } = await searchParams;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: {
      name: true,
      email: true,
      role: true,
      affiliation: true,
      researcherStatus: true,
      researcherRequestedAt: true,
    },
  });
  const availableTools = tools.filter((tool) => hasRole(user.role, tool.minimum));

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            PolarLink
          </Link>
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

      <main className="mx-auto max-w-5xl px-6 py-12">
        {denied && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>
              Your account doesn&apos;t have access to that page.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {user.name ?? user.email ?? "Your dashboard"}
          </h1>
          <Badge variant="secondary">{roleLabels[user.role]}</Badge>
        </div>
        {(user.email || user.affiliation) && (
          <p className="mt-2 text-muted-foreground">
            {[user.email, user.affiliation].filter(Boolean).join(" · ")}
          </p>
        )}

        {user.role === "PUBLIC" && (
          <Card className="mt-10">
            <CardHeader>
              <CardTitle>Researcher access</CardTitle>
              <CardDescription>
                Researchers can submit expedition reports, datasets, and media
                to the archive. Requests are reviewed by an administrator.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.researcherStatus === "PENDING" ? (
                <p className="text-sm">
                  Your request is awaiting review
                  {user.researcherRequestedAt &&
                    ` (submitted ${dateFormat.format(user.researcherRequestedAt)})`}
                  . You&apos;ll get researcher tools here once it&apos;s approved.
                </p>
              ) : (
                <>
                  {user.researcherStatus === "REJECTED" && (
                    <Alert className="mb-6">
                      <AlertDescription>
                        Your previous request wasn&apos;t approved. You can
                        submit a new one with more detail.
                      </AlertDescription>
                    </Alert>
                  )}
                  <RequestAccessForm defaultName={user.name ?? ""} />
                </>
              )}
            </CardContent>
          </Card>
        )}

        {availableTools.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold">Your tools</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {availableTools.map((tool) => (
                <Card key={tool.title} className={tool.href ? "relative transition-colors hover:bg-muted/50" : undefined}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-base">
                        {tool.href ? (
                          <Link href={tool.href} className="after:absolute after:inset-0">
                            {tool.title}
                          </Link>
                        ) : (
                          tool.title
                        )}
                      </CardTitle>
                      {!tool.href && <Badge variant="outline">Not built yet</Badge>}
                    </div>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
