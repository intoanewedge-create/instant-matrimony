import { IdentityVerification } from "@prisma/client";
import { prisma } from "../prisma";
import { BaseRepository } from "./base.repository";
import { IVerificationRepository } from "./interfaces/verification.repository";

export class PrismaVerificationRepository extends BaseRepository<IdentityVerification> implements IVerificationRepository {
  protected modelDelegate = prisma.identityVerification;

  async findByUserId(userId: string): Promise<IdentityVerification | null> {
    return prisma.identityVerification.findFirst({
      where: { userId, deletedAt: null },
      include: { documentMedia: true, selfieMedia: true },
    });
  }

  async findPendingQueue(): Promise<IdentityVerification[]> {
    return prisma.identityVerification.findMany({
      where: { status: "PENDING", deletedAt: null },
      include: { user: true, documentMedia: true, selfieMedia: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async findHistory(): Promise<IdentityVerification[]> {
    return prisma.identityVerification.findMany({
      where: {
        status: { in: ["APPROVED", "REJECTED", "RE_UPLOAD"] },
        deletedAt: null,
      },
      include: { user: true, documentMedia: true, selfieMedia: true },
      orderBy: { updatedAt: "desc" },
    });
  }
}
