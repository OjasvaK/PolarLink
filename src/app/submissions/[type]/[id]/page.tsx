import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ContentDetails } from "@/components/content/content-details";
import { ContentForm } from "@/components/content/content-form";
import { StatusBadge } from "@/components/content/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth-guard";
import { getContent, latestReview, ownerOf, publishedExpeditionOptions } from "@/lib/content/repo";
import { contentTypes, isContentSlug, toFormValues } from "@/lib/content/types";
import { deleteSubmission, saveSubmission, withdrawSubmission } from "../../actions";

export const metadata: Metadata = {
  title: "Submission | PolarLink",
};

const decisionTitles = {
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CHANGES_REQUESTED: "Changes requested",
} as const;

export default async function SubmissionPage({ params }: PageProps<"/submissions/[type]/[id]">) {
  const { type: slug, id } = await params;
  if (!isContentSlug(slug)) notFound();
  const type = contentTypes[slug];

  const user = await requireRole("RESEARCHER", `/submissions/${slug}/${id}`);
  const item = await getContent(slug, id);
  // Someone else's submission is reported as missing rather than forbidden.
  if (!item || ownerOf(slug, item) !== user.id) notFound();

  const review = await latestReview(slug, id);
  const editable = item.status === "DRAFT" || item.status === "REJECTED";
  const expeditions = editable ? await publishedExpeditionOptions() : [];

  return (
    <div className="min-h-svh bg-background">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/submissions" className="text-sm text-muted-foreground hover:text-foreground">
          Back to My Submissions
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight">{String(item[type.titleField])}</h1>
          <StatusBadge status={item.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{type.label}</p>

        {review && item.status !== "PENDING" && review.comment && (
          <Alert className="mt-6" variant={review.decision === "APPROVED" ? "default" : "destructive"}>
            <AlertTitle>
              {decisionTitles[review.decision]}
              {review.reviewer.name && ` by ${review.reviewer.name}`}
            </AlertTitle>
            <AlertDescription className="whitespace-pre-line">{review.comment}</AlertDescription>
          </Alert>
        )}

        {editable ? (
          <>
            <div className="mt-8">
              <ContentForm
                slug={slug}
                action={saveSubmission.bind(null, slug, id)}
                initialValues={toFormValues(type, item)}
                expeditions={expeditions}
              />
            </div>
            <form action={deleteSubmission} className="mt-10 border-t pt-6">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="id" value={id} />
              <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                Delete this draft
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="mt-8">
              <ContentDetails slug={slug} item={item} />
            </div>
            {item.status === "PENDING" && (
              <form action={withdrawSubmission} className="mt-10 flex flex-wrap items-center gap-4 border-t pt-6">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="id" value={id} />
                <p className="text-sm text-muted-foreground">Waiting for an editor to review this.</p>
                <Button type="submit" variant="outline" size="sm">
                  Withdraw to edit
                </Button>
              </form>
            )}
          </>
        )}
      </main>
    </div>
  );
}
