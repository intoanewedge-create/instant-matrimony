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

  const profileResult = await container.services.profileService.getProfileByUserId(userId);
  if (!profileResult.success) {
    redirect("/onboarding");
  }
  if (profileResult.data.status !== "APPROVED") {
    redirect("/dashboard");
  }

  const convosResult = await container.services.messagingService.getConversations(userId);
  const conversations = convosResult.success ? convosResult.data : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-slate-50 to-white text-slate-900">
      <ChatListClient conversations={conversations} />
    </div>
  );
}
