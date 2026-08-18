"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Home,
  Users,
  Heart,
  MessageSquare,
  Search,
  Bell,
  Crown,
  Shield,
  ChevronDown,
  User,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
  Check,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import {
  getRecentNotificationsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  dismissNotificationAction,
} from "@/lib/actions/notification.actions";

interface DashboardNavProps {
  userName: string;
  publicId: string | null;
  isPremium: boolean;
  planName: string;
  isAdmin: boolean;
  notifications?: any[];
  signOutAction: () => Promise<void>;
}

const navLinks = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/matches", label: "Matches", icon: Users },
  { href: "/interests", label: "Interests", icon: Heart },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/search", label: "Search", icon: Search },
];

export function DashboardNav({
  userName,
  publicId,
  isPremium,
  planName,
  isAdmin,
  notifications = [],
  signOutAction,
}: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<"all" | "interactions" | "urgent">(
    "all",
  );

  // Real notification records (seeded from server, refreshed on open)
  const [notifItems, setNotifItems] = useState<any[]>(notifications || []);
  const [busyId, setBusyId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const refreshNotifications = useCallback(async () => {
    const res = await getRecentNotificationsAction(15);
    if (res.success) {
      setNotifItems((res.notifications as any[]) || []);
    }
  }, []);

  // Sync with prop updates
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      setNotifItems(notifications);
    }
  }, [notifications]);

  // Fetch fresh state on opening dropdown
  useEffect(() => {
    if (notifOpen) refreshNotifications();
  }, [notifOpen, refreshNotifications]);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const unreadCount = notifItems.filter((n: any) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    if (busyId) return;
    setBusyId(id);
    try {
      const res = await markNotificationAsReadAction(id);
      if (res.success) {
        setNotifItems((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (busyId) return;
    setBusyId("ALL");
    try {
      const res = await markAllNotificationsAsReadAction();
      if (res.success) {
        setNotifItems((prev) => prev.map((n) => ({ ...n, read: true })));
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleDismiss = async (id: string) => {
    if (busyId) return;
    setBusyId(id);
    try {
      const res = await dismissNotificationAction(id);
      if (res.success) {
        setNotifItems((prev) => prev.filter((n) => n.id !== id));
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  };

  // Filter notifications by tab
  const filteredNotifs = notifItems.filter((n: any) => {
    const typeStr = (n.type || n.category || "").toString().toUpperCase();
    const textStr = `${n.title || ""} ${n.message || ""}`.toLowerCase();

    if (notifTab === "interactions") {
      return (
        typeStr.includes("INTEREST") ||
        typeStr.includes("MESSAGE") ||
        typeStr.includes("MATCH") ||
        typeStr.includes("VIEW") ||
        textStr.includes("interest") ||
        textStr.includes("message") ||
        textStr.includes("viewed")
      );
    }
    if (notifTab === "urgent") {
      return (
        typeStr.includes("SYSTEM") ||
        typeStr.includes("URGENT") ||
        typeStr.includes("ALERT") ||
        typeStr.includes("PAYMENT") ||
        typeStr.includes("VERIF") ||
        textStr.includes("urgent") ||
        textStr.includes("action required") ||
        textStr.includes("review") ||
        textStr.includes("verification")
      );
    }
    return true;
  });

  return (
    <header
      className="sticky top-0 z-40 w-full border-b shadow-xs"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* LEFT — Brand Logo */}
        <Link
          href="/dashboard"
          className="flex items-center space-x-2.5 select-none shrink-0"
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-100 shadow-xs">
            <Image
              src="/InstantMatrimony-Logo.jpeg"
              alt="InstantMatrimony Logo"
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          </div>
          <span
            className="text-lg font-bold tracking-tight hidden sm:block"
            style={{ color: "#1F2937" }}
          >
            Instant
            <span style={{ color: "#00A76F" }} className="font-extrabold">
              Matrimony
            </span>
          </span>
        </Link>

        {/* CENTER — Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-1.5 lg:gap-3"
          aria-label="Main navigation"
        >
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
                  active ? "font-bold" : "hover:bg-gray-50"
                }`}
                style={{ color: active ? "#00A76F" : "#6B7280" }}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span>{label}</span>
                {active && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                    style={{ backgroundColor: "#00A76F" }}
                  />
                )}
              </Link>
            );
          })}

          {/* Notification Nav Item */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
                notifOpen ? "font-bold" : "hover:bg-gray-50"
              }`}
              style={{ color: notifOpen ? "#00A76F" : "#6B7280" }}
              aria-label="Open notifications dropdown"
              aria-expanded={notifOpen}
              data-testid="notification-bell-btn"
            >
              <div className="relative">
                <Bell className="w-5 h-5" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: "#00A76F" }}
                    data-testid="notification-unread-badge"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span>Notification</span>
            </button>

            {/* Notification Dropdown */}
            {notifOpen && (
              <div
                className="fixed inset-x-2 top-16 sm:inset-x-auto sm:right-0 sm:top-auto sm:absolute mt-2 sm:w-96 max-w-sm sm:max-w-none rounded-2xl border shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 mx-auto"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
                role="region"
                aria-label="Notifications menu"
                data-testid="notification-popup"
              >
                {/* Arrow indicator */}
                <div
                  className="absolute -top-2 right-12 w-4 h-4 rotate-45 border-l border-t"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
                />

                {/* Dropdown Header */}
                <div
                  className="px-4 py-3 border-b flex items-center justify-between gap-2"
                  style={{ borderColor: "#F3F4F6", backgroundColor: "#FAFAFA" }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <h3
                      className="text-sm font-bold"
                      style={{ color: "#1F2937" }}
                    >
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "#E6F4EA", color: "#00A76F" }}
                      >
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        disabled={busyId === "ALL"}
                        className="text-[11px] font-bold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-emerald-50 disabled:opacity-50 transition-colors"
                        style={{ color: "#00A76F" }}
                        data-testid="notification-mark-all-read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setNotifOpen(false)}
                      aria-label="Close notifications"
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      style={{ color: "#6B7280" }}
                      data-testid="notification-close-btn"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div
                  className="flex p-2 gap-1 border-b"
                  style={{ borderColor: "#F3F4F6", backgroundColor: "#FFFFFF" }}
                >
                  {(["all", "interactions", "urgent"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setNotifTab(tab)}
                      className="flex-1 py-1 text-xs font-semibold rounded-lg capitalize transition-all"
                      style={
                        notifTab === tab
                          ? { backgroundColor: "#00A76F", color: "#FFFFFF" }
                          : { backgroundColor: "#F3F4F6", color: "#6B7280" }
                      }
                      data-testid={`notification-tab-${tab}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Notification Items List */}
                <div className="max-h-80 overflow-y-auto p-3">
                  {filteredNotifs.length === 0 ? (
                    <div className="py-8 px-4 text-center flex flex-col items-center">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mb-3 border shadow-xs"
                        style={{
                          backgroundColor: "#FEF3C7",
                          borderColor: "#FDE68A",
                        }}
                      >
                        <Bell
                          className="w-7 h-7 animate-bounce"
                          style={{ color: "#D97706" }}
                        />
                      </div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: "#1F2937" }}
                      >
                        You have no notifications so far
                      </p>
                      <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                        We&apos;ll notify you when someone views your profile or
                        sends an interest.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredNotifs.slice(0, 10).map((n: any) => (
                        <div
                          key={n.id || n.title}
                          className="p-3 rounded-xl text-xs space-y-1 border transition-colors hover:bg-gray-50"
                          style={{
                            backgroundColor: n.read ? "#FFFFFF" : "#E6F4EA",
                            borderColor: n.read ? "#F3F4F6" : "#A7F3D0",
                          }}
                          data-testid={`notification-item-${n.id}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span
                              className="font-bold text-sm"
                              style={{ color: "#1F2937" }}
                            >
                              {n.title}
                            </span>
                            <span
                              className="text-[10px]"
                              style={{ color: "#9CA3AF" }}
                            >
                              {formatDate(n.createdAt)}
                            </span>
                          </div>
                          <p style={{ color: "#4B5563" }}>{n.message}</p>
                          <div className="flex items-center justify-between pt-1 border-t border-gray-100/60 mt-1.5">
                            {!n.read ? (
                              <button
                                onClick={() => handleMarkRead(n.id)}
                                disabled={busyId === n.id}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                              >
                                <Check className="w-3 h-3" /> Mark read
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-medium">
                                Read
                              </span>
                            )}
                            <button
                              onClick={() => handleDismiss(n.id)}
                              disabled={busyId === n.id}
                              className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                              title="Dismiss notification"
                              aria-label="Dismiss notification"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* RIGHT — Upgrade & Profile Menu */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isAdmin && (
            <Link href="/admin">
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer">
                <Shield className="w-3.5 h-3.5" /> Admin
              </span>
            </Link>
          )}

          <Link href="/dashboard/billing">
            <span
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-sm cursor-pointer transition-all hover:opacity-95 transform active:scale-95"
              style={{ backgroundColor: "#FF6B00" }}
            >
              <Crown className="w-4 h-4" />
              <span>{isPremium ? planName : "Upgrade"}</span>
            </span>
          </Link>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border hover:bg-gray-50 transition-colors"
              style={{ borderColor: "#E5E7EB" }}
              aria-label="Open profile menu"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs"
                style={{ backgroundColor: "#00A76F" }}
                aria-hidden="true"
              >
                {initials}
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                style={{ color: "#6B7280" }}
              />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl border shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
                role="menu"
              >
                <div
                  className="px-4 py-3 border-b"
                  style={{ borderColor: "#F3F4F6", backgroundColor: "#FAFAFA" }}
                >
                  <p
                    className="text-sm font-bold truncate"
                    style={{ color: "#1F2937" }}
                  >
                    {userName}
                  </p>
                  {publicId && (
                    <p
                      className="text-xs font-mono font-semibold"
                      style={{ color: "#00A76F" }}
                    >
                      {publicId}
                    </p>
                  )}
                </div>

                <div className="py-1">
                  {[
                    { href: "/profile", label: "My Profile", icon: User },
                    { href: "/settings", label: "Settings", icon: Settings },
                    {
                      href: "/dashboard/billing",
                      label: "Membership",
                      icon: CreditCard,
                    },
                  ].map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: "#374151" }}
                      role="menuitem"
                    >
                      <Icon className="w-4 h-4" style={{ color: "#9CA3AF" }} />
                      {label}
                    </Link>
                  ))}
                </div>

                <div
                  className="border-t py-1"
                  style={{ borderColor: "#F3F4F6" }}
                >
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 transition-colors text-red-600 font-medium"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={
              mobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" style={{ color: "#1F2937" }} />
            ) : (
              <Menu className="w-5 h-5" style={{ color: "#1F2937" }} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav
          className="md:hidden border-t max-h-[calc(100vh-4rem)] overflow-y-auto animate-in fade-in slide-in-from-top-1"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
          aria-label="Mobile navigation"
        >
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            {/* User Profile Card on Mobile */}
            <div
              className="p-3.5 rounded-2xl border flex items-center justify-between"
              style={{ backgroundColor: "#FAFAFA", borderColor: "#F3F4F6" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs shrink-0"
                  style={{ backgroundColor: "#00A76F" }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                  {publicId && (
                    <p className="text-xs font-mono font-semibold text-emerald-700">
                      Profile ID: {publicId}
                    </p>
                  )}
                </div>
              </div>

              <Link
                href="/dashboard/billing"
                onClick={() => setMobileOpen(false)}
                className="shrink-0"
              >
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: "#FF6B00" }}
                >
                  <Crown className="w-3 h-3" />
                  <span>{isPremium ? planName : "Upgrade"}</span>
                </span>
              </Link>
            </div>

            {/* Primary Navigation Links */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 pb-1">
                Navigation
              </p>
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      active
                        ? "bg-emerald-50 text-emerald-700"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className="w-5 h-5"
                        style={{ color: active ? "#00A76F" : "#6B7280" }}
                        aria-hidden="true"
                      />
                      <span>{label}</span>
                    </div>
                    {active && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    )}
                  </Link>
                );
              })}

              <Link
                href="/dashboard/concierge"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  pathname.startsWith("/dashboard/concierge")
                    ? "bg-rose-50 text-rose-700"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Crown
                    className="w-5 h-5"
                    style={{
                      color: pathname.startsWith("/dashboard/concierge")
                        ? "#E11D48"
                        : "#6B7280",
                    }}
                  />
                  <span>VIP Concierge</span>
                </div>
              </Link>
            </div>

            {/* Account & Settings Links */}
            <div className="space-y-1 border-t pt-3" style={{ borderColor: "#F3F4F6" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 pb-1">
                Account & Settings
              </p>
              {[
                { href: "/profile", label: "My Profile", icon: User },
                { href: "/settings", label: "Account Settings", icon: Settings },
                { href: "/dashboard/billing", label: "Manage Plan & Invoices", icon: CreditCard },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Icon className="w-5 h-5 text-gray-400" />
                  <span>{label}</span>
                </Link>
              ))}

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                >
                  <Shield className="w-5 h-5" /> Admin Management
                </Link>
              )}
            </div>

            {/* Logout Action */}
            <div className="border-t pt-3" style={{ borderColor: "#F3F4F6" }}>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </form>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
