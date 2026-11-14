import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/#contact");
});

test("shows validation errors for an empty form", async ({ page }) => {
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Please enter a name")).toBeVisible();
  await expect(page.getByText("Please enter a valid email")).toBeVisible();
  await expect(page.getByText("Please enter a message")).toBeVisible();
  await expect(page.getByLabel("Name")).toBeFocused();
});

test("submits to the contact API", async ({ page }) => {
  let body: unknown;
  await page.route("**/api/contact", async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"message":"Message sent"}',
    });
  });

  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill("Test@Example.com");
  await page.getByLabel("Message").fill("Hello there");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(
    page.getByText("Message sent. Thanks for reaching out!"),
  ).toBeVisible();
  await expect(page.getByLabel("Name")).toHaveValue("");
  expect(body).toMatchObject({
    name: "Test User",
    email: "test@example.com",
    message: "Hello there",
    website: "",
  });
});

test("explains API errors", async ({ page }) => {
  await page.route("**/api/contact", (route) =>
    route.fulfill({
      status: 429,
      contentType: "application/json",
      body: '{"message":"Too Many Requests"}',
    }),
  );

  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Message").fill("Hello there");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByText(/Too many requests/)).toBeVisible();
});
