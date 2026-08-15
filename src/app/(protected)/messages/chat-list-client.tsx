"use client";

import { MessageSquare, ArrowLeft, ChevronRight, Compass, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function ChatListClient({ conversations }: { conversations: any[] }) {
  return (
    <div className="space-y-6" style={{ color: "#1F2937" }}>
      {/* Header */}
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

      {/* Conversation List Card */}
      <div
        className="rounded-2xl border shadow-xs overflow-hidden"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
      >
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between" style={{ borderColor: "#F3F4F6" }}>
          <h2 className="text-sm font-bold text-gray-900">Active Conversations</h2>
          <span className="text-xs font-semibold text-gray-500">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div>
          {conversations.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No active conversations found</h3>
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
                const contactName = c.contactName || c.contactUser?.name || "Member";
                const publicId = c.publicId || c.contactUser?.publicId || null;
                const photoUrl = c.contactPhoto || c.contactUser?.profile?.photos?.[0]?.url;

                return (
                  <Link
                    key={c.id || c.contactId}
                    href={`/messages/${c.contactId}`}
                    className="flex items-center justify-between p-4 hover:bg-emerald-50/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-emerald-50 flex items-center justify-center font-bold text-emerald-600 text-base shadow-xs">
                        {photoUrl ? (
                          <img src={photoUrl} alt={contactName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{contactName.charAt(0)}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-gray-900 truncate">{contactName}</h3>
                          {publicId && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                              {publicId}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {c.lastMessage || "Start the conversation..."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {c.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-[10px] font-bold flex items-center justify-center text-white shadow-xs">
                          {c.unreadCount}
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
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
