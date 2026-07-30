import { VerificationOtp } from "@prisma/client";

export interface IVerificationOtpRepository {
  findLatest(target: string, purpose: string): Promise<VerificationOtp | null>;
  create(data: { target: string; purpose: string; hashedCode: string; expiresAt: Date }): Promise<VerificationOtp>;
  incrementAttempts(id: string): Promise<VerificationOtp>;
  markAsVerified(id: string): Promise<VerificationOtp>;
}
