"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { Bell, CheckCheck, Clock, Sparkles, Check, X, MoreHorizontal, Trash2, User, Flame, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getRecentNotificationsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  dismissNotificationAction,
} from "@/lib/actions/notification.actions";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string | Date;
  read: boolean;
  category?: string;
  type?: string;
  metadata?: any;
  targetId?: string;
  senderAvatar?: string;
};

function formatRelativeTime(dateInput: string | Date): string {
  const d = new Date(dateInput);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}hrs`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getNotificationTargetUrl(n: NotificationItem): string {
  const type = (n.type || n.category || "").toUpperCase();
  const meta = n.metadata || {};
  let targetId = n.targetId || meta.targetId || meta.senderId || meta.userId || meta.profileId || meta.chatId || meta.conversationId;

  if (!targetId && n.category && n.category.includes(":")) {
    targetId = n.category.split(":")[1];
  }

  if (type.includes("PROFILE_VIEW") || type.includes("VISIT") || (type.includes("VIEW") && targetId)) {
    return targetId ? `/profile/${targetId}` : `/profile`;
  }
  if (type.includes("INTEREST")) {
    return `/dashboard/interests`;
  }
  if (type.includes("MESSAGE") || type.includes("CHAT")) {
    return targetId ? `/messages/${targetId}` : `/messages`;
  }
  if (type.includes("PROFILE") || type.includes("APPROVAL") || type.includes("REVIEW")) {
    return `/profile`;
  }
  if (type.includes("MEMBERSHIP") || type.includes("PAYMENT") || type.includes("BILLING")) {
    return `/dashboard/billing`;
  }
  if (type.includes("CONCIERGE")) {
    return `/dashboard/concierge`;
  }
  if (targetId) {
    return `/profile/${targetId}`;
  }
  return `/dashboard`;
}

export function NotificationBell({
  initialNotifications = [],
  initialUnreadCount = 0,
}: {
  initialNotifications?: NotificationItem[];
  initialUnreadCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(initialNotifications || []);
  const [unread, setUnread] = useState<number>(initialUnreadCount || 0);
  const [filterTab, setFilterTab] = useState<"ALL" | "INTERACTIONS" | "URGENT">("ALL");

  // Selected notification for Three-Dot Options Modal / Popover
  const [activeOptionItem, setActiveOptionItem] = useState<NotificationItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const res = await getRecentNotificationsAction(15);
    if (res.success) {
      setItems((res.notifications as NotificationItem[]) || []);
      setUnread(res.unreadCount || 0);
    }
  }, []);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  useEffect(() => {
    const int = setInterval(() => refresh(), 30000);
    return () => clearInterval(int);
  }, [refresh]);

  const handleMarkOne = (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((c) => Math.max(0, c - 1));
    startTransition(async () => {
      await markNotificationAsReadAction(id);
    });
  };

  const handleDismiss = async (id: string, wasUnread: boolean) => {
    setDeletingId(id);
    try {
      const res = await dismissNotificationAction(id);
      if (res.success) {
        setItems((prev) => prev.filter((n) => n.id !== id));
        if (wasUnread) {
          setUnread((c) => Math.max(0, c - 1));
        }
      }
    } finally {
      setDeletingId(null);
      setActiveOptionItem(null);
    }
  };

  const handleMarkAll = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    startTransition(async () => {
      await markAllNotificationsAsReadAction();
    });
  };

  // Filter items based on active tab
  const filteredItems = items.filter((item) => {
    const typeStr = (item.type || item.category || "").toUpperCase();
    const textStr = (item.title + " " + item.message).toLowerCase();

    if (filterTab === "INTERACTIONS") {
      return (
        typeStr.includes("INTEREST") ||
        typeStr.includes("MATCH") ||
        typeStr.includes("VIEW") ||
        typeStr.includes("MESSAGE") ||
        typeStr.includes("CHAT") ||
        typeStr.includes("UNLOCK") ||
        textStr.includes("viewed") ||
        textStr.includes("interest") ||
        textStr.includes("message")
      );
    }

    if (filterTab === "URGENT") {
      return (
        typeStr.includes("VERIFY") ||
        typeStr.includes("PAYMENT") ||
        typeStr.includes("CONCIERGE") ||
        typeStr.includes("URGENT") ||
        typeStr.includes("ALERT") ||
        textStr.includes("urgent") ||
        textStr.includes("action required") ||
        textStr.includes("verification")
      );
    }

    return true; // "ALL"
  });

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open notifications"
        className="relative border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm rounded-xl"
      >
        <Bell className="w-4 h-4 text-rose-600" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white shadow-xs">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 mt-2 w-[380px] max-w-[calc(100vw-1.5rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
              role="dialog"
              aria-label="Notifications"
            >
              {/* Dropdown Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                  {unread > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                      {unread} unread
                    </span>
                  )}
                </div>
                <button
                  onClick={handleMarkAll}
                  disabled={pending || unread === 0}
                  className="text-[11px] text-rose-600 hover:text-rose-700 disabled:opacity-40 flex items-center gap-1 font-semibold"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              </div>

              {/* Filter Tabs with Green Active State */}
              <div className="flex border-b border-slate-200 bg-white px-2 pt-1 gap-2 text-xs font-semibold">
                <button
                  onClick={() => setFilterTab("ALL")}
                  className={`pb-2 px-3 transition-colors ${
                    filterTab === "ALL"
                      ? "text-emerald-600 border-b-2 border-emerald-500 font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterTab("INTERACTIONS")}
                  className={`pb-2 px-3 transition-colors ${
                    filterTab === "INTERACTIONS"
                      ? "text-emerald-600 border-b-2 border-emerald-500 font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Interactions
                </button>
                <button
                  onClick={() => setFilterTab("URGENT")}
                  className={`pb-2 px-3 transition-colors ${
                    filterTab === "URGENT"
                      ? "text-emerald-600 border-b-2 border-emerald-500 font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Urgent
                </button>
              </div>

              {/* Notification List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs space-y-1">
                    <p className="font-medium text-slate-600">No notifications in this filter ✨</p>
                    <p className="text-[11px]">You're all caught up!</p>
                  </div>
                ) : (
                  filteredItems.map((n) => {
                    const isUnread = !n.read;
                    const targetUrl = getNotificationTargetUrl(n);

                    return (
                      <div
                        key={n.id}
                        className={`w-full text-left px-3.5 py-3 transition-colors flex items-start gap-3 relative group ${
                          isUnread ? "bg-rose-50/40 hover:bg-rose-50/70" : "hover:bg-slate-50/80"
                        }`}
                      >
                        {/* LEFT: Circular presentation icon/avatar */}
                        <div className="shrink-0 mt-0.5">
                          <div className="w-8 h-8 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
                            {n.type?.includes("INTEREST") ? (
                              <Sparkles className="w-4 h-4" />
                            ) : n.type?.includes("MESSAGE") ? (
                              <MessageSquare className="w-4 h-4" />
                            ) : n.type?.includes("URGENT") ? (
                              <Flame className="w-4 h-4 text-amber-600" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>
                        </div>

                        {/* MIDDLE: Message & relative timestamp with Link wrapper */}
                        <Link
                          href={targetUrl}
                          onClick={() => {
                            if (isUnread) handleMarkOne(n.id);
                            setOpen(false);
                          }}
                          className="flex-1 min-w-0 pr-8 block"
                        >
                          <p className={`text-xs ${isUnread ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                            {n.message || n.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {formatRelativeTime(n.createdAt)}
                            </span>
                            <span className="text-[10px] font-bold text-rose-600 hover:underline border border-rose-200 bg-white px-2 py-0.5 rounded-full inline-block">
                              View
                            </span>
                          </div>
                        </Link>

                        {/* RIGHT: Three-dot Options Button */}
                        <div className="absolute right-2 top-3 flex items-center gap-1">
                          <button
                            onClick={() => setActiveOptionItem(n)}
                            aria-label="Notification options"
                            className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Three-Dot Action Popover / Slide-in Modal */}
      <AnimatePresence>
        {activeOptionItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-900 text-sm">Notification Options</h4>
                <button
                  onClick={() => setActiveOptionItem(null)}
                  aria-label="Close"
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 line-clamp-2">
                "{activeOptionItem.message || activeOptionItem.title}"
              </div>

              <div className="space-y-2">
                {!activeOptionItem.read && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleMarkOne(activeOptionItem.id);
                      setActiveOptionItem(null);
                    }}
                    className="w-full justify-start text-xs text-slate-700 border-slate-200 hover:bg-slate-50"
                  >
                    <Check className="w-4 h-4 mr-2 text-rose-600" /> Mark as read
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={deletingId === activeOptionItem.id}
                  onClick={() => handleDismiss(activeOptionItem.id, !activeOptionItem.read)}
                  className="w-full justify-start text-xs text-red-600 border-red-200 hover:bg-red-50 font-semibold"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deletingId === activeOptionItem.id ? "Deleting..." : "🗑 Delete notification"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
