import { BaseService } from "./base.service";
import { Result } from "../result";
import { IUserSessionHistoryRepository } from "../repositories/interfaces/user-session-history.repository";
import { loggerService } from "./logger.service";

export class SessionSecurityService extends BaseService {
  constructor(private sessionHistoryRepository: IUserSessionHistoryRepository) {
    super();
  }

  async getActiveSessions(userId: string): Promise<Result<any[]>> {
    try {
      const histories = await this.sessionHistoryRepository.getUserSessions(userId);
      const active = histories.filter((h) => !h.logoutAt && !h.revokedAt);
      return this.returnSuccess(active);
    } catch (e: any) {
      loggerService.error("Error retrieving active sessions", { userId }, e);
      return this.returnFailure(e.message, "SESSION_RETRIEVAL_ERROR");
    }
  }

  async revokeSession(sessionId: string, userId: string): Promise<Result<boolean>> {
    try {
      const sessions = await this.sessionHistoryRepository.getUserSessions(userId);
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) {
        return this.returnFailure("Session not found or access denied.", "SESSION_NOT_FOUND");
      }

      await this.sessionHistoryRepository.revokeSession(sessionId);
      loggerService.info("User session revoked", { sessionId, userId });
      return this.returnSuccess(true);
    } catch (e: any) {
      loggerService.error("Error revoking session", { sessionId, userId }, e);
      return this.returnFailure(e.message, "SESSION_REVOCATION_ERROR");
    }
  }

  async revokeAllSessions(userId: string): Promise<Result<boolean>> {
    try {
      const activeResult = await this.getActiveSessions(userId);
      if (!activeResult.success || !activeResult.data) {
        return this.returnFailure(activeResult.error || "Failed to get active sessions", activeResult.code);
      }

      for (const session of activeResult.data) {
        await this.sessionHistoryRepository.revokeSession(session.id);
      }
      loggerService.info("All active sessions revoked for user", { userId });
      return this.returnSuccess(true);
    } catch (e: any) {
      loggerService.error("Error revoking all sessions", { userId }, e);
      return this.returnFailure(e.message, "ALL_SESSIONS_REVOCATION_ERROR");
    }
  }
}
