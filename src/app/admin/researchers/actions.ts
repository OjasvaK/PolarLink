"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

async function decide(userId: string, decision: "approve" | "reject") {
  const admin = await requireRole("ADMIN", "/admin/researchers");

  // Only act on a request that is still pending, so a double click or a stale
  // tab can't re-approve or overwrite a decision already made.
  const { count } = await prisma.user.updateMany({
    where: { id: userId, researcherStatus: "PENDING", role: "PUBLIC" },
    data:
      decision === "approve"
        ? { researcherStatus: "APPROVED", role: "RESEARCHER" }
        : { researcherStatus: "REJECTED" },
  });

  if (count > 0) {
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: decision === "approve" ? "researcher_access.approved" : "researcher_access.rejected",
        targetType: "User",
        targetId: userId,
      },
    });
  }

  revalidatePath("/admin/researchers");
}

export async function approveResearcher(formData: FormData) {
  const userId = formData.get("userId");
  if (typeof userId === "string") await decide(userId, "approve");
}

export async function rejectResearcher(formData: FormData) {
  const userId = formData.get("userId");
  if (typeof userId === "string") await decide(userId, "reject");
}
