"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// @ts-ignore
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  Users,
  Heart,
  Eye,
  Star,
  Sparkles,
  MapPin,
  ShieldCheck,
  Compass,
  Filter,
  CheckCircle2,
  Calendar,
  Lock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  UserCheck,
  Globe,
  Briefcase,
  GraduationCap,
  Moon,
  Zap,
} from "lucide-react";
import { searchMatchesAction } from "@/lib/actions/search.actions";
import { sendInterestAction } from "@/lib/actions/interest.actions";
import { toggleFavoriteAction } from "@/lib/actions/favorite.actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";

interface SidebarSectionItem {
  id: string;
  title: string;
  subtitle: string;
  icon?: any;
  filter?: Record<string, any>;
}

interface SidebarSection {
  title: string;
  items: SidebarSectionItem[];
}

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
  const [pagination, setPagination] = useState({
    page: initialResults?.page || 1,
    totalPages: initialResults?.totalPages || 1,
    totalRecords: initialResults?.totalRecords || 0,
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("bestMatch");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarSections: SidebarSection[] = [
    {
      title: "ALL MATCHES",
      items: [
        {
          id: "all",
          title: "Best Matches",
          subtitle: "Profiles matching your partner preferences",
          icon: Sparkles,
          filter: {},
        },
        {
          id: "new_matches",
          title: "New Matches",
          subtitle: "Newly registered member profiles (Last 7 days)",
          icon: Zap,
          filter: {},
        },
        {
          id: "recently_joined",
          title: "Recently Joined",
          subtitle: "Members who joined within 30 days",
          icon: Calendar,
          filter: {},
        },
      ],
    },
    {
      title: "ACTIVITY & INTERACTIONS",
      items: [
        {
          id: "shortlisted_by_you",
          title: "Shortlisted by You",
          subtitle: "Profiles you have saved to shortlist",
          icon: Heart,
          filter: {},
        },
        {
          id: "viewed_you",
          title: "Viewed You",
          subtitle: "Members who visited your profile",
          icon: Eye,
          filter: {},
        },
        {
          id: "shortlisted_you",
          title: "Shortlisted You",
          subtitle: "Members who favorited your profile",
          icon: Star,
          filter: {},
        },
        {
          id: "viewed_by_you",
          title: "Viewed by You",
          subtitle: "Profiles you have previously viewed",
          icon: Users,
          filter: {},
        },
      ],
    },
    {
      title: "LOCATION & DEMOGRAPHICS",
      items: [
        {
          id: "nearby",
          title: "Nearby Matches",
          subtitle: "Profiles in your city / district / state",
          icon: MapPin,
          filter: {},
        },
        {
          id: "pref_location",
          title: "Location Preference",
          subtitle: "Profiles in your preferred locations",
          icon: Globe,
          filter: {},
        },
        {
          id: "pref_nri",
          title: "NRI Matches",
          subtitle: "Non-Resident Indian member profiles",
          icon: Compass,
          filter: {},
        },
      ],
    },
    {
      title: "VERIFICATION & MEDIA",
      items: [
        {
          id: "with_photos",
          title: "Matches with Photos",
          subtitle: "Profiles with verified active photos",
          icon: UserCheck,
          filter: { hasPhoto: true },
        },
        {
          id: "with_horoscope",
          title: "With Horoscope",
          subtitle: "Profiles with horoscope details",
          icon: Moon,
          filter: {},
        },
      ],
    },
    {
      title: "MUTUAL & COMPATIBILITY",
      items: [
        {
          id: "mutual_matches",
          title: "Mutual Matches",
          subtitle: "Reciprocal shortlists & mutual interests",
          icon: Heart,
          filter: {},
        },
        {
          id: "looking_for_you",
          title: "Looking for You",
          subtitle: "Members whose preferences match you",
          icon: Sparkles,
          filter: {},
        },
      ],
    },
    {
      title: "PREFERENCES",
      items: [
        {
          id: "pref_education",
          title: "Education Preference",
          subtitle: "Matches matching your education criteria",
          icon: GraduationCap,
          filter: {},
        },
        {
          id: "pref_profession",
          title: "Profession Preference",
          subtitle: "Matches based on career preference",
          icon: Briefcase,
          filter: {},
        },
      ],
    },
  ];

  const fetchMatches = async (categoryId: string, targetPage: number = 1, targetSort: string = sortBy) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const allItems: SidebarSectionItem[] = sidebarSections.flatMap((s) => s.items);
      const sectionItem = allItems.find((i) => i.id === categoryId);

      const res = await searchMatchesAction({
        filters: { ...(sectionItem?.filter || {}), category: categoryId },
        page: targetPage,
        limit: 12,
        sortBy: targetSort,
      });

      if (res.success) {
        setResultsData(res.data || []);
        setPagination({
          page: res.page || 1,
          totalPages: res.totalPages || 1,
          totalRecords: res.totalRecords || 0,
        });
      } else {
        setErrorMessage(res.error || "Unable to fetch matches for this category.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred while loading matches. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    setMobileMenuOpen(false);
    fetchMatches(categoryId, 1, sortBy);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    fetchMatches(activeCategory, 1, newSort);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchMatches(activeCategory, newPage, sortBy);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSendInterest = async (targetUserId: string) => {
    setProcessingId(targetUserId);
    try {
      const res = await sendInterestAction(targetUserId);
      if (res.success) {
        setResultsData((prev) =>
          prev.map((item) => {
            const uId = item?.profile?.userId || item?.userId;
            return uId === targetUserId ? { ...item, interestSent: true } : item;
          })
        );
      }
    } catch {
      // ignore
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleFavorite = async (targetUserId: string) => {
    try {
      const res = await toggleFavoriteAction(targetUserId);
      if (res.success) {
        setResultsData((prev) =>
          prev.map((item) => {
            const uId = item?.profile?.userId || item?.userId;
            return uId === targetUserId ? { ...item, favorited: !item.favorited } : item;
          })
        );
      }
    } catch {
      // ignore
    }
  };

  const allCategoryItems: SidebarSectionItem[] = sidebarSections.flatMap((s) => s.items);
  const activeCategoryItem = allCategoryItems.find((i) => i.id === activeCategory);

  const getEmptyStateDescription = (catId: string) => {
    switch (catId) {
      case "shortlisted_by_you":
        return "You have not shortlisted any profiles yet. Browse matches and click the heart icon to save favorites.";
      case "viewed_you":
        return "No members have viewed your profile yet. Completing your profile and adding photos increases visibility.";
      case "shortlisted_you":
        return "No members have shortlisted your profile yet. Keep your profile updated to attract more interest.";
      case "viewed_by_you":
        return "You have not viewed any profiles yet. Explore matches to build your browsing history.";
      case "mutual_matches":
        return "No mutual matches found yet. Mutual matches occur when both members shortlist or accept interest with each other.";
      case "looking_for_you":
        return "No members currently have preferences matching your exact profile attributes. Try updating your profile details.";
      case "pref_profession":
        return "Partner Preference for Profession is not configured in the database schema. Update your partner preferences or use Search filters.";
      case "pref_education":
        return "No profiles match your specific education preference criteria. Consider broadening your partner preferences.";
      case "pref_location":
        return "No profiles match your preferred location. Check your partner preference settings.";
      case "pref_nri":
        return "No Non-Resident Indian (NRI) profiles found matching your active criteria.";
      case "with_horoscope":
        return "No active profiles with horoscope details found matching your criteria. Ensure you have provided your horoscope details on your profile to unlock full horoscope compatibility matching.";
      case "with_photos":
        return "No active profiles with photos found matching your criteria.";
      default:
        return "No matching profiles found in this category. Check other categories or adjust your partner preferences.";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-rose-600 shrink-0" /> Matrimonial Matches
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Discover compatible profiles curated across 16 personalized matrimonial categories.
          </p>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <label htmlFor="matchesSortSelect" className="text-xs font-semibold text-slate-600 shrink-0">
            Sort By:
          </label>
          <select
            id="matchesSortSelect"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="h-9 px-3 border border-slate-200 bg-white rounded-xl text-xs text-slate-800 shadow-xs focus:border-rose-500 focus:outline-none"
          >
            <option value="bestMatch">Best Match (Compatibility)</option>
            <option value="recentlyJoined">Recently Joined</option>
            <option value="recentlyActive">Recently Active</option>
            <option value="age">Age (Youngest First)</option>
            <option value="height">Height (Tallest First)</option>
          </select>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-red-800 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Category Title Bar & Mobile Drawer Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Filter className="w-3.5 h-3.5 text-rose-600" />
            <span>{mobileMenuOpen ? "Hide Categories" : "Categories"}</span>
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {activeCategoryItem?.title || "Your Matches"}
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">
              {activeCategoryItem?.subtitle}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-xs shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-rose-600" />
          <span>{pagination.totalRecords} Profiles Found</span>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* MATCHES SIDEBAR (LEFT) */}
        <aside
          className={`space-y-4 ${mobileMenuOpen ? "block" : "hidden lg:block"}`}
          aria-label="Matches category sidebar"
        >
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden sticky top-20">
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-rose-600" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Match Categories
                </h2>
              </div>
              <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                16 Feeds
              </span>
            </div>

            <div className="p-2 space-y-3 max-h-[75vh] overflow-y-auto">
              {sidebarSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <h3 className="px-3 pt-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {section.title}
                  </h3>
                  {section.items.map((item) => {
                    const selected = activeCategory === item.id;
                    const ItemIcon = item.icon || Sparkles;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleCategorySelect(item.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between text-xs ${
                          selected
                            ? "bg-rose-50 border border-rose-200 text-rose-700 font-bold shadow-2xs"
                            : "text-slate-700 hover:bg-slate-50 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${selected ? "text-rose-600" : "text-slate-400"}`} />
                          <span className="truncate">{item.title}</span>
                        </div>
                        {selected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* RESULTS SECTION (RIGHT) */}
        <div className="space-y-6">
          {/* Loading Indicator */}
          {loading ? (
            <Card className="border border-slate-200 bg-white p-12 text-center shadow-xs rounded-2xl">
              <Spinner className="w-8 h-8 text-rose-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">Searching matches…</h3>
              <p className="text-xs text-slate-500 mt-1">Retrieving matching member profiles from the database.</p>
            </Card>
          ) : resultsData.length === 0 ? (
            /* Empty Results State */
            <Card className="border border-slate-200 bg-white p-12 text-center shadow-xs rounded-2xl">
              <div className="h-14 w-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-3">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Matching Profiles Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {getEmptyStateDescription(activeCategory)}
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Button
                  size="sm"
                  onClick={() => handleCategorySelect("all")}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> View All Best Matches
                </Button>
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs px-4 py-2 font-semibold transition-colors shadow-xs"
                >
                  <Compass className="w-3.5 h-3.5 mr-1" /> Custom Search
                </Link>
              </div>
            </Card>
          ) : (
            /* Results Card Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {resultsData.map((res: any) => {
                const profile = res.profile || res;
                if (!profile) return null;

                const isBlur = res.privacy?.blurPhotos && !res.isUnlocked;
                const activePhotos = Array.isArray(profile.photos)
                  ? profile.photos.filter((p: any) => !p.deletedAt)
                  : [];
                const mainPhotoUrl =
                  activePhotos.find((p: any) => p.isMain)?.url ||
                  activePhotos[0]?.url ||
                  "/placeholder-avatar.png";

                let displayAge = profile.age;
                if (!displayAge && profile.dateOfBirth) {
                  const dob = new Date(profile.dateOfBirth);
                  const diffMs = Date.now() - dob.getTime();
                  displayAge = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
                }

                const targetUserId = profile.userId || profile.user?.id || profile.id;
                const displayName = profile.name || profile.user?.name || "Matrimonial Member";
                const displayPublicId = profile.user?.publicId || "";

                return (
                  <motion.div
                    key={profile.id || targetUserId}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between h-full group overflow-hidden rounded-2xl">
                      <div>
                        {/* Image Preview Container */}
                        <div className="relative aspect-square overflow-hidden bg-slate-100">
                          <Image
                            src={mainPhotoUrl}
                            alt={displayName}
                            fill
                            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                              isBlur ? "blur-md scale-110" : ""
                            }`}
                          />
                          {isBlur && (
                            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 text-center">
                              <div className="p-2 bg-white/90 rounded-lg border border-slate-200 text-slate-800 shadow-md flex flex-col items-center gap-1">
                                <Lock className="w-5 h-5 text-rose-600" />
                                <span className="text-[10px] font-bold">Photo Blur Enabled</span>
                              </div>
                            </div>
                          )}

                          {/* Score Badge */}
                          {res.rankingScore > 0 && (
                            <span className="absolute top-3 left-3 bg-rose-600/90 backdrop-blur-md text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> {res.rankingScore}% Match
                            </span>
                          )}

                          {/* Favorite Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleFavorite(targetUserId)}
                            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md text-slate-600 hover:text-rose-600 transition-colors shadow-xs"
                            aria-label="Shortlist profile"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                res.favorited ? "fill-rose-600 text-rose-600" : ""
                              }`}
                            />
                          </button>

                          {/* Profile ID Pill */}
                          {displayPublicId && (
                            <span className="absolute bottom-2 left-2 bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
                              {displayPublicId}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-base truncate">
                              <span>{displayName}</span>
                              {res.user?.identityVerification?.status === "APPROVED" && (
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </h3>
                            {displayAge ? (
                              <span className="text-xs font-semibold text-slate-500 shrink-0">
                                {displayAge} yrs
                              </span>
                            ) : null}
                          </div>

                          <div className="text-xs text-slate-500 space-y-1">
                            <p className="flex items-center gap-1 text-slate-700 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              {profile.city
                                ? `${profile.city}${profile.state ? `, ${profile.state}` : ""}`
                                : profile.state || profile.country || "India"}
                            </p>
                            <p>
                              {profile.religion || "Community"}
                              {profile.caste ? ` • ${profile.caste}` : ""}
                              {profile.gothram ? ` (${profile.gothram})` : ""}
                            </p>
                            <p className="text-slate-500 truncate">
                              {profile.education || "Graduate"}
                              {profile.occupation ? ` • ${profile.occupation}` : ""}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-4 pt-0 flex gap-2 border-t border-slate-100 mt-2 pt-3">
                        <Link
                          href={`/profile/${targetUserId}`}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs w-1/2 py-2 font-semibold transition-colors shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" /> View Profile
                        </Link>

                        <Button
                          size="sm"
                          disabled={res.interestSent || processingId === targetUserId}
                          onClick={() => handleSendInterest(targetUserId)}
                          className="w-1/2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-semibold shadow-md shadow-rose-500/20 rounded-xl"
                        >
                          {processingId === targetUserId ? (
                            <Spinner className="w-3.5 h-3.5 mr-1 text-white" />
                          ) : res.interestSent ? (
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          ) : (
                            <Heart className="w-3.5 h-3.5 mr-1" />
                          )}
                          {res.interestSent ? "Interest Sent" : "Send Interest"}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Server-side Pagination Bar */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center border-t border-slate-200 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1 || loading}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>

              <span className="text-xs font-medium text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
