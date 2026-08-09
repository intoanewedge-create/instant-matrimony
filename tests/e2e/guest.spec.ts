import { test, expect } from "@playwright/test";

test.describe("Guest User Verification", () => {
  test("should load public landing page with logo and main heading", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/InstantMatrimony/i);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should load public about page", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("h1")).toContainText(/Mission|Story|About/i);
  });

  test("should load public contact page", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("h1")).toContainText(/Get In Touch|Contact/i);
  });

  test("should load public membership details page", async ({ page }) => {
    await page.goto("/membership");
    await expect(page.locator("h1")).toContainText(/Matchmaking Membership|Pricing/i);
  });

  test("should redirect guest trying to access dashboard to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login");
    await expect(page).toHaveURL(/.*login/);
  });

  test("should redirect guest trying to access profile to login", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForURL("**/login");
    await expect(page).toHaveURL(/.*login/);
  });

  test("should redirect guest trying to access messages to login", async ({ page }) => {
    await page.goto("/messages");
    await page.waitForURL("**/login");
    await expect(page).toHaveURL(/.*login/);
  });

  test("should redirect guest trying to access admin to login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL("**/login");
    await expect(page).toHaveURL(/.*login/);
  });
});
