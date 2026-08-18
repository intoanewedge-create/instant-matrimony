import { Conversation } from "@prisma/client";
import { prisma } from "../prisma";
import { IConversationRepository } from "./interfaces/conversation.repository";

export class PrismaConversationRepository implements IConversationRepository {
  async create(participantUserIds: string[]): Promise<Conversation> {
    return prisma.conversation.create({
      data: {
        participants: {
          create: participantUserIds.map((userId) => ({ userId })),
        },
      },
    });
  }

  async findById(id: string): Promise<Conversation | null> {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              include: { profile: { include: { photos: true } } },
            },
          },
        },
        messages: {
          where: { isDeleted: false },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }) as any;
  }

  async findByParticipants(userIds: string[]): Promise<Conversation | null> {
    if (userIds.length !== 2) return null;
    const [u1, u2] = userIds;
    return prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: u1 } } },
          { participants: { some: { userId: u2 } } },
        ],
      },
      include: {
        participants: true,
      },
    }) as any;
  }

  async findUserConversations(userId: string): Promise<any[]> {
    // Check for any accepted interests for this user to ensure conversations exist
    try {
      const acceptedInterests = await prisma.interest.findMany({
        where: {
          OR: [
            { senderId: userId, status: "ACCEPTED" },
            { receiverId: userId, status: "ACCEPTED" },
          ],
        },
        select: { senderId: true, receiverId: true },
      });

      for (const interest of acceptedInterests) {
        const otherUserId = interest.senderId === userId ? interest.receiverId : interest.senderId;
        const existingConv = await this.findByParticipants([userId, otherUserId]);
        if (!existingConv) {
          await this.create([userId, otherUserId]);
        }
      }
    } catch {
      // Ignore background sync errors to not block main query
    }

    const participantEntries = await prisma.conversationParticipant.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      include: {
        conversation: {
          include: {
            participants: {
              where: {
                userId: { not: userId },
              },
              include: {
                user: {
                  include: { profile: { include: { photos: true } } },
                },
              },
            },
            messages: {
              where: { isDeleted: false },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    return participantEntries
      .map((entry) => {
        const conv = entry.conversation;
        const otherParticipant = conv.participants[0];
        const lastMsg = conv.messages[0];
        if (!otherParticipant) return null;

        const photoUrl = otherParticipant.user.profile?.photos?.find((p) => p.isMain)?.url || otherParticipant.user.image;

        return {
          id: conv.id,
          contactId: otherParticipant.userId,
          partnerId: otherParticipant.userId,
          contactName: otherParticipant.user.name,
          name: otherParticipant.user.name,
          publicId: otherParticipant.user.publicId,
          contactPhoto: photoUrl,
          image: photoUrl,
          lastMessage: lastMsg ? lastMsg.content : "",
          lastMessageAt: lastMsg ? lastMsg.createdAt : conv.updatedAt,
          unreadCount: entry.unreadCount,
          isArchived: entry.isArchived,
          isMuted: entry.isMuted,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b!.lastMessageAt).getTime() - new Date(a!.lastMessageAt).getTime());
  }

  async softDelete(id: string): Promise<Conversation> {
    return prisma.conversation.update({
      where: { id },
      data: { status: "DELETED", deletedAt: new Date() },
    });
  }
}

