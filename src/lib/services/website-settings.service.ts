import { prisma } from "../prisma";
import { Result, returnSuccess, returnFailure } from "../result";

export interface SystemBrandingSettings {
  websiteName: string;
  companyName: string;
  logo: string;
  darkLogo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  successColor: string;
  warningColor: string;
  dangerColor: string;
  borderRadius: string;
  fontFamily: string;
  contactNumber: string;
  whatsappNumber: string;
  paymentNumber: string;
  emailAddress: string;
  officeAddress: string;
  googleMapsUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  seoTitle: string;
  seoDescription: string;
  metaKeywords: string;
  ogImage: string;
  footerContent: string;
  copyrightText: string;
  timeZone: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  defaultLanguage: string;
  isInstalled: boolean;
}

export const DEFAULT_BRANDING_SETTINGS: SystemBrandingSettings = {
  websiteName: "InstantMatrimony",
  companyName: "చైతన్య",
  logo: "/InstantMatrimony-Logo.jpeg",
  darkLogo: "/InstantMatrimony-Logo.jpeg",
  favicon: "/favicon.ico",
  primaryColor: "#e11d48", // Rose-600
  secondaryColor: "#4f46e5", // Indigo-600
  successColor: "#16a34a", // Green-600
  warningColor: "#d97706", // Amber-600
  dangerColor: "#dc2626", // Red-600
  borderRadius: "0.5rem",
  fontFamily: "Inter, sans-serif",
  contactNumber: "8885678080",
  whatsappNumber: "8885678080",
  paymentNumber: "9000906292",
  emailAddress: "support@instantmatrimony.com",
  officeAddress: "గుంటూరు district, ఆంధ్ర ప్రదేశ్",
  googleMapsUrl: "https://maps.google.com",
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  twitterUrl: "https://x.com",
  linkedinUrl: "https://linkedin.com",
  youtubeUrl: "https://youtube.com",
  seoTitle: "InstantMatrimony - Find Your Perfect Life Partner",
  seoDescription: "The premier enterprise matrimony platform connecting souls worldwide with privacy and speed.",
  metaKeywords: "matrimony, marriage, match, bride, groom, matchmaking, instant matrimony",
  ogImage: "/InstantMatrimony-Logo.jpeg",
  footerContent: "Empowering families and individuals to find trusted matches securely.",
  copyrightText: "© 2026 InstantMatrimony Tech. All rights reserved.",
  timeZone: "Asia/Kolkata",
  currency: "INR",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "12H",
  defaultLanguage: "en",
  isInstalled: false,
};

export class WebsiteSettingsService {
  async getSettings(): Promise<Result<SystemBrandingSettings>> {
    try {
      const records = await prisma.siteSettings.findMany();
      const settingsMap: Record<string, string> = {};
      for (const rec of records) {
        settingsMap[rec.key] = rec.value;
      }

      const settings: SystemBrandingSettings = {
        websiteName: settingsMap.websiteName || DEFAULT_BRANDING_SETTINGS.websiteName,
        companyName: settingsMap.companyName || DEFAULT_BRANDING_SETTINGS.companyName,
        logo: settingsMap.logo || DEFAULT_BRANDING_SETTINGS.logo,
        darkLogo: settingsMap.darkLogo || DEFAULT_BRANDING_SETTINGS.darkLogo,
        favicon: settingsMap.favicon || DEFAULT_BRANDING_SETTINGS.favicon,
        primaryColor: settingsMap.primaryColor || DEFAULT_BRANDING_SETTINGS.primaryColor,
        secondaryColor: settingsMap.secondaryColor || DEFAULT_BRANDING_SETTINGS.secondaryColor,
        successColor: settingsMap.successColor || DEFAULT_BRANDING_SETTINGS.successColor,
        warningColor: settingsMap.warningColor || DEFAULT_BRANDING_SETTINGS.warningColor,
        dangerColor: settingsMap.dangerColor || DEFAULT_BRANDING_SETTINGS.dangerColor,
        borderRadius: settingsMap.borderRadius || DEFAULT_BRANDING_SETTINGS.borderRadius,
        fontFamily: settingsMap.fontFamily || DEFAULT_BRANDING_SETTINGS.fontFamily,
        contactNumber: settingsMap.contactNumber || DEFAULT_BRANDING_SETTINGS.contactNumber,
        whatsappNumber: settingsMap.whatsappNumber || DEFAULT_BRANDING_SETTINGS.whatsappNumber,
        paymentNumber: settingsMap.paymentNumber || DEFAULT_BRANDING_SETTINGS.paymentNumber,
        emailAddress: settingsMap.emailAddress || DEFAULT_BRANDING_SETTINGS.emailAddress,
        officeAddress: settingsMap.officeAddress || DEFAULT_BRANDING_SETTINGS.officeAddress,
        googleMapsUrl: settingsMap.googleMapsUrl || DEFAULT_BRANDING_SETTINGS.googleMapsUrl,
        facebookUrl: settingsMap.facebookUrl || DEFAULT_BRANDING_SETTINGS.facebookUrl,
        instagramUrl: settingsMap.instagramUrl || DEFAULT_BRANDING_SETTINGS.instagramUrl,
        twitterUrl: settingsMap.twitterUrl || DEFAULT_BRANDING_SETTINGS.twitterUrl,
        linkedinUrl: settingsMap.linkedinUrl || DEFAULT_BRANDING_SETTINGS.linkedinUrl,
        youtubeUrl: settingsMap.youtubeUrl || DEFAULT_BRANDING_SETTINGS.youtubeUrl,
        seoTitle: settingsMap.seoTitle || DEFAULT_BRANDING_SETTINGS.seoTitle,
        seoDescription: settingsMap.seoDescription || DEFAULT_BRANDING_SETTINGS.seoDescription,
        metaKeywords: settingsMap.metaKeywords || DEFAULT_BRANDING_SETTINGS.metaKeywords,
        ogImage: settingsMap.ogImage || DEFAULT_BRANDING_SETTINGS.ogImage,
        footerContent: settingsMap.footerContent || DEFAULT_BRANDING_SETTINGS.footerContent,
        copyrightText: settingsMap.copyrightText || DEFAULT_BRANDING_SETTINGS.copyrightText,
        timeZone: settingsMap.timeZone || DEFAULT_BRANDING_SETTINGS.timeZone,
        currency: settingsMap.currency || DEFAULT_BRANDING_SETTINGS.currency,
        dateFormat: settingsMap.dateFormat || DEFAULT_BRANDING_SETTINGS.dateFormat,
        timeFormat: settingsMap.timeFormat || DEFAULT_BRANDING_SETTINGS.timeFormat,
        defaultLanguage: settingsMap.defaultLanguage || DEFAULT_BRANDING_SETTINGS.defaultLanguage,
        isInstalled: settingsMap.isInstalled === "true",
      };

      return returnSuccess(settings);
    } catch (e: any) {
      return returnFailure(e.message, "SETTINGS_GET_ERROR");
    }
  }

  async updateSettings(newSettings: Partial<SystemBrandingSettings>): Promise<Result<SystemBrandingSettings>> {
    try {
      const entries = Object.entries(newSettings);
      for (const [key, value] of entries) {
        if (value !== undefined) {
          const strVal = String(value);
          await prisma.siteSettings.upsert({
            where: { key },
            update: { value: strVal },
            create: { key, value: strVal },
          });
        }
      }
      return await this.getSettings();
    } catch (e: any) {
      return returnFailure(e.message, "SETTINGS_UPDATE_ERROR");
    }
  }
}

export const websiteSettingsService = new WebsiteSettingsService();
