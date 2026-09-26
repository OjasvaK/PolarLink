import { config } from "dotenv";
import pg from "pg";

// Test database access, always the local Docker database from .env.local.
config({ path: [".env.local", ".env"], quiet: true });

export function testDatabaseUrl() {
  const url = process.env.DATABASE_URL ?? "";
  if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url)) {
    throw new Error("QA tests only run against the local database. Check .env.local.");
  }
  return url;
}

export async function withDb<T>(fn: (client: pg.Client) => Promise<T>) {
  const client = new pg.Client({ connectionString: testDatabaseUrl() });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

export const qaUsers = {
  public: { id: "qa-public", token: "qa-public-token", role: "PUBLIC", name: "QA Public" },
  researcher: { id: "qa-researcher", token: "qa-researcher-token", role: "RESEARCHER", name: "QA Researcher" },
  editor: { id: "qa-editor", token: "qa-editor-token", role: "EDITOR", name: "QA Editor" },
  admin: { id: "qa-admin", token: "qa-admin-token", role: "ADMIN", name: "QA Admin" },
} as const;

export type QaRole = keyof typeof qaUsers;

const ids = Object.values(qaUsers).map((u) => u.id);

// Removes everything the QA users created, then the users themselves.
export async function cleanup(client: pg.Client) {
  await client.query(`DELETE FROM "GeneratedContent" WHERE "generatedById" = ANY($1)`, [ids]);
  await client.query(`DELETE FROM "Review" WHERE "reviewerId" = ANY($1)`, [ids]);
  await client.query(`DELETE FROM "AuditLog" WHERE "actorId" = ANY($1)`, [ids]);
  for (const [table, owner] of [
    ["MediaAsset", "uploadedById"],
    ["Dataset", "submittedById"],
    ["Publication", "submittedById"],
    ["InstitutionalActivity", "submittedById"],
    ["Expedition", "submittedById"],
  ]) {
    await client.query(`DELETE FROM "${table}" WHERE "${owner}" = ANY($1)`, [ids]);
  }
  await client.query(`DELETE FROM "Session" WHERE "userId" = ANY($1)`, [ids]);
  await client.query(`DELETE FROM "User" WHERE id = ANY($1)`, [ids]);
}
