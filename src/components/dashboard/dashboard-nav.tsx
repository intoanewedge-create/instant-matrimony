"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Home,
  Heart,
  MessageSquare,
  Search,
  Bell,
  Sparkles,
  Shield,
  ChevronDown,
  User,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface DashboardNavProps {
  userName: string;
  publicId: string | null;
  isPremium: boolean;
  planName: string;
  isAdmin: boolean;
  signOutAction: () => Promise<void>;
}

const navLinks = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/search", label: "Matches", icon: Sparkles },
  { href: "/interests", label: "Interests", icon: Heart },
  { href: "/messages", label: "Chat", icon: MessageSquare },
  { href: "/find", label: "Search", icon: Search },
  { href: "/dashboard/recommendations", label: "Notifications", icon: Bell },
];

export function DashboardNav({
  userName,
  publicId,
  isPremium,
  planName,
  isAdmin,
  signOutAction,
}: DashboardNavProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
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

  return (
    <header
      className="sticky top-0 z-40 w-full border-b shadow-sm"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">

        {/* LEFT — Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2.5 select-none shrink-0">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-rose-100 shadow-sm">
            <Image
              src="/InstantMatrimony-Logo.jpeg"
              alt="InstantMatrimony Logo"
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          </div>
          <span className="text-lg font-bold tracking-tight hidden sm:block" style={{ color: "#111827" }}>
            Instant<span className="text-rose-600 font-extrabold">Matrimony</span>
          </span>
        </Link>

        {/* CENTER — Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? "text-rose-600 bg-rose-50"
                    : "hover:bg-gray-50 hover:text-rose-600"
                }`}
                style={{ color: active ? "#E11D48" : "#6B7280" }}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span>{label}</span>
                {active && (
                  <span className="block w-4 h-0.5 rounded-full bg-rose-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT — Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Admin badge */}
          {isAdmin && (
            <Link href="/admin">
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer">
                <Shield className="w-3.5 h-3.5" /> Admin
              </span>
            </Link>
          )}

          {/* Upgrade pill */}
          <Link href="/dashboard/billing">
            <span
              className={`hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-all ${
                isPremium
                  ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                  : "bg-rose-600 text-white border-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-200"
              }`}
            >
              {isPremium ? (
                <><Sparkles className="w-3.5 h-3.5" /> {planName}</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5" /> Upgrade</>
              )}
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
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)" }}
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
                className="absolute right-0 mt-2 w-56 rounded-2xl border shadow-xl overflow-hidden z-50"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
                role="menu"
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b" style={{ borderColor: "#F3F4F6", backgroundColor: "#FAFAFA" }}>
                  <p className="text-sm font-bold truncate" style={{ color: "#111827" }}>{userName}</p>
                  {publicId && (
                    <p className="text-xs font-mono" style={{ color: "#6B7280" }}>{publicId}</p>
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
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 transition-colors text-red-600"
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

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" style={{ color: "#374151" }} /> : <Menu className="w-5 h-5" style={{ color: "#374151" }} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Sheet */}
      {mobileOpen && (
        <nav
          className="lg:hidden border-t"
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active ? "bg-rose-50 text-rose-600" : "hover:bg-gray-50"
                  }`}
                  style={{ color: active ? "#E11D48" : "#374151" }}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Shield className="w-5 h-5" /> Admin Panel
              </Link>
            )}

            <div className="border-t pt-3 mt-2" style={{ borderColor: "#F3F4F6" }}>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
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
