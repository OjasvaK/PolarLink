import { expect, test } from "./fixtures";
import { withDb } from "./db";

// Public visitor flows (spec sections 4, 8.1, 8.3, 8.7, 8.8).

test("landing hero fills the first screen and stats match the database", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const heroBottom = await page.locator("section").first().evaluate((el) => el.getBoundingClientRect().bottom);
  expect(heroBottom).toBeGreaterThanOrEqual(page.viewportSize()!.height - 1);

  const counts = await withDb(async (db) => {
    const q = async (table: string) =>
      Number((await db.query(`SELECT count(*) FROM "${table}" WHERE status = 'PUBLISHED'`)).rows[0].count);
    return [await q("Expedition"), await q("Dataset"), await q("Publication"), await q("MediaAsset")];
  });
  const shown = await page.locator("section.border-y .tabular-nums").allTextContents();
  expect(shown.map(Number)).toEqual(counts);

  await page.getByRole("link", { name: "Explore the Archive" }).click();
  await expect(page).toHaveURL(/\/archive$/);
});

test("archive search and filters are reflected in the URL", async ({ page }) => {
  await page.goto("/archive");
  await page.getByLabel("Search").fill("Bharati");
  await page.getByLabel("Type").selectOption("dataset");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page).toHaveURL(/q=Bharati/);
  await expect(page).toHaveURL(/type=dataset/);
  await expect(page.getByText(/^\d+ results?$/)).toBeVisible();
  await expect(page.locator("main ul li").first()).toContainText(/Bharati/i);

  await page.goto("/archive?q=zzzz-no-such-thing");
  await expect(page.getByText("Nothing matches those filters")).toBeVisible();
});

test("archive detail pages render and missing items 404", async ({ page }) => {
  await page.goto("/archive?type=publication");
  await page.locator("main ul li a").first().click();
  await expect(page.getByRole("heading", { name: "Cite this publication" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Copy BibTeX/i })).toBeVisible();

  const response = await page.goto("/archive/expedition/does-not-exist");
  expect(response?.status()).toBe(404);
});

test("stations, timeline and static pages load", async ({ page }) => {
  for (const [path, heading] of [
    ["/stations", "Research Stations"],
    ["/timeline", "Program Timeline"],
    ["/about", "About This Project"],
    ["/privacy", "Privacy Policy"],
    ["/terms", "Terms of Service"],
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
  }
  await expect(page.getByText("Not an official website of NCPOR")).toBeVisible();
});

test("signed-out visitors are sent to sign in from protected pages", async ({ page }) => {
  for (const path of ["/dashboard", "/submissions", "/review", "/generator", "/admin/researchers"]) {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`/signin\\?callbackUrl=${encodeURIComponent(path).replace(/%2F/g, "%2F")}`));
  }
});

test("public API returns published content without personal data", async ({ request }) => {
  for (const collection of ["expeditions", "datasets", "publications", "media", "activities"]) {
    const response = await request.get(`/api/public/${collection}?pageSize=5`);
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).not.toMatch(/submittedBy|uploadedBy|reviewer|@qa\.local|email/i);
    expect(JSON.parse(body).items.length).toBeGreaterThan(0);
  }
  expect((await request.post("/api/public/datasets")).status()).toBe(405);
  expect((await request.get("/api/public/datasets?pageSize=500")).status()).toBe(400);

  const feed = await request.get("/api/public/feed.xml");
  expect(feed.headers()["content-type"]).toContain("application/rss+xml");
  expect(await feed.text()).toContain("<rss version=\"2.0\"");
});
