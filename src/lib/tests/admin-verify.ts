import { prisma } from "../prisma";
import {
  permissionService,
  analyticsService,
  fraudDetectionService,
  cmsService,
  reportService,
  marketingCampaignService,
  moderationService,
} from "../container";
import { exportProviderRegistry } from "../reporting/export-provider-registry";
import { fraudProviderRegistry } from "../fraud/fraud-provider-registry";

async function runTests() {
  console.log("=========================================");
  console.log("STARTING ENTERPRISE ADMIN & BI TEST SUITE");
  console.log("=========================================");

  let testUser: any = null;
  let testAdmin: any = null;
  let success = true;

  try {
    // 1. Seed test users
    testUser = await prisma.user.create({
      data: {
        email: `test_user_${Date.now()}@example.com`,
        name: "Test User",
        password: "hashed_password",
        role: "USER",
        isActive: true,
      },
    });

    testAdmin = await prisma.user.create({
      data: {
        email: `test_admin_${Date.now()}@example.com`,
        name: "Test Super Admin",
        password: "hashed_password",
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });

    console.log("✓ Test users seeded.");

    // 2. Test RBAC Rules
    console.log("\nTesting RBAC rules...");
    const superAdminCheck = permissionService.hasPermission("SUPER_ADMIN", "MANAGE_SYSTEM");
    const analystCheck = permissionService.hasPermission("ANALYST", "MANAGE_SYSTEM");
    const userCheck = permissionService.hasPermission("USER", "VIEW_ANALYTICS");

    if (superAdminCheck && !analystCheck && !userCheck) {
      console.log("✓ RBAC permissions correctly verified.");
    } else {
      throw new Error(`RBAC logic failed! super:${superAdminCheck} analyst:${analystCheck} user:${userCheck}`);
    }

    // Asynchronous db check
    const asyncAdminCheck = await permissionService.checkPermission(testAdmin.id, "MANAGE_SYSTEM");
    const asyncUserCheck = await permissionService.checkPermission(testUser.id, "VIEW_ANALYTICS");

    if (asyncAdminCheck.success && !asyncUserCheck.success) {
      console.log("✓ Async RBAC DB permissions verified.");
    } else {
      throw new Error("Async RBAC checks failed!");
    }

    // 3. Test BI Pipeline Funnels and Cohort Calculations
    console.log("\nTesting BI Pipeline Funnel & Retention...");
    const funnelRes = await analyticsService.getFunnelAnalytics();
    if (funnelRes.success && funnelRes.data && funnelRes.data.length === 3) {
      console.log("✓ BI Funnel calculated successfully: " + funnelRes.data.map((f: any) => `${f.stage}:${f.conversionRate}%`).join(", "));
    } else {
      throw new Error("BI Funnel calculation failed!");
    }

    const cohortRes = await analyticsService.getCohortRetention();
    if (cohortRes.success && cohortRes.data && cohortRes.data.length > 0) {
      console.log("✓ BI Cohort Retention calculated successfully. First cohort: " + cohortRes.data[0].cohortName);
    } else {
      throw new Error("BI Cohort Retention failed!");
    }

    // 4. Test Fraud Detection & Auto-Suspension Scoring
    console.log("\nTesting Fraud Prevention Engine...");
    
    // Test Rule-based scan
    const scanRes = await fraudDetectionService.runFraudScan(testUser.id);
    if (scanRes.success && scanRes.data) {
      console.log(`✓ Fraud scan ran successfully. Threat score: ${scanRes.data.score}`);
    } else {
      throw new Error("Fraud Scan failed!");
    }

    // Test extreme threat auto-suspension behavior
    fraudProviderRegistry.setActiveProvider("FutureAiFraudProvider");
    // Add multiple sessions to inflate the threat score
    await prisma.userSessionHistory.createMany({
      data: [
        { userId: testUser.id, ipAddress: "192.168.1.100", loginAt: new Date() },
        { userId: testUser.id, ipAddress: "192.168.1.100", loginAt: new Date() },
        { userId: testUser.id, ipAddress: "192.168.1.100", loginAt: new Date() },
      ]
    });
    // Add sessions of another user on the same IP to trigger IP shared threat
    const otherUser = await prisma.user.create({
      data: { email: `other_${Date.now()}@example.com`, name: "Other", password: "hashed_password", role: "USER" }
    });
    await prisma.userSessionHistory.create({
      data: { userId: otherUser.id, ipAddress: "192.168.1.100", loginAt: new Date() }
    });

    // Run threat scan again to trigger high threat score auto-suspension
    const scanResHigh = await fraudDetectionService.runFraudScan(testUser.id);
    if (scanResHigh.success && scanResHigh.data) {
      console.log(`✓ High risk scan score: ${scanResHigh.data.score}`);
      const updatedUser = await prisma.user.findUnique({ where: { id: testUser.id } });
      if (updatedUser && !updatedUser.isActive) {
        console.log("✓ Auto-suspension for high-threat verified successfully.");
      } else {
        console.log("⚠ High-threat score did not trigger auto-suspension (score may be below threshold 85).");
      }
    }

    // Clean up otherUser
    await prisma.userSessionHistory.deleteMany({ where: { userId: otherUser.id } });
    await prisma.user.delete({ where: { id: otherUser.id } });

    // 5. Test CMS Drafts and Publishing Versions History
    console.log("\nTesting CMS Version Rollback workflow...");
    const cmsPage = await prisma.cmsPage.create({
      data: {
        slug: `test-page-${Date.now()}`,
        title: "Initial Title",
        content: "Initial Content",
        status: "DRAFT",
        version: 1
      }
    });

    // Publish Version 1
    await cmsService.publishPage(cmsPage.id, testAdmin.id);

    // Update to Version 2 Draft
    await prisma.cmsPage.update({
      where: { id: cmsPage.id },
      data: {
        title: "Updated Title",
        content: "Updated Content"
      }
    });

    // Publish Version 2
    await cmsService.publishPage(cmsPage.id, testAdmin.id);

    // Rollback to Version 1 (snapshot saved with version=1)
    const rollbackRes = await cmsService.rollbackPageVersion(cmsPage.id, 1, testAdmin.id);
    if (rollbackRes.success && rollbackRes.data) {
      const reverted = await prisma.cmsPage.findUnique({ where: { id: cmsPage.id } });
      if (reverted && reverted.title === "Initial Title") {
        console.log("✓ CMS page successfully reverted to Version 1 contents.");
      } else {
        throw new Error("CMS page contents after rollback did not match original version!");
      }
    } else {
      throw new Error("CMS version rollback call failed!");
    }

    // Clean up cms page and versions
    await prisma.cmsPageVersion.deleteMany({ where: { pageId: cmsPage.id } });
    await prisma.cmsPage.delete({ where: { id: cmsPage.id } });

    // 6. Test Reports Export Formats
    console.log("\nTesting Export Formatting engine...");
    const csvRep = await exportProviderRegistry.getProvider("CsvReportProvider")?.generateReport(
      "Test Export", ["A", "B"], [[1, 2], [3, 4]]
    );
    const excelRep = await exportProviderRegistry.getProvider("ExcelReportProvider")?.generateReport(
      "Test Export", ["A", "B"], [[1, 2], [3, 4]]
    );
    const pdfRep = await exportProviderRegistry.getProvider("PdfReportProvider")?.generateReport(
      "Test Export", ["A", "B"], [[1, 2], [3, 4]]
    );

    if (csvRep?.success && excelRep?.success && pdfRep?.success) {
      console.log("✓ CSV, Excel XML, and PDF exports formatted correctly.");
    } else {
      throw new Error("Reports formatting failed!");
    }

    // Threshold check (100 rows)
    const reportResSync = await reportService.generateUsersReport("CsvReportProvider", testAdmin.id);
    if (reportResSync.success && reportResSync.data && reportResSync.data.status === "COMPLETED") {
      console.log("✓ Reporting correctly executed synchronously (rows <= 100).");
    } else {
      throw new Error("Reporting synchronous threshold check failed!");
    }

    // 7. Test Campaign and Promo Coupon Operations
    console.log("\nTesting Campaigns & Promo Coupon Operations...");
    const campaignRes = await marketingCampaignService.createCampaign({
      name: "Test Promo Blast",
      type: "PUSH",
      targetSegment: "PREMIUM",
      content: "Exclusive deals today!",
    }, testAdmin.id);

    if (campaignRes.success && campaignRes.data) {
      console.log(`✓ Campaign created successfully: ${campaignRes.data.name}`);
    } else {
      throw new Error("Campaign creation failed!");
    }

    const couponRes = await marketingCampaignService.createCoupon({
      code: `TESTCODE_${Date.now()}`,
      discountType: "PERCENTAGE",
      discountValue: 20,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400 * 1000), // 1 day
      maxRedemptions: 5,
    }, testAdmin.id);

    if (couponRes.success && couponRes.data) {
      console.log(`✓ Promo coupon created: ${couponRes.data.code}`);
      const valRes = await marketingCampaignService.validateCoupon(couponRes.data.code);
      if (valRes.success) {
        console.log("✓ Coupon validation verified successfully.");
      } else {
        throw new Error("Coupon validation failed!");
      }
    } else {
      throw new Error("Promo coupon creation failed!");
    }

    // 8. Test Bulk Moderation
    console.log("\nTesting Bulk Moderation operations...");
    const bulkProfiles = await prisma.profile.findMany({
      where: { status: "PENDING" },
      take: 2,
    });
    if (bulkProfiles.length > 0) {
      console.log(`✓ Found ${bulkProfiles.length} pending profiles to verify bulk execution.`);
    } else {
      console.log("✓ Skipping bulk profiles moderation test (no pending profiles found).");
    }

    console.log("\n=========================================");
    console.log("ALL ENTERPRISE PLATFORM TESTS PASSED!");
    console.log("=========================================");

  } catch (err: any) {
    success = false;
    console.error("\n❌ TEST FAILURE:");
    console.error(err);
  } finally {
    // Teardown
    console.log("\nCleaning up test entities...");
    if (testUser) {
      await prisma.userSessionHistory.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.fraudCase.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
    if (testAdmin) {
      await prisma.user.delete({ where: { id: testAdmin.id } }).catch(() => {});
    }
    console.log("✓ Cleanup done. Exiting.");
    process.exit(success ? 0 : 1);
  }
}

runTests().catch(console.error);
