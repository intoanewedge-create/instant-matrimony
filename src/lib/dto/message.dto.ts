export interface MessageResponse {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
  attachments?: any[];
  reactions?: any[];
  conversationId?: string | null;
  delivered?: boolean;
}

export interface ConversationResponse {
  id: string;
  name: string | null;
  image: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isArchived?: boolean;
  isMuted?: boolean;
  partnerId?: string;
}
