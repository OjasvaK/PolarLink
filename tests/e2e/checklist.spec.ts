import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// Design checklist (spec section 9), checked on every public page and the
// signed-in tools, at desktop and mobile width (see playwright.config.ts).

const publicPages = ["/", "/archive", "/archive?type=media", "/stations", "/timeline", "/about", "/privacy", "/terms", "/signin"];
const toolPages = ["/dashboard", "/submissions", "/submissions/new/dataset", "/review", "/generator", "/admin/researchers"];

async function audit(page: Page) {
  return page.evaluate(() => {
    const problems: string[] = [];
    const text = document.body.innerText;

    if (/[–—]/.test(text)) problems.push("en or em dash in visible text");
    if (/\w\.\.\.(\s|$)/.test(text)) problems.push("three dots instead of an ellipsis character");
    if (document.documentElement.scrollWidth > window.innerWidth + 1) problems.push("horizontal overflow");

    document.querySelectorAll("img").forEach((img) => {
      if (!img.hasAttribute("alt")) problems.push(`img without alt: ${img.src}`);
      if (!img.getAttribute("width") && !img.style.position && getComputedStyle(img).position !== "absolute") {
        problems.push(`img without explicit size: ${img.src}`);
      }
    });

    document.querySelectorAll("input:not([type=hidden]), select, textarea").forEach((el) => {
      const labelled =
        el.getAttribute("aria-label") ||
        el.getAttribute("aria-labelledby") ||
        (el.id && document.querySelector(`label[for="${el.id}"]`)) ||
        el.closest("label") ||
        el.getAttribute("aria-hidden") === "true";
      if (!labelled) problems.push(`unlabelled form control: ${el.outerHTML.slice(0, 80)}`);
    });

    document.querySelectorAll("button, a[href]").forEach((el) => {
      const name = (el.textContent ?? "").trim() || el.getAttribute("aria-label") || el.getAttribute("title");
      if (!name && !el.querySelector("img[alt]:not([alt=''])")) problems.push(`control without a name: ${el.outerHTML.slice(0, 80)}`);
    });

    if (document.querySelector("[onclick]")) problems.push("inline onclick handler");
    return problems;
  });
}

test("public pages pass the design checklist", async ({ page }) => {
  for (const path of publicPages) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    expect(await audit(page), path).toEqual([]);
  }
});

test("signed-in tools pass the design checklist", async ({ as }) => {
  const admin = await as("admin");
  for (const path of toolPages) {
    await admin.goto(path);
    await admin.waitForLoadState("networkidle");
    expect(await audit(admin), path).toEqual([]);
  }
});

test("keyboard focus is always visible", async ({ page }) => {
  await page.goto("/archive");
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    const visible = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return true;
      const style = getComputedStyle(el);
      const outline = style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0;
      const ring = style.boxShadow && style.boxShadow !== "none";
      const underline = style.textDecorationLine.includes("underline");
      return outline || ring || underline;
    });
    expect(visible, `focus indicator on tab stop ${i + 1}`).toBeTruthy();
  }
});

test("reduced motion turns scroll animations off", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(`${baseURL}/`);
  const transforms = await page.locator(".reveal-inner").evaluateAll((els) =>
    els.map((el) => getComputedStyle(el).transform)
  );
  expect(transforms.length).toBeGreaterThan(0);
  expect(transforms.every((t) => t === "none")).toBeTruthy();
  const stationOpacity = await page.locator(".map-station").first().evaluate((el) => getComputedStyle(el).opacity);
  expect(stationOpacity).toBe("1");
  await context.close();
});

test("dark mode applies a dark color scheme", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  await page.goto(`${baseURL}/archive`);
  const { scheme, background } = await page.evaluate(() => ({
    scheme: getComputedStyle(document.documentElement).colorScheme,
    background: getComputedStyle(document.body).backgroundColor,
  }));
  expect(scheme).toContain("dark");
  const [r, g, b] = background.match(/[\d.]+/g)!.map(Number);
  expect(r + g + b).toBeLessThan(150);
  await context.close();
});

test("empty states are designed, not blank", async ({ page }) => {
  await page.goto("/archive?q=no-such-record-anywhere");
  await expect(page.getByText("Nothing matches those filters. Try removing one.")).toBeVisible();
});
