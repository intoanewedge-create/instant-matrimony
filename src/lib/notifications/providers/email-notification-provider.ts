import { NotificationProvider } from "./notification-provider";
import { EmailProvider } from "../../email/email-provider";
import { prisma } from "../../prisma";

export class EmailNotificationProvider implements NotificationProvider {
  constructor(private emailProvider: EmailProvider) {}

  name(): string {
    return "EmailNotificationProvider";
  }

  async send(
    userId: string,
    title: string,
    message: string,
    category: "SYSTEM" | "MATCH" | "MESSAGE" | "PAYMENT" | "SECURITY" | "PROFILE" | "ADMIN"
  ): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      if (user?.email) {
        await this.emailProvider.send(user.email, `[${category}] ${title}`, message);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }> {
    return { status: "UP", latencyMs: 2 };
  }
}
