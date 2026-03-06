import { expect, test, type Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD;

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL || "");
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD || "");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/admin(?:\?.*)?$/i, { timeout: 20_000 });
}

test.describe("authenticated admin routes", () => {
  test.skip(
    !ADMIN_EMAIL || !ADMIN_PASSWORD,
    "Set PLAYWRIGHT_ADMIN_EMAIL and PLAYWRIGHT_ADMIN_PASSWORD."
  );

  test("admin dashboard and core routes stay accessible", async ({ page }) => {
    await login(page);
    await expect(page.locator(".kpi-grid")).toBeVisible();
    await expect(page.locator(".bizbox-grid")).toBeVisible();

    const adminRoutes = [
      "/admin/leads",
      "/admin/jobs",
      "/admin/clients",
      "/admin/work-orders",
      "/admin/messages",
      "/admin/settings",
      "/admin/business-os"
    ];

    for (const route of adminRoutes) {
      await page.goto(route);
      await page.waitForURL(new RegExp(`${route}(?:\\?.*)?$`), {
        timeout: 20_000
      });
      await expect(page.locator(".sidebar")).toBeVisible();
      await expect(page.locator(".panel").first()).toBeVisible();
    }
  });

  test("dashboard buttons and sidebar clicks work", async ({ page }) => {
    await login(page);

    await page
      .getByRole("link", { name: /open admin quote workflow/i })
      .click();
    await page.waitForURL(/\/admin\/lead-intake(?:\?.*)?$/i, { timeout: 20_000 });
    await expect(page.locator(".panel").first()).toBeVisible();

    await page.goto("/admin");
    await page
      .getByRole("link", { name: /open admin neatcurbos overview/i })
      .click();
    await page.waitForURL(/\/admin\/business-os(?:\?.*)?$/i, { timeout: 20_000 });
    await expect(page.locator(".panel").first()).toBeVisible();

    await page.goto("/admin");
    await page
      .getByRole("button", { name: /open admin business ai panel/i })
      .click();
    await expect(page.locator(".nexus-panel")).toBeVisible();

    await page.getByRole("link", { name: /^Leads$/i }).click();
    await page.waitForURL(/\/admin\/leads(?:\?.*)?$/i, { timeout: 20_000 });
    await expect(page.locator(".panel").first()).toBeVisible();

    await page.getByRole("link", { name: /^Clients$/i }).click();
    await page.waitForURL(/\/admin\/clients(?:\?.*)?$/i, { timeout: 20_000 });
    await expect(page.locator(".panel").first()).toBeVisible();

    await page.getByRole("link", { name: /^Dashboard$/i }).click();
    await page.waitForURL(/\/admin(?:\?.*)?$/i, { timeout: 20_000 });
    await expect(page.locator(".kpi-grid")).toBeVisible();
  });
});
