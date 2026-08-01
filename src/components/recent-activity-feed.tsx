"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Heart,
  MessageSquare,
  Bell,
  UserCheck,
  Clock,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";

type ActivityItem = {
  id: string;
  kind: "message" | "interest_received" | "interest_sent" | "notification";
  title: string;
  subtitle: string;
  timestamp: Date;
  href?: string;
  meta?: string;
  unread?: boolean;
};

function toDate(d: any): Date {
  return d instanceof Date ? d : new Date(d);
}

function timeAgo(d: Date): string {
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86400);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function RecentActivityFeed({
  conversations = [],
  receivedInterests = [],
  sentInterests = [],
  notifications = [],
}: {
  conversations?: any[];
  receivedInterests?: any[];
  sentInterests?: any[];
  notifications?: any[];
}) {
  const items: ActivityItem[] = [];

  // Recent conversations => latest message per conversation.
  for (const c of conversations) {
    if (!c) continue;
    const ts =
      c.lastMessageAt || c.updatedAt || c.lastActivityAt || c.createdAt;
    if (!ts) continue;
    items.push({
      id: `conv-${c.id || c.contactId}`,
      kind: "message",
      title: c.contactName || "New message",
      subtitle: c.lastMessage || "You have an active conversation",
      timestamp: toDate(ts),
      href: c.contactId ? `/messages/${c.contactId}` : "/messages",
      unread: (c.unreadCount || 0) > 0,
      meta: c.unreadCount > 0 ? `${c.unreadCount} unread` : undefined,
    });
  }

  // Received interests.
  for (const i of receivedInterests) {
    if (!i) continue;
    items.push({
      id: `intR-${i.id}`,
      kind: "interest_received",
      title: `${i?.sender?.name || "Someone"} sent you an interest`,
      subtitle: i?.status
        ? `Status: ${i.status.toLowerCase()}`
        : "Pending your response",
      timestamp: toDate(i.createdAt || Date.now()),
      href: i.senderId ? `/profile/${i.senderId}` : "/dashboard/interests",
      unread: i.status === "PENDING",
    });
  }

  // Sent interests (only accepted are interesting to surface).
  for (const i of sentInterests) {
    if (!i) continue;
    if (i.status === "ACCEPTED") {
      items.push({
        id: `intS-${i.id}`,
        kind: "interest_sent",
        title: `${i?.receiver?.name || "A member"} accepted your interest`,
        subtitle: "You can now start chatting",
        timestamp: toDate(i.updatedAt || i.createdAt || Date.now()),
        href: i.receiverId ? `/messages/${i.receiverId}` : "/messages",
        unread: false,
      });
    }
  }

  // Notifications.
  for (const n of notifications) {
    if (!n) continue;
    items.push({
      id: `notif-${n.id}`,
      kind: "notification",
      title: n.title,
      subtitle: n.message,
      timestamp: toDate(n.createdAt),
      unread: !n.read,
    });
  }

  items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const top = items.slice(0, 8);

  const iconFor = (k: ActivityItem["kind"]) => {
    switch (k) {
      case "message":
        return {
          Icon: MessageSquare,
          color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
        };
      case "interest_received":
        return {
          Icon: Heart,
          color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        };
      case "interest_sent":
        return {
          Icon: UserCheck,
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        };
      case "notification":
        return {
          Icon: Bell,
          color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        };
    }
  };

  return (
    <Card className="border border-slate-800 bg-slate-900/40 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-400" /> Recent Activity
          </CardTitle>
          <CardDescription>
            Everything happening across your matches, messages and alerts
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {top.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-slate-400 text-sm">
              No activity yet — send an interest to get started!
            </p>
          </div>
        ) : (
          top.map((it, idx) => {
            const { Icon, color } = iconFor(it.kind);
            const Wrapper: any = it.href ? Link : "div";
            const props: any = it.href ? { href: it.href } : {};
            return (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Wrapper
                  {...props}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                    it.unread
                      ? "border-rose-500/20 bg-rose-950/10 hover:bg-rose-950/20"
                      : "border-slate-800 hover:bg-slate-950/40"
                  }`}
                >
                  <div className={`shrink-0 p-2 rounded-lg border ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-semibold truncate ${it.unread ? "text-slate-100" : "text-slate-300"}`}
                      >
                        {it.title}
                      </p>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" /> {timeAgo(it.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-slate-400 truncate">
                        {it.subtitle}
                      </p>
                      {it.meta && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-600/20 text-rose-300 border border-rose-600/30 shrink-0">
                          {it.meta}
                        </span>
                      )}
                    </div>
                  </div>
                </Wrapper>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
