import { Notification } from "@prisma/client";

export interface INotificationRepository {
  create(userId: string, title: string, message: string, type: any): Promise<Notification>;
  findUserNotifications(userId: string, cursor?: string, limit?: number): Promise<Notification[]>;
  markAsRead(id: string): Promise<Notification>;
  markAllAsRead(userId: string): Promise<void>;
  delete(id: string): Promise<Notification>;
}
