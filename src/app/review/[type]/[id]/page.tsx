import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ContentDetails } from "@/components/content/content-details";
import { StatusBadge } from "@/components/content/status-badge";
import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { getContent, ownerOf } from "@/lib/content/repo";
import { contentTypes, isContentSlug } from "@/lib/content/types";
import { reviewSubmission } from "../../actions";
import { ReviewForm } from "./review-form";

export const metadata: Metadata = {
  title: "Review submission | PolarLink",
};

export default async function ReviewItemPage({ params }: PageProps<"/review/[type]/[id]">) {
  const { type: slug, id } = await params;
  if (!isContentSlug(slug)) notFound();
  const type = contentTypes[slug];

  const reviewer = await requireRole("EDITOR", `/review/${slug}/${id}`);
  const item = await getContent(slug, id);
  // Drafts are private to their owner; reviewers only see what was submitted.
  if (!item || item.status === "DRAFT") notFound();

  const ownerId = ownerOf(slug, item);
  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { name: true, email: true, affiliation: true },
  });
  const ownSubmission = ownerId === reviewer.id && reviewer.role !== "ADMIN";

  return (
    <div className="min-h-svh bg-background">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/review" className="text-sm text-muted-foreground hover:text-foreground">
          Back to Review Queue
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight">{String(item[type.titleField])}</h1>
          <StatusBadge status={item.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {type.label} submitted by{" "}
          {[owner?.name ?? owner?.email, owner?.affiliation].filter(Boolean).join(", ")}
        </p>

        <div className="mt-8">
          <ContentDetails slug={slug} item={item} />
        </div>

        <section className="mt-10 border-t pt-6">
          <h2 className="text-lg font-semibold">Decision</h2>
          <div className="mt-4">
            {item.status !== "PENDING" ? (
              <p className="text-sm text-muted-foreground">This submission has already been reviewed.</p>
            ) : ownSubmission ? (
              <p className="text-sm text-muted-foreground">
                This is your own submission, so another editor needs to review it.
              </p>
            ) : (
              <ReviewForm action={reviewSubmission.bind(null, slug, id)} />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
