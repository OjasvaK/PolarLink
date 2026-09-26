import { defineConfig, devices } from "@playwright/test";

// End-to-end QA (build plan step 11). Runs against the local dev server and
// the local Docker database (docker-compose.yml + .env.local): global setup
// creates one signed-in test user per role and teardown removes everything
// they created. Never point this at the Supabase database.
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  use: {
    baseURL: process.env.QA_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /checklist\.spec\.ts/ },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000/signin",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
