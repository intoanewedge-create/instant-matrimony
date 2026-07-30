import { UserSessionHistory } from "@prisma/client";
import { prisma } from "../prisma";
import { IUserSessionHistoryRepository } from "./interfaces/user-session-history.repository";

export class PrismaUserSessionHistoryRepository implements IUserSessionHistoryRepository {
  async logLogin(userId: string, data: { ipAddress?: string; userAgent?: string; deviceName?: string }): Promise<UserSessionHistory> {
    return prisma.userSessionHistory.create({
      data: {
        userId,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        deviceName: data.deviceName || null,
        loginAt: new Date(),
      },
    });
  }

  async logLogout(id: string): Promise<UserSessionHistory> {
    return prisma.userSessionHistory.update({
      where: { id },
      data: {
        logoutAt: new Date(),
      },
    });
  }

  async revokeSession(id: string): Promise<UserSessionHistory> {
    return prisma.userSessionHistory.update({
      where: { id },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async getUserSessions(userId: string): Promise<UserSessionHistory[]> {
    return prisma.userSessionHistory.findMany({
      where: { userId },
      orderBy: { loginAt: "desc" },
      take: 20,
    });
  }
}
