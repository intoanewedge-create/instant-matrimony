"use server";

import { pluginManagerService } from "../services/plugin-manager.service";
import { revalidatePath } from "next/cache";

export async function getPluginsAction() {
  return await pluginManagerService.getPlugins();
}

export async function togglePluginAction(pluginKey: string, isEnabled: boolean) {
  const res = await pluginManagerService.togglePlugin(pluginKey, isEnabled);
  if (res.success) {
    revalidatePath("/admin/plugins");
  }
  return res;
}
