import { INotificationProvider } from "./notification-provider";

export class MockNotificationProvider implements INotificationProvider {
  name(): string {
    return "MockNotificationProvider";
  }

  async send(
    userId: string,
    title: string,
    message: string,
    category: "SYSTEM" | "MATCH" | "MESSAGE" | "PAYMENT" | "SECURITY" | "PROFILE" | "ADMIN"
  ): Promise<boolean> {
    return true;
  }

  async getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }> {
    return { status: "UP", latencyMs: 0 };
  }
}
