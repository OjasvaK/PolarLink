import { cleanup, qaUsers, withDb } from "./db";

export default async function globalSetup() {
  await withDb(async (client) => {
    await cleanup(client);
    for (const user of Object.values(qaUsers)) {
      await client.query(
        `INSERT INTO "User" (id, name, email, role, "researcherStatus")
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, user.name, `${user.id}@qa.local`, user.role, user.role === "PUBLIC" ? "NONE" : "APPROVED"]
      );
      await client.query(
        `INSERT INTO "Session" (id, "sessionToken", "userId", expires) VALUES ($1, $2, $3, now() + interval '1 day')`,
        [`${user.id}-session`, user.token, user.id]
      );
    }
  });
}
