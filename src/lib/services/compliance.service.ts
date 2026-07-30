import { BaseService } from "./base.service";
import { Result } from "../result";
import { logger } from "../logger";

export interface UserConsent {
  termsAccepted: boolean;
  marketingAccepted: boolean;
  analyticsAccepted: boolean;
  updatedAt: Date;
}

/**
 * Enterprise Compliance & Data Governance Service.
 * Manages GDPR/CCPA user data exports, erasure policies,
 * user consent tracking, and personally identifiable information (PII) masking.
 */
export class ComplianceService extends BaseService {
  private legalHolds = new Set<string>();
  private userConsents = new Map<string, UserConsent>();

  /**
   * Masks sensitive Personally Identifiable Information (PII) like email, phone, and IP addresses.
   *
   * @param data - The data object containing PII.
   * @returns A copy of the object with PII fields masked.
   */
  public maskPII(data: any): any {
    if (!data) return data;
    const masked = { ...data };

    if (masked.email) {
      const [local, domain] = masked.email.split("@");
      masked.email = local.length > 2
        ? `${local.substring(0, 2)}***@${domain}`
        : `***@${domain}`;
    }

    if (masked.phone) {
      masked.phone = masked.phone.replace(/(\d{3})\d+(\d{3})/, "$1****$2");
    }

    if (masked.ipAddress) {
      masked.ipAddress = "xxx.xxx.xxx.xxx";
    }

    return masked;
  }

  /**
   * Exports all user records for GDPR Portability requests.
   */
  public async exportUserData(userId: string): Promise<Result<any>> {
    logger.info(`[ComplianceService] Processing GDPR data export request for user: ${userId}`);
    
    // Simulate user aggregate data gathering
    const data = {
      userId,
      profile: { fullName: "John Doe", birthDate: "1990-01-01" },
      contact: { email: "john@example.com", phone: "+123456789" },
      exportedAt: new Date()
    };

    return this.returnSuccess(data);
  }

  /**
   * Executes GDPR Right to be Forgotten (Account Erasure).
   * Will reject if the user account is on a Legal Hold.
   */
  public async deleteUserData(userId: string): Promise<Result<boolean>> {
    logger.info(`[ComplianceService] Processing GDPR deletion request for user: ${userId}`);

    if (this.legalHolds.has(userId)) {
      logger.error(`[ComplianceService] Cannot delete user data: ${userId} is under a LEGAL HOLD.`);
      return this.returnFailure("User data cannot be deleted due to an active legal hold.", "LEGAL_HOLD_ACTIVE");
    }

    // Simulate database record purging
    logger.info(`[ComplianceService] User data purged from user, profile, messages, and payments tables: ${userId}`);
    return this.returnSuccess(true);
  }

  /**
   * Toggles legal hold state to protect data from purge operations.
   */
  public toggleLegalHold(userId: string, active: boolean): void {
    if (active) {
      this.legalHolds.add(userId);
      logger.warn(`[ComplianceService] Legal hold PLACED on user: ${userId}`);
    } else {
      this.legalHolds.delete(userId);
      logger.info(`[ComplianceService] Legal hold REMOVED from user: ${userId}`);
    }
  }

  /**
   * Updates consent preferences.
   */
  public trackConsent(userId: string, consents: Partial<UserConsent>): void {
    const existing = this.userConsents.get(userId) || {
      termsAccepted: true,
      marketingAccepted: false,
      analyticsAccepted: false,
      updatedAt: new Date()
    };

    const updated = {
      ...existing,
      ...consents,
      updatedAt: new Date()
    };

    this.userConsents.set(userId, updated);
    logger.info(`[ComplianceService] Updated consents for user ${userId}: ${JSON.stringify(updated)}`);
  }

  /**
   * Gets user consent preferences.
   */
  public getConsent(userId: string): UserConsent | null {
    return this.userConsents.get(userId) || null;
  }
}
export const complianceService = new ComplianceService();
export default complianceService;
