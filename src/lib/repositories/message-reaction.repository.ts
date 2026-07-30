import { MessageReaction } from "@prisma/client";
import { prisma } from "../prisma";
import { IMessageReactionRepository } from "./interfaces/message-reaction.repository";

export class PrismaMessageReactionRepository implements IMessageReactionRepository {
  async upsert(messageId: string, userId: string, reaction: string): Promise<MessageReaction> {
    return prisma.messageReaction.upsert({
      where: {
        messageId_userId_reaction: { messageId, userId, reaction },
      },
      create: {
        messageId,
        userId,
        reaction,
      },
      update: {
        reaction,
      },
    });
  }

  async delete(messageId: string, userId: string, reaction: string): Promise<void> {
    await prisma.messageReaction.deleteMany({
      where: {
        messageId,
        userId,
        reaction,
      },
    });
  }

  async findByMessageId(messageId: string): Promise<MessageReaction[]> {
    return prisma.messageReaction.findMany({
      where: { messageId },
    });
  }
}
