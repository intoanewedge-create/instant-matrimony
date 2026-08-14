"use client";

import { MessageSquare, ArrowLeft, ChevronRight, Compass } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export function ChatListClient({ conversations }: { conversations: any[] }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl text-slate-900">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <MessageSquare className="w-6 h-6 text-rose-600" /> Conversations
          </h2>
        </div>

        <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-slate-900 text-lg">Active Chats</CardTitle>
            <CardDescription className="text-slate-500">Chat only with members who accepted your interest request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-0 p-0">
            {conversations.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-slate-500 text-sm">No active conversations found.</p>
                <Link href="/search" className="inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-colors bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700 h-10 px-5 py-2 shadow-md shadow-rose-500/20">
                  <Compass className="w-4 h-4 mr-2" /> Find Matches
                </Link>
              </div>
            ) : (
              conversations.map((c: any) => (
                <Link
                  key={c.id}
                  href={`/messages/${c.contactId}`}
                  className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center font-bold text-rose-600 border border-rose-100 shadow-xs">
                      {c.contactName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{c.contactName || "Premium Member"}</h4>
                      <p className="text-xs text-slate-500 max-w-md line-clamp-1 mt-0.5">{c.lastMessage || "No messages yet"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-rose-600 text-[10px] font-bold flex items-center justify-center text-white shadow-xs">
                        {c.unreadCount}
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
