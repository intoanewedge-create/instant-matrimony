import { Result } from "../result";

export interface RealtimeMessagePayload {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageId: string;
  createdAt: Date;
  attachments?: any[];
}

/**
 * Interface representing the enterprise Real-Time Communication Provider.
 * Allows emitting presence updates, typing signals, message events, notifications,
 * and operations center events.
 */
export interface IRealtimeProvider {
  emitMessage(payload: RealtimeMessagePayload): Promise<Result<boolean>>;
  emitTyping(conversationId: string, userId: string, isTyping: boolean): Promise<Result<boolean>>;
  emitPresence(userId: string, isOnline: boolean, lastSeen?: Date): Promise<Result<boolean>>;
  emitReadReceipt(conversationId: string, userId: string, messageId: string): Promise<Result<boolean>>;
  emitDeliveryReceipt(conversationId: string, userId: string, messageId: string): Promise<Result<boolean>>;
  emitConversationUpdate(conversationId: string, data: any): Promise<Result<boolean>>;
  emitMatchNotification(userId: string, matchData: any): Promise<Result<boolean>>;
  emitAdminNotification(adminId: string, alertData: any): Promise<Result<boolean>>;
  emitLiveModerationEvent(moderatorId: string, eventData: any): Promise<Result<boolean>>;
  emitDashboardRefreshEvent(adminId: string, refreshData: any): Promise<Result<boolean>>;
  
  /**
   * Health status reporting method for the provider.
   */
  getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }>;
}

// Retain legacy RealtimeProvider name as type alias for container wiring backward compatibility
export type RealtimeProvider = IRealtimeProvider;
