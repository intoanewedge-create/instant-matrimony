import { NotificationProvider } from "./notification-provider";
import { logger } from "../../logger/logger";

export class PushNotificationProvider implements NotificationProvider {
  name(): string {
    return "PushNotificationProvider";
  }

  async send(
    userId: string,
    title: string,
    message: string,
    category: "SYSTEM" | "MATCH" | "MESSAGE" | "PAYMENT" | "SECURITY" | "PROFILE" | "ADMIN"
  ): Promise<boolean> {
    logger.info({ userId, title, message, category }, `[PushNotificationProvider] Mock push sent.`);
    return true;
  }

  async getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }> {
    return { status: "UP", latencyMs: 2 };
  }
}

