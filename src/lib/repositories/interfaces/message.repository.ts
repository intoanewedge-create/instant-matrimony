import { Message } from "@prisma/client";

export interface IMessageRepository {
  create(senderId: string, receiverId: string, content: string, conversationId?: string, attachmentMediaIds?: string[]): Promise<Message>;
  findChatMessages(userId: string, contactId: string, cursor?: string, limit?: number): Promise<Message[]>;
  findConversations(userId: string): Promise<any[]>;
  markAsRead(senderId: string, receiverId: string): Promise<void>;
  findById(id: string): Promise<Message | null>;
  softDelete(id: string): Promise<Message>;
  update(id: string, data: any): Promise<Message>;
  
  findConversationMessages(conversationId: string, cursor?: string, limit?: number): Promise<Message[]>;
  markAsDelivered(conversationId: string, userId: string): Promise<void>;
  searchMessages(conversationId: string, query: string): Promise<Message[]>;
}
