"use client";

import Link from "next/link";
import {
  UserCheck,
  Edit3,
  Sliders,
  HelpCircle,
  Settings,
  HeartHandshake,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export function QuickActionsSidebar() {
  const accountActions = [
    {
      href: "/profile",
      icon: Edit3,
      label: "Edit profile",
    },
    {
      href: "/profile?tab=preferences",
      icon: Sliders,
      label: "Edit preferences",
    },
    {
      href: "/contact",
      icon: HelpCircle,
      label: "Support & feedback",
    },
    {
      href: "/settings",
      icon: Settings,
      label: "Settings",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Account Management Card */}
      <div
        className="rounded-2xl border shadow-xs overflow-hidden"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
      >
        <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: "#F3F4F6" }}>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6B7280" }}>
            Account Management
          </span>
          <Link
            href="/login"
            className="flex items-center gap-1 text-xs font-semibold hover:underline"
            style={{ color: "#00A76F" }}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Switch account</span>
          </Link>
        </div>

        <div className="p-2 space-y-1">
          {accountActions.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-emerald-50"
              style={{ color: "#374151" }}
            >
              <Icon className="w-4 h-4" style={{ color: "#00A76F" }} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
