import { Page, expect } from "@playwright/test";

export async function loginAs(page: Page, email: string, password = "User@123") {
  // If we are already on the dashboard, we are good
  if (page.url().includes("/dashboard")) {
    return;
  }

  await page.goto("/login");
  
  // Wait for either the email input (logged out state) or the Go to Dashboard button (logged in state)
  const emailInput = page.locator("#email");
  const goBtn = page.locator('a:has-text("Go to Dashboard"), button:has-text("Go to Dashboard")').first();
  
  await Promise.race([
    emailInput.waitFor({ state: "visible", timeout: 5000 }).catch(() => {}),
    goBtn.waitFor({ state: "visible", timeout: 5000 }).catch(() => {})
  ]);

  // Check if we are already logged in
  if (page.url().includes("/dashboard")) {
    return;
  }

  if (await goBtn.isVisible()) {
    await goBtn.click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    return;
  }

  // Perform normal login if not logged in
  await emailInput.click();
  await emailInput.fill(email);
  await page.locator("#password").click();
  await page.locator("#password").fill(password);
  
  // Verify that the inputs contain the correct values to guard against hydration resets
  await expect(emailInput).toHaveValue(email);
  await expect(page.locator("#password")).toHaveValue(password);

  await page.click('button[type="submit"]');
  
  // Ensure we transition to the dashboard
  try {
    await page.waitForURL("**/dashboard", { timeout: 10000 });
  } catch (err) {
    await page.goto("/dashboard");
    await page.waitForURL("**/dashboard", { timeout: 10000 });
  }
}
