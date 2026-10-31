import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate to the blogs page from the navbar", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("banner")
      .getByRole("link", { name: "Blogs", exact: true })
      .click();
    await expect(page).toHaveURL(/\/blogs$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "My Blogs",
    );
  });

  test("should navigate to the projects page from the navbar", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("banner")
      .getByRole("link", { name: "Projects", exact: true })
      .click();
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Projects",
    );
  });

  test("should open a blog post from the blogs page", async ({ page }) => {
    await page.goto("/blogs");
    await page.locator('a[href^="/blogs/"]').first().click();
    await expect(page).toHaveURL(/\/blogs\/.+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should show a 404 page for unknown routes", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("link", { name: /back home/i })).toBeVisible();
  });
});
