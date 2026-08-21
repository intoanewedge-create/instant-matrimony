"use server";

import { auth } from "../auth";
import { container } from "../container";
import { sendMessageSchema } from "../validators/message.validator";
import { revalidatePath } from "next/cache";

export async function sendMessageAction(receiverId: string, content: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const senderId = (session.user as any).id;

  const result = sendMessageSchema.safeParse({ receiverId, content });
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const serviceResult = await container.services.messagingService.sendMessage(senderId, receiverId, content);
  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  revalidatePath(`/messages/${receiverId}`);
  return { success: true, message: serviceResult.data };
}

export async function getChatMessagesAction(contactId: string, cursor?: string, limit?: number) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = (session.user as any).id;

  const serviceResult = await container.services.messagingService.getChatMessages(userId, contactId, cursor, limit);
  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  return { success: true, messages: serviceResult.data };
}

export async function getConversationsAction() {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = (session.user as any).id;

  const serviceResult = await container.services.messagingService.getConversations(userId);
  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  return { success: true, conversations: serviceResult.data };
}

export async function sendConversationMessageAction(
  receiverId: string,
  content: string,
  conversationId?: string,
  attachmentMediaIds?: string[]
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = sendMessageSchema.safeParse({ receiverId, content });
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const serviceResult = await container.services.messagingService.sendMessage(
    session.user.id,
    receiverId,
    content,
    conversationId,
    attachmentMediaIds
  );

  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  if (conversationId) {
    revalidatePath(`/messages/conversation/${conversationId}`);
  } else {
    revalidatePath(`/messages`);
  }
  return { success: true, message: serviceResult.data };
}

export async function getConversationMessagesAction(conversationId: string, cursor?: string, limit?: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const serviceResult = await container.services.messagingService.getConversationMessages(
    session.user.id,
    conversationId,
    cursor,
    limit
  );

  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  return { success: true, messages: serviceResult.data };
}

export async function addMessageReactionAction(messageId: string, reaction: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const serviceResult = await container.services.messagingService.addReaction(
    session.user.id,
    messageId,
    reaction
  );

  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  return { success: true, data: serviceResult.data };
}

export async function removeMessageReactionAction(messageId: string, reaction: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const serviceResult = await container.services.messagingService.removeReaction(
    session.user.id,
    messageId,
    reaction
  );

  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  return { success: true };
}

export async function markConversationAsReadAction(conversationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const serviceResult = await container.services.messagingService.markAsRead(
    session.user.id,
    conversationId
  );

  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  return { success: true };
}

export async function setTypingStatusAction(conversationId: string, isTyping: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const serviceResult = await container.services.messagingService.setTypingStatus(
    session.user.id,
    conversationId,
    isTyping
  );

  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  return { success: true };
}

export async function updatePresenceAction(isOnline: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const serviceResult = await container.services.messagingService.updatePresence(
    session.user.id,
    isOnline
  );

  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  return { success: true };
}

export async function searchConversationMessagesAction(conversationId: string, query: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!query) {
    return { success: false, error: "Query is required" };
  }

  const serviceResult = await container.services.messagingService.searchMessages(
    session.user.id,
    conversationId,
    query
  );

  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  return { success: true, messages: serviceResult.data };
}

export async function deleteMessageAction(messageId: string, contactId?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const serviceResult = await container.services.messagingService.deleteMessage(
    session.user.id,
    messageId
  );

  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  if (contactId) {
    revalidatePath(`/messages/${contactId}`);
  }
  revalidatePath("/messages");

  return { success: true };
}

export async function getOrCreateConversationAction(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = session.user.id;

  const serviceResult = await container.services.messagingService.getOrCreateConversation(userId, targetUserId);
  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  return { success: true, conversation: serviceResult.data };
}
