import { NotificationProvider } from "./notification-provider";

export class PushNotificationProvider implements NotificationProvider {
  name(): string {
    return "PushNotificationProvider";
  }

  async send(
    _userId: string,
    _title: string,
    _message: string,
    _category: "SYSTEM" | "MATCH" | "MESSAGE" | "PAYMENT" | "SECURITY" | "PROFILE" | "ADMIN"
  ): Promise<boolean> {
    // Stub for Web Push
    return true;
  }

  async getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }> {
    return { status: "UP", latencyMs: 2 };
  }
}
