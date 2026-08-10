import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";

test.describe("Conversations and Instant Messaging", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "user@instantmatrimony.com", "User@123");
    await page.goto("/messages", { waitUntil: "domcontentloaded" });
  });

  test("should load the conversations index page", async ({ page }) => {
    await expect(page.locator("h2")).toContainText(/Conversations/i);
  });

  test("should interact with active chat room or show empty state", async ({ page }) => {
    const noChats = page.locator("text=No active conversations found");
    const firstChatLink = page.locator("a[href^='/messages/']");
    
    if (await firstChatLink.count() > 0) {
      // Click on the first chat room
      await firstChatLink.first().click();
      
      // Wait for Chat Room client to render
      await expect(page.locator("input[placeholder='Type message...']")).toBeVisible();
      
      // Type and send message
      await page.fill("input[placeholder='Type message...']", "Hello from automated Playwright test!");
      await page.click('button[type="submit"]');
      
      // Verify message is sent and visible in the feed
      await expect(page.locator("text=Hello from automated Playwright").first()).toBeVisible();
    } else {
      await expect(noChats).toBeVisible();
    }
  });
});
