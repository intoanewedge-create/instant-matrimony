import { WebhookEvent, WebhookLog } from "@prisma/client";
import { prisma } from "../prisma";
import { IWebhookRepository } from "./interfaces/webhook.repository";

export class PrismaWebhookRepository implements IWebhookRepository {
  async createEvent(data: any): Promise<WebhookEvent> {
    return prisma.webhookEvent.create({ data });
  }

  async findEventByProviderAndId(provider: string, eventId: string): Promise<WebhookEvent | null> {
    return prisma.webhookEvent.findFirst({
      where: { provider, eventId },
    }) as any;
  }

  async updateEventStatus(id: string, status: any): Promise<WebhookEvent> {
    return prisma.webhookEvent.update({
      where: { id },
      data: { status },
    });
  }

  async createLog(data: any): Promise<WebhookLog> {
    return prisma.webhookLog.create({ data });
  }

  async findEvents(): Promise<WebhookEvent[]> {
    return prisma.webhookEvent.findMany({
      orderBy: { createdAt: "desc" },
      include: { logs: true },
    }) as any;
  }
}
