"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Heart,
  Eye,
  Star,
  Sparkles,
  MapPin,
  ShieldCheck,
  MessageSquare,
  Compass,
  Filter,
  CheckCircle2,
  Calendar,
  BookOpen,
} from "lucide-react";
import { searchMatchesAction } from "@/lib/actions/search.actions";
import { sendInterestAction } from "@/lib/actions/interest.actions";
import { toggleFavoriteAction } from "@/lib/actions/favorite.actions";

interface MatchesClientProps {
  initialResults: {
    data: any[];
    totalRecords: number;
    page: number;
    totalPages: number;
  };
}

export function MatchesClient({ initialResults }: MatchesClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [resultsData, setResultsData] = useState<any[]>(initialResults?.data || []);
  const [totalRecords, setTotalRecords] = useState(initialResults?.totalRecords || 0);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("bestMatch");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const sidebarSections = [
    {
      title: "ALL MATCHES",
      items: [
        {
          id: "all",
          title: "Your Matches",
          subtitle: "View all profiles matching your preferences",
          filter: {},
        },
      ],
    },
    {
      title: "BASED ON ACTIVITY",
      items: [
        {
          id: "shortlisted_by_you",
          title: "Shortlisted by you",
          subtitle: "Matches you have shortlisted",
          filter: {},
        },
        {
          id: "viewed_you",
          title: "Viewed you",
          subtitle: "Matches who have viewed your profile",
          filter: {},
        },
        {
          id: "shortlisted_you",
          title: "Shortlisted you",
          subtitle: "Matches who have shortlisted your profile",
          filter: {},
        },
        {
          id: "viewed_by_you",
          title: "Viewed by you",
          subtitle: "Matches you have viewed",
          filter: {},
        },
      ],
    },
    {
      title: "RECENTLY JOINED & NEARBY",
      items: [
        {
          id: "newly_joined",
          title: "Newly Joined",
          subtitle: "Matches who joined within the last 30 days",
          filter: { recentlyJoined: true },
        },
        {
          id: "nearby",
          title: "Nearby matches",
          subtitle: "Matches near your location",
          filter: {},
        },
      ],
    },
    {
      title: "PROFILE DETAILS",
      items: [
        {
          id: "with_photos",
          title: "Matches with photos",
          subtitle: "Matches that have added photos",
          filter: { hasPhoto: true },
        },
        {
          id: "with_horoscope",
          title: "Matches with horoscope",
          subtitle: "Matches that have added horoscope",
          filter: {},
        },
      ],
    },
    {
      title: "ASTROLOGY",
      items: [
        {
          id: "star_matches",
          title: "Star matches",
          subtitle: "Matches with compatible star sign",
          filter: {},
        },
        {
          id: "horoscope_matches",
          title: "Horoscope matches",
          subtitle: "Matches with horoscope matching yours",
          filter: {},
        },
      ],
    },
    {
      title: "MUTUAL",
      items: [
        {
          id: "mutual_matches",
          title: "Mutual matches",
          subtitle: "Matches whose profile match your preferences and vice versa",
          filter: {},
        },
        {
          id: "looking_for_you",
          title: "Looking for you",
          subtitle: "Matches whose preferences match your profile",
          filter: {},
        },
      ],
    },
    {
      title: "PREFERENCES",
      items: [
        {
          id: "pref_education",
          title: "Education preference",
          subtitle: "Matches matching your education criteria",
          filter: {},
        },
        {
          id: "pref_profession",
          title: "Professional preference",
          subtitle: "Matches matching your career criteria",
          filter: {},
        },
        {
          id: "pref_location",
          title: "City / location preference",
          subtitle: "Matches in your preferred cities",
          filter: {},
        },
        {
          id: "pref_nri",
          title: "NRI matches",
          subtitle: "Non-resident Indian profiles",
          filter: {},
        },
      ],
    },
  ];

  const handleCategorySelect = async (cat: any) => {
    setActiveCategory(cat.id);
    setLoading(true);
    try {
      const res = await searchMatchesAction({
        filters: cat.filter || {},
        page: 1,
        limit: 12,
        sortBy,
      });
      if (res.success) {
        setResultsData(res.data || []);
        setTotalRecords(res.totalRecords || 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = async (newSort: string) => {
    setSortBy(newSort);
    setLoading(true);
    try {
      const res = await searchMatchesAction({
        filters: {},
        page: 1,
        limit: 12,
        sortBy: newSort,
      });
      if (res.success) {
        setResultsData(res.data || []);
        setTotalRecords(res.totalRecords || 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSendInterest = async (userId: string) => {
    setProcessingId(userId);
    try {
      const res = await sendInterestAction(userId);
      if (res.success) {
        setResultsData((prev) =>
          prev.map((item) => {
            const uId = item?.profile?.userId || item?.userId;
            return uId === userId ? { ...item, interestSent: true } : item;
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
        setResultsData((prev) =>
          prev.map((item) => {
            const uId = item?.profile?.userId || item?.userId;
            return uId === userId ? { ...item, favorited: !item.favorited } : item;
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
    <div className="space-y-6" style={{ color: "#1F2937" }}>
      {/* ── TWO-COLUMN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

        {/* ── 7A. MATCHES SIDEBAR (LEFT 28-30%) ── */}
        <aside className="space-y-4" aria-label="Matches category sidebar">
          <div
            className="rounded-2xl border shadow-xs overflow-hidden"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
          >
            <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: "#F3F4F6", backgroundColor: "#FAFAFA" }}>
              <Filter className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">Filter Matches</h2>
            </div>

            <div className="p-2 space-y-4 max-h-[80vh] overflow-y-auto">
              {sidebarSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <h3 className="px-3 pt-2 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                    {section.title}
                  </h3>
                  {section.items.map((item) => {
                    const selected = activeCategory === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleCategorySelect(item)}
                        className={`w-full text-left px-3 py-2 rounded-xl transition-all ${
                          selected ? "border" : "hover:bg-gray-50"
                        }`}
                        style={
                          selected
                            ? { backgroundColor: "#E6F4EA", borderColor: "#A7F3D0" }
                            : { backgroundColor: "transparent" }
                        }
                      >
                        <p
                          className="text-xs font-bold"
                          style={{ color: selected ? "#00A76F" : "#1F2937" }}
                        >
                          {item.title}
                        </p>
                        <p className="text-[11px] leading-tight" style={{ color: "#6B7280" }}>
                          {item.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── 7B & 7C. MATCH RESULTS (RIGHT 70-75%) ── */}
        <main className="space-y-4" aria-label="Match results list">
          {/* Header Bar */}
          <div
            className="p-4 rounded-2xl border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
          >
            <div>
              <h1 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>{totalRecords} Matches based on your preferences</span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Profiles recommended by InstantMatrimony recommendation algorithm.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="sort-select" className="text-xs font-semibold text-gray-600">Sort:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="h-9 px-3 border rounded-xl text-xs font-semibold bg-white text-gray-800 focus:outline-none focus:border-emerald-500"
                style={{ borderColor: "#E5E7EB" }}
              >
                <option value="bestMatch">Relevance (Best Match)</option>
                <option value="age">Age</option>
                <option value="recentlyJoined">Recent</option>
              </select>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="py-16 text-center text-gray-400 font-medium text-sm">
              Loading matches...
            </div>
          ) : resultsData.length === 0 ? (
            <div
              className="p-12 text-center rounded-2xl border bg-white shadow-xs space-y-3"
              style={{ borderColor: "#E5E7EB" }}
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No matches found for this category</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Try selecting "Your Matches" or update your partner preferences to discover more candidates.
              </p>
              <Link
                href="/onboarding?step=8"
                className="inline-block text-xs font-bold px-4 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
              >
                Edit Preferences
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resultsData.map((item: any, idx: number) => {
                const p = item?.profile || item;
                const userId = p?.userId || item?.userId || `match-${idx}`;
                const name = p?.name || item?.name || "Member";
                const age = p?.age ?? item?.age;
                const height = p?.height ?? item?.height;
                const religion = p?.religion || item?.religion || "Not specified";
                const caste = p?.caste || item?.caste || "Not specified";
                const education = p?.education || item?.education || "Graduate";
                const occupation = p?.occupation || item?.occupation || "Professional";
                const city = p?.city || item?.city || "Location not specified";
                const publicId = p?.publicId || item?.publicId || null;
                const matchScore = item?.rankingScore || item?.compatibility?.score;
                const isVerified = item?.user?.identityVerification?.status === "APPROVED";
                const photos: any[] = p?.photos || [];
                const photoCount = photos.length || 1;
                const mainPhoto = photos.find((ph: any) => ph.isMain)?.url || photos[0]?.url;

                return (
                  <div
                    key={userId}
                    className="rounded-2xl border shadow-xs hover:shadow-md transition-all overflow-hidden bg-white flex flex-col justify-between"
                    style={{ borderColor: "#E5E7EB" }}
                  >
                    {/* Upper content */}
                    <div className="p-4 flex gap-4">
                      {/* Photo column */}
                      <div className="relative w-28 h-36 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        {mainPhoto ? (
                          <img
                            src={mainPhoto}
                            alt={`${name}'s photo`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-emerald-50 text-emerald-600">
                            {name.charAt(0)}
                          </div>
                        )}

                        {/* Photo count badge */}
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white">
                          1/{photoCount}
                        </span>

                        {/* Favorite button */}
                        <button
                          onClick={() => handleToggleFavorite(userId)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 shadow-xs flex items-center justify-center"
                          aria-label={`Favorite ${name}`}
                        >
                          <Heart
                            className="w-3.5 h-3.5"
                            style={{
                              color: item?.favorited ? "#00A76F" : "#9CA3AF",
                              fill: item?.favorited ? "#00A76F" : "none",
                            }}
                          />
                        </button>
                      </div>

                      {/* Info column */}
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h2 className="text-base font-bold text-gray-900 truncate">{name}</h2>
                          {isVerified && (
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-label="Verified" />
                          )}
                        </div>

                        {/* Profile ID */}
                        {publicId && (
                          <span className="inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {publicId}
                          </span>
                        )}

                        <p className="text-xs text-gray-600 pt-1">
                          {age ? `${age} yrs` : ""} {age && height ? "•" : ""} {height ? formatHeight(height) : ""}
                        </p>

                        <p className="text-xs text-gray-600 truncate">
                          {religion} {religion && caste ? `, ${caste}` : ""}
                        </p>

                        <p className="text-xs text-gray-600 truncate">
                          {education} • {occupation}
                        </p>

                        <p className="text-xs text-gray-500 flex items-center gap-1 truncate pt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>{city}</span>
                        </p>
                      </div>
                    </div>

                    {/* Bottom actions bar */}
                    <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between gap-2" style={{ borderColor: "#F3F4F6" }}>
                      <Link
                        href={`/profile/${userId}`}
                        className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-emerald-600"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Profile
                      </Link>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/messages`}
                          className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Chat
                        </Link>

                        <button
                          disabled={item?.interestSent || processingId === userId}
                          onClick={() => handleSendInterest(userId)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs"
                          style={{ backgroundColor: item?.interestSent ? "#9CA3AF" : "#00A76F" }}
                        >
                          <Heart className="w-3.5 h-3.5" />
                          <span>{processingId === userId ? "..." : item?.interestSent ? "Sent" : "Send Interest"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
