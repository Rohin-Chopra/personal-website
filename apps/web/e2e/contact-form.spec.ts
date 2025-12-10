import { test, expect } from "@playwright/test";

test.describe("Contact Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Scroll to contact section
    await page.locator("#contact").scrollIntoViewIfNeeded();
  });

  test("should display contact form", async ({ page }) => {
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Message")).toBeVisible();
    await expect(page.getByRole("button", { name: /let's talk/i })).toBeVisible();
  });

  test("should show validation errors for empty form", async ({ page }) => {
    await page.getByRole("button", { name: /let's talk/i }).click();
    
    // Wait for validation errors
    await expect(page.getByText(/please enter a name/i)).toBeVisible();
    await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
    await expect(page.getByText(/please enter a message/i)).toBeVisible();
  });

  test("should show validation error for invalid email", async ({ page }) => {
    await page.getByLabel("Name").fill("Test User");
    await page.getByLabel("Email").fill("invalid-email");
    await page.getByLabel("Message").fill("Test message");
    await page.getByRole("button", { name: /let's talk/i }).click();

    await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
  });

  test("should submit form with valid data", async ({ page }) => {
    // Mock the API response
    await page.route("**/contact", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ message: "Message sent" }),
      });
    });

    await page.getByLabel("Name").fill("Test User");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Message").fill("Test message");
    await page.getByRole("button", { name: /let's talk/i }).click();

    // Wait for success toast
    await expect(page.getByText(/message sent/i)).toBeVisible();
  });
});

