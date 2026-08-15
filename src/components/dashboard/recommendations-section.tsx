"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Eye, MapPin, ShieldCheck, ChevronRight } from "lucide-react";
import { sendInterestAction } from "@/lib/actions/interest.actions";
import { toggleFavoriteAction } from "@/lib/actions/favorite.actions";

interface RecommendationsSectionProps {
  suggestions: any[];
}

export function RecommendationsSection({ suggestions }: RecommendationsSectionProps) {
  const [items, setItems] = useState(suggestions);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleSendInterest = async (userId: string) => {
    setProcessingId(userId);
    try {
      const res = await sendInterestAction(userId);
      if (res.success) {
        setItems((prev) =>
          prev.map((s) => {
            const sUserId = s?.profile?.userId || s?.userId;
            return sUserId === userId ? { ...s, interestSent: true } : s;
          })
        );
      }
    } catch {
      // ignore
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleFavorite = async (userId: string) => {
    try {
      const res = await toggleFavoriteAction(userId);
      if (res.success) {
        setItems((prev) =>
          prev.map((s) => {
            const sUserId = s?.profile?.userId || s?.userId;
            return sUserId === userId ? { ...s, favorited: !s.favorited } : s;
          })
        );
      }
    } catch {
      // ignore
    }
  };

  const formatHeight = (cm: number | null) => {
    if (!cm) return null;
    const totalInches = Math.round(cm / 2.54);
    return `${Math.floor(totalInches / 12)}'${totalInches % 12}"`;
  };

  return (
    <div
      className="rounded-2xl border shadow-xs overflow-hidden"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "#F3F4F6" }}
      >
        <div>
          <h2 className="text-base font-bold" style={{ color: "#1F2937" }}>Daily Recommendations</h2>
          <p className="text-xs" style={{ color: "#6B7280" }}>Recommended matches for today</p>
        </div>
        <Link
          href="/matches"
          className="flex items-center gap-1 text-xs font-bold hover:opacity-80 transition-opacity"
          style={{ color: "#00A76F" }}
          aria-label="View all matches"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Cards */}
      <div className="p-4">
        {items.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: "#9CA3AF" }}>
              No recommendations yet. Complete your profile to get matched!
            </p>
            <Link
              href="/onboarding"
              className="mt-3 inline-block text-xs font-bold px-4 py-2 rounded-xl text-white shadow-xs"
              style={{ backgroundColor: "#00A76F" }}
            >
              Complete Profile
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((s: any, idx: number) => {
              const p = s?.profile || s;
              const userId = p?.userId || s?.userId || `rec-${idx}`;
              const name = p?.name || s?.name || "Member";
              const age = p?.age ?? s?.age;
              const height = p?.height ?? s?.height;
              const city = p?.city || s?.city;
              const state = p?.state || s?.state;
              const matchScore = s?.rankingScore || s?.compatibility?.score;
              const isVerified = s?.user?.identityVerification?.status === "APPROVED";
              const photos: any[] = p?.photos || [];
              const mainPhoto = photos.find((ph: any) => ph.isMain)?.url || photos[0]?.url;
              const publicId = p?.publicId || null;

              return (
                <div
                  key={userId}
                  className="rounded-xl border overflow-hidden shadow-xs hover:shadow-md transition-all group"
                  style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}
                >
                  {/* Portrait photo — approx 3:4 ratio */}
                  <div className="relative" style={{ paddingBottom: "133%" }}>
                    <div className="absolute inset-0" style={{ backgroundColor: "#F9FAFB" }}>
                      {mainPhoto ? (
                        <img
                          src={mainPhoto}
                          alt={`${name}'s profile photo`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-3xl font-bold"
                          style={{ background: "linear-gradient(135deg, #E6F4EA, #D1E7DD)", color: "#00A76F" }}
                        >
                          {name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Match score badge */}
                    {matchScore > 0 && (
                      <span
                        className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full text-white shadow-xs"
                        style={{ backgroundColor: "#00A76F" }}
                      >
                        {matchScore}% Match
                      </span>
                    )}

                    {/* Favorite button */}
                    <button
                      onClick={() => handleToggleFavorite(userId)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full border flex items-center justify-center shadow-xs hover:scale-110 transition-transform"
                      style={{ backgroundColor: "rgba(255,255,255,0.9)", borderColor: "#E5E7EB" }}
                      aria-label={s.favorited ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
                    >
                      <Heart
                        className="w-3.5 h-3.5"
                        style={{ color: s.favorited ? "#00A76F" : "#9CA3AF", fill: s.favorited ? "#00A76F" : "none" }}
                      />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-1">
                    <div className="flex items-center gap-1">
                      <h3 className="text-sm font-bold truncate" style={{ color: "#1F2937" }}>{name}</h3>
                      {isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" style={{ color: "#00A76F" }} aria-label="Verified profile" />
                      )}
                    </div>

                    <p className="text-xs" style={{ color: "#6B7280" }}>
                      {age ? `${age} yrs` : ""}
                      {age && height ? " • " : ""}
                      {height ? formatHeight(height) : ""}
                    </p>

                    {(city || state) && (
                      <p className="text-xs flex items-center gap-1" style={{ color: "#6B7280" }}>
                        <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                        {city}{city && state ? ", " : ""}{state}
                      </p>
                    )}

                    {publicId && (
                      <p className="text-xs font-mono font-bold" style={{ color: "#00A76F" }}>{publicId}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-3 pb-3 flex gap-2">
                    <Link
                      href={`/profile/${userId}`}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs font-semibold hover:bg-gray-50 transition-colors"
                      style={{ borderColor: "#E5E7EB", color: "#374151" }}
                    >
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" /> View
                    </Link>
                    <button
                      disabled={s.interestSent || processingId === userId}
                      onClick={() => handleSendInterest(userId)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-95 disabled:opacity-60"
                      style={{ backgroundColor: s.interestSent ? "#9CA3AF" : "#00A76F" }}
                      aria-label={s.interestSent ? `Interest already sent to ${name}` : `Send interest to ${name}`}
                    >
                      <Heart className="w-3.5 h-3.5" aria-hidden="true" />
                      {processingId === userId ? "..." : s.interestSent ? "Sent" : "Interest"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All footer */}
        {items.length > 0 && (
          <div className="mt-4 text-center">
            <Link
              href="/matches"
              className="inline-flex items-center gap-1 text-xs font-bold hover:opacity-80 transition-opacity"
              style={{ color: "#00A76F" }}
            >
              View All Matches <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
