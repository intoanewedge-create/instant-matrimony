import { eventDispatcher } from "./event-dispatcher";
import { DOMAIN_EVENTS } from "@/constants";

async function getServices() {
  const { auditService, notificationService } = await import("../container");
  return { auditService, notificationService };
}

export function initEventSubscribers() {
  eventDispatcher.subscribe(DOMAIN_EVENTS.USER_REGISTERED, async (data: any) => {
    const { auditService, notificationService } = await getServices();
    await auditService.log(data.userId, "USER_REGISTERED", undefined, undefined, JSON.stringify(data));
    await notificationService.enqueue(
      data.userId,
      "Welcome to InstantMatrimony!",
      "Complete your profile wizard to start matching with premium members!"
    );
  });

  eventDispatcher.subscribe(DOMAIN_EVENTS.PROFILE_SUBMITTED, async (data: any) => {
    const { auditService, notificationService } = await getServices();
    await auditService.log(data.userId, "PROFILE_SUBMITTED", undefined, undefined, JSON.stringify(data));
    await notificationService.enqueue(
      data.userId,
      "Profile Submitted for Review",
      "Our moderation team is reviewing your details. We will notify you once approved."
    );
  });

  eventDispatcher.subscribe(DOMAIN_EVENTS.PROFILE_APPROVED, async (data: any) => {
    const { auditService, notificationService } = await getServices();
    await auditService.log(data.userId, "PROFILE_APPROVED", undefined, undefined, JSON.stringify(data));
    await notificationService.enqueue(
      data.userId,
      "Profile Approved!",
      "Congratulations! Your profile is now visible to other members. Best of luck on your search!"
    );
  });

  eventDispatcher.subscribe(DOMAIN_EVENTS.INTEREST_SENT, async (data: any) => {
    const { auditService } = await getServices();
    await auditService.log(data.senderId, "INTEREST_SENT", undefined, undefined, JSON.stringify(data));
  });

  eventDispatcher.subscribe(DOMAIN_EVENTS.INTEREST_ACCEPTED, async (data: any) => {
    const { auditService } = await getServices();
    await auditService.log(data.receiverId, "INTEREST_ACCEPTED", undefined, undefined, JSON.stringify(data));
  });

  eventDispatcher.subscribe(DOMAIN_EVENTS.MEMBERSHIP_PURCHASED, async (data: any) => {
    const { auditService, notificationService } = await getServices();
    await auditService.log(data.userId, "MEMBERSHIP_PURCHASED", undefined, undefined, JSON.stringify(data));
    await notificationService.enqueue(
      data.userId,
      "Membership Upgrade Successful!",
      "Thank you for upgrading. Enjoy premium privileges!"
    );
  });

  eventDispatcher.subscribe(DOMAIN_EVENTS.MESSAGE_SENT, async (data: any) => {
    const { auditService } = await getServices();
    await auditService.log(data.senderId, "MESSAGE_SENT", undefined, undefined, JSON.stringify(data));
  });

  // Media & Photo events
  eventDispatcher.subscribe("PhotoUploaded", async (data: any) => {
    const { auditService, notificationService } = await getServices();
    await auditService.log(data.userId, "PHOTO_UPLOADED", undefined, undefined, JSON.stringify(data));
    await notificationService.enqueue(
      data.userId,
      "Photo Uploaded Successfully",
      "Your new profile photo has been uploaded and is waiting for moderator review."
    );
  });

  eventDispatcher.subscribe("PhotoDeleted", async (data: any) => {
    const { auditService } = await getServices();
    await auditService.log(data.userId, "PHOTO_DELETED", undefined, undefined, JSON.stringify(data));
  });

  eventDispatcher.subscribe("PrimaryPhotoChanged", async (data: any) => {
    const { auditService } = await getServices();
    await auditService.log(data.userId, "PRIMARY_PHOTO_CHANGED", undefined, undefined, JSON.stringify(data));
  });

  // Verification events
  eventDispatcher.subscribe("VerificationSubmitted", async (data: any) => {
    const { auditService, notificationService } = await getServices();
    await auditService.log(data.userId, "VERIFICATION_SUBMITTED", undefined, undefined, JSON.stringify(data));
    await notificationService.enqueue(
      data.userId,
      "Verification Documents Under Review",
      "Your government identity documents and selfie have been submitted successfully. A moderator will review them shortly."
    );
  });

  eventDispatcher.subscribe("VerificationApproved", async (data: any) => {
    const { auditService } = await getServices();
    await auditService.log(data.userId, "VERIFICATION_APPROVED", undefined, undefined, JSON.stringify(data));
  });

  eventDispatcher.subscribe("VerificationRejected", async (data: any) => {
    const { auditService } = await getServices();
    await auditService.log(data.userId, "VERIFICATION_REJECTED", undefined, undefined, JSON.stringify(data));
  });
}
