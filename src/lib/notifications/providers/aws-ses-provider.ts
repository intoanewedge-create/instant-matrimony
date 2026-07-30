import { INotificationProvider } from "./notification-provider";
import { logger } from "../../logger";

export class AwsSesNotificationProvider implements INotificationProvider {
  name(): string {
    return "AwsSesNotificationProvider";
  }

  async send(
    userId: string,
    title: string,
    message: string,
    category: "SYSTEM" | "MATCH" | "MESSAGE" | "PAYMENT" | "SECURITY" | "PROFILE" | "ADMIN"
  ): Promise<boolean> {
    logger.info(`[AWS SES] Sending email to ${userId}: ${title} - ${message}`);
    return true;
  }

  async getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }> {
    return { status: "UP", latencyMs: 15 };
  }
}
