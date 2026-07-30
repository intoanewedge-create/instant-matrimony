import { NotificationProvider } from "../providers/notification-provider";
import { NotificationContext } from "../../domain/contracts";
import { prisma } from "../../prisma";

export class NotificationGenerator {
  generate(context: NotificationContext): NotificationContext {
    return {
      ...context,
      title: context.title.trim(),
      message: context.message.trim(),
    };
  }
}

export class NotificationFormatter {
  format(context: NotificationContext): { formattedTitle: string; formattedMessage: string } {
    return {
      formattedTitle: `[${context.category}] ${context.title}`,
      formattedMessage: context.message,
    };
  }
}

export class NotificationDispatcher {
  constructor(private providers: NotificationProvider[]) {}

  async dispatch(
    userId: string,
    title: string,
    message: string,
    category: "SYSTEM" | "MATCH" | "MESSAGE" | "PAYMENT" | "SECURITY" | "PROFILE" | "ADMIN"
  ): Promise<boolean> {
    // 1. Fetch user notification preferences
    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // Check category settings if prefs exist
    let allowEmail = true;
    let allowBrowser = true;

    if (prefs) {
      if (category === "MATCH") {
        allowEmail = prefs.emailMatches;
        allowBrowser = prefs.browserMatches;
      } else if (category === "MESSAGE") {
        allowEmail = prefs.emailMessages;
        allowBrowser = prefs.browserMessages;
      } else if (category === "SECURITY") {
        allowEmail = prefs.emailSecurity;
        allowBrowser = prefs.browserSecurity;
      } else if (category === "PAYMENT") {
        allowEmail = prefs.emailPayments;
        allowBrowser = prefs.browserPayments;
      }
    }

    const promises = this.providers.map(async (provider) => {
      const pName = provider.name().toLowerCase();
      if (pName.includes("email") && !allowEmail) return false;
      if (pName.includes("browser") && !allowBrowser) return false;
      
      try {
        return await provider.send(userId, title, message, category);
      } catch {
        return false;
      }
    });

    await Promise.all(promises);
    return true;
  }
}
