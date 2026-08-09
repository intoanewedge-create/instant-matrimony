import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

test.describe("Membership Plans Interface", () => {
  test("should display subscription plans to a guest user", async ({ page }) => {
    await page.goto("/membership");
    await expect(page.locator("h1")).toContainText(/Matchmaking Membership/i);
    // Check that we see multiple cards
    const planCards = page.locator("h3:has-text('Plan'), h3:has-text('Concierge'), h3:has-text('Standard')");
    await expect(planCards.first()).toBeVisible();
  });

  test("should display membership plans with billing details to logged in user", async ({ page }) => {
    await loginAs(page, "user@instantmatrimony.com", "User@123");
    await page.goto("/membership");
    await expect(page.locator("h1")).toContainText(/Matchmaking Membership/i);
    
    // Check that billing options are visible
    await expect(page.locator("text=UPI / QR Code Payment")).toBeVisible();
  });
});
