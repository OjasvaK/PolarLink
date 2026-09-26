"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasRole, requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { delegates, getContent, ownerOf } from "@/lib/content/repo";
import { contentTypes, isContentSlug, parseContentForm } from "@/lib/content/types";

export type SubmissionFormState = {
  errors?: Record<string, string>;
  values?: Record<string, string>;
  formError?: string;
};

const editableStatuses = new Set(["DRAFT", "REJECTED"]);

export async function saveSubmission(
  slug: string,
  id: string | null,
  _prev: SubmissionFormState,
  formData: FormData
): Promise<SubmissionFormState> {
  if (!isContentSlug(slug)) return { formError: "Unknown content type." };
  const type = contentTypes[slug];
  const user = await requireRole("RESEARCHER");
  if (!hasRole(user.role, type.minRole)) {
    return { formError: `Your role can’t submit ${type.plural.toLowerCase()}.` };
  }

  const parsed = parseContentForm(type, formData);
  if (!parsed.ok) return { errors: parsed.errors, values: parsed.values };
  const data = parsed.data;

  if (typeof data.linkedExpeditionId === "string") {
    const linked = await prisma.expedition.findFirst({
      where: { id: data.linkedExpeditionId, status: "PUBLISHED" },
      select: { id: true },
    });
    if (!linked) {
      return {
        errors: { linkedExpeditionId: "Choose a published expedition." },
        values: Object.fromEntries(
          [...formData.entries()].map(([key, value]) => [key, String(value)])
        ),
      };
    }
  }

  const submit = formData.get("intent") === "submit";
  const status = submit ? "PENDING" : "DRAFT";
  let itemId = id;

  if (id) {
    const existing = await getContent(slug, id);
    if (!existing || ownerOf(slug, existing) !== user.id) {
      return { formError: "Submission not found." };
    }
    // Only unpublished work that isn’t already in review can be edited.
    const { count } = await delegates[slug].updateMany({
      where: { id, status: { in: [...editableStatuses] } },
      data: { ...data, status },
    });
    if (count === 0) return { formError: "This submission can no longer be edited." };
  } else {
    const created = await delegates[slug].create({
      data: { ...data, status, [type.ownerField]: user.id },
    });
    itemId = created.id;
  }

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: `${slug}.${submit ? "submitted" : "saved"}`,
      targetType: slug,
      targetId: itemId!,
    },
  });

  revalidatePath("/submissions");
  revalidatePath("/review");
  redirect(`/submissions?${submit ? "submitted" : "saved"}=1`);
}

async function ownedItem(slug: string, id: string) {
  if (!isContentSlug(slug)) return null;
  const user = await requireRole("RESEARCHER");
  const item = await getContent(slug, id);
  if (!item || ownerOf(slug, item) !== user.id) return null;
  return { user, item, slug };
}

// Pull a pending submission back to draft so it can be edited again.
export async function withdrawSubmission(formData: FormData) {
  const owned = await ownedItem(String(formData.get("slug")), String(formData.get("id")));
  if (!owned) return;
  const { count } = await delegates[owned.slug].updateMany({
    where: { id: owned.item.id, status: "PENDING" },
    data: { status: "DRAFT" },
  });
  if (count > 0) {
    await prisma.auditLog.create({
      data: {
        actorId: owned.user.id,
        action: `${owned.slug}.withdrawn`,
        targetType: owned.slug,
        targetId: owned.item.id,
      },
    });
  }
  revalidatePath("/submissions");
  revalidatePath("/review");
  redirect(`/submissions/${owned.slug}/${owned.item.id}`);
}

export async function deleteSubmission(formData: FormData) {
  const owned = await ownedItem(String(formData.get("slug")), String(formData.get("id")));
  if (!owned || !editableStatuses.has(owned.item.status)) return;
  await delegates[owned.slug].delete({ where: { id: owned.item.id } });
  await prisma.auditLog.create({
    data: {
      actorId: owned.user.id,
      action: `${owned.slug}.deleted`,
      targetType: owned.slug,
      targetId: owned.item.id,
    },
  });
  revalidatePath("/submissions");
  redirect("/submissions?deleted=1");
}
