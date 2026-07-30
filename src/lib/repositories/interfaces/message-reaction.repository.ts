import { MessageReaction } from "@prisma/client";

export interface IMessageReactionRepository {
  upsert(messageId: string, userId: string, reaction: string): Promise<MessageReaction>;
  delete(messageId: string, userId: string, reaction: string): Promise<void>;
  findByMessageId(messageId: string): Promise<MessageReaction[]>;
}
