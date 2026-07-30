import { MessageResponse } from "../dto/message.dto";

export class MessageMapper {
  static toResponse(message: any): MessageResponse {
    return {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      read: message.read,
      createdAt: message.createdAt.toISOString(),
      attachments: message.attachments || [],
      reactions: message.reactions || [],
      conversationId: message.conversationId,
      delivered: message.delivered,
    };
  }
}
