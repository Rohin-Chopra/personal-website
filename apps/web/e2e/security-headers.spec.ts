import { expect, test } from "@playwright/test";

test.describe("Content Security Policy", () => {
  for (const path of [
    "/",
    "/blogs",
    "/projects",
    "/blogs/ecs-sqs-autoscaling",
  ]) {
    test(`${path} loads without CSP violations`, async ({ page }) => {
      const violations: string[] = [];
      page.on("console", (message) => {
        if (/Content Security Policy/i.test(message.text())) {
          violations.push(message.text());
        }
      });

      const response = await page.goto(path);
      await page.waitForLoadState("networkidle");

      expect(response?.headers()["content-security-policy"]).toBeTruthy();
      expect(response?.headers()["x-xss-protection"]).toBeUndefined();
      expect(violations).toEqual([]);
    });
  }

  test("does not allow eval in production", async ({ page }) => {
    const response = await page.goto("/");
    const csp = response?.headers()["content-security-policy"] ?? "";
    test.skip(process.env.CI === undefined, "dev server allows eval");
    expect(csp).not.toContain("'unsafe-eval'");
  });
});
