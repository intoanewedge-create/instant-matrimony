import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

test.describe("Manual Payment Processing", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "user@instantmatrimony.com", "User@123");
    await page.goto("/membership", { waitUntil: "domcontentloaded" });
  });

  test("should successfully submit a payment verification request", async ({ page }) => {
    // Select the first plan card if not already selected
    const planCards = page.locator(".cursor-pointer");
    await planCards.first().click();

    // Verify payment number is displayed in the payment section
    await expect(page.locator("#payment-section").getByText("8885678080").first()).toBeVisible({ timeout: 10000 });

    // Submit payment
    await page.click('button:has-text("Submit Payment for Verification")');

    // Check for success screen
    await expect(page.locator("text=Payment Submitted for Admin Verification")).toBeVisible({ timeout: 10000 });
  });
});
