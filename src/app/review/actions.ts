"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { delegatesFor, getContent, ownerOf } from "@/lib/content/repo";
import { isContentSlug } from "@/lib/content/types";

export type ReviewFormState = { error?: string };

const outcomes = {
  APPROVED: { status: "PUBLISHED", action: "approved" },
  REJECTED: { status: "REJECTED", action: "rejected" },
  // Requesting changes sends it back to the submitter as an editable draft.
  CHANGES_REQUESTED: { status: "DRAFT", action: "changes_requested" },
} as const;

export async function reviewSubmission(
  slug: string,
  id: string,
  _prev: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  if (!isContentSlug(slug)) return { error: "Unknown content type." };
  const reviewer = await requireRole("EDITOR", "/review");

  const decision = formData.get("decision");
  if (decision !== "APPROVED" && decision !== "REJECTED" && decision !== "CHANGES_REQUESTED") {
    return { error: "Choose a decision." };
  }
  const commentRaw = formData.get("comment");
  const comment = typeof commentRaw === "string" ? commentRaw.trim() : "";
  if (decision !== "APPROVED" && comment.length < 5) {
    return { error: "Explain what needs to change so the submitter can act on it." };
  }
  if (comment.length > 5000) return { error: "Keep the comment under 5000 characters." };

  const item = await getContent(slug, id);
  if (!item) return { error: "Submission not found." };
  if (ownerOf(slug, item) === reviewer.id && reviewer.role !== "ADMIN") {
    return { error: "You can’t review your own submission." };
  }

  const outcome = outcomes[decision];
  const updated = await prisma.$transaction(async (tx) => {
    const { count } = await delegatesFor(tx)[slug].updateMany({
      where: { id, status: "PENDING" },
      data: {
        status: outcome.status,
        ...(decision === "APPROVED" ? { publishedAt: new Date() } : {}),
      },
    });
    if (count === 0) return false;
    await tx.review.create({
      data: { targetType: slug, targetId: id, decision, comment: comment || null, reviewerId: reviewer.id },
    });
    await tx.auditLog.create({
      data: { actorId: reviewer.id, action: `${slug}.${outcome.action}`, targetType: slug, targetId: id },
    });
    return true;
  });
  if (!updated) return { error: "This submission is no longer pending review." };

  revalidatePath("/review");
  revalidatePath("/submissions");
  // Landing stats and "Recently published" are statically regenerated.
  if (decision === "APPROVED") revalidatePath("/");
  redirect(`/review?done=${outcome.action}`);
}
