import { prisma } from "../prisma";
import { Result, returnSuccess, returnFailure } from "../result";
import fs from "fs";
import path from "path";

export class BackupRestoreService {
  private backupDir = path.join(process.cwd(), "scratch", "backups");

  private ensureDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup(type: "FULL" | "CMS" | "SETTINGS" = "FULL"): Promise<Result<any>> {
    try {
      this.ensureDir();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `backup-${type.toLowerCase()}-${timestamp}.json`;
      const filePath = path.join(this.backupDir, fileName);

      const backupData: any = {};

      if (type === "FULL" || type === "SETTINGS") {
        backupData.siteSettings = await prisma.siteSettings.findMany();
      }
      if (type === "FULL" || type === "CMS") {
        backupData.cmsPages = await prisma.cmsPage.findMany();
        backupData.faqs = await prisma.fAQ.findMany();
        backupData.banners = await prisma.banner.findMany();
        backupData.testimonials = await prisma.testimonial.findMany();
        backupData.successStories = await prisma.successStory.findMany();
        backupData.blogPosts = await prisma.blogPost.findMany();
      }

      const jsonStr = JSON.stringify(backupData, null, 2);
      fs.writeFileSync(filePath, jsonStr, "utf8");

      const record = await prisma.backupRecord.create({
        data: {
          fileName,
          fileSize: Buffer.byteLength(jsonStr),
          backupType: type,
          filePath,
        },
      });

      return returnSuccess(record);
    } catch (e: any) {
      return returnFailure(e.message, "CREATE_BACKUP_ERROR");
    }
  }

  async listBackups(): Promise<Result<any[]>> {
    try {
      const backups = await prisma.backupRecord.findMany({ orderBy: { createdAt: "desc" } });
      return returnSuccess(backups);
    } catch (e: any) {
      return returnFailure(e.message, "LIST_BACKUPS_ERROR");
    }
  }

  async restoreBackup(backupId: string): Promise<Result<void>> {
    try {
      const record = await prisma.backupRecord.findUnique({ where: { id: backupId } });
      if (!record || !fs.existsSync(record.filePath)) {
        return returnFailure("Backup file not found", "BACKUP_FILE_NOT_FOUND");
      }

      const raw = fs.readFileSync(record.filePath, "utf8");
      const data = JSON.parse(raw);

      if (data.siteSettings) {
        for (const s of data.siteSettings) {
          await prisma.siteSettings.upsert({
            where: { key: s.key },
            update: { value: s.value },
            create: { key: s.key, value: s.value },
          });
        }
      }

      return returnSuccess(undefined);
    } catch (e: any) {
      return returnFailure(e.message, "RESTORE_BACKUP_ERROR");
    }
  }
}

export const backupRestoreService = new BackupRestoreService();
