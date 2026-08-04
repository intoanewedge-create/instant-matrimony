"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getRecentNotificationsAction(limit: number = 10) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized", notifications: [], unreadCount: 0 };
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: session.user.id, read: false },
    });

    return {
      success: true,
      notifications,
      unreadCount,
    };
  } catch (e: any) {
    return { success: false, error: e.message, notifications: [], unreadCount: 0 };
  }
}

export async function markNotificationAsReadAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const notification = await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { read: true },
    });

    return { success: true, notification };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function markAllNotificationsAsReadAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
