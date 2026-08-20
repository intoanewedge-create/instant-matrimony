"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type NotificationTab = "all" | "interactions" | "urgent";

export async function getRecentNotificationsAction(
  limit: number = 10,
  tab: NotificationTab = "all",
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
      notifications: [],
      unreadCount: 0,
    };
  }

  try {
    const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 50);

    const where: Prisma.NotificationWhereInput = {
      userId: session.user.id,
    };

    if (tab === "interactions") {
      where.OR = [
        {
          category: {
            in: ["MATCH", "MESSAGE"],
          },
        },
        {
          title: {
            contains: "interest",
            mode: "insensitive",
          },
        },
        {
          message: {
            contains: "interest",
            mode: "insensitive",
          },
        },
      ];
    }

    if (tab === "urgent") {
      where.type = {
        in: ["WARNING", "ERROR"],
      };
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        take: safeLimit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.notification.count({
        where: {
          userId: session.user.id,
          read: false,
        },
      }),
    ]);

    return {
      success: true,
      notifications,
      unreadCount,
    };
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to fetch notifications",
      notifications: [],
      unreadCount: 0,
    };
  }
}

export async function markNotificationAsReadAction(id: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  try {
    const notification = await prisma.notification.updateMany({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        read: true,
      },
    });

    return {
      success: true,
      notification,
    };
  } catch (e: unknown) {
    return {
      success: false,
      error:
        e instanceof Error ? e.message : "Failed to mark notification as read",
    };
  }
}

export async function markAllNotificationsAsReadAction() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  try {
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return {
      success: true,
    };
  } catch (e: unknown) {
    return {
      success: false,
      error:
        e instanceof Error
          ? e.message
          : "Failed to mark all notifications as read",
    };
  }
}

export async function dismissNotificationAction(id: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  try {
    await prisma.notification.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return {
      success: true,
    };
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to dismiss notification",
    };
  }
}
