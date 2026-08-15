"use client";

import Link from "next/link";
import { useState } from "react";
import { Camera, Copy, CheckCheck, Star, Crown } from "lucide-react";

interface ProfileSidebarCardProps {
  name: string;
  publicId: string | null;
  membershipLabel: string;
  isPremium: boolean;
  photoUrl?: string | null;
  completionPercent: number;
}

export function ProfileSidebarCard({
  name,
  publicId,
  membershipLabel,
  isPremium,
  photoUrl,
  completionPercent,
}: ProfileSidebarCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!publicId) return;
    await navigator.clipboard.writeText(publicId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-sm"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      {/* Top gradient banner */}
      <div
        className="h-16 w-full"
        style={{ background: "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 50%, #FED7AA 100%)" }}
      />

      {/* Avatar section */}
      <div className="relative -mt-10 flex flex-col items-center px-4 pb-4">
        <Link href="/onboarding" className="relative group" aria-label="Edit profile photo">
          <div
            className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden flex items-center justify-center text-white text-xl font-bold"
            style={{ background: photoUrl ? undefined : "linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)" }}
          >
            {photoUrl ? (
              <img src={photoUrl} alt={`${name}'s photo`} className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <span
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm"
            style={{ backgroundColor: "#E11D48" }}
          >
            <Camera className="w-3 h-3 text-white" aria-hidden="true" />
          </span>
        </Link>

        {/* Name */}
        <h2 className="mt-3 text-base font-bold text-center" style={{ color: "#111827" }}>
          {name}
        </h2>

        {/* Brand line */}
        <p className="text-xs font-medium" style={{ color: "#9CA3AF" }}>InstantMatrimony</p>

        {/* Profile ID */}
        {publicId ? (
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className="text-xs font-mono font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "#FFF1F2", color: "#E11D48", border: "1px solid #FECDD3" }}
            >
              {publicId}
            </span>
            <button
              onClick={handleCopy}
              aria-label={`Copy Profile ID ${publicId}`}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              {copied ? (
                <CheckCheck className="w-3.5 h-3.5" style={{ color: "#16A34A" }} />
              ) : (
                <Copy className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
              )}
            </button>
          </div>
        ) : (
          <div className="mt-2 h-7" />
        )}

        {/* Membership badge */}
        <span
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
          style={
            isPremium
              ? { backgroundColor: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" }
              : { backgroundColor: "#F3F4F6", color: "#6B7280", border: "1px solid #E5E7EB" }
          }
        >
          {isPremium ? <Crown className="w-3 h-3" /> : <Star className="w-3 h-3" />}
          {membershipLabel}
        </span>

        {/* Completion bar */}
        <div className="mt-3 w-full">
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: "#6B7280" }}>Profile Complete</span>
            <span className="font-bold" style={{ color: "#E11D48" }}>{completionPercent}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: "#F3F4F6" }}>
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${completionPercent}%`, backgroundColor: "#E11D48" }}
              role="progressbar"
              aria-valuenow={completionPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Profile ${completionPercent}% complete`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
