import { Notification } from "@prisma/client";
import { prisma } from "../prisma";
import { INotificationRepository } from "./interfaces/notification.repository";

export class PrismaNotificationRepository implements INotificationRepository {
  protected modelDelegate = prisma.notification;

  async create(userId: string, title: string, message: string, type: any): Promise<Notification> {
    return prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        read: false,
      },
    }) as any;
  }

  async findUserNotifications(userId: string, cursor?: string, limit: number = 20): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async delete(id: string): Promise<Notification> {
    return prisma.notification.delete({
      where: { id },
    });
  }
}
