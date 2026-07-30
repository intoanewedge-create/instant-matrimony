import { Notification } from "@prisma/client";
import { NotificationResponse } from "../dto/notification.dto";

export class NotificationMapper {
  static toResponse(notification: Notification): NotificationResponse {
    return {
      id: notification.id,
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.read,
      createdAt: notification.createdAt.toISOString(),
    };
  }
}
