"use client";

import Link from "next/link";
import { Crown, Sparkles, ArrowRight } from "lucide-react";

interface UpgradeCardProps {
  isPremium: boolean;
  planName: string;
  daysRemaining?: number;
}

export function UpgradeCard({ isPremium, planName, daysRemaining }: UpgradeCardProps) {
  if (isPremium) {
    return (
      <div
        className="rounded-2xl border p-4 shadow-xs"
        style={{ backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Crown className="w-4 h-4" style={{ color: "#D97706" }} />
          <h3 className="text-sm font-bold" style={{ color: "#92400E" }}>{planName}</h3>
        </div>
        {daysRemaining !== undefined && daysRemaining > 0 ? (
          <p className="text-xs" style={{ color: "#B45309" }}>
            {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
          </p>
        ) : (
          <p className="text-xs" style={{ color: "#B45309" }}>Active premium membership</p>
        )}
        <Link
          href="/dashboard/billing"
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all text-white shadow-xs"
          style={{ backgroundColor: "#FF6B00" }}
        >
          Manage Plan <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border p-4 shadow-xs flex flex-col justify-between"
      style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs"
          style={{ backgroundColor: "#FEF3C7", border: "1px solid #FCD34D" }}
        >
          <Crown className="w-4 h-4" style={{ color: "#FF6B00" }} />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: "#1F2937" }}>
            Upgrade Membership
          </h3>
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#6B7280" }}>
            Upgrade membership to call or message with matches
          </p>
        </div>
      </div>

      <Link
        href="/dashboard/billing"
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs font-bold text-white shadow-xs transition-all hover:opacity-95 transform active:scale-95"
        style={{ backgroundColor: "#FF6B00" }}
      >
        <Crown className="w-4 h-4" />
        <span>Upgrade now</span>
      </Link>
    </div>
  );
}
