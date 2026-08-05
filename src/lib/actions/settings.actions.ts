"use server";

import { websiteSettingsService, SystemBrandingSettings } from "../services/website-settings.service";
import { revalidatePath } from "next/cache";
import { verifyActionPermission } from "./action-utils";
import { returnFailure } from "../result";

export async function getSettingsAction() {
  return await websiteSettingsService.getSettings();
}

export async function updateSettingsAction(data: Partial<SystemBrandingSettings>) {
  const permCheck = await verifyActionPermission("MANAGE_SYSTEM");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }

  const res = await websiteSettingsService.updateSettings(data);
  if (res.success) {
    revalidatePath("/", "layout");
  }
  return res;
}
