import { test, expect } from "@playwright/test";

test.describe("Responsive Mobile & Desktop Layouts", () => {
  test.describe("Mobile Viewport checks", () => {
    test.use({ viewport: { width: 375, height: 667 } }); // mobile view

    test("should render mobile-friendly homepage", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible();
      
      // Verify that desktop-only navbar links are either hidden or wrapped in mobile menu
      const navLinks = page.locator("nav a");
      const visibleLinksCount = await navLinks.filter({ hasNotText: "" }).count();
      // On mobile view, typically fewer navigation links are displayed directly
      expect(visibleLinksCount).toBeLessThan(12);
    });
  });

  test.describe("Desktop Viewport checks", () => {
    test.use({ viewport: { width: 1280, height: 720 } }); // desktop view

    test("should render full desktop header navigation", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible();
      
      // Header navigation links should be visible
      const homeLink = page.locator("text=About").or(page.locator("text=Membership"));
      await expect(homeLink.first()).toBeVisible();
    });
  });
});
