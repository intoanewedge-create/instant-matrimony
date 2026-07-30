import { container } from "../src/lib/container";
import { prisma } from "../src/lib/prisma";
import { MediaType, DocumentType, VerificationStatus } from "@prisma/client";
import sharp from "sharp";

async function runTests() {
  console.log("🚀 Starting Media & Verification Integration Tests...");
  let success = true;
  
  // 1. Setup Test User, Admin, and Profile
  const testEmail = `test-${Date.now()}@example.com`;
  const user = await prisma.user.create({
    data: {
      name: "Verification Test User",
      email: testEmail,
      password: "HashedPassword123!",
      role: "USER",
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: "Test Admin Moderator",
      email: `admin-${Date.now()}@example.com`,
      password: "HashedPassword123!",
      role: "ADMIN",
    },
  });

  const profile = await prisma.profile.create({
    data: {
      userId: user.id,
      gender: "MALE",
      dateOfBirth: new Date("1995-05-15"),
      religion: "HINDU",
      caste: "BRAHMIN",
      motherTongue: "HINDI",
      height: 180,
      maritalStatus: "NEVER_MARRIED",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      status: "PENDING",
      completionPercent: 80,
    },
  });

  console.log(`✅ Test User created: ID = ${user.id}, Test Admin: ID = ${adminUser.id}`);

  try {
    // 2. Test ImageService (with 300x300 mock pixel PNG image buffer)
    const mockPngBuffer = await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 0.5 }
      }
    }).png().toBuffer();

    console.log("🧪 Testing ImageService validation...");
    const validateRes = await container.services.imageService.validateImage(mockPngBuffer, "test.png", "image/png");
    if (!validateRes.success) {
      throw new Error(`Image validation failed: ${validateRes.error}`);
    }
    console.log("✅ Image validation passed.");

    console.log("🧪 Testing ImageService processing (WebP conversion, thumbnailing)...");
    const processRes = await container.services.imageService.processImage(mockPngBuffer, "test.png");
    if (!processRes.success || !processRes.data) {
      throw new Error(`Image processing failed: ${processRes.error}`);
    }
    console.log("✅ Image processing succeeded. WebP output generated.");

    const { processedBuffer, checksum, width, height } = processRes.data;

    // 3. Test StorageService upload
    console.log("🧪 Testing StorageService photo upload...");
    const uploadRes = await container.services.storageService.uploadFile(
      { name: "test-processed.webp", buffer: processedBuffer, mimeType: "image/webp" },
      MediaType.PHOTO,
      user.id
    );
    if (!uploadRes.success || !uploadRes.data) {
      throw new Error(`Storage upload failed: ${uploadRes.error}`);
    }
    console.log(`✅ Storage upload succeeded. URL: ${uploadRes.data.url}`);

    const media = uploadRes.data;

    // 4. Create Photo entry
    console.log("🧪 Creating Photo entry...");
    const photo = await container.repositories.photoRepository.create({
      profileId: profile.id,
      mediaId: media.id,
      url: media.url,
      isMain: true,
      isApproved: false,
    });
    console.log(`✅ Photo entry created: ID = ${photo.id}`);

    // Create ImageMetadata
    await container.repositories.imageMetadataRepository.create({
      photoId: photo.id,
      fileSize: media.fileSize,
      mimeType: media.mimeType,
      width,
      height,
      originalName: "test.png",
      storageProvider: media.provider,
      checksum,
    });
    console.log("✅ ImageMetadata created.");

    // 5. Test Verification Document & Selfie uploads
    console.log("🧪 Uploading mock government ID scan...");
    const docUploadRes = await container.services.storageService.uploadFile(
      { name: "aadhaar.jpg", buffer: mockPngBuffer, mimeType: "image/jpeg" },
      MediaType.DOCUMENT,
      user.id
    );
    if (!docUploadRes.success || !docUploadRes.data) {
      throw new Error(`ID upload failed: ${docUploadRes.error}`);
    }
    console.log("✅ Mock ID document uploaded.");

    console.log("🧪 Uploading mock verification selfie...");
    const selfieUploadRes = await container.services.storageService.uploadFile(
      { name: "selfie.jpg", buffer: mockPngBuffer, mimeType: "image/jpeg" },
      MediaType.DOCUMENT,
      user.id
    );
    if (!selfieUploadRes.success || !selfieUploadRes.data) {
      throw new Error(`Selfie upload failed: ${selfieUploadRes.error}`);
    }
    console.log("✅ Mock verification selfie uploaded.");

    // 6. Test Verification submission
    console.log("🧪 Testing VerificationService submission...");
    const verifRes = await container.services.verificationService.submitVerification(user.id, {
      documentType: DocumentType.AADHAAR,
      documentMediaId: docUploadRes.data.id,
      selfieMediaId: selfieUploadRes.data.id,
    });
    if (!verifRes.success || !verifRes.data) {
      throw new Error(`Verification submission failed: ${verifRes.error}`);
    }
    console.log(`✅ Verification submitted. Status: ${verifRes.data.status}`);

    const verification = verifRes.data;

    // 7. Test Moderation approve verification
    console.log("🧪 Testing ModerationService approval...");
    const approveRes = await container.services.moderationService.approveVerification(verification.id, adminUser.id);
    if (!approveRes.success) {
      throw new Error(`Moderation approval failed: ${approveRes.error}`);
    }
    console.log("✅ Verification request approved.");

    const updatedVerif = await prisma.identityVerification.findUnique({
      where: { id: verification.id },
    });
    if (updatedVerif?.status !== VerificationStatus.APPROVED) {
      throw new Error(`Assertion failed: expected status APPROVED, got ${updatedVerif?.status}`);
    }
    console.log("🎉 All assertions passed successfully!");

  } catch (err: any) {
    success = false;
    console.error("❌ Test failed with error:", err.message);
  } finally {
    console.log("🧹 Cleaning up test database entries...");
    await prisma.auditLog.deleteMany({ where: { userId: adminUser.id } }).catch(() => {});
    await prisma.moderationHistory.deleteMany({ where: { targetUserId: user.id } }).catch(() => {});
    await prisma.moderationHistory.deleteMany({ where: { targetUserId: profile.id } }).catch(() => {});
    await prisma.identityVerification.deleteMany({ where: { userId: user.id } }).catch(() => {});
    await prisma.imageMetadata.deleteMany({ where: { photo: { profileId: profile.id } } }).catch(() => {});
    await prisma.photo.deleteMany({ where: { profileId: profile.id } }).catch(() => {});
    await prisma.media.deleteMany({ where: { userId: user.id } }).catch(() => {});
    await prisma.profile.deleteMany({ where: { id: profile.id } }).catch(() => {});
    await prisma.user.deleteMany({ where: { id: user.id } }).catch(() => {});
    await prisma.user.deleteMany({ where: { id: adminUser.id } }).catch(() => {});
    console.log("🧹 Cleanup complete.");
    process.exit(success ? 0 : 1);
  }
}

runTests();
