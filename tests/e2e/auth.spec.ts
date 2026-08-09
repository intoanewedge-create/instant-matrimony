import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

test.describe("Authentication Flows", () => {
  test("should authenticate standard user successfully", async ({ page }) => {
    await loginAs(page, "user@instantmatrimony.com", "User@123");
  });

  test("should reject login with invalid password and display error message", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", "user@instantmatrimony.com");
    await page.fill("#password", "WrongPassword123");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=Invalid email or password")).toBeVisible();
  });

  test("should enforce weak password and reject registration", async ({ page }) => {
    await page.goto("/register");
    await page.fill("#name", "Test User Registration");
    await page.fill("#email", "newuser@example.com");
    await page.fill("#password", "123"); // Weak password
    await page.fill("#confirmPassword", "123");
    await page.click('button[type="submit"]');
    // Error validation message should appear (either next to field or general)
    const errText = page.locator("text=Password must be at least");
    await expect(errText.first()).toBeVisible();
  });

  test("should reject duplicate email registration", async ({ page }) => {
    await page.goto("/register");
    await page.fill("#name", "Duplicate User");
    await page.fill("#email", "user@instantmatrimony.com"); // Already exists
    await page.fill("#password", "User@123");
    await page.fill("#confirmPassword", "User@123");
    await page.check("#acceptTerms");
    await page.click('button[type="submit"]');
    
    // Check if error box or validation appears
    await expect(page.locator("text=Email already registered").or(page.locator("text=already exists"))).toBeVisible();
  });

  test("should sign out successfully", async ({ page }) => {
    await loginAs(page, "user@instantmatrimony.com", "User@123");
    const logoutBtn = page.locator('button[title="Logout"]');
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
    } else {
      await page.click("text=Sign Out", { timeout: 10000 }).catch(async () => {
        // If button has a different locator like an avatar dropdown
        await page.click("button[aria-haspopup='menu']");
        await page.click("text=Logout");
      });
    }
    await page.waitForURL("**/login");
    await expect(page).toHaveURL(/.*login/);
  });
});
