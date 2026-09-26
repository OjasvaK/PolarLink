import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { approveResearcher, rejectResearcher } from "./actions";

export const metadata: Metadata = {
  title: "Researcher requests | PolarLink",
};

const dateFormat = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" });

export default async function ResearcherRequestsPage() {
  await requireRole("ADMIN", "/admin/researchers");

  const requests = await prisma.user.findMany({
    where: { researcherStatus: "PENDING", role: "PUBLIC" },
    orderBy: { researcherRequestedAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      affiliation: true,
      researcherRequestReason: true,
      researcherRequestedAt: true,
    },
  });

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            PolarLink
          </Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">Researcher requests</h1>
        <p className="mt-2 text-muted-foreground">
          Approving a request gives the user researcher access immediately.
        </p>

        {requests.length === 0 ? (
          <p className="mt-10 rounded-md border border-dashed p-8 text-center text-muted-foreground">
            No pending requests.
          </p>
        ) : (
          <ul className="mt-10 grid gap-4">
            {requests.map((request) => (
              <li key={request.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {request.name ?? request.email ?? "Unnamed user"}
                    </CardTitle>
                    <CardDescription>
                      {[
                        request.affiliation,
                        request.email,
                        request.researcherRequestedAt &&
                          `Requested ${dateFormat.format(request.researcherRequestedAt)}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-5">
                    <p className="whitespace-pre-line text-sm">{request.researcherRequestReason}</p>
                    <div className="flex gap-3">
                      <form action={approveResearcher}>
                        <input type="hidden" name="userId" value={request.id} />
                        <Button type="submit" size="sm">
                          Approve
                        </Button>
                      </form>
                      <form action={rejectResearcher}>
                        <input type="hidden" name="userId" value={request.id} />
                        <Button type="submit" size="sm" variant="outline">
                          Reject
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
