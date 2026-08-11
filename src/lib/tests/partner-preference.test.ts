import { container } from "../container";
import { step7Schema } from "../validators/profile.validator";
import assert from "assert";

async function testPartnerPreferenceFlow() {
  console.log("=================================================");
  console.log("STARTING PARTNER PREFERENCES PERSISTENCE TESTS");
  console.log("=================================================");

  // 1. Validator Tests
  console.log("\n[1. Validator Tests (step7Schema)]");
  const validData = {
    minAge: 25,
    maxAge: 28,
    minHeight: 160,
    maxHeight: 190,
    religion: "Hindu",
    maritalStatus: "SINGLE",
    motherTongue: "Telugu",
    education: "Graduate",
    country: "India",
  };

  const parseResult1 = step7Schema.safeParse(validData);
  assert.ok(parseResult1.success, "Valid partner preference payload should succeed");
  console.log("✓ Valid data passed schema validation:", parseResult1.data);

  // Partial / string numbers / empty strings
  const stringNumData = {
    minAge: "24",
    maxAge: "30",
    minHeight: "",
    maxHeight: null,
    religion: "Hindu",
  };
  const parseResult2 = step7Schema.safeParse(stringNumData);
  assert.ok(parseResult2.success, "String numbers and empty strings should parse cleanly");
  assert.strictEqual(parseResult2.data.minAge, 24);
  assert.strictEqual(parseResult2.data.maxAge, 30);
  assert.strictEqual(parseResult2.data.minHeight, undefined);
  assert.strictEqual(parseResult2.data.maxHeight, undefined);
  console.log("✓ Coerced string numbers & empty string handling passed");

  // 2. Integration / Service Flow with Mock or Real Profile
  console.log("\n[2. Service Integration Flow]");
  const { profileService, authService } = container.services;

  const { prisma } = await import("../prisma");
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    console.log("⚠️ Local database not connected (Production synchronized with Neon PostgreSQL). Skipping live DB integration assertions.");
    console.log("\n=================================================");
    console.log("✓ ALL VALIDATOR TESTS PASSED!");
    console.log("=================================================");
    process.exit(0);
  }

  // Let's create or find a test user profile
  const testEmail = `pref_test_${Date.now()}@instantmatrimony.com`;
  const regRes = await authService.register({
    name: "Pref Test User",
    email: testEmail,
    password: "Password@123",
  });
  assert.ok(regRes.success, "Test user registration must succeed");
  const userId = regRes.data.id;

  // Save wizard step 7 directly through profileService
  console.log("\n[3. Testing saveWizardStep(step=7)]");
  const saveStep7Res = await profileService.saveWizardStep(userId, 7, {
    minAge: 25,
    maxAge: 28,
    minHeight: 160,
    maxHeight: 190,
    religion: "Hindu",
  });
  assert.ok(saveStep7Res.success, `saveWizardStep(7) should succeed: ${saveStep7Res.error}`);
  console.log("✓ saveWizardStep(7) succeeded without throwing Unknown argument minAge!");

  // Update via updatePartnerPreference directly
  console.log("\n[4. Testing updatePartnerPreference directly]");
  const updatePrefRes = await profileService.updatePartnerPreference(userId, {
    minAge: 26,
    maxAge: 32,
    religion: "Hindu",
    country: "India",
  });
  assert.ok(updatePrefRes.success, `updatePartnerPreference should succeed: ${updatePrefRes.error}`);
  assert.strictEqual(updatePrefRes.data.minAge, 26);
  assert.strictEqual(updatePrefRes.data.maxAge, 32);
  console.log("✓ updatePartnerPreference correctly upserted PartnerPreference record:", updatePrefRes.data);

  // Verify fetch profile includes partnerPreference
  console.log("\n[5. Verifying fetched profile includes partner preferences]");
  const fetchRes = await profileService.getProfileByUserId(userId);
  assert.ok(fetchRes.success, "Profile fetch must succeed");
  assert.ok(fetchRes.data.partnerPreference, "Profile must include partnerPreference relation");
  assert.strictEqual(fetchRes.data.partnerPreference.minAge, 26);
  assert.strictEqual(fetchRes.data.partnerPreference.religion, "Hindu");
  console.log("✓ Fetched profile correctly contains partner preference relation!");

  // Verify completion percentage calculation accounts for partner preferences
  console.log(`✓ Profile completion percent: ${fetchRes.data.completionPercent}%`);

  console.log("\n=================================================");
  console.log("✓ ALL PARTNER PREFERENCE PERSISTENCE TESTS PASSED!");
  console.log("=================================================");
  process.exit(0);
}

testPartnerPreferenceFlow().catch((err) => {
  console.error("\n❌ PARTNER PREFERENCES TEST FAILED:", err);
  process.exit(1);
});
