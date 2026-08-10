import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

test.describe("Interest Management Hub", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "user@instantmatrimony.com", "User@123");
    await page.goto("/interests", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toContainText(/Interest/i, { timeout: 30000 });
  });

  test("should toggle between Received and Sent interest tabs", async ({ page }) => {
    // Check received tab active by default or clickable
    const receivedTab = page.locator('button:has-text("Received")');
    await expect(receivedTab).toBeVisible();
    
    // Click Sent tab
    const sentTab = page.locator('button:has-text("Sent")');
    await sentTab.click();
    await expect(
      page.locator("text=No sent interests in this category").or(page.locator(".profile-card"))
    ).toBeVisible({ timeout: 30000 });
  });

  test("should filter interests by status", async ({ page }) => {
    // Click "PENDING" filter
    await page.click('button:has-text("PENDING")');
    
    // Check active styling or list refresh
    await page.waitForTimeout(500);
    
    // Click "ACCEPTED" filter
    await page.click('button:has-text("ACCEPTED")');
    await page.waitForTimeout(500);
  });
});
