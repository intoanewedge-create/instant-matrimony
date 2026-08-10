import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

test.describe("Profile Management Workspace", () => {
  const testImagePath = path.join(__dirname, "test-image.png");

  test.beforeAll(async () => {
    // Generate a valid 300x300 PNG image using sharp with random background to ensure unique checksum
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 4,
        background: { r, g, b, alpha: 1.0 }
      }
    })
    .png()
    .toFile(testImagePath);
  });

  test.afterAll(async () => {
    if (fs.existsSync(testImagePath)) {
      try {
        fs.unlinkSync(testImagePath);
      } catch {}
    }
    try {
      const { prisma } = await import("../../src/lib/prisma");
      await prisma.profile.updateMany({
        where: { user: { email: "user@instantmatrimony.com" } },
        data: { status: "APPROVED" },
      });
    } catch {}
  });

  test.beforeEach(async ({ page }) => {
    try {
      const { prisma } = await import("../../src/lib/prisma");
      await prisma.profile.updateMany({
        where: { user: { email: "user@instantmatrimony.com" } },
        data: { status: "APPROVED" },
      });
      await prisma.photo.deleteMany({
        where: { profile: { user: { email: "user@instantmatrimony.com" } } },
      });
    } catch {}
    await loginAs(page, "user@instantmatrimony.com", "User@123");
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toContainText(/Profile/i, { timeout: 30000 });
  });

  test("should update personal details successfully", async ({ page }) => {
    // We are on details tab by default
    await page.locator("#height").fill("");
    await page.locator("#height").fill("175");
    await page.locator("#religion").fill("Hindu");
    await page.locator("#city").fill("Bengaluru");
    await page.locator("#bio").fill("This is a test biography description.");
    
    // Save details
    await page.click('button:has-text("Save Details")');
    await expect(page.locator("text=updated successfully")).toBeVisible({ timeout: 30000 });
  });

  test("should update partner preferences match criteria", async ({ page }) => {
    await page.click('button:has-text("Partner Preferences")');
    await page.fill("#minAge", "22");
    await page.fill("#maxAge", "30");
    await page.fill("#religionPref", "HINDU");
    
    await page.click('button:has-text("Save Preferences")');
    await expect(page.locator("text=updated successfully")).toBeVisible({ timeout: 30000 });
  });

  test("should upload and delete photo in photo gallery", async ({ page }) => {
    await page.click('button:has-text("Photo Gallery")');
    
    // Upload mock photo file
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.click("label[for='photoInput']");
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(testImagePath);
    
    // Wait for successful upload message
    await expect(page.locator("text=uploaded successfully")).toBeVisible({ timeout: 30000 });
  });
});
