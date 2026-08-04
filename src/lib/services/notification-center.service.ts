import { prisma } from "../prisma";
import { Result, returnSuccess, returnFailure } from "../result";
import { smsWhatsappProvider } from "./sms-whatsapp-provider";
import { emailService } from "../email";
import { loggerService } from "./logger.service";

export interface EventNotificationConfig {
  eventKey: string;
  eventName: string;
  description: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
}

export const SYSTEM_NOTIFICATION_EVENTS: EventNotificationConfig[] = [
  { eventKey: "registration", eventName: "User Registration", description: "Triggered on successful user sign-up", emailEnabled: true, smsEnabled: true, whatsappEnabled: true, pushEnabled: true, inAppEnabled: true },
  { eventKey: "verification", eventName: "Identity Verification", description: "Triggered on document verification update", emailEnabled: true, smsEnabled: true, whatsappEnabled: true, pushEnabled: true, inAppEnabled: true },
  { eventKey: "interest_received", eventName: "Interest Received", description: "Triggered when another profile sends an interest", emailEnabled: true, smsEnabled: true, whatsappEnabled: true, pushEnabled: true, inAppEnabled: true },
  { eventKey: "interest_accepted", eventName: "Interest Accepted", description: "Triggered when sent interest is accepted", emailEnabled: true, smsEnabled: true, whatsappEnabled: true, pushEnabled: true, inAppEnabled: true },
  { eventKey: "message_received", eventName: "Message Received", description: "Triggered on new chat message", emailEnabled: true, smsEnabled: false, whatsappEnabled: true, pushEnabled: true, inAppEnabled: true },
  { eventKey: "payment_submitted", eventName: "Payment Submitted", description: "Triggered when manual payment is uploaded", emailEnabled: true, smsEnabled: true, whatsappEnabled: false, pushEnabled: true, inAppEnabled: true },
  { eventKey: "payment_approved", eventName: "Payment Approved", description: "Triggered when admin approves payment", emailEnabled: true, smsEnabled: true, whatsappEnabled: true, pushEnabled: true, inAppEnabled: true },
  { eventKey: "payment_rejected", eventName: "Payment Rejected", description: "Triggered when admin rejects payment", emailEnabled: true, smsEnabled: true, whatsappEnabled: true, pushEnabled: true, inAppEnabled: true },
  { eventKey: "membership_activated", eventName: "Membership Activated", description: "Triggered when plan becomes active", emailEnabled: true, smsEnabled: true, whatsappEnabled: true, pushEnabled: true, inAppEnabled: true },
  { eventKey: "membership_expiring", eventName: "Membership Expiring", description: "Triggered when subscription expires soon", emailEnabled: true, smsEnabled: true, whatsappEnabled: true, pushEnabled: true, inAppEnabled: true },
  { eventKey: "profile_approved", eventName: "Profile Approved", description: "Triggered on profile moderation approval", emailEnabled: true, smsEnabled: true, whatsappEnabled: true, pushEnabled: true, inAppEnabled: true },
  { eventKey: "profile_rejected", eventName: "Profile Rejected", description: "Triggered on profile moderation rejection", emailEnabled: true, smsEnabled: true, whatsappEnabled: true, pushEnabled: true, inAppEnabled: true },
  { eventKey: "concierge_update", eventName: "Concierge Update", description: "Triggered on dedicated matchmaking update", emailEnabled: true, smsEnabled: true, whatsappEnabled: true, pushEnabled: true, inAppEnabled: true },
];

export class NotificationCenterService {
  async seedEvents(): Promise<Result<void>> {
    try {
      for (const ev of SYSTEM_NOTIFICATION_EVENTS) {
        await prisma.notificationSetting.upsert({
          where: { eventKey: ev.eventKey },
          update: { eventName: ev.eventName, description: ev.description },
          create: {
            eventKey: ev.eventKey,
            eventName: ev.eventName,
            description: ev.description,
            emailEnabled: ev.emailEnabled,
            smsEnabled: ev.smsEnabled,
            whatsappEnabled: ev.whatsappEnabled,
            pushEnabled: ev.pushEnabled,
            inAppEnabled: ev.inAppEnabled,
          },
        });
      }
      return returnSuccess(undefined);
    } catch (e: any) {
      return returnFailure(e.message, "NOTIF_CENTER_SEED_ERROR");
    }
  }

  async getSettings(): Promise<Result<any[]>> {
    try {
      await this.seedEvents();
      const settings = await prisma.notificationSetting.findMany({ orderBy: { eventName: "asc" } });
      return returnSuccess(settings);
    } catch (e: any) {
      return returnFailure(e.message, "GET_NOTIF_SETTINGS_ERROR");
    }
  }

  async updateEventSetting(eventKey: string, channels: Partial<EventNotificationConfig>): Promise<Result<any>> {
    try {
      const updated = await prisma.notificationSetting.update({
        where: { eventKey },
        data: {
          emailEnabled: channels.emailEnabled,
          smsEnabled: channels.smsEnabled,
          whatsappEnabled: channels.whatsappEnabled,
          pushEnabled: channels.pushEnabled,
          inAppEnabled: channels.inAppEnabled,
        },
      });
      return returnSuccess(updated);
    } catch (e: any) {
      return returnFailure(e.message, "UPDATE_NOTIF_SETTING_ERROR");
    }
  }

  async dispatchNotification(
    eventKey: string,
    recipient: { userId: string; email?: string; phone?: string },
    payload: { title: string; message: string; emailSubject?: string; emailHtml?: string }
  ): Promise<Result<void>> {
    try {
      const config = await prisma.notificationSetting.findUnique({ where: { eventKey } });
      if (!config) {
        loggerService.warn(`Notification event key ${eventKey} not found.`);
        return returnSuccess(undefined);
      }

      // In-App Notification
      if (config.inAppEnabled && recipient.userId) {
        await prisma.notification.create({
          data: {
            userId: recipient.userId,
            title: payload.title,
            message: payload.message,
            category: eventKey.toUpperCase(),
          },
        });
      }

      // Email Notification
      if (config.emailEnabled && recipient.email && payload.emailHtml) {
        await emailService.sendEmail({
          to: recipient.email,
          subject: payload.emailSubject || payload.title,
          html: payload.emailHtml,
        });
      }

      // SMS Notification
      if (config.smsEnabled && recipient.phone) {
        await smsWhatsappProvider.sendSms({
          to: recipient.phone,
          message: `${payload.title}: ${payload.message}`,
        });
      }

      // WhatsApp Notification
      if (config.whatsappEnabled && recipient.phone) {
        await smsWhatsappProvider.sendWhatsApp({
          to: recipient.phone,
          message: `${payload.title}\n\n${payload.message}`,
        });
      }

      return returnSuccess(undefined);
    } catch (e: any) {
      return returnFailure(e.message, "DISPATCH_NOTIFICATION_ERROR");
    }
  }
}

export const notificationCenterService = new NotificationCenterService();
