"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { Bell, CheckCheck, Clock, Sparkles, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getRecentNotificationsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  dismissNotificationAction,
} from "@/lib/actions/notification.actions";
import { motion, AnimatePresence } from "framer-motion";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string | Date;
  read: boolean;
  category?: string;
  type?: string;
};

export function NotificationBell({
  initialNotifications = [],
  initialUnreadCount = 0,
}: {
  initialNotifications?: NotificationItem[];
  initialUnreadCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(
    initialNotifications || [],
  );
  const [unread, setUnread] = useState<number>(initialUnreadCount || 0);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const res = await getRecentNotificationsAction(10);
    if (res.success) {
      setItems((res.notifications as NotificationItem[]) || []);
      setUnread(res.unreadCount || 0);
    }
  }, []);

  // Refresh when dropdown opens + light polling every 30s.
  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  useEffect(() => {
    const int = setInterval(() => refresh(), 30000);
    return () => clearInterval(int);
  }, [refresh]);

  const handleMarkOne = (id: string) => {
    // Optimistic
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnread((c) => Math.max(0, c - 1));
    startTransition(async () => {
      await markNotificationAsReadAction(id);
    });
  };

  const handleDismiss = (id: string, wasUnread: boolean) => {
    // Optimistic remove
    setItems((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) {
      setUnread((c) => Math.max(0, c - 1));
    }
    startTransition(async () => {
      await dismissNotificationAction(id);
    });
  };

  const handleMarkAll = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    startTransition(async () => {
      await markAllNotificationsAsReadAction();
    });
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open notifications"
        className="relative border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
      >
        <Bell className="w-4 h-4 text-rose-600" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
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
              className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
              role="dialog"
              aria-label="Notifications"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-600" />
                  <h3 className="font-semibold text-slate-900 text-sm">
                    Notifications
                  </h3>
                  {unread > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                      {unread} new
                    </span>
                  )}
                </div>
                <button
                  onClick={handleMarkAll}
                  disabled={pending || unread === 0}
                  className="text-[11px] text-rose-600 hover:text-rose-700 disabled:opacity-40 flex items-center gap-1 font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              </div>

              <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
                {items.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    You're all caught up ✨
                  </div>
                ) : (
                  items.map((n) => {
                    const isUnread = !n.read;
                    return (
                      <div
                        key={n.id}
                        className={`w-full text-left px-4 py-3 transition-colors flex items-start gap-3 group relative ${
                          isUnread
                            ? "bg-rose-50/60 hover:bg-rose-50/90"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="pt-1 shrink-0">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              isUnread
                                ? "bg-rose-600 animate-pulse"
                                : "bg-slate-300"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0 pr-12">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-xs font-semibold truncate ${isUnread ? "text-slate-900" : "text-slate-600"}`}
                            >
                              {n.title}
                            </p>
                            <span className="text-[9px] text-slate-400 flex items-center gap-0.5 shrink-0">
                              <Clock className="w-2.5 h-2.5" />
                              {new Date(n.createdAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <p
                            className={`text-[11px] mt-0.5 line-clamp-2 ${isUnread ? "text-slate-700" : "text-slate-500"}`}
                          >
                            {n.message}
                          </p>
                        </div>
                        <div className="absolute right-2 top-3 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {isUnread && (
                            <button
                              onClick={() => handleMarkOne(n.id)}
                              title="Mark as read"
                              className="p-1 rounded hover:bg-rose-100 text-rose-600 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDismiss(n.id, isUnread)}
                            title="Dismiss notification"
                            className="p-1 rounded hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
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
    </div>
  );
}
