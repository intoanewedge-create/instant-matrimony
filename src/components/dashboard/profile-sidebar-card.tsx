"use client";

import Link from "next/link";
import Image from "next/image";
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
      className="rounded-2xl border overflow-hidden shadow-xs"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      {/* Top gradient banner */}
      <div
        className="h-16 w-full"
        style={{ background: "linear-gradient(135deg, #E6F4EA 0%, #D1E7DD 50%, #FEF3C7 100%)" }}
      />

      {/* Avatar section */}
      <div className="relative -mt-10 flex flex-col items-center px-4 pb-4">
        <Link href="/profile" className="relative group" aria-label="Edit profile photo">
          <div
            className="relative w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden flex items-center justify-center text-white text-xl font-bold"
            style={{ background: photoUrl ? undefined : "linear-gradient(135deg, #00A76F 0%, #008F60 100%)" }}
          >
            {photoUrl ? (
              <Image src={photoUrl} alt={`${name}'s photo`} fill className="object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <span
            className="absolute bottom-0 right-0 w-6.5 h-6.5 rounded-full border-2 border-white flex items-center justify-center shadow-xs"
            style={{ backgroundColor: "#00A76F" }}
          >
            <Camera className="w-3.5 h-3.5 text-white" aria-hidden="true" />
          </span>
        </Link>

        {/* Profile ID directly below photo */}
        {publicId ? (
          <div className="mt-2.5 flex items-center gap-1.5">
            <span
              className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: "#E6F4EA", color: "#00A76F", border: "1px solid #A7F3D0" }}
            >
              Profile ID: {publicId}
            </span>
            <button
              onClick={handleCopy}
              aria-label={`Copy Profile ID ${publicId}`}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {copied ? (
                <CheckCheck className="w-3.5 h-3.5" style={{ color: "#16A34A" }} />
              ) : (
                <Copy className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
              )}
            </button>
          </div>
        ) : (
          <div className="mt-2.5 h-6" />
        )}

        {/* Name */}
        <h2 className="mt-2 text-base font-bold text-center" style={{ color: "#1F2937" }}>
          {name}
        </h2>

        {/* Brand line */}
        <p className="text-xs font-medium" style={{ color: "#6B7280" }}>InstantMatrimony</p>

        {/* Membership badge */}
        <span
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
          style={
            isPremium
              ? { backgroundColor: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }
              : { backgroundColor: "#F3F4F6", color: "#6B7280", border: "1px solid #E5E7EB" }
          }
        >
          {isPremium ? <Crown className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
          {membershipLabel}
        </span>

        {/* Completion bar */}
        <div className="mt-3.5 w-full">
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: "#6B7280" }}>Profile Complete</span>
            <span className="font-bold" style={{ color: "#00A76F" }}>{completionPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: "#F3F4F6" }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${completionPercent}%`, backgroundColor: "#00A76F" }}
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
