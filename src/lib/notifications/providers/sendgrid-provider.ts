import { INotificationProvider } from "./notification-provider";
import { logger } from "../../logger";

export class SendGridNotificationProvider implements INotificationProvider {
  name(): string {
    return "SendGridNotificationProvider";
  }

  async send(
    userId: string,
    title: string,
    message: string,
    category: "SYSTEM" | "MATCH" | "MESSAGE" | "PAYMENT" | "SECURITY" | "PROFILE" | "ADMIN"
  ): Promise<boolean> {
    logger.info(`[SendGrid] Sending email to ${userId}: ${title} - ${message}`);
    return true;
  }

  async getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }> {
    return { status: "UP", latencyMs: 12 };
  }
}
