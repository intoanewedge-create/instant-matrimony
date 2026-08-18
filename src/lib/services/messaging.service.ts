import { BaseService } from "./base.service";
import { Result } from "../result";
import { IMessageRepository } from "../repositories/interfaces/message.repository";
import { PermissionService } from "./permission.service";
import { NotificationService } from "./notification.service";
import { IConversationRepository } from "../repositories/interfaces/conversation.repository";
import { IConversationParticipantRepository } from "../repositories/interfaces/conversation-participant.repository";
import { IMessageReactionRepository } from "../repositories/interfaces/message-reaction.repository";
import { RealtimeProvider } from "../realtime/realtime-provider";
import { eventDispatcher } from "../events/event-dispatcher";
import { DOMAIN_EVENTS } from "@/constants";
import { MessageMapper } from "../mappers/message.mapper";

export class MessagingService extends BaseService {
  constructor(
    private messageRepository: IMessageRepository,
    private permissionService: PermissionService,
    private notificationService: NotificationService,
    private conversationRepo: IConversationRepository,
    private participantRepo: IConversationParticipantRepository,
    private reactionRepo: IMessageReactionRepository,
    private realtimeProvider: RealtimeProvider
  ) {
    super();
  }

  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
    conversationId?: string,
    attachmentMediaIds?: string[]
  ): Promise<Result<any>> {
    try {
      const allowed = await this.permissionService.canChat(senderId, receiverId);
      if (!allowed) {
        return this.returnFailure(
          "You can only send messages to users with whom you have a mutual match (accepted interest).",
          "CHAT_NOT_ALLOWED"
        );
      }

      let activeConversationId = conversationId;
      if (!activeConversationId) {
        let conversation = await this.conversationRepo.findByParticipants([senderId, receiverId]);
        if (!conversation) {
          conversation = await this.conversationRepo.create([senderId, receiverId]);
        }
        activeConversationId = conversation.id;
      }

      const message = await this.messageRepository.create(
        senderId,
        receiverId,
        content,
        activeConversationId,
        attachmentMediaIds
      );

      await this.participantRepo.incrementUnreadCount(activeConversationId, senderId);

      await this.realtimeProvider.emitMessage({
        conversationId: activeConversationId,
        senderId,
        receiverId,
        content,
        messageId: message.id,
        createdAt: message.createdAt,
        attachments: (message as any).attachments || [],
      });

      await eventDispatcher.publish(DOMAIN_EVENTS.MESSAGE_SENT, {
        messageId: message.id,
        senderId,
        receiverId,
      });

      await this.notificationService.enqueue(
        receiverId,
        "New Message Received",
        `You have received a new message: "${content.substring(0, 30)}..."`,
        "INFO"
      );

      return this.returnSuccess(MessageMapper.toResponse(message));
    } catch (e: any) {
      return this.returnFailure(e.message, "MESSAGE_SEND_ERROR");
    }
  }

  async getChatMessages(userId: string, contactId: string, cursor?: string, limit?: number): Promise<Result<any>> {
    try {
      const allowed = await this.permissionService.canChat(userId, contactId);
      if (!allowed) {
        return this.returnFailure(
          "You must have a mutual interest and an active Standard membership (₹1,000) to chat.",
          "CHAT_ACCESS_DENIED"
        );
      }

      const messages = await this.messageRepository.findChatMessages(userId, contactId, cursor, limit);
      const responses = messages.map(MessageMapper.toResponse);
      return this.returnSuccess(responses);
    } catch (e: any) {
      return this.returnFailure(e.message, "CHAT_FETCH_ERROR");
    }
  }

  async getConversations(userId: string): Promise<Result<any>> {
    try {
      const conversations = await this.conversationRepo.findUserConversations(userId);
      return this.returnSuccess(conversations);
    } catch (e: any) {
      return this.returnFailure(e.message, "CONVERSATIONS_FETCH_ERROR");
    }
  }

  async getConversationMessages(userId: string, conversationId: string, cursor?: string, limit?: number): Promise<Result<any>> {
    try {
      const participant = await this.participantRepo.findParticipant(conversationId, userId);
      if (!participant || participant.isDeleted) {
        return this.returnFailure("You are not authorized to access this conversation.", "CONVERSATION_ACCESS_DENIED");
      }

      const conversation = (await this.conversationRepo.findById(conversationId)) as any;
      if (conversation?.participants) {
        const other = conversation.participants.find((p: any) => p.userId !== userId);
        if (other?.userId) {
          const allowed = await this.permissionService.canChat(userId, other.userId);
          if (!allowed) {
            return this.returnFailure(
              "You must have a mutual interest and an active Standard membership (₹1,000) to access this conversation.",
              "CONVERSATION_ACCESS_DENIED"
            );
          }
        }
      }

      const messages = await this.messageRepository.findConversationMessages(conversationId, cursor, limit);
      await this.messageRepository.markAsDelivered(conversationId, userId);
      const responses = messages.map(MessageMapper.toResponse);
      return this.returnSuccess(responses);
    } catch (e: any) {
      return this.returnFailure(e.message, "CONVERSATION_MESSAGES_FETCH_ERROR");
    }
  }

  async markAsRead(userId: string, targetId: string): Promise<Result<boolean>> {
    try {
      let conversationId = targetId;
      let otherUserId: string | null = null;

      // 1. Try resolving targetId directly as a conversation
      let participant = await this.participantRepo.findParticipant(conversationId, userId);
      if (!participant) {
        // targetId might be contactId. Look up conversation between userId and contactId
        const conversation = await this.conversationRepo.findByParticipants([userId, targetId]);
        if (conversation) {
          conversationId = conversation.id;
          otherUserId = targetId;
          participant = await this.participantRepo.findParticipant(conversationId, userId);
        } else {
          // If no conversation record yet, still mark any direct messages as read
          await this.messageRepository.markAsRead(targetId, userId);
          return this.returnSuccess(true);
        }
      }

      if (participant) {
        await this.participantRepo.resetUnreadCount(conversationId, userId);
      }

      if (!otherUserId) {
        const conversation = (await this.conversationRepo.findById(conversationId)) as any;
        if (conversation && conversation.participants) {
          const otherParticipant = conversation.participants.find((p: any) => p.userId !== userId);
          if (otherParticipant) {
            otherUserId = otherParticipant.userId;
          }
        }
      }

      if (otherUserId) {
        await this.messageRepository.markAsRead(otherUserId, userId);
        const conversation = (await this.conversationRepo.findById(conversationId)) as any;
        const lastMsg = conversation?.messages?.[0];
        if (lastMsg) {
          await this.realtimeProvider.emitReadReceipt(conversationId, userId, lastMsg.id);
        }
      }

      return this.returnSuccess(true);
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async addReaction(userId: string, messageId: string, reaction: string): Promise<Result<any>> {
    try {
      const message = await this.messageRepository.findById(messageId);
      if (!message) {
        return this.returnFailure("Message not found.", "MESSAGE_NOT_FOUND");
      }

      const result = await this.reactionRepo.upsert(messageId, userId, reaction);
      return this.returnSuccess(result);
    } catch (e: any) {
      return this.returnFailure(e.message, "REACTION_ADD_ERROR");
    }
  }

  async removeReaction(userId: string, messageId: string, reaction: string): Promise<Result<boolean>> {
    try {
      await this.reactionRepo.delete(messageId, userId, reaction);
      return this.returnSuccess(true);
    } catch (e: any) {
      return this.returnFailure(e.message, "REACTION_REMOVE_ERROR");
    }
  }

  async setTypingStatus(userId: string, conversationId: string, isTyping: boolean): Promise<Result<boolean>> {
    try {
      await this.realtimeProvider.emitTyping(conversationId, userId, isTyping);
      return this.returnSuccess(true);
    } catch (e: any) {
      return this.returnFailure(e.message, "TYPING_STATUS_ERROR");
    }
  }

  async updatePresence(userId: string, isOnline: boolean): Promise<Result<boolean>> {
    try {
      await this.realtimeProvider.emitPresence(userId, isOnline, new Date());
      return this.returnSuccess(true);
    } catch (e: any) {
      return this.returnFailure(e.message, "PRESENCE_UPDATE_ERROR");
    }
  }

  async searchMessages(userId: string, conversationId: string, query: string): Promise<Result<any>> {
    try {
      const participant = await this.participantRepo.findParticipant(conversationId, userId);
      if (!participant) {
        return this.returnFailure("You are not a participant in this conversation.", "SEARCH_ACCESS_DENIED");
      }

      const messages = await this.messageRepository.searchMessages(conversationId, query);
      const responses = messages.map(MessageMapper.toResponse);
      return this.returnSuccess(responses);
    } catch (e: any) {
      return this.returnFailure(e.message, "MESSAGE_SEARCH_ERROR");
    }
  }

  async deleteMessage(userId: string, messageId: string): Promise<Result<boolean>> {
    try {
      const message = await this.messageRepository.findById(messageId);
      if (!message) {
        return this.returnFailure("Message not found", "NOT_FOUND");
      }
      if (message.senderId !== userId) {
        return this.returnFailure("You can only delete your own messages", "UNAUTHORIZED");
      }
      await this.messageRepository.softDelete(messageId);
      return this.returnSuccess(true);
    } catch (e: any) {
      return this.returnFailure(e.message, "MESSAGE_DELETE_ERROR");
    }
  }
}
