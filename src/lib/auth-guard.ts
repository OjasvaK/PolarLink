import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/enums";

// The authoritative permission check (spec section 4). proxy.ts only does an
// optimistic cookie check; every protected page, server action and route
// handler must call one of these, which verify the session against the
// database.

const rank: Record<Role, number> = {
  PUBLIC: 0,
  RESEARCHER: 1,
  EDITOR: 2,
  ADMIN: 3,
};

export function hasRole(role: Role, minimum: Role) {
  return rank[role] >= rank[minimum];
}

export async function requireUser(callbackUrl = "/dashboard") {
  const session = await auth();
  if (!session?.user) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session.user;
}

export async function requireRole(minimum: Role, callbackUrl?: string) {
  const user = await requireUser(callbackUrl);
  if (!hasRole(user.role, minimum)) {
    redirect("/dashboard?denied=1");
  }
  return user;
}
