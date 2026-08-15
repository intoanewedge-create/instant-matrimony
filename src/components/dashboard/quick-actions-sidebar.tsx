"use client";

import Link from "next/link";
import { Edit3, Sliders } from "lucide-react";

export function QuickActionsSidebar() {
  const actions = [
    {
      href: "/onboarding",
      icon: Edit3,
      label: "Edit Profile",
      desc: "Update your biodata",
    },
    {
      href: "/onboarding?step=8",
      icon: Sliders,
      label: "Edit Preferences",
      desc: "Partner criteria",
    },
  ];

  return (
    <div
      className="rounded-2xl border shadow-sm overflow-hidden"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="px-4 py-3 border-b" style={{ borderColor: "#F3F4F6" }}>
        <h3 className="text-sm font-bold" style={{ color: "#111827" }}>Quick Actions</h3>
      </div>
      <div className="p-3 space-y-2">
        {actions.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 p-3 rounded-xl border hover:border-rose-200 hover:bg-rose-50 transition-all group"
            style={{ borderColor: "#F3F4F6" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#FFF1F2" }}
            >
              <Icon className="w-4 h-4" style={{ color: "#E11D48" }} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: "#111827" }}>{label}</p>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
