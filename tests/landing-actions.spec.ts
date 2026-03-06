import { expect, test } from "@playwright/test";

test("landing logo and CTAs navigate correctly", async ({ page }) => {
  await page.goto("/services");

  await page.locator(".navbar-brand a").click();
  await page.waitForURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: /WNY's Reliable Landscape/i })
  ).toBeVisible();

  await page.locator(".hero-actions .btn-primary").click();
  await page.waitForURL(/\/request-quote(?:\?.*)?$/);
  await expect(
    page.getByRole("heading", { name: /Request a Quote/i })
  ).toBeVisible();

  await page.goto("/");
  await page.locator(".cta-banner .btn-primary").click();
  await page.waitForURL(/\/request-quote(?:\?.*)?$/);
});

test("address autocomplete accepts global queries", async ({ request }) => {
  const response = await request.get("/api/public/address-autocomplete", {
    params: { q: "Toronto Ontario" }
  });

  expect(response.ok()).toBeTruthy();

  const payload = (await response.json()) as {
    ok?: boolean;
    data?: { suggestions?: Array<{ label?: string }> };
  };

  expect(payload.ok).toBeTruthy();
  const labels = (payload.data?.suggestions || []).map((entry) =>
    String(entry.label || "").toLowerCase()
  );
  expect(labels.some((label) => label.includes("toronto"))).toBeTruthy();
});
