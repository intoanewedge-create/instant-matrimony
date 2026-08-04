"use me";
"use server";

import { websiteSettingsService, SystemBrandingSettings } from "../services/website-settings.service";
import { revalidatePath } from "next/cache";

export async function getSettingsAction() {
  return await websiteSettingsService.getSettings();
}

export async function updateSettingsAction(data: Partial<SystemBrandingSettings>) {
  const res = await websiteSettingsService.updateSettings(data);
  if (res.success) {
    revalidatePath("/", "layout");
  }
  return res;
}
