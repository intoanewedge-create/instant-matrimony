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
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          include: {
            profile: {
              include: { photos: true },
            },
          },
        },
        receiver: {
          include: {
            profile: {
              include: { photos: true },
            },
          },
        },
      },
    });

    const conversationsMap = new Map<string, any>();
    for (const msg of messages) {
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!partner) continue;
      if (!conversationsMap.has(partner.id)) {
        conversationsMap.set(partner.id, {
          id: partner.id,
          name: partner.name,
          image: partner.profile?.photos?.find((p) => p.isMain)?.url || partner.image,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount: msg.receiverId === userId && !msg.read ? 1 : 0,
        });
      } else {
        if (msg.receiverId === userId && !msg.read) {
          const entry = conversationsMap.get(partner.id);
          entry.unreadCount += 1;
        }
      }
    }

    return Array.from(conversationsMap.values());
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
