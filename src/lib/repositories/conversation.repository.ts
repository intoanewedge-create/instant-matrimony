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
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return null;

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
    const participantEntries = await prisma.conversationParticipant.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      select: {
        unreadCount: true,
        isArchived: true,
        isMuted: true,
        conversation: {
          select: {
            id: true,
            updatedAt: true,
            participants: {
              where: {
                userId: { not: userId },
              },
              select: {
                userId: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    publicId: true,
                    profile: {
                      select: {
                        photos: {
                          where: { deletedAt: null },
                          select: { url: true, isMain: true },
                          take: 2,
                        },
                      },
                    },
                  },
                },
              },
            },
            messages: {
              where: { isDeleted: false },
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                content: true,
                createdAt: true,
              },
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
        if (!otherParticipant?.user) return null;

        const photoUrl =
          otherParticipant.user.profile?.photos?.find((p) => p.isMain)?.url ||
          otherParticipant.user.profile?.photos?.[0]?.url ||
          otherParticipant.user.image ||
          null;

        return {
          id: conv.id,
          contactId: otherParticipant.userId,
          partnerId: otherParticipant.userId,
          contactName: otherParticipant.user.name || "Member",
          name: otherParticipant.user.name || "Member",
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

