import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { StatusBadge } from "@/components/content/status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { hasRole, requireRole } from "@/lib/auth-guard";
import { listSubmissionsBy } from "@/lib/content/repo";
import { contentSlugs, contentTypes } from "@/lib/content/types";

export const metadata: Metadata = {
  title: "My Submissions | PolarLink",
};

const dateFormat = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" });

const notices: Record<string, string> = {
  submitted: "Submitted for review. An editor will look at it soon.",
  saved: "Draft saved.",
  deleted: "Draft deleted.",
};

export default async function SubmissionsPage({ searchParams }: PageProps<"/submissions">) {
  const user = await requireRole("RESEARCHER", "/submissions");
  const params = await searchParams;
  const notice = Object.keys(notices).find((key) => params[key]);
  const items = await listSubmissionsBy(user.id);
  const creatable = contentSlugs.filter((slug) => hasRole(user.role, contentTypes[slug].minRole));

  return (
    <div className="min-h-svh bg-background">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">My Submissions</h1>
        <p className="mt-2 text-muted-foreground">
          Drafts stay private until you submit them. Editors review each
          submission before it is published to the archive.
        </p>

        {notice && (
          <Alert className="mt-6">
            <AlertDescription>{notices[notice]}</AlertDescription>
          </Alert>
        )}

        <div className="mt-8 flex flex-wrap gap-2">
          {creatable.map((slug) => (
            <Button key={slug} asChild variant="outline" size="sm">
              <Link href={`/submissions/new/${slug}`}>New {contentTypes[slug].label.toLowerCase()}</Link>
            </Button>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="mt-10 rounded-md border border-dashed p-8 text-center text-muted-foreground">
            You haven&apos;t submitted anything yet. Start with one of the options above.
          </p>
        ) : (
          <Table className="mt-8">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={`${item.slug}-${item.id}`}>
                  <TableCell className="max-w-80 truncate font-medium">
                    <Link href={`/submissions/${item.slug}/${item.id}`} className="hover:underline">
                      {item.title}
                    </Link>
                  </TableCell>
                  <TableCell>{contentTypes[item.slug].label}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
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
