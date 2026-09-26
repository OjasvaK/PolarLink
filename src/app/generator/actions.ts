"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { socialCaption, websiteBlurb } from "@/lib/generator/rule-based";
import { isGeneratorSourceType, loadGeneratorSource, siteOrigin } from "@/lib/generator/source";

export async function generateDrafts(formData: FormData) {
  const editor = await requireRole("EDITOR", "/generator");
  const type = String(formData.get("type"));
  const id = String(formData.get("id"));
  if (!isGeneratorSourceType(type)) return;

  const loaded = await loadGeneratorSource(type, id);
  if (!loaded) return;

  const path = `/archive/${type}/${id}`;
  const url = `${await siteOrigin()}${path}`;
  const drafts = [
    { kind: "WEBSITE_BLURB" as const, text: websiteBlurb(loaded.source) },
    { kind: "SOCIAL_CAPTION" as const, text: socialCaption(loaded.source, url) },
  ];

  // One rule-based row per source and kind: regenerating refreshes the draft
  // text, discards unpublished edits, and returns it to draft for review.
  for (const draft of drafts) {
    const where = { sourceType: type, sourceId: id, kind: draft.kind, method: "RULE_BASED" as const };
    const existing = await prisma.generatedContent.findFirst({ where, select: { id: true } });
    const data = {
      draftText: draft.text,
      editedText: null,
      status: "DRAFT" as const,
      shareImageUrl: `${path}/opengraph-image`,
      generatedById: editor.id,
      publishedById: null,
    };
    const row = existing
      ? await prisma.generatedContent.update({ where: { id: existing.id }, data })
      : await prisma.generatedContent.create({ data: { ...where, ...data } });
    await prisma.auditLog.create({
      data: { actorId: editor.id, action: "generated_content.generated", targetType: "GeneratedContent", targetId: row.id },
    });
  }

  revalidatePath("/generator");
  revalidatePath("/");
  redirect(`/generator/${type}/${id}`);
}

export type EditState = { error?: string; saved?: "saved" | "published" | "unpublished" };

export async function updateGenerated(
  contentId: string,
  _prev: EditState,
  formData: FormData
): Promise<EditState> {
  const editor = await requireRole("EDITOR", "/generator");
  const intent = formData.get("intent");
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { error: "The text can't be empty." };
  if (text.length > 5000) return { error: "Keep it under 5000 characters." };

  const row = await prisma.generatedContent.findUnique({ where: { id: contentId } });
  if (!row) return { error: "This draft no longer exists." };

  const editedText = text === row.draftText ? null : text;
  const status = intent === "publish" ? "PUBLISHED" : intent === "unpublish" ? "DRAFT" : row.status;
  await prisma.generatedContent.update({
    where: { id: contentId },
    data: {
      editedText,
      status,
      publishedById: status === "PUBLISHED" ? editor.id : null,
    },
  });
  await prisma.auditLog.create({
    data: {
      actorId: editor.id,
      action: `generated_content.${intent === "publish" ? "published" : intent === "unpublish" ? "unpublished" : "edited"}`,
      targetType: "GeneratedContent",
      targetId: contentId,
    },
  });

  revalidatePath(`/generator/${row.sourceType}/${row.sourceId}`);
  revalidatePath("/generator");
  revalidatePath("/");
  return { saved: intent === "publish" ? "published" : intent === "unpublish" ? "unpublished" : "saved" };
}
