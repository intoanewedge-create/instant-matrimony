import { MessageResponse } from "../dto/message.dto";

export class MessageMapper {
  static toResponse(message: any): MessageResponse {
    const createdAtStr =
      message.createdAt instanceof Date
        ? message.createdAt.toISOString()
        : typeof message.createdAt === "string"
        ? message.createdAt
        : new Date().toISOString();

    return {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      read: message.read,
      createdAt: createdAtStr,
      attachments: message.attachments || [],
      reactions: message.reactions || [],
      conversationId: message.conversationId,
      delivered: message.delivered,
    };
  }
}
