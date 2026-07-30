import { NotificationResponse } from "../dto/notification.dto";

export class NotificationSerializer {
  static serialize(notification: NotificationResponse): NotificationResponse {
    return notification;
  }

  static serializeMany(notifications: NotificationResponse[]): NotificationResponse[] {
    return notifications.map(this.serialize);
  }
}
