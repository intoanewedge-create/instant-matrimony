"use server";

import { notificationCenterService, EventNotificationConfig } from "../services/notification-center.service";
import { revalidatePath } from "next/cache";

export async function getNotificationSettingsAction() {
  return await notificationCenterService.getSettings();
}

export async function updateNotificationEventAction(eventKey: string, channels: Partial<EventNotificationConfig>) {
  const res = await notificationCenterService.updateEventSetting(eventKey, channels);
  if (res.success) {
    revalidatePath("/admin/notifications");
  }
  return res;
}
