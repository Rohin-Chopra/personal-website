import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate to different sections", async ({ page }) => {
    await page.goto("/");

    // Test navigation to different sections
    await page.getByRole("link", { name: /skills/i }).click();
    await expect(page.locator("#skills")).toBeVisible();

    await page.getByRole("link", { name: /projects/i }).click();
    await expect(page.locator("#projects")).toBeVisible();

    await page.getByRole("link", { name: /blogs/i }).click();
    await expect(page.locator("#blogs")).toBeVisible();

    await page.getByRole("link", { name: /contact/i }).click();
    await expect(page.locator("#contact")).toBeVisible();
  });

  test("should navigate to blogs page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /blogs/i }).click();
    await expect(page).toHaveURL(/.*blogs/);
  });

  test("should navigate to projects page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /projects/i }).click();
    await expect(page).toHaveURL(/.*projects/);
  });
});

