"use client";

import { motion } from "framer-motion";
import { MessageSquare, ArrowLeft, ChevronRight, Compass } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ChatListClient({ conversations }: { conversations: any[] }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-rose-500" /> Conversations
          </h2>
        </div>

        <Card className="border border-slate-800 bg-slate-900/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Active Chats</CardTitle>
            <CardDescription>Chat only with members who accepted your interest request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-0">
            {conversations.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <p className="text-slate-400 text-sm">No active conversations found.</p>
                <Link href="/search" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-rose-600 text-white hover:bg-rose-500 h-10 px-4 py-2">
                  <Compass className="w-4 h-4 mr-2" /> Find Matches
                </Link>
              </div>
            ) : (
              conversations.map((c: any) => (
                <Link
                  key={c.id}
                  href={`/messages/${c.contactId}`}
                  className="flex items-center justify-between p-4 border-b border-slate-800/60 last:border-0 hover:bg-slate-950/40 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-850 flex items-center justify-center font-bold text-rose-500 border border-slate-800">
                      {c.contactName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200">{c.contactName || "Premium Member"}</h4>
                      <p className="text-xs text-slate-400 max-w-md line-clamp-1">{c.lastMessage || "No messages yet"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-rose-600 text-[10px] font-bold flex items-center justify-center text-white">
                        {c.unreadCount}
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-slate-500" />
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
