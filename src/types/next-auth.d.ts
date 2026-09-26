import type { DefaultSession } from "next-auth";
import type { ResearcherStatus, Role } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      researcherStatus: ResearcherStatus;
    } & DefaultSession["user"];
  }
}
