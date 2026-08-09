import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

test.describe("Security and Role-Based Access Control", () => {
  test("should deny standard user access to admin dashboard and redirect to 403 error page", async ({ page }) => {
    await loginAs(page, "user@instantmatrimony.com", "User@123");
    
    // Attempt to access admin console
    await page.goto("/admin");
    
    // Should redirect to 403 page
    await page.waitForURL("**/error/403");
    await expect(page).toHaveURL(/.*error\/403/);
  });

  test("should deny standard user access to admin audit logs", async ({ page }) => {
    await loginAs(page, "user@instantmatrimony.com", "User@123");
    await page.goto("/admin/audit-logs");
    await page.waitForURL("**/error/403");
  });
});
