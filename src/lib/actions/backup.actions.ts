"use server";

import { backupRestoreService } from "../services/backup-restore.service";
import { revalidatePath } from "next/cache";

export async function createBackupAction(type: "FULL" | "CMS" | "SETTINGS" = "FULL") {
  const res = await backupRestoreService.createBackup(type);
  if (res.success) {
    revalidatePath("/admin/backups");
  }
  return res;
}

export async function listBackupsAction() {
  return await backupRestoreService.listBackups();
}

export async function restoreBackupAction(backupId: string) {
  const res = await backupRestoreService.restoreBackup(backupId);
  if (res.success) {
    revalidatePath("/admin/backups");
  }
  return res;
}
