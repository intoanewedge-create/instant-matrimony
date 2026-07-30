import { Conversation } from "@prisma/client";

export interface IConversationRepository {
  create(participantUserIds: string[]): Promise<Conversation>;
  findById(id: string): Promise<Conversation | null>;
  findByParticipants(userIds: string[]): Promise<Conversation | null>;
  findUserConversations(userId: string): Promise<any[]>;
  softDelete(id: string): Promise<Conversation>;
}
