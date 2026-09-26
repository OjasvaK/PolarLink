import { expect, test } from "./fixtures";

// The full role workflow (spec sections 4, 8.2, 8.4, 8.5, 8.6), run in order:
// request access -> admin approval -> submit -> changes requested ->
// resubmit -> approve -> public archive -> Content Generator.
test.describe.configure({ mode: "serial" });

const longTitle =
  "QA expedition with a deliberately long title to check that very long names wrap and truncate cleanly across tables, cards and headings without breaking layouts in the archive or dashboards 2025";

test("a public user requests researcher access and an admin approves it", async ({ as }) => {
  const user = await as("public");
  await user.goto("/dashboard");
  await user.getByRole("button", { name: "Submit Request" }).click();
  await expect(user.getByText("Enter your institution or organisation.")).toBeVisible();
  // The first invalid field receives focus.
  await expect(user.getByLabel("Institutional Affiliation")).toBeFocused();

  await user.getByLabel("Institutional Affiliation").fill("QA Institute");
  await user.getByLabel(/Why do you need researcher access/).fill("Testing the researcher access request flow end to end.");
  await user.getByRole("button", { name: "Submit Request" }).click();
  await expect(user.getByText("Your request is awaiting review")).toBeVisible();

  const admin = await as("admin");
  await admin.goto("/admin/researchers");
  const card = admin.locator("li", { hasText: "QA Public" });
  await expect(card).toContainText("QA Institute");
  await card.getByRole("button", { name: "Approve" }).click();
  await expect(admin.locator("li", { hasText: "QA Public" })).toHaveCount(0);

  await user.goto("/dashboard");
  await expect(user.getByText("Researcher", { exact: true })).toBeVisible();
  await expect(user.getByRole("link", { name: "My Submissions" }).first()).toBeVisible();
});

test("a researcher submits an expedition and an editor requests changes", async ({ as }) => {
  const researcher = await as("researcher");
  await researcher.goto("/submissions/new/expedition");
  await researcher.getByRole("button", { name: "Submit for Review" }).click();
  await expect(researcher.getByText("Some fields need attention.")).toBeVisible();
  await expect(researcher.getByLabel("Expedition Name")).toBeFocused();

  await researcher.getByLabel("Expedition Name").fill(longTitle);
  await researcher.getByLabel("Program").selectOption("ARCTIC");
  await researcher.getByLabel("Station").fill("Himadri");
  await researcher.getByLabel("Start Date").fill("2025-06-01");
  await researcher.getByLabel(/End date/i).fill("2025-07-15");
  await researcher.getByLabel("Summary").fill("QA summary. Sampling in Kongsfjorden. Aerosol measurements.");
  await researcher.getByRole("button", { name: "Submit for Review" }).click();
  await expect(researcher).toHaveURL(/\/submissions\?submitted=1/);
  await expect(researcher.getByRole("row", { name: /QA expedition/ })).toContainText("Pending review");

  const editor = await as("editor");
  await editor.goto("/review");
  await editor.getByRole("link", { name: /QA expedition/ }).click();
  await editor.getByRole("button", { name: "Request Changes" }).click();
  await expect(editor.getByText("Explain what needs to change")).toBeVisible();
  await editor.getByLabel(/Comment/).fill("Please add the report PDF.");
  await editor.getByRole("button", { name: "Request Changes" }).click();
  await expect(editor).toHaveURL(/done=changes_requested/);
});

test("the researcher resubmits and the editor approves and publishes", async ({ as }) => {
  const researcher = await as("researcher");
  await researcher.goto("/submissions");
  await researcher.getByRole("link", { name: /QA expedition/ }).click();
  await expect(researcher.getByText("Please add the report PDF.")).toBeVisible();
  await researcher.getByLabel(/Report PDF/i).fill("https://example.org/qa-report.pdf");
  await researcher.getByRole("button", { name: "Submit for Review" }).click();
  await expect(researcher).toHaveURL(/submitted=1/);

  const editor = await as("editor");
  await editor.goto("/review");
  await editor.getByRole("link", { name: /QA expedition/ }).click();
  await editor.getByRole("button", { name: "Approve and Publish" }).click();
  await expect(editor).toHaveURL(/done=approved/);

  const visitor = editor; // approved content is public
  await visitor.goto("/archive?q=QA%20expedition");
  await visitor.getByRole("link", { name: /QA expedition/ }).click();
  await expect(visitor.getByRole("heading", { level: 1 })).toContainText("QA expedition");
  const overflow = await visitor.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("an editor generates, edits and publishes content with a share image", async ({ as }) => {
  const editor = await as("editor");
  await editor.goto("/generator");
  await editor.getByRole("link", { name: /QA expedition/ }).click();
  await editor.getByRole("button", { name: "Generate Drafts" }).click();
  await expect(editor.getByText("Draft: review before publishing")).toHaveCount(2);

  const blurb = editor.locator("form", { hasText: "Website Blurb" });
  await expect(blurb.getByRole("textbox")).toHaveValue(/Arctic research program, based at Himadri/);
  await blurb.getByRole("button", { name: "Publish" }).click();
  await expect(blurb.getByText("Published.")).toBeVisible();

  const caption = await editor.locator("form", { hasText: "Social Caption" }).getByRole("textbox").inputValue();
  expect(caption.replace(/https?:\/\/\S+/g, "x".repeat(23)).length).toBeLessThanOrEqual(280);

  const image = await editor.request.get(await editor.locator("img[alt^='Share card']").getAttribute("src") ?? "");
  expect(image.headers()["content-type"]).toBe("image/png");
});

test("each role is limited to its own tools", async ({ as }) => {
  const researcher = await as("researcher");
  for (const path of ["/review", "/generator", "/admin/researchers", "/submissions/new/activity"]) {
    await researcher.goto(path);
    await expect(researcher).toHaveURL(/\/dashboard\?denied=1/);
  }

  const editor = await as("editor");
  await editor.goto("/admin/researchers");
  await expect(editor).toHaveURL(/\/dashboard\?denied=1/);

  // Editors can't review their own submissions.
  await editor.goto("/submissions/new/activity");
  await editor.getByLabel("Title").fill("QA activity by an editor");
  await editor.getByLabel("Date").fill("2025-05-05");
  await editor.getByLabel("Description").fill("An institutional activity submitted by the QA editor.");
  await editor.getByRole("button", { name: "Submit for Review" }).click();
  await editor.goto("/review");
  await editor.getByRole("link", { name: "QA activity by an editor" }).click();
  await expect(editor.getByText("another editor needs to review it")).toBeVisible();
});
