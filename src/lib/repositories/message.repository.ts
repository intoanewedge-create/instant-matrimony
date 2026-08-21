import { Message } from "@prisma/client";
import { prisma } from "../prisma";
import { IMessageRepository } from "./interfaces/message.repository";

export class PrismaMessageRepository implements IMessageRepository {
  protected modelDelegate = prisma.message;

  async create(senderId: string, receiverId: string, content: string, conversationId?: string, attachmentMediaIds?: string[]): Promise<Message> {
    return prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        conversationId,
        attachments: attachmentMediaIds ? {
          connect: attachmentMediaIds.map((id) => ({ id })),
        } : undefined,
      },
      include: {
        attachments: true,
        reactions: true,
      },
    }) as any;
  }

  async findChatMessages(userId: string, contactId: string, cursor?: string, limit: number = 20): Promise<Message[]> {
    return prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: contactId },
          { senderId: contactId, receiverId: userId },
        ],
        isDeleted: false,
      },
      include: {
        attachments: true,
        reactions: {
          include: { user: true },
        },
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
    }) as any;
  }

  async findConversations(userId: string): Promise<any[]> {
    const participantEntries = await prisma.conversationParticipant.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      select: {
        unreadCount: true,
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
          id: otherParticipant.userId,
          conversationId: conv.id,
          name: otherParticipant.user.name || "Member",
          image: photoUrl,
          lastMessage: lastMsg ? lastMsg.content : "",
          lastMessageAt: lastMsg ? lastMsg.createdAt : conv.updatedAt,
          unreadCount: entry.unreadCount,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b!.lastMessageAt).getTime() - new Date(a!.lastMessageAt).getTime());
  }

  async markAsRead(senderId: string, receiverId: string): Promise<void> {
    await prisma.message.updateMany({
      where: {
        senderId,
        receiverId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  }

  async findById(id: string): Promise<Message | null> {
    return prisma.message.findUnique({
      where: { id },
      include: {
        attachments: true,
        reactions: {
          include: { user: true },
        },
      },
    }) as any;
  }

  async softDelete(id: string): Promise<Message> {
    return prisma.message.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    }) as any;
  }

  async update(id: string, data: any): Promise<Message> {
    return prisma.message.update({
      where: { id },
      data,
    }) as any;
  }

  async findConversationMessages(conversationId: string, cursor?: string, limit: number = 20): Promise<Message[]> {
    return prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false,
      },
      include: {
        attachments: true,
        reactions: {
          include: { user: true },
        },
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
    }) as any;
  }

  async markAsDelivered(conversationId: string, userId: string): Promise<void> {
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        delivered: false,
      },
      data: {
        delivered: true,
        deliveryStatus: "DELIVERED",
      },
    });
  }

  async searchMessages(conversationId: string, query: string): Promise<Message[]> {
    return prisma.message.findMany({
      where: {
        conversationId,
        content: {
          contains: query,
          mode: "insensitive",
        },
        isDeleted: false,
      },
      include: {
        attachments: true,
        reactions: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }) as any;
  }
}
