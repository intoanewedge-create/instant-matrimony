/**
 * Interface representing the notification delivery provider (Email, SMS, Push, In-App).
 */
export interface INotificationProvider {
  /**
   * Name of the notification channel provider.
   */
  name(): string;

  /**
   * Dispatches a notification to a specific user.
   *
   * @param userId - Recipient identifier.
   * @param title - Notification subject/title.
   * @param message - Notification body/content.
   * @param category - Category routing of the notification.
   */
  send(
    userId: string,
    title: string,
    message: string,
    category: "SYSTEM" | "MATCH" | "MESSAGE" | "PAYMENT" | "SECURITY" | "PROFILE" | "ADMIN"
  ): Promise<boolean>;

  /**
   * Health status reporting method for the provider.
   */
  getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }>;
}

export type NotificationProvider = INotificationProvider;
