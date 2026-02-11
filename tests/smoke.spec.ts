import { expect, test } from "@playwright/test";

test("landing page renders trust markers", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /BBB Accreditation & Reviews/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Our Services/i })).toBeVisible();
});

test("admin login screen is reachable", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.locator(".auth-title")).toContainText(/Sign in/i);
});

test("request quote form is reachable", async ({ page }) => {
  await page.goto("/request-quote");
  await expect(page.getByRole("heading", { name: /Request a Quote/i })).toBeVisible();
  await expect(page.getByLabel(/Service Needed/i)).toBeVisible();
});
