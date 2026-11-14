import { expect, test } from "@playwright/test";

test.describe("URL-backed search and filters", () => {
  test("blog tag filter is read from and written to the URL", async ({
    page,
  }) => {
    await page.goto("/blogs?tag=ECS");
    await expect(page.getByRole("button", { name: "ECS" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByText("1 post found")).toBeVisible();

    await page.getByRole("button", { name: "All" }).click();
    await expect(page).toHaveURL(/\/blogs$/);
    await expect(page.getByText("3 posts found")).toBeVisible();

    await page.getByRole("button", { name: "Lambda" }).click();
    await expect(page).toHaveURL(/\/blogs\?tag=Lambda$/);
  });

  test("project search survives a reload", async ({ page }) => {
    await page.goto("/projects");
    await page
      .getByRole("searchbox", { name: "Search projects" })
      .fill("gatsby");
    await expect(page).toHaveURL(/\/projects\?q=gatsby$/);
    await expect(page.getByText("1 project found")).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("searchbox", { name: "Search projects" }),
    ).toHaveValue("gatsby");
    await expect(page.getByText("1 project found")).toBeVisible();
  });

  test("featured project cards link to the project", async ({ page }) => {
    await page.goto("/");
    const projects = page.locator("#projects");
    await expect(
      projects.getByRole("link", { name: /^makemycareer/i }),
    ).toHaveAttribute("href", "https://makemycareer.rohinchopra.com");
    await expect(projects.getByRole("link", { name: /^code/i })).toHaveCount(3);
    await expect(
      projects.getByRole("link", { name: "View all projects →" }),
    ).toHaveCount(1);
  });
});
