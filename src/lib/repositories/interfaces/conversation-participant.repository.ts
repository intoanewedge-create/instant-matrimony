import { ConversationParticipant } from "@prisma/client";

export interface IConversationParticipantRepository {
  findById(id: string): Promise<ConversationParticipant | null>;
  findParticipant(conversationId: string, userId: string): Promise<ConversationParticipant | null>;
  update(conversationId: string, userId: string, data: any): Promise<ConversationParticipant>;
  incrementUnreadCount(conversationId: string, excludeUserId: string): Promise<void>;
  resetUnreadCount(conversationId: string, userId: string): Promise<void>;
}
