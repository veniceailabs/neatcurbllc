import { expect, test } from "@playwright/test";

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "desktop", width: 1440, height: 900 }
];

for (const viewport of viewports) {
  test.describe(`${viewport.name} layout`, () => {
    test.use({ viewport });

    test("home page stays readable", async ({ page }) => {
      await page.goto("/");
      await expect(
        page.getByRole("heading", { name: /WNY's Reliable Landscape/i })
      ).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      expect(overflow).toBeLessThanOrEqual(8);
    });

    test("request quote page stays readable", async ({ page }) => {
      await page.goto("/request-quote");
      await expect(
        page.getByRole("heading", { name: /Request a Quote/i })
      ).toBeVisible();
      await expect(page.getByLabel(/Service Needed/i)).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      expect(overflow).toBeLessThanOrEqual(8);
    });

    test("admin login page stays readable", async ({ page }) => {
      await page.goto("/admin/login");
      await expect(page.locator(".auth-title")).toContainText(/Sign in/i);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      expect(overflow).toBeLessThanOrEqual(8);
    });
  });
}
