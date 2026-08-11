import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

test.describe("Membership Plans Interface", () => {
  test("should display subscription plans to a guest user", async ({ page }) => {
    await page.goto("/membership", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toContainText(/Matchmaking Membership/i, { timeout: 30000 });
    // Check that we see multiple cards
    const planCards = page.locator("h3:has-text('Plan'), h3:has-text('Concierge'), h3:has-text('Standard')");
    await expect(planCards.first()).toBeVisible({ timeout: 30000 });
  });

  test("should display membership plans with payment details to logged in user", async ({ page }) => {
    await loginAs(page, "user@instantmatrimony.com", "User@123");
    await page.goto("/membership", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toContainText(/Matchmaking Membership/i, { timeout: 30000 });
    
    // Check that payment details are visible in payment section
    await expect(page.locator("#payment-section").getByText("9000906292").first()).toBeVisible({ timeout: 30000 });
  });
});
