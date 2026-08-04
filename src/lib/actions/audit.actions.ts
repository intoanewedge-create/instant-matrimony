"use server";

import { prisma } from "../prisma";
import { returnSuccess, returnFailure } from "../result";

export async function getAuditLogsAction(filters?: { userId?: string; module?: string; action?: string; limit?: number }) {
  try {
    const limit = filters?.limit || 50;
    const where: any = {};
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.module) where.module = filters.module;
    if (filters?.action) where.action = { contains: filters.action, mode: "insensitive" };

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: { name: true, email: true } } },
    });

    return returnSuccess(logs);
  } catch (e: any) {
    return returnFailure(e.message, "GET_AUDIT_LOGS_ERROR");
  }
}
