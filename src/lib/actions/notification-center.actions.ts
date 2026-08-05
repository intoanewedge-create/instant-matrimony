"use server";

import { notificationCenterService, EventNotificationConfig } from "../services/notification-center.service";
import { revalidatePath } from "next/cache";
import { verifyActionPermission } from "./action-utils";
import { returnFailure } from "../result";

export async function getNotificationSettingsAction() {
  const permCheck = await verifyActionPermission("MANAGE_SYSTEM");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  return await notificationCenterService.getSettings();
}

export async function updateNotificationEventAction(eventKey: string, channels: Partial<EventNotificationConfig>) {
  const permCheck = await verifyActionPermission("MANAGE_SYSTEM");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const res = await notificationCenterService.updateEventSetting(eventKey, channels);
  if (res.success) {
    revalidatePath("/admin/notifications");
  }
  return res;
}
