"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
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
  Sparkles,
  Zap,
} from "lucide-react";
import { formatDate } from "@/lib/utils/format";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<"all" | "interactions" | "urgent">("all");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  // Filter notifications by tab
  const filteredNotifs = notifications.filter((n: any) => {
    if (notifTab === "interactions") {
      return n.type === "INTEREST" || n.type === "MESSAGE" || n.title?.toLowerCase().includes("interest") || n.title?.toLowerCase().includes("message");
    }
    if (notifTab === "urgent") {
      return n.type === "SYSTEM" || n.title?.toLowerCase().includes("urgent") || n.title?.toLowerCase().includes("review");
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
        <Link href="/dashboard" className="flex items-center space-x-2.5 select-none shrink-0">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-100 shadow-xs">
            <Image
              src="/InstantMatrimony-Logo.jpeg"
              alt="InstantMatrimony Logo"
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          </div>
          <span className="text-lg font-bold tracking-tight hidden sm:block" style={{ color: "#1F2937" }}>
            Instant<span style={{ color: "#00A76F" }} className="font-extrabold">Matrimony</span>
          </span>
        </Link>

        {/* CENTER — Desktop Icon + Label Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-3" aria-label="Main navigation">
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
            >
              <div className="relative">
                <Bell className="w-5 h-5" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: "#00A76F" }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span>Notification</span>
            </button>

            {/* Notification Floating Popup Dropdown */}
            {notifOpen && (
              <div
                className="absolute right-1/2 translate-x-1/2 md:translate-x-0 md:right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
                role="region"
                aria-label="Notifications menu"
              >
                {/* Top arrow */}
                <div
                  className="absolute -top-2 right-12 w-4 h-4 rotate-45 border-l border-t"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
                />

                {/* Dropdown Header */}
                <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "#F3F4F6", backgroundColor: "#FAFAFA" }}>
                  <h3 className="text-sm font-bold" style={{ color: "#1F2937" }}>Notifications</h3>
                  {unreadCount > 0 && (
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#E6F4EA", color: "#00A76F" }}
                    >
                      {unreadCount} unread
                    </span>
                  )}
                </div>

                {/* Header Filter Tabs */}
                <div className="flex p-2 gap-1 border-b" style={{ borderColor: "#F3F4F6", backgroundColor: "#FFFFFF" }}>
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
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Notifications List / Matrimonial Bell Empty State */}
                <div className="max-h-80 overflow-y-auto p-3">
                  {filteredNotifs.length === 0 ? (
                    <div className="py-8 px-4 text-center flex flex-col items-center">
                      {/* Gold ringing bell illustration */}
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 border shadow-xs" style={{ backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }}>
                        <Bell className="w-7 h-7 animate-bounce" style={{ color: "#D97706" }} />
                      </div>
                      <p className="text-sm font-bold" style={{ color: "#1F2937" }}>You have no notifications so far</p>
                      <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                        We'll notify you when someone views your profile or sends an interest.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredNotifs.slice(0, 6).map((n: any) => (
                        <div
                          key={n.id || n.title}
                          className="p-3 rounded-xl text-xs space-y-1 border transition-colors hover:bg-gray-50"
                          style={{
                            backgroundColor: n.read ? "#FFFFFF" : "#E6F4EA",
                            borderColor: n.read ? "#F3F4F6" : "#A7F3D0",
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-sm" style={{ color: "#1F2937" }}>{n.title}</span>
                            <span className="text-[10px]" style={{ color: "#9CA3AF" }}>{formatDate(n.createdAt)}</span>
                          </div>
                          <p style={{ color: "#4B5563" }}>{n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* RIGHT — Actions: Upgrade Pill + Profile Avatar Dropdown */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Admin badge */}
          {isAdmin && (
            <Link href="/admin">
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer">
                <Shield className="w-3.5 h-3.5" /> Admin
              </span>
            </Link>
          )}

          {/* Orange Upgrade Pill / Button */}
          <Link href="/dashboard/billing">
            <span
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-sm cursor-pointer transition-all hover:opacity-95 transform active:scale-95"
              style={{ backgroundColor: "#FF6B00" }}
            >
              <Crown className="w-4 h-4" />
              <span>{isPremium ? planName : "Upgrade"}</span>
            </span>
          </Link>

          {/* Profile Avatar + Dropdown */}
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
                {/* User info header */}
                <div className="px-4 py-3 border-b" style={{ borderColor: "#F3F4F6", backgroundColor: "#FAFAFA" }}>
                  <p className="text-sm font-bold truncate" style={{ color: "#1F2937" }}>{userName}</p>
                  {publicId && (
                    <p className="text-xs font-mono font-semibold" style={{ color: "#00A76F" }}>{publicId}</p>
                  )}
                </div>

                {/* Menu items */}
                <div className="py-1">
                  {[
                    { href: "/profile", label: "My Profile", icon: User },
                    { href: "/settings", label: "Settings", icon: Settings },
                    { href: "/dashboard/billing", label: "Membership", icon: CreditCard },
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

                <div className="border-t py-1" style={{ borderColor: "#F3F4F6" }}>
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

          {/* Mobile hamburger button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" style={{ color: "#1F2937" }} /> : <Menu className="w-5 h-5" style={{ color: "#1F2937" }} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Menu */}
      {mobileOpen && (
        <nav
          className="md:hidden border-t animate-in fade-in slide-in-from-top-1"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
          aria-label="Mobile navigation"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    active ? "bg-emerald-50 text-emerald-700" : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <Icon className="w-5 h-5" style={{ color: active ? "#00A76F" : "#6B7280" }} aria-hidden="true" />
                  {label}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                <Shield className="w-5 h-5" /> Admin Panel
              </Link>
            )}

            <div className="border-t pt-3 mt-2" style={{ borderColor: "#F3F4F6" }}>
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
