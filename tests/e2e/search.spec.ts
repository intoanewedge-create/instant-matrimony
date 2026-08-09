import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

test.describe("Advanced Match Search", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "premium-gold@instantmatrimony.com", "User@123");
    await page.goto("/search");
    await expect(page.locator("h1")).toContainText(/Search/i);
  });

  test("should search profiles by city filter successfully", async ({ page }) => {
    // Fill search criteria
    await page.fill("input[placeholder='e.g. Mumbai']", "Mumbai");
    
    // Apply filters
    await page.click('button:has-text("Apply Filters")');
    
    // Check that search results container or matching cards are displayed
    // (the seed file populates Mumbai profiles, so we expect some results)
    await page.waitForTimeout(1000); // Wait for API response
    const profileCards = page.locator(".profile-card, :has-text('Mumbai')");
    await expect(profileCards.first()).toBeVisible();
  });
});
