"use server";

import { backupRestoreService } from "../services/backup-restore.service";
import { revalidatePath } from "next/cache";
import { verifyActionPermission } from "./action-utils";
import { returnFailure } from "../result";

export async function createBackupAction(type: "FULL" | "CMS" | "SETTINGS" = "FULL") {
  const permCheck = await verifyActionPermission("MANAGE_SYSTEM");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const res = await backupRestoreService.createBackup(type);
  if (res.success) {
    revalidatePath("/admin/backups");
  }
  return res;
}

export async function listBackupsAction() {
  const permCheck = await verifyActionPermission("MANAGE_SYSTEM");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  return await backupRestoreService.listBackups();
}

export async function restoreBackupAction(backupId: string) {
  const permCheck = await verifyActionPermission("MANAGE_SYSTEM");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const res = await backupRestoreService.restoreBackup(backupId);
  if (res.success) {
    revalidatePath("/admin/backups");
  }
  return res;
}
