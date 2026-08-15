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
      href: "/onboarding",
      icon: Edit3,
      label: "Edit profile",
    },
    {
      href: "/onboarding?step=8",
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

  const externalServices = [
    { name: "AstroFreeChat.com", href: "https://astrofreechat.com" },
    { name: "WeddingBazaar.com", href: "https://weddingbazaar.com" },
    { name: "Mandap.com", href: "https://mandap.com" },
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

      {/* Community & Other Services Card */}
      <div
        className="rounded-2xl border shadow-xs overflow-hidden"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
      >
        <div className="p-3 border-b" style={{ borderColor: "#F3F4F6" }}>
          <div className="flex items-center justify-between text-xs font-bold" style={{ color: "#1F2937" }}>
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4" style={{ color: "#00A76F" }} />
              <span>Matrimony Services</span>
            </div>
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#FF6B00" }} />
          </div>
        </div>

        {/* Divider & Matrimony.com Other Services */}
        <div className="p-3 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
            Matrimony.com - Other Services
          </p>
          <div className="space-y-1">
            {externalServices.map(({ name, href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
                style={{ color: "#4B5563" }}
              >
                <span>{name}</span>
                <ExternalLink className="w-3 h-3" style={{ color: "#9CA3AF" }} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
