"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { searchMatchesAction } from "@/lib/actions/search.actions";
import { sendInterestAction } from "@/lib/actions/interest.actions";
import { toggleFavoriteAction } from "@/lib/actions/favorite.actions";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Filter,
  Heart,
  MapPin,
  Search,
  CheckCircle2,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  UserCheck,
} from "lucide-react";

export function SearchClient({
  initialResults,
  defaultGender,
}: {
  initialResults: {
    data: any[];
    totalRecords: number;
    page: number;
    totalPages: number;
  };
  defaultGender: string;
}) {
  const [resultsData, setResultsData] = useState(initialResults?.data || []);
  const [pagination, setPagination] = useState({
    page: initialResults?.page || 1,
    totalPages: initialResults?.totalPages || 1,
    totalRecords: initialResults?.totalRecords || 0,
  });
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("bestMatch");
  const [interestLoadingId, setInterestLoadingId] = useState<string | null>(null);
  const [favLoadingId, setFavLoadingId] = useState<string | null>(null);

  // Master Data State
  const [religions, setReligions] = useState<any[]>([]);
  const [castes, setCastes] = useState<any[]>([]);
  const [subCastes, setSubCastes] = useState<any[]>([]);
  const [motherTongues, setMotherTongues] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [occupations, setOccupations] = useState<any[]>([]);

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      gender: defaultGender,
      minAge: "",
      maxAge: "",
      minHeight: "",
      maxHeight: "",
      minWeight: "",
      maxWeight: "",
      maritalStatus: "",
      religion: "",
      caste: "",
      subCaste: "",
      gothram: "",
      motherTongue: "",
      education: "",
      occupation: "",
      minIncome: "",
      maxIncome: "",
      country: "",
      state: "",
      district: "",
      city: "",
      smoking: "",
      drinking: "",
      food: "",
      isVerified: false,
      hasPhoto: false,
      recentlyJoined: false,
      recentlyActive: false,
    },
  });

  const selectedReligion = watch("religion");
  const selectedCaste = watch("caste");

  // Fetch Master Data
  useEffect(() => {
    fetch("/api/master-data?type=religions").then((res) => res.json()).then((res) => { if (res.success) setReligions(res.data); });
    fetch("/api/master-data?type=mothertongues").then((res) => res.json()).then((res) => { if (res.success) setMotherTongues(res.data); });
    fetch("/api/master-data?type=educations").then((res) => res.json()).then((res) => { if (res.success) setEducations(res.data); });
    fetch("/api/master-data?type=occupations").then((res) => res.json()).then((res) => { if (res.success) setOccupations(res.data); });
  }, []);

  // Fetch Castes when Religion changes
  useEffect(() => {
    if (selectedReligion) {
      const relObj = religions.find((r) => r.name === selectedReligion || r.id === selectedReligion);
      const queryId = relObj?.id || selectedReligion;
      fetch(`/api/master-data?type=castes&parentId=${encodeURIComponent(queryId)}`)
        .then((res) => res.json())
        .then((res) => { if (res.success) setCastes(res.data); });
    } else {
      setCastes([]);
    }
  }, [selectedReligion, religions]);

  // Fetch SubCastes when Caste changes
  useEffect(() => {
    if (selectedCaste) {
      const casteObj = castes.find((c) => c.name === selectedCaste || c.id === selectedCaste);
      const queryId = casteObj?.id || selectedCaste;
      fetch(`/api/master-data?type=subcastes&parentId=${encodeURIComponent(queryId)}`)
        .then((res) => res.json())
        .then((res) => { if (res.success) setSubCastes(res.data); });
    } else {
      setSubCastes([]);
    }
  }, [selectedCaste, castes]);

  const executeSearch = async (formData: any, targetPage: number = 1, targetSort: string = sortBy) => {
    setLoading(true);
    try {
      const filters: any = {};
      Object.keys(formData).forEach((key) => {
        const val = formData[key];
        if (val !== "" && val !== undefined && val !== false) {
          filters[key] = val;
        }
      });

      const res = await searchMatchesAction({
        filters,
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
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: any) => {
    executeSearch(data, 1, sortBy);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    handleSubmit((data) => executeSearch(data, 1, newSort))();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      handleSubmit((data) => executeSearch(data, newPage, sortBy))();
    }
  };

  const handleSendInterest = async (receiverId: string) => {
    setInterestLoadingId(receiverId);
    try {
      const res = await sendInterestAction(receiverId);
      if (res.success) {
        setResultsData((prev: any) =>
          prev.map((r: any) =>
            r.profile.userId === receiverId ? { ...r, interestSent: true } : r,
          ),
        );
      }
    } catch (e) {
      // ignore
    } finally {
      setInterestLoadingId(null);
    }
  };

  const handleToggleFavorite = async (targetUserId: string) => {
    setFavLoadingId(targetUserId);
    try {
      const res = await toggleFavoriteAction(targetUserId);
      if (res.success) {
        setResultsData((prev: any) =>
          prev.map((r: any) =>
            r.profile.userId === targetUserId
              ? { ...r, favorited: !r.favorited }
              : r,
          ),
        );
      }
    } catch (e) {
      // ignore
    } finally {
      setFavLoadingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent flex items-center gap-3">
            <Compass className="w-8 h-8 text-rose-500" /> Advanced Match Search
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Filter profiles using 24+ parameters powered by our Recommendation Engine.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label className="text-xs text-slate-400 shrink-0">Sort By:</Label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="h-9 px-3 border border-slate-800 bg-slate-900 rounded-lg text-xs text-white focus:border-rose-500"
          >
            <option value="bestMatch">Best Match (Recommendation Score)</option>
            <option value="recentlyJoined">Recently Joined</option>
            <option value="recentlyActive">Recently Active</option>
            <option value="age">Age (Youngest First)</option>
            <option value="height">Height (Talleest First)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl h-fit lg:col-span-1">
          <CardHeader className="border-b border-slate-800 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-rose-400">
              <SlidersHorizontal className="w-5 h-5" /> Filter Criteria
            </CardTitle>
            <CardDescription className="text-xs">Refine your match search</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Gender */}
              <div className="space-y-1.5">
                <Label className="text-xs">Looking For</Label>
                <select
                  {...register("gender")}
                  className="w-full h-8 px-2 border border-slate-800 bg-slate-950/60 rounded text-xs text-white"
                >
                  <option value="FEMALE">Bride (Female)</option>
                  <option value="MALE">Groom (Male)</option>
                </select>
              </div>

              {/* Age Range */}
              <div className="space-y-1.5">
                <Label className="text-xs">Age Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Min 18" {...register("minAge")} className="h-8 text-xs border-slate-800 bg-slate-950/60" />
                  <Input type="number" placeholder="Max 60" {...register("maxAge")} className="h-8 text-xs border-slate-800 bg-slate-950/60" />
                </div>
              </div>

              {/* Religion & Caste */}
              <div className="space-y-1.5">
                <Label className="text-xs">Religion</Label>
                <select {...register("religion")} className="w-full h-8 px-2 border border-slate-800 bg-slate-950/60 rounded text-xs text-white">
                  <option value="">Any Religion</option>
                  {religions.map((r) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Caste</Label>
                {castes.length > 0 ? (
                  <select {...register("caste")} className="w-full h-8 px-2 border border-slate-800 bg-slate-950/60 rounded text-xs text-white">
                    <option value="">Any Caste</option>
                    {castes.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <Input placeholder="Enter caste" {...register("caste")} className="h-8 text-xs border-slate-800 bg-slate-950/60" />
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Sub Caste</Label>
                {subCastes.length > 0 ? (
                  <select {...register("subCaste")} className="w-full h-8 px-2 border border-slate-800 bg-slate-950/60 rounded text-xs text-white">
                    <option value="">Any Sub Caste</option>
                    {subCastes.map((sc) => (
                      <option key={sc.id} value={sc.name}>{sc.name}</option>
                    ))}
                  </select>
                ) : (
                  <Input placeholder="Enter sub caste" {...register("subCaste")} className="h-8 text-xs border-slate-800 bg-slate-950/60" />
                )}
              </div>

              {/* Mother Tongue */}
              <div className="space-y-1.5">
                <Label className="text-xs">Mother Tongue</Label>
                <select {...register("motherTongue")} className="w-full h-8 px-2 border border-slate-800 bg-slate-950/60 rounded text-xs text-white">
                  <option value="">Any Mother Tongue</option>
                  {motherTongues.map((m) => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Education & Occupation */}
              <div className="space-y-1.5">
                <Label className="text-xs">Education</Label>
                <select {...register("education")} className="w-full h-8 px-2 border border-slate-800 bg-slate-950/60 rounded text-xs text-white">
                  <option value="">Any Education</option>
                  {educations.map((e) => (
                    <option key={e.id} value={e.name}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Occupation</Label>
                <select {...register("occupation")} className="w-full h-8 px-2 border border-slate-800 bg-slate-950/60 rounded text-xs text-white">
                  <option value="">Any Occupation</option>
                  {occupations.map((o) => (
                    <option key={o.id} value={o.name}>{o.name}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <Label className="text-xs">City / Location</Label>
                <Input placeholder="e.g. Mumbai" {...register("city")} className="h-8 text-xs border-slate-800 bg-slate-950/60" />
              </div>

              {/* Checkbox Options */}
              <div className="pt-2 space-y-2 border-t border-slate-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input type="checkbox" {...register("isVerified")} className="rounded border-slate-800 bg-slate-950" />
                  <span>Verified Profiles Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input type="checkbox" {...register("hasPhoto")} className="rounded border-slate-800 bg-slate-950" />
                  <span>Must Have Photo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input type="checkbox" {...register("recentlyJoined")} className="rounded border-slate-800 bg-slate-950" />
                  <span>Recently Joined (30 Days)</span>
                </label>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold text-xs py-2 shadow-lg shadow-rose-600/30">
                {loading ? <Spinner className="w-4 h-4 mr-2" /> : <Search className="w-4 h-4 mr-2" />} Apply Filters
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Showing {resultsData.length} of {pagination.totalRecords} Profiles Found</span>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
          </div>

          {resultsData.length === 0 ? (
            <Card className="border border-slate-800 bg-slate-900/60 p-12 text-center">
              <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-300">No Matching Profiles Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try broadening your search criteria or resetting filters to discover more compatible profiles.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resultsData.map((res: any) => {
                const profile = res.profile;
                const isBlur = res.privacy?.blurPhotos && !res.isUnlocked;
                const mainPhotoUrl = profile.photos?.find((p: any) => p.isMain)?.url || profile.photos?.[0]?.url || "/placeholder-avatar.png";

                return (
                  <motion.div key={profile.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl overflow-hidden hover:border-rose-500/50 transition-all flex flex-col justify-between h-full group">
                      <div>
                        {/* Image Preview Container */}
                        <div className="relative aspect-square overflow-hidden bg-slate-950">
                          <img
                            src={mainPhotoUrl}
                            alt={profile.name}
                            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isBlur ? "blur-md scale-110" : ""}`}
                          />
                          {isBlur && (
                            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 text-center">
                              <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-700 text-slate-200 flex flex-col items-center gap-1">
                                <Lock className="w-5 h-5 text-rose-400" />
                                <span className="text-[10px] font-semibold">Photo Blur Enabled</span>
                              </div>
                            </div>
                          )}

                          {/* Score Badge */}
                          {res.rankingScore > 0 && (
                            <span className="absolute top-3 left-3 bg-rose-600/90 backdrop-blur-md text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> {res.rankingScore}% Match
                            </span>
                          )}

                          {/* Favorite Button */}
                          <button
                            onClick={() => handleToggleFavorite(profile.userId)}
                            className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/60 backdrop-blur-md text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Heart className={`w-4 h-4 ${res.favorited ? "fill-rose-500 text-rose-500" : ""}`} />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-100 flex items-center gap-1.5 text-base">
                              {profile.name}
                              {res.user?.identityVerification?.status === "APPROVED" && (
                                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                            </h3>
                            <span className="text-xs font-semibold text-slate-400">
                              {profile.age ? `${profile.age} yrs` : ""}
                            </span>
                          </div>

                          <div className="text-xs text-slate-400 space-y-1">
                            <p className="flex items-center gap-1 text-slate-300">
                              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              {profile.city ? `${profile.city}, ${profile.state || ""}` : "India"}
                            </p>
                            <p>{profile.religion} • {profile.caste || "General"}</p>
                            <p className="text-slate-400 truncate">{profile.education} • {profile.occupation}</p>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-4 pt-0 flex gap-2">
                        <Link
                          href={`/profile/${profile.userId}`}
                          className="inline-flex items-center justify-center rounded-md border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs w-1/2 py-1.5 font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> Profile
                        </Link>

                        <Button
                          size="sm"
                          disabled={res.interestSent || interestLoadingId === profile.userId}
                          onClick={() => handleSendInterest(profile.userId)}
                          className="w-1/2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                        >
                          {interestLoadingId === profile.userId ? (
                            <Spinner className="w-3.5 h-3.5 mr-1" />
                          ) : res.interestSent ? (
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          ) : (
                            <Heart className="w-3.5 h-3.5 mr-1" />
                          )}
                          {res.interestSent ? "Sent" : "Interest"}
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
            <div className="flex justify-between items-center border-t border-slate-800 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1 || loading}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="border-slate-800 text-slate-300"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>

              <span className="text-xs text-slate-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="border-slate-800 text-slate-300"
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
