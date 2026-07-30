import { PasswordHistory } from "@prisma/client";
import { prisma } from "../prisma";
import { IPasswordHistoryRepository } from "./interfaces/password-history.repository";

export class PrismaPasswordHistoryRepository implements IPasswordHistoryRepository {
  async create(userId: string, hash: string, tx?: any): Promise<PasswordHistory> {
    const db = tx || prisma;
    return db.passwordHistory.create({
      data: {
        userId,
        password: hash,
      },
    });
  }

  async getByUserId(userId: string, limit: number): Promise<PasswordHistory[]> {
    return prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async deleteOldest(userId: string, keepCount: number, tx?: any): Promise<void> {
    const db = tx || prisma;
    const records = await db.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (records.length > keepCount) {
      const idsToDelete = records.slice(keepCount).map((r: any) => r.id);
      await db.passwordHistory.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    }
  }
}
