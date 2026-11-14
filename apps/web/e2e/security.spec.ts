import { expect, test } from "@playwright/test";

for (const path of [
  "/",
  "/blogs",
  "/projects",
  "/blogs/ecs-sqs-autoscaling",
  "/nope",
]) {
  test(`${path} loads without CSP violations or errors`, async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" && !/status of 404/.test(message.text())) {
        problems.push(message.text());
      }
    });
    page.on("pageerror", (error) => problems.push(error.message));

    const response = await page.goto(path);
    await page.waitForLoadState("networkidle");

    expect(response?.headers()["content-security-policy"]).toContain(
      "frame-ancestors 'none'",
    );
    expect(problems).toEqual([]);
  });
}

test("pages carry a hash-based script policy", async ({ page }) => {
  await page.goto("/");
  const policy = await page
    .locator('meta[http-equiv="Content-Security-Policy"]')
    .getAttribute("content");
  expect(policy).toMatch(
    /^script-src 'self' https:\/\/challenges\.cloudflare\.com( 'sha256-[^']+')+$/,
  );
  expect(policy).not.toContain("unsafe-inline");
});
