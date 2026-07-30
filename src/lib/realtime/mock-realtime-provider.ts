import { IRealtimeProvider, RealtimeMessagePayload } from "./realtime-provider";
import { Result } from "../result";
import { logger } from "../logger";

export class MockRealtimeProvider implements IRealtimeProvider {
  async emitMessage(payload: RealtimeMessagePayload): Promise<Result<boolean>> {
    logger.info(`[MockRealtime] Message sent in ${payload.conversationId} by ${payload.senderId}`);
    return { success: true, data: true };
  }

  async emitTyping(conversationId: string, userId: string, isTyping: boolean): Promise<Result<boolean>> {
    logger.info(`[MockRealtime] ${userId} typing status: ${isTyping} in ${conversationId}`);
    return { success: true, data: true };
  }

  async emitPresence(userId: string, isOnline: boolean, lastSeen?: Date): Promise<Result<boolean>> {
    logger.info(`[MockRealtime] User ${userId} presence: ${isOnline ? "ONLINE" : "OFFLINE"}`);
    return { success: true, data: true };
  }

  async emitReadReceipt(conversationId: string, userId: string, messageId: string): Promise<Result<boolean>> {
    logger.info(`[MockRealtime] Read receipt in ${conversationId} from ${userId} for ${messageId}`);
    return { success: true, data: true };
  }

  async emitDeliveryReceipt(conversationId: string, userId: string, messageId: string): Promise<Result<boolean>> {
    logger.info(`[MockRealtime] Delivery receipt in ${conversationId} from ${userId} for ${messageId}`);
    return { success: true, data: true };
  }

  async emitConversationUpdate(conversationId: string, data: any): Promise<Result<boolean>> {
    logger.info(`[MockRealtime] Conversation update for ${conversationId}: ${JSON.stringify(data)}`);
    return { success: true, data: true };
  }

  async emitMatchNotification(userId: string, matchData: any): Promise<Result<boolean>> {
    logger.info(`[MockRealtime] Match notification sent to ${userId}`);
    return { success: true, data: true };
  }

  async emitAdminNotification(adminId: string, alertData: any): Promise<Result<boolean>> {
    logger.info(`[MockRealtime] Admin notification sent to ${adminId}`);
    return { success: true, data: true };
  }

  async emitLiveModerationEvent(moderatorId: string, eventData: any): Promise<Result<boolean>> {
    logger.info(`[MockRealtime] Live moderation event sent to ${moderatorId}`);
    return { success: true, data: true };
  }

  async emitDashboardRefreshEvent(adminId: string, refreshData: any): Promise<Result<boolean>> {
    logger.info(`[MockRealtime] Dashboard refresh event sent to ${adminId}`);
    return { success: true, data: true };
  }

  async getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }> {
    return { status: "UP", latencyMs: 1 };
  }
}
