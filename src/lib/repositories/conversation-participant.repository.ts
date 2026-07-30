import { ConversationParticipant } from "@prisma/client";
import { prisma } from "../prisma";
import { IConversationParticipantRepository } from "./interfaces/conversation-participant.repository";

export class PrismaConversationParticipantRepository implements IConversationParticipantRepository {
  async findById(id: string): Promise<ConversationParticipant | null> {
    return prisma.conversationParticipant.findUnique({ where: { id } });
  }

  async findParticipant(conversationId: string, userId: string): Promise<ConversationParticipant | null> {
    return prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });
  }

  async update(conversationId: string, userId: string, data: any): Promise<ConversationParticipant> {
    return prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      data,
    });
  }

  async incrementUnreadCount(conversationId: string, excludeUserId: string): Promise<void> {
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: { not: excludeUserId },
      },
      data: {
        unreadCount: { increment: 1 },
      },
    });
  }

  async resetUnreadCount(conversationId: string, userId: string): Promise<void> {
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        unreadCount: 0,
      },
    });
  }
}
