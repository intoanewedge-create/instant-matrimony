import { INotificationProvider } from "./notification-provider";

export class MockNotificationProvider implements INotificationProvider {
  name(): string {
    return "MockNotificationProvider";
  }

  async send(
    _userId: string,
    _title: string,
    _message: string,
    _category: "SYSTEM" | "MATCH" | "MESSAGE" | "PAYMENT" | "SECURITY" | "PROFILE" | "ADMIN"
  ): Promise<boolean> {
    return true;
  }

  async getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }> {
    return { status: "UP", latencyMs: 0 };
  }
}
