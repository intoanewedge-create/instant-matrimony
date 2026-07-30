import { NotificationProvider } from "./notification-provider";
import { loggerService } from "../../services/logger.service";

export class BrowserNotificationProvider implements NotificationProvider {
  name(): string {
    return "BrowserNotificationProvider";
  }

  async send(
    userId: string,
    title: string,
    message: string,
    category: "SYSTEM" | "MATCH" | "MESSAGE" | "PAYMENT" | "SECURITY" | "PROFILE" | "ADMIN"
  ): Promise<boolean> {
    loggerService.info(`Sending browser push notification to User ${userId}`, {
      title,
      message,
      category,
    });
    return true;
  }

  async getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }> {
    return { status: "UP", latencyMs: 2 };
  }
}
