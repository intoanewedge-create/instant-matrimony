import { BaseService } from "./base.service";
import { Result } from "../result";
import { IdentityVerification, DocumentType, VerificationStatus } from "@prisma/client";
import { IVerificationRepository } from "../repositories/interfaces/verification.repository";
import { eventDispatcher } from "../events/event-dispatcher";

export class VerificationService extends BaseService {
  constructor(private verificationRepository: IVerificationRepository) {
    super();
  }

  async getVerificationByUserId(userId: string): Promise<Result<IdentityVerification | null>> {
    try {
      const verification = await this.verificationRepository.findByUserId(userId);
      return this.returnSuccess(verification);
    } catch (e: any) {
      return this.returnFailure(`Failed to fetch verification status: ${e.message}`);
    }
  }

  async submitVerification(
    userId: string,
    data: { documentType: DocumentType; documentMediaId: string; selfieMediaId: string }
  ): Promise<Result<IdentityVerification>> {
    try {
      const existing = await this.verificationRepository.findByUserId(userId);
      
      let verification: IdentityVerification;
      if (existing) {
        verification = await this.verificationRepository.update(existing.id, {
          status: VerificationStatus.PENDING,
          documentType: data.documentType,
          documentMediaId: data.documentMediaId,
          selfieMediaId: data.selfieMediaId,
          rejectionReason: null,
          verifiedAt: null,
          verifiedById: null,
        });
      } else {
        verification = await this.verificationRepository.create({
          userId,
          status: VerificationStatus.PENDING,
          documentType: data.documentType,
          documentMediaId: data.documentMediaId,
          selfieMediaId: data.selfieMediaId,
        });
      }

      await eventDispatcher.publish("VerificationSubmitted", {
        verificationId: verification.id,
        userId,
        documentType: data.documentType,
      });

      return this.returnSuccess(verification);
    } catch (e: any) {
      return this.returnFailure(`Verification submission failed: ${e.message}`, "VERIFICATION_SUBMIT_ERROR");
    }
  }
}
