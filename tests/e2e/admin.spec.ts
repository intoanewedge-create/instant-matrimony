import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

test.describe("Admin Console Operations", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin@instantmatrimony.com", "Admin@123");
  });

  test("should load the admin workspace with dashboard metrics", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toContainText(/Admin/i, { timeout: 30000 });
    // Check that admin-only links are visible
    await expect(page.locator("a[href='/admin/audit-logs']").first()).toBeVisible({ timeout: 30000 });
  });

  test("should access and list profiles management table", async ({ page }) => {
    await page.goto("/admin/profiles", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toContainText(/Profile/i, { timeout: 30000 });
  });

  test("should access and read system audit logs", async ({ page }) => {
    await page.goto("/admin/audit-logs", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toContainText(/Audit/i, { timeout: 30000 });
  });

  test("should access and read system health dashboard", async ({ page }) => {
    await page.goto("/admin/system-health", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toContainText(/Health/i, { timeout: 30000 });
  });
});
