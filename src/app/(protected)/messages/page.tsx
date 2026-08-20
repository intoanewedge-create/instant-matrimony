import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { container } from "@/lib/container";
import { ChatListClient } from "./chat-list-client";
import { MessageSquare, AlertCircle } from "lucide-react";

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userId = (session.user as any).id;

  const profileResult = await container.services.profileService.getProfileByUserId(userId);
  if (!profileResult.success) {
    redirect("/onboarding");
  }
  if (profileResult.data?.status !== "APPROVED") {
    redirect("/dashboard");
  }

  const convosResult = await container.services.messagingService.getConversations(userId);
  const conversations = convosResult.success ? convosResult.data : [];
  
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-slate-50 to-white text-slate-900 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {error === "unauthorized" && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">
              You cannot access this chat. You must have a mutual accepted interest and an active Standard membership.
            </p>
          </div>
        )}

        {/* Desktop 2-column layout */}
        <div className="hidden md:grid md:grid-cols-12 gap-6">
          <div className="md:col-span-5 lg:col-span-4">
            <ChatListClient conversations={conversations as any[]} currentUserId={userId} />
          </div>
          <div className="md:col-span-7 lg:col-span-8 flex flex-col items-center justify-center border border-gray-200 bg-white rounded-2xl p-12 text-center shadow-xs min-h-[500px]">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-xs">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Your Conversations</h2>
            <p className="text-xs text-gray-500 max-w-sm mt-1 leading-relaxed">
              Select a conversation from the left to view messages or start a new chat with your mutual matches.
            </p>
          </div>
        </div>

        {/* Mobile single-column view */}
        <div className="md:hidden">
          <ChatListClient conversations={conversations as any[]} currentUserId={userId} />
        </div>
      </div>
    </div>
  );
}
