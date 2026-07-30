import { VerificationOtp } from "@prisma/client";
import { prisma } from "../prisma";
import { IVerificationOtpRepository } from "./interfaces/verification-otp.repository";

export class PrismaVerificationOtpRepository implements IVerificationOtpRepository {
  async findLatest(target: string, purpose: string): Promise<VerificationOtp | null> {
    return prisma.verificationOtp.findFirst({
      where: { target, purpose },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: { target: string; purpose: string; hashedCode: string; expiresAt: Date }): Promise<VerificationOtp> {
    return prisma.verificationOtp.create({
      data: {
        target: data.target,
        purpose: data.purpose,
        hashedCode: data.hashedCode,
        expiresAt: data.expiresAt,
        attempts: 0,
        verified: false,
      },
    });
  }

  async incrementAttempts(id: string): Promise<VerificationOtp> {
    return prisma.verificationOtp.update({
      where: { id },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });
  }

  async markAsVerified(id: string): Promise<VerificationOtp> {
    return prisma.verificationOtp.update({
      where: { id },
      data: {
        verified: true,
      },
    });
  }
}
