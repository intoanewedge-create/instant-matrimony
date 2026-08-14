import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { container } from "@/lib/container";
import { ChatRoomClient } from "./chat-room-client";

export default async function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userId = (session.user as any).id;
  const { id: contactId } = await params;

  const profileResult = await container.services.profileService.getProfileByUserId(userId);
  if (!profileResult.success) {
    redirect("/onboarding");
  }
  if (profileResult.data.status !== "APPROVED") {
    redirect("/dashboard");
  }

  const allowed = await container.services.permissionService.canChat(userId, contactId);
  if (!allowed) {
    redirect("/messages?error=unauthorized");
  }

  const contactProfile = (await container.repositories.profileRepository.findByUserId(contactId)) as any;
  const contactName = contactProfile?.user?.name || "Member";

  const messagesResult = await container.services.messagingService.getChatMessages(userId, contactId);
  const initialMessages = messagesResult.success ? messagesResult.data : [];

  await container.services.messagingService.markAsRead(userId, contactId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-slate-50 to-white text-slate-900 flex flex-col">
      <ChatRoomClient
        userId={userId}
        contactId={contactId}
        contactName={contactName}
        initialMessages={initialMessages}
      />
    </div>
  );
}
