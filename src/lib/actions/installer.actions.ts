"use server";

import { setupWizardService, SetupWizardData } from "../services/setup-wizard.service";
import { revalidatePath } from "next/cache";

export async function isSystemInstalledAction() {
  return await setupWizardService.isInstalled();
}

export async function runSetupWizardAction(data: SetupWizardData) {
  const res = await setupWizardService.runSetup(data);
  if (res.success) {
    revalidatePath("/", "layout");
  }
  return res;
}
