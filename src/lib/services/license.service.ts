import { prisma } from "../prisma";
import { Result, returnSuccess, returnFailure } from "../result";

export class LicenseService {
  async getLicenseInfo(): Promise<Result<any>> {
    try {
      let license = await prisma.license.findFirst();
      if (!license) {
        license = await prisma.license.create({
          data: {
            licenseKey: "IM-COMMERCIAL-ENTERPRISE-2026-UNLIMITED",
            customerName: "Enterprise Commercial Client",
            company: "White-Label Partner",
            domain: "localhost",
            version: "2.0.0-ENTERPRISE",
            expiryDate: new Date(Date.now() + 365 * 10 * 86400000), // 10 years
            supportExpiry: new Date(Date.now() + 365 * 86400000),
            status: "ACTIVE",
          },
        });
      }
      return returnSuccess(license);
    } catch (e: any) {
      return returnFailure(e.message, "GET_LICENSE_ERROR");
    }
  }
}

export const licenseService = new LicenseService();
