import { INotificationProvider } from "./notification-provider";
import { logger } from "../../logger";

export class TwilioNotificationProvider implements INotificationProvider {
  name(): string {
    return "TwilioNotificationProvider";
  }

  async send(
    userId: string,
    title: string,
    message: string,
    category: "SYSTEM" | "MATCH" | "MESSAGE" | "PAYMENT" | "SECURITY" | "PROFILE" | "ADMIN"
  ): Promise<boolean> {
    logger.info(`[Twilio SMS] Sending message to ${userId}: ${title} - ${message}`);
    return true;
  }

  async getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }> {
    return { status: "UP", latencyMs: 8 };
  }
}
