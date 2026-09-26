// One-off helper for build plan step 2 (spec section 12): screenshot each
// landing-page direction mockup in light and dark mode for side-by-side
// comparison. Requires the dev server running at http://localhost:3000.
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const outDir = process.argv[2] ?? "screenshots";
const mockups = ["mockup-1", "mockup-2", "mockup-3", "mockup-4"];
const themes = ["light", "dark"];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
for (const mockup of mockups) {
  for (const theme of themes) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1024 },
      colorScheme: theme,
    });
    await page.goto(`http://localhost:3000/preview/${mockup}`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(400); // let entrance/reveal animations settle
    await page.screenshot({
      path: `${outDir}/${mockup}-${theme}.png`,
      fullPage: true,
    });
    await page.close();
    console.log(`captured ${mockup} (${theme})`);
  }
}
await browser.close();
