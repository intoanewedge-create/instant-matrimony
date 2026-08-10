import { container } from "../src/lib/container";
import { prisma } from "../src/lib/prisma";

async function runAuthVerificationTests() {
  console.log("=================================================");
  console.log("   AUTH & EMAIL VERIFICATION QA TEST SUITE       ");
  console.log("=================================================");

  const testEmail = `qa_test_${Date.now()}@instantmatrimony.com`;
  const testPassword = "Password@123";
  const newPassword = "NewPassword@123";
  const nonExistentEmail = `nonexistent_${Date.now()}@instantmatrimony.com`;

  try {
    // 1. Test Registration creates unverified user
    console.log("\n[Test 1] Testing User Registration...");
    const regResult = await container.services.authService.register({
      name: "QA Test User",
      email: testEmail,
      phone: `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: testPassword,
    });

    if (!regResult.success) {
      throw new Error(`Registration failed: ${regResult.error}`);
    }
    console.log("✓ Registration succeeded.");

    const createdUser = await container.repositories.userRepository.findByEmail(testEmail);
    if (!createdUser) throw new Error("Created user not found in database.");
    if (createdUser.isEmailVerified !== false) {
      throw new Error(`Expected isEmailVerified to be false, got: ${createdUser.isEmailVerified}`);
    }
    console.log("✓ User created with isEmailVerified = false.");

    // 2. Test OTP was generated for EMAIL_VERIFICATION
    console.log("\n[Test 2] Testing Verification OTP generation...");
    const otpRecord = await prisma.verificationOtp.findFirst({
      where: { target: testEmail, purpose: "EMAIL_VERIFICATION" },
      orderBy: { createdAt: "desc" },
    });
    if (!otpRecord) {
      throw new Error("No OTP record generated for user registration.");
    }
    console.log("✓ Verification OTP record found in database.");

    // 3. Test Forgot Password with Non-Existent Email (Privacy / Anti-Enumeration)
    console.log("\n[Test 3] Testing Forgot Password for Non-Existent Email...");
    const nonExistentResult = await container.services.authService.forgotPassword(nonExistentEmail);
    if (!nonExistentResult.success) {
      throw new Error(`Expected success for non-existent email, got error: ${nonExistentResult.error}`);
    }
    console.log("✓ Non-existent email returns generic success (no user enumeration).");

    // 4. Test Forgot Password for Registered User
    console.log("\n[Test 4] Testing Forgot Password for Registered User...");
    const forgotResult = await container.services.authService.forgotPassword(testEmail);
    if (!forgotResult.success) {
      throw new Error(`Forgot password failed: ${forgotResult.error}`);
    }
    console.log("✓ Forgot password processed successfully without Resend Forbidden errors.");

    // 5. Test Password Reset Token & OTP Generation
    console.log("\n[Test 5] Checking Password Reset Token & OTP...");
    const resetOtp = await prisma.verificationOtp.findFirst({
      where: { target: testEmail, purpose: "PASSWORD_RESET" },
      orderBy: { createdAt: "desc" },
    });
    if (!resetOtp) {
      throw new Error("No PASSWORD_RESET OTP record generated.");
    }
    console.log("✓ Password reset OTP record created.");

    // 6. Test Email Verification with OTP
    console.log("\n[Test 6] Testing Email Verification with valid OTP...");
    const testOtpCode = "654321";
    const cryptoModule = await import("crypto");
    const testHashedCode = cryptoModule.createHash("sha256").update(testOtpCode).digest("hex");
    await prisma.verificationOtp.create({
      data: {
        target: testEmail,
        purpose: "EMAIL_VERIFICATION",
        hashedCode: testHashedCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const verifyResult = await container.services.authService.verifyEmail(testEmail, testOtpCode);
    if (!verifyResult.success) {
      throw new Error(`Email verification failed: ${verifyResult.error}`);
    }
    console.log("✓ Email verified successfully.");

    const verifiedUser = await container.repositories.userRepository.findByEmail(testEmail);
    if (!verifiedUser || !verifiedUser.isEmailVerified) {
      throw new Error("User isEmailVerified was not updated to true.");
    }
    console.log("✓ User isEmailVerified is now TRUE in database.");

    // 7. Test Password Reset Execution
    console.log("\n[Test 7] Testing Password Reset...");
    const testResetCode = "889900";
    const testResetHashed = cryptoModule.createHash("sha256").update(testResetCode).digest("hex");
    await prisma.verificationOtp.create({
      data: {
        target: testEmail,
        purpose: "PASSWORD_RESET",
        hashedCode: testResetHashed,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const resetResult = await container.services.authService.resetPassword(testEmail, testResetCode, newPassword);
    if (!resetResult.success) {
      throw new Error(`Reset password failed: ${resetResult.error}`);
    }
    console.log("✓ Password successfully reset.");

    // 8. Verify new password hash
    const bcrypt = await import("bcryptjs");
    const updatedUser = await container.repositories.userRepository.findByEmail(testEmail);
    if (!updatedUser) throw new Error("Updated user not found.");
    const isNewPasswordValid = await bcrypt.compare(newPassword, updatedUser.password);
    if (!isNewPasswordValid) {
      throw new Error("New password hash did not match in database.");
    }
    console.log("✓ New password hash verified in database.");

    console.log("\n=================================================");
    console.log("🎉 ALL AUTH & EMAIL VERIFICATION TESTS PASSED!");
    console.log("=================================================\n");
  } catch (err: any) {
    console.error("\n❌ TEST SUITE FAILED:", err.message);
    process.exit(1);
  } finally {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: testEmail },
    }).catch(() => {});
    await prisma.verificationOtp.deleteMany({
      where: { target: testEmail },
    }).catch(() => {});
    await prisma.verificationToken.deleteMany({
      where: { identifier: testEmail },
    }).catch(() => {});
    process.exit(0);
  }
}

runAuthVerificationTests();
