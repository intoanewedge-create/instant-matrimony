"use client";

import Link from "next/link";
import { Sparkles, CheckCircle, ArrowRight } from "lucide-react";

interface UpgradeCardProps {
  isPremium: boolean;
  planName: string;
  daysRemaining?: number;
}

export function UpgradeCard({ isPremium, planName, daysRemaining }: UpgradeCardProps) {
  if (isPremium) {
    return (
      <div
        className="rounded-2xl border p-4 shadow-sm"
        style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4" style={{ color: "#B45309" }} />
          <h3 className="text-sm font-bold" style={{ color: "#92400E" }}>{planName}</h3>
        </div>
        {daysRemaining !== undefined && daysRemaining > 0 ? (
          <p className="text-xs" style={{ color: "#B45309" }}>
            {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
          </p>
        ) : (
          <p className="text-xs" style={{ color: "#B45309" }}>Active membership</p>
        )}
        <Link
          href="/dashboard/billing"
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors"
          style={{ backgroundColor: "#FCD34D", color: "#92400E" }}
        >
          View Plan Details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-sm"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      {/* Gradient header */}
      <div
        className="px-4 pt-4 pb-3"
        style={{ background: "linear-gradient(135deg, #FFF1F2 0%, #FFF7ED 100%)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4" style={{ color: "#E11D48" }} />
          <h3 className="text-sm font-bold" style={{ color: "#111827" }}>Upgrade Your Membership</h3>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>
          Unlock contact details, priority visibility, and VIP concierge matching.
        </p>
      </div>

      {/* Plans */}
      <div className="px-4 py-3 space-y-2">
        {[
          { price: "₹1,000", label: "Standard", detail: "30 days • 5 contact unlocks" },
          { price: "₹5,00,000", label: "VIP Concierge", detail: "Valid till marriage" },
        ].map((plan) => (
          <div
            key={plan.label}
            className="flex items-center gap-2 text-xs"
            style={{ color: "#374151" }}
          >
            <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: "#16A34A" }} />
            <span><strong>{plan.price}</strong> — {plan.label} · {plan.detail}</span>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4">
        <Link
          href="/dashboard/billing"
          className="block w-full text-center py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 shadow-sm"
          style={{ background: "linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)" }}
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  );
}
