import { BaseService } from "./base.service";
import { Result } from "../result";
import { INotificationRepository } from "../repositories/interfaces/notification.repository";
import { NotificationDispatcher, NotificationGenerator, NotificationFormatter } from "../notifications/pipeline/notification-pipeline";
import { prisma } from "../prisma";

/**
 * Enterprise Notification Service.
 * Manages notification delivery pipeline, user notification preferences,
 * and templated message generations for critical business events.
 */
export class NotificationService extends BaseService {
  private generator = new NotificationGenerator();
  private formatter = new NotificationFormatter();

  constructor(
    private notificationRepository: INotificationRepository,
    private dispatcher: NotificationDispatcher
  ) {
    super();
  }

  /**
   * Enqueues and dispatches a notification to all active providers.
   */
  public async enqueue(
    userId: string,
    title: string,
    message: string,
    type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO",
    category: "SYSTEM" | "MATCH" | "MESSAGE" | "PAYMENT" | "SECURITY" | "PROFILE" | "ADMIN" = "SYSTEM"
  ): Promise<Result<any>> {
    try {
      const context = this.generator.generate({
        userId,
        title,
        message,
        type,
        category,
      });

      const { formattedTitle, formattedMessage } = this.formatter.format(context);

      const notification = await prisma.notification.create({
        data: {
          userId,
          title: formattedTitle,
          message: formattedMessage,
          type,
          category,
        },
      });

      // Dispatch async to active providers
      await this.dispatcher.dispatch(userId, formattedTitle, formattedMessage, category);

      return this.returnSuccess(notification);
    } catch (e: any) {
      return this.returnFailure(e.message, "NOTIFICATION_ENQUEUE_ERROR");
    }
  }

  public async markAsRead(id: string): Promise<Result<any>> {
    try {
      const notification = await this.notificationRepository.markAsRead(id);
      return this.returnSuccess(notification);
    } catch (e: any) {
      return this.returnFailure(e.message, "NOTIFICATION_READ_ERROR");
    }
  }

  public async markAllAsRead(userId: string): Promise<Result<boolean>> {
    try {
      await this.notificationRepository.markAllAsRead(userId);
      return this.returnSuccess(true);
    } catch (e: any) {
      return this.returnFailure(e.message, "NOTIFICATION_READ_ALL_ERROR");
    }
  }

  public async getPreferences(userId: string): Promise<Result<any>> {
    try {
      let pref = await prisma.notificationPreference.findUnique({
        where: { userId },
      });
      if (!pref) {
        pref = await prisma.notificationPreference.create({
          data: { userId },
        });
      }
      return this.returnSuccess(pref);
    } catch (e: any) {
      return this.returnFailure(e.message, "NOTIFICATION_PREF_ERROR");
    }
  }

  public async updatePreferences(userId: string, data: any): Promise<Result<any>> {
    try {
      const pref = await prisma.notificationPreference.upsert({
        where: { userId },
        create: {
          userId,
          ...data,
        },
        update: data,
      });
      return this.returnSuccess(pref);
    } catch (e: any) {
      return this.returnFailure(e.message, "NOTIFICATION_PREF_UPDATE_ERROR");
    }
  }

  /* Templated Notifications */

  public async sendWelcomeNotification(userId: string, name: string): Promise<Result<any>> {
    return this.enqueue(
      userId,
      "Welcome to InstantMatrimony!",
      `Hello ${name}, welcome to the platform. Complete your profile details to unlock premium matches!`,
      "SUCCESS",
      "SYSTEM"
    );
  }

  public async sendVerificationNotification(userId: string, approved: boolean): Promise<Result<any>> {
    const title = approved ? "Profile Verification Approved!" : "Profile Verification Update";
    const body = approved 
      ? "Congratulations, your government identity has been verified. You now have a verified badge!"
      : "Your uploaded documents could not be verified. Please review the upload guidelines and resubmit.";
    return this.enqueue(userId, title, body, approved ? "SUCCESS" : "WARNING", "SECURITY");
  }

  public async sendPasswordResetNotification(userId: string): Promise<Result<any>> {
    return this.enqueue(
      userId,
      "Password Reset Requested",
      "A request was made to reset your password. If this was not you, please contact support immediately.",
      "WARNING",
      "SECURITY"
    );
  }

  public async sendMatchFoundNotification(userId: string, partnerName: string): Promise<Result<any>> {
    return this.enqueue(
      userId,
      "New Compatible Match Found!",
      `We found a new partner match for you: ${partnerName}. View their profile and send an interest!`,
      "SUCCESS",
      "MATCH"
    );
  }

  public async sendNewMessageNotification(userId: string, senderName: string): Promise<Result<any>> {
    return this.enqueue(
      userId,
      "New Chat Message Received",
      `You received a new message from ${senderName}. Open chats to reply.`,
      "INFO",
      "MESSAGE"
    );
  }

  public async sendSubscriptionNotification(userId: string, tier: string): Promise<Result<any>> {
    return this.enqueue(
      userId,
      "Subscription Status Updated",
      `Your subscription to the ${tier} tier is now active. Thank you for choosing us!`,
      "SUCCESS",
      "PAYMENT"
    );
  }

  public async sendBillingNotification(userId: string, invoiceId: string, amount: number): Promise<Result<any>> {
    return this.enqueue(
      userId,
      "Invoice Generated",
      `Invoice ${invoiceId} for the amount of $${amount} is generated and paid.`,
      "INFO",
      "PAYMENT"
    );
  }

  public async sendFraudAlertNotification(userId: string, reason: string): Promise<Result<any>> {
    return this.enqueue(
      userId,
      "Security Alert: Suspicious Activity Detected",
      `Our systems detected anomalous behavior associated with your account: ${reason}. Please secure your details.`,
      "ERROR",
      "SECURITY"
    );
  }

  public async sendAppealNotification(userId: string, status: string): Promise<Result<any>> {
    return this.enqueue(
      userId,
      "Account Appeal Resolution Update",
      `Your moderation appeal status has been updated to: ${status}.`,
      "INFO",
      "SYSTEM"
    );
  }

  public async sendMarketingNotification(userId: string, campaignName: string): Promise<Result<any>> {
    return this.enqueue(
      userId,
      `Special Offer: ${campaignName}`,
      "Unlock exclusive premium features at an introductory discount. Offer ends soon!",
      "INFO",
      "SYSTEM"
    );
  }
}
