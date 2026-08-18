import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { container } from "@/lib/container";
import { ChatRoomClient } from "./chat-room-client";
import { ChatListClient } from "../chat-list-client";

export default async function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userId = (session.user as any).id;
  const { id: paramId } = await params;

  const profileResult = await container.services.profileService.getProfileByUserId(userId);
  if (!profileResult.success) {
    redirect("/onboarding");
  }
  if (profileResult.data.status !== "APPROVED") {
    redirect("/dashboard");
  }

  // Resolve whether paramId is a contactId (user ID) or a conversationId
  let contactId = paramId;
  const resolvedConversation = await container.repositories.conversationRepository.findById(paramId);
  if (resolvedConversation && (resolvedConversation as any).participants) {
    const isParticipant = (resolvedConversation as any).participants.some((p: any) => p.userId === userId);
    if (!isParticipant) {
      redirect("/messages?error=unauthorized");
    }
    const otherParticipant = (resolvedConversation as any).participants.find((p: any) => p.userId !== userId);
    if (otherParticipant) {
      contactId = otherParticipant.userId;
    }
  }

  const allowed = await container.services.permissionService.canChat(userId, contactId);
  if (!allowed) {
    redirect("/messages?error=unauthorized");
  }

  const contactProfile = (await container.repositories.profileRepository.findByUserId(contactId)) as any;
  const contactName = contactProfile?.user?.name || "Member";
  const contactPhoto = contactProfile?.photos?.find((p: any) => p.isMain)?.url || contactProfile?.user?.image || null;

  const messagesResult = await container.services.messagingService.getChatMessages(userId, contactId);
  const initialMessages = messagesResult.success ? messagesResult.data : [];

  const convosResult = await container.services.messagingService.getConversations(userId);
  const conversations = convosResult.success ? convosResult.data : [];

  await container.services.messagingService.markAsRead(userId, contactId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-slate-50 to-white text-slate-900 py-4 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Desktop 2-column view */}
        <div className="hidden md:grid md:grid-cols-12 gap-6">
          <div className="md:col-span-4 lg:col-span-4 max-h-[700px] overflow-y-auto">
            <ChatListClient
              conversations={conversations}
              currentUserId={userId}
              activeContactId={contactId}
              isSidebarView
            />
          </div>
          <div className="md:col-span-8 lg:col-span-8">
            <ChatRoomClient
              userId={userId}
              contactId={contactId}
              contactName={contactName}
              contactPhoto={contactPhoto}
              initialMessages={initialMessages}
            />
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          <ChatRoomClient
            userId={userId}
            contactId={contactId}
            contactName={contactName}
            contactPhoto={contactPhoto}
            initialMessages={initialMessages}
            isMobileView
          />
        </div>
      </div>
    </div>
  );
}
