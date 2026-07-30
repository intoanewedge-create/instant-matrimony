import { UserSessionHistory } from "@prisma/client";

export interface IUserSessionHistoryRepository {
  logLogin(userId: string, data: { ipAddress?: string; userAgent?: string; deviceName?: string }): Promise<UserSessionHistory>;
  logLogout(id: string): Promise<UserSessionHistory>;
  revokeSession(id: string): Promise<UserSessionHistory>;
  getUserSessions(userId: string): Promise<UserSessionHistory[]>;
}
