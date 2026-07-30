import { WebhookEvent, WebhookLog } from "@prisma/client";

export interface IWebhookRepository {
  createEvent(data: any): Promise<WebhookEvent>;
  findEventByProviderAndId(provider: string, eventId: string): Promise<WebhookEvent | null>;
  updateEventStatus(id: string, status: any): Promise<WebhookEvent>;
  createLog(data: any): Promise<WebhookLog>;
  findEvents(): Promise<WebhookEvent[]>;
}
