import { NotificationProvider } from "./notification-provider";
import { prisma } from "../../prisma";

export class InAppNotificationProvider implements NotificationProvider {
  name(): string {
    return "InAppNotificationProvider";
  }

  async send(
    userId: string,
    title: string,
    message: string,
    category: "SYSTEM" | "MATCH" | "MESSAGE" | "PAYMENT" | "SECURITY" | "PROFILE" | "ADMIN"
  ): Promise<boolean> {
    try {
      await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type: "INFO",
          category,
          read: false,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }> {
    return { status: "UP", latencyMs: 2 };
  }
}

