"use client";

import { MessageSquare, ArrowLeft, ChevronRight, Compass } from "lucide-react";
import Link from "next/link";

export function ChatListClient({
  conversations,
  activeContactId,
  isSidebarView = false,
}: {
  conversations: any[];
  currentUserId?: string;
  activeContactId?: string;
  isSidebarView?: boolean;
}) {
  return (
    <div className="space-y-4" style={{ color: "#1F2937" }}>
      {/* Header */}
      {!isSidebarView && (
        <div
          className="p-4 rounded-2xl border shadow-xs flex items-center justify-between"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
        >
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" /> Messages & Chat
              </h1>
              <p className="text-xs text-gray-500">
                Chat with verified members who accepted your interest requests.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conversation List Card */}
      <div
        className="rounded-2xl border shadow-xs overflow-hidden"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
      >
        <div className="p-3 border-b bg-gray-50 flex items-center justify-between" style={{ borderColor: "#F3F4F6" }}>
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Active Conversations</h2>
          <span className="text-xs font-semibold text-gray-500">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div>
          {conversations.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">No active conversations found</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Once an interest is accepted between you and another candidate, your conversation will appear here.
              </p>
              <Link
                href="/matches"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
              >
                <Compass className="w-4 h-4" /> Find Matches
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "#F3F4F6" }}>
              {conversations.map((c: any) => {
                const contactId = c.contactId || c.partnerId || c.contactUser?.id;
                const contactName = c.contactName || c.name || c.contactUser?.name || "Member";
                const publicId = c.publicId || c.contactUser?.publicId || null;
                const photoUrl = c.contactPhoto || c.image || c.contactUser?.profile?.photos?.[0]?.url;
                const isActive = activeContactId && activeContactId === contactId;

                if (!contactId) return null;

                return (
                  <Link
                    key={c.id || contactId}
                    href={`/messages/${contactId}`}
                    className={`flex items-center justify-between p-3.5 transition-colors group ${
                      isActive ? "bg-emerald-50/90 font-semibold" : "hover:bg-emerald-50/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-emerald-50 flex items-center justify-center font-bold text-emerald-600 text-sm shadow-xs">
                        {photoUrl ? (
                          <img src={photoUrl} alt={contactName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{contactName.charAt(0)}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-xs text-gray-900 truncate">{contactName}</h3>
                          {publicId && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                              {publicId}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {c.lastMessage || "Start conversation..."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {c.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-[9px] font-bold flex items-center justify-center text-white shadow-xs">
                          {c.unreadCount}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
