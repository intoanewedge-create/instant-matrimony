import { prisma } from "../prisma";
import { Result, returnSuccess, returnFailure } from "../result";
import { websiteSettingsService } from "./website-settings.service";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export interface SetupWizardData {
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  websiteName: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  primaryColor: string;
  currency: string;
}

export class SetupWizardService {
  async isInstalled(): Promise<boolean> {
    try {
      const rec = await prisma.siteSettings.findUnique({ where: { key: "isInstalled" } });
      return rec?.value === "true";
    } catch {
      return false;
    }
  }

  async runSetup(data: SetupWizardData): Promise<Result<void>> {
    try {
      if (await this.isInstalled()) {
        return returnFailure("System is already configured and locked.", "ALREADY_INSTALLED");
      }

      // Strong password validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&()_\-+=\[\]{}|\\:;"'<>,.?\/~`])[A-Za-z\d@$!%*?&()_\-+=\[\]{}|\\:;"'<>,.?\/~`]{12,}$/;
      if (!passwordRegex.test(data.adminPassword)) {
        return returnFailure(
          "Admin password must be at least 12 characters and include uppercase, lowercase, numbers, and special characters.",
          "WEAK_PASSWORD"
        );
      }

      // 1. Create or update Super Admin user
      const passwordHash = await bcrypt.hash(data.adminPassword, 10);
      await prisma.user.upsert({
        where: { email: data.adminEmail },
        update: {
          name: data.adminName,
          password: passwordHash,
          role: Role.SUPER_ADMIN,
          isActive: true,
          isEmailVerified: true,
        },
        create: {
          email: data.adminEmail,
          name: data.adminName,
          password: passwordHash,
          role: Role.SUPER_ADMIN,
          isActive: true,
          isEmailVerified: true,
        },
      });

      // 2. Save site branding & configuration
      await websiteSettingsService.updateSettings({
        websiteName: data.websiteName,
        companyName: data.companyName,
        emailAddress: data.contactEmail,
        contactNumber: data.contactPhone,
        primaryColor: data.primaryColor,
        currency: data.currency,
        isInstalled: true,
      });

      return returnSuccess(undefined);
    } catch (e: any) {
      return returnFailure(e.message, "SETUP_WIZARD_ERROR");
    }
  }
}

export const setupWizardService = new SetupWizardService();
