"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

export type RequestAccessState = {
  errors?: Partial<Record<"name" | "affiliation" | "reason" | "form", string>>;
  ok?: boolean;
};

function field(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function requestResearcherAccess(
  _prev: RequestAccessState,
  formData: FormData
): Promise<RequestAccessState> {
  const user = await requireUser();

  const name = field(formData, "name");
  const affiliation = field(formData, "affiliation");
  const reason = field(formData, "reason");

  const errors: RequestAccessState["errors"] = {};
  if (name.length < 2 || name.length > 120) errors.name = "Enter your full name.";
  if (affiliation.length < 2 || affiliation.length > 200) {
    errors.affiliation = "Enter your institution or organisation.";
  }
  if (reason.length < 20 || reason.length > 2000) {
    errors.reason = "Tell us a little more (at least 20 characters).";
  }
  if (Object.keys(errors).length > 0) return { errors };

  // Re-read from the database rather than trusting the session snapshot.
  const current = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, researcherStatus: true },
  });
  if (
    !current ||
    current.role !== "PUBLIC" ||
    current.researcherStatus === "PENDING" ||
    current.researcherStatus === "APPROVED"
  ) {
    return { errors: { form: "You can’t submit a new request right now." } };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        affiliation,
        researcherRequestReason: reason,
        researcherRequestedAt: new Date(),
        researcherStatus: "PENDING",
      },
    }),
    prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "researcher_access.requested",
        targetType: "User",
        targetId: user.id,
      },
    }),
  ]);

  revalidatePath("/dashboard");
  return { ok: true };
}
