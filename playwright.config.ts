import { defineConfig, devices } from "@playwright/test";

const localPort = process.env.PLAYWRIGHT_PORT || "3100";
const localBase = `http://localhost:${localPort}`;
const baseURL = process.env.PLAYWRIGHT_BASE_URL || localBase;

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `npm run dev -- --port ${localPort}`,
        url: localBase,
        reuseExistingServer: true,
        timeout: 120_000
      }
});
