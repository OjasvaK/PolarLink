import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { listPending } from "@/lib/content/repo";
import { contentTypes } from "@/lib/content/types";

export const metadata: Metadata = {
  title: "Review Queue | PolarLink",
};

const dateFormat = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" });

const notices: Record<string, string> = {
  approved: "Approved and published.",
  rejected: "Rejected. The submitter can see your comment.",
  changes_requested: "Sent back to the submitter with your comments.",
};

export default async function ReviewQueuePage({ searchParams }: PageProps<"/review">) {
  const reviewer = await requireRole("EDITOR", "/review");
  const { done } = await searchParams;
  const items = (await listPending()).reverse();

  const owners = await prisma.user.findMany({
    where: { id: { in: [...new Set(items.map((item) => item.ownerId))] } },
    select: { id: true, name: true, email: true },
  });
  const ownerName = new Map(owners.map((owner) => [owner.id, owner.name ?? owner.email ?? "Unknown"]));

  return (
    <div className="min-h-svh bg-background">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">Review Queue</h1>
        <p className="mt-2 text-muted-foreground">
          Pending submissions across all content types, oldest first.
        </p>

        {typeof done === "string" && notices[done] && (
          <Alert className="mt-6">
            <AlertDescription>{notices[done]}</AlertDescription>
          </Alert>
        )}

        {items.length === 0 ? (
          <p className="mt-10 rounded-md border border-dashed p-8 text-center text-muted-foreground">
            Nothing is waiting for review.
          </p>
        ) : (
          <Table className="mt-8">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Submitted by</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={`${item.slug}-${item.id}`}>
                  <TableCell className="max-w-80 truncate font-medium">
                    <Link href={`/review/${item.slug}/${item.id}`} className="hover:underline">
                      {item.title}
                    </Link>
                  </TableCell>
                  <TableCell>{contentTypes[item.slug].label}</TableCell>
                  <TableCell>
                    {ownerName.get(item.ownerId)}
                    {item.ownerId === reviewer.id && <span className="text-muted-foreground"> (you)</span>}
                  </TableCell>
                  <TableCell className="tabular-nums">{dateFormat.format(item.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </main>
    </div>
  );
}
