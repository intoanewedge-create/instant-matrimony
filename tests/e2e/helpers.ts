import { Page, expect } from "@playwright/test";

export async function loginAs(page: Page, email: string, password = "User@123") {
  // Clear cookies to ensure completely isolated session for the requested user
  await page.context().clearCookies();
  
  await page.goto("/login");

  const emailInput = page.locator("#email");
  const submitBtn = page.locator('button[type="submit"]');

  await emailInput.waitFor({ state: "visible", timeout: 15000 });
  await submitBtn.waitFor({ state: "visible", timeout: 15000 });

  // Allow NextAuth CSRF token initialization to settle
  await page.waitForTimeout(1000);

  // Fill credentials
  await emailInput.click();
  await emailInput.fill(email);
  await page.locator("#password").click();
  await page.locator("#password").fill(password);

  await submitBtn.click();

  // Wait for transition to dashboard or admin
  try {
    await page.waitForURL(/.*(dashboard|admin).*/, { timeout: 30000 });
  } catch (_err) {
    if (await submitBtn.isVisible()) {
      await emailInput.fill(email);
      await page.locator("#password").fill(password);
      await submitBtn.click();
      await page.waitForURL(/.*(dashboard|admin).*/, { timeout: 30000 });
    }
  }

  // Strictly verify authentication success
  await expect(page).toHaveURL(/.*(dashboard|admin).*/, { timeout: 30000 });
}
