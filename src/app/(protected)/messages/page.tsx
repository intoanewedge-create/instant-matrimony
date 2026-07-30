import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { container } from "@/lib/container";
import { ChatListClient } from "./chat-list-client";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userId = (session.user as any).id;

  const convosResult = await container.services.messagingService.getConversations(userId);
  const conversations = convosResult.success ? convosResult.data : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <ChatListClient conversations={conversations} />
    </div>
  );
}
