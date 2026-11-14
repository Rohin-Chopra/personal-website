import { expect, test } from "@playwright/test";

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
  await expect(page.getByText("2 posts found")).toBeVisible();
});

test("project search survives a reload", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("searchbox", { name: "Search projects" }).fill("astro");
  await expect(page).toHaveURL(/\/projects\?q=astro$/);
  await expect(page.getByText("1 project found")).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("searchbox", { name: "Search projects" }),
  ).toHaveValue("astro");
  await expect(page.getByText("1 project found")).toBeVisible();
});

test("featured projects link to the live sites", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /^MakeMyCareer/ }),
  ).toHaveAttribute("href", "https://makemycareer.rohinchopra.com");
  await expect(page.getByRole("link", { name: /^Digishelf/ })).toHaveAttribute(
    "href",
    "https://digishelf.rohinchopra.com",
  );
});
