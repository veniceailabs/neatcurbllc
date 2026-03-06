import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD;

test.describe("authenticated admin routes", () => {
  test.skip(
    !ADMIN_EMAIL || !ADMIN_PASSWORD,
    "Set PLAYWRIGHT_ADMIN_EMAIL and PLAYWRIGHT_ADMIN_PASSWORD."
  );

  test("admin dashboard and core routes stay accessible", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL || "");
    await page.getByLabel(/password/i).fill(ADMIN_PASSWORD || "");
    await page.getByRole("button", { name: /sign in/i }).click();

    await page.waitForURL(/\/admin(?:\?.*)?$/i, { timeout: 20_000 });
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
});
