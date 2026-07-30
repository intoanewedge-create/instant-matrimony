import { AuditLog } from "@prisma/client";
import { prisma } from "../prisma";
import { IAuditRepository } from "./interfaces/audit.repository";

export class PrismaAuditRepository implements IAuditRepository {
  protected modelDelegate = prisma.auditLog;

  async create(
    userId: string | null,
    action: string,
    ipAddress?: string,
    userAgent?: string,
    details?: string,
    tx?: any
  ): Promise<AuditLog> {
    const db = tx || prisma;
    return db.auditLog.create({
      data: {
        userId,
        action,
        ipAddress,
        userAgent,
        details,
      },
    }) as any;
  }

  async findLogs(params: { userId?: string; action?: string; cursor?: string; limit: number }): Promise<AuditLog[]> {
    const { userId, action, cursor, limit } = params;
    return prisma.auditLog.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(action ? { action } : {}),
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }
}
