import { expect, test } from "@playwright/test";

test("navigates from home to the blog and a post", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Writing" })
    .click();
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Notes & guides.",
  );

  await page.getByRole("link", { name: /Autoscaling ECS workloads/ }).click();
  await expect(page).toHaveURL(/\/blogs\/ecs-sqs-autoscaling$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /Autoscaling ECS workloads/,
  );
  await expect(page.locator(".shiki").first()).toBeVisible();
});

test("navigates to projects", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Projects" })
    .click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole("article")).toHaveCount(3);
});

test("post pages load directly, with a table of contents", async ({ page }) => {
  await page.goto("/blogs/image-optimization-pipeline");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Image Optimisation Pipeline",
  );
  await expect(
    page.getByRole("navigation", { name: "Table of contents" }).first(),
  ).toBeAttached();
});

test("trailing slashes redirect to the canonical URL", async ({ page }) => {
  await page.goto("/blogs/");
  await expect(page).toHaveURL(/\/blogs$/);
});

test("unknown paths get a 404 page", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("link", { name: "Back home" })).toBeVisible();
});

test("theme toggle switches and remembers the theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).not.toHaveClass(/dark/);

  // system -> light -> dark
  await page.getByRole("button", { name: /^Theme:/ }).click();
  await page.getByRole("button", { name: /^Theme:/ }).click();
  await expect(html).toHaveClass(/dark/);

  await page.reload();
  await expect(html).toHaveClass(/dark/);
});
