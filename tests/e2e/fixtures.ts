import { test as base, type Page } from "@playwright/test";
import { qaUsers, type QaRole } from "./db";

// `as(role)` opens a new page signed in as that role's QA user.
export const test = base.extend<{ as: (role: QaRole) => Promise<Page> }>({
  as: async ({ browser, baseURL }, provide) => {
    const contexts: Awaited<ReturnType<typeof browser.newContext>>[] = [];
    await provide(async (role) => {
      const context = await browser.newContext();
      contexts.push(context);
      await context.addCookies([{ name: "authjs.session-token", value: qaUsers[role].token, url: baseURL! }]);
      return context.newPage();
    });
    await Promise.all(contexts.map((c) => c.close()));
  },
});

export { expect } from "@playwright/test";
