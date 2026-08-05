"use server";

import { pluginManagerService } from "../services/plugin-manager.service";
import { revalidatePath } from "next/cache";
import { verifyActionPermission } from "./action-utils";
import { returnFailure } from "../result";

export async function getPluginsAction() {
  const permCheck = await verifyActionPermission("MANAGE_SYSTEM");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  return await pluginManagerService.getPlugins();
}

export async function togglePluginAction(pluginKey: string, isEnabled: boolean) {
  const permCheck = await verifyActionPermission("MANAGE_SYSTEM");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }

  const res = await pluginManagerService.togglePlugin(pluginKey, isEnabled);
  if (res.success) {
    revalidatePath("/admin/plugins");
  }
  return res;
}
