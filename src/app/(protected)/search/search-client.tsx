"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import {
  searchMatchesAction,
  getRecentlyViewedProfilesAction,
} from "@/lib/actions/search.actions";
import { sendInterestAction } from "@/lib/actions/interest.actions";
import { toggleFavoriteAction } from "@/lib/actions/favorite.actions";
import {
  MOTHER_TONGUE_OPTIONS,
  EDUCATION_OPTIONS,
  OCCUPATION_OPTIONS,
  GOTHRAM_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  SMOKING_OPTIONS,
  DRINKING_OPTIONS,
  DIET_OPTIONS,
  INDIAN_STATES,
  MAJOR_COUNTRIES,
} from "@/lib/constants/options";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";
import {
  Compass,
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
  History,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  AlertCircle,
  X,
  Zap,
} from "lucide-react";

export function SearchClient({
  initialResults,
  defaultGender,
  initialError,
}: {
  initialResults: {
    data: any[];
    totalRecords: number;
    page: number;
    totalPages: number;
  };
  defaultGender: string;
  initialError?: string;
}) {
  const [resultsData, setResultsData] = useState(initialResults?.data || []);
  const [pagination, setPagination] = useState({
    page: initialResults?.page || 1,
    totalPages: initialResults?.totalPages || 1,
    totalRecords: initialResults?.totalRecords || 0,
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError || null);
  const [sortBy, setSortBy] = useState("bestMatch");
  const [interestLoadingId, setInterestLoadingId] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<"quick" | "advanced" | "profileId" | "recentlyViewed">("quick");
  const [profileIdInput, setProfileIdInput] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Custom Others Inputs
  const [customEducation, setCustomEducation] = useState("");
  const [customOccupation, setCustomOccupation] = useState("");

  // Collapsible Accordion States for Advanced Search
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    basic: true,
    religious: true,
    professional: true,
    location: false,
    lifestyle: false,
    activity: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Master Data State
  const [religions, setReligions] = useState<any[]>([]);
  const [castes, setCastes] = useState<any[]>([]);
  const [subCastes, setSubCastes] = useState<any[]>([]);
  const [motherTongues, setMotherTongues] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [occupations, setOccupations] = useState<any[]>([]);

  const defaultValues = {
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
  };

  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues,
  });

  const selectedReligion = watch("religion");
  const selectedCaste = watch("caste");
  const selectedEducation = watch("education");
  const selectedOccupation = watch("occupation");

  // Fetch Master Data
  useEffect(() => {
    fetch("/api/master-data?type=religions")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) setReligions(res.data);
      })
      .catch(() => {});

    fetch("/api/master-data?type=mothertongues")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) setMotherTongues(res.data);
      })
      .catch(() => {});

    fetch("/api/master-data?type=educations")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) setEducations(res.data);
      })
      .catch(() => {});

    fetch("/api/master-data?type=occupations")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) setOccupations(res.data);
      })
      .catch(() => {});
  }, []);

  // Fetch Castes when Religion changes
  useEffect(() => {
    if (selectedReligion) {
      const relObj = religions.find(
        (r) => r.name === selectedReligion || r.id === selectedReligion
      );
      const queryId = relObj?.id || selectedReligion;
      fetch(`/api/master-data?type=castes&parentId=${encodeURIComponent(queryId)}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data) setCastes(res.data);
        })
        .catch(() => {});
    } else {
      setCastes([]);
    }
  }, [selectedReligion, religions]);

  // Fetch SubCastes when Caste changes
  useEffect(() => {
    if (selectedCaste) {
      const casteObj = castes.find(
        (c) => c.name === selectedCaste || c.id === selectedCaste
      );
      const queryId = casteObj?.id || selectedCaste;
      fetch(`/api/master-data?type=subcastes&parentId=${encodeURIComponent(queryId)}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success && res.data) setSubCastes(res.data);
        })
        .catch(() => {});
    } else {
      setSubCastes([]);
    }
  }, [selectedCaste, castes]);

  const executeSearch = async (
    formData: any,
    targetPage: number = 1,
    targetSort: string = sortBy
  ) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const filters: any = {};
      Object.keys(formData).forEach((key) => {
        const val = formData[key];
        if (val !== "" && val !== undefined && val !== false) {
          filters[key] = val;
        }
      });

      // Handle Education "Others" custom text
      if (formData.education === "Others" && customEducation.trim()) {
        filters.education = customEducation.trim();
      }

      // Handle Occupation "Others" custom text
      if (formData.occupation === "Others" && customOccupation.trim()) {
        filters.occupation = customOccupation.trim();
      }

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
      } else {
        setErrorMessage(res.error || "Unable to complete your search. Please try again.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const executeProfileIdSearch = async () => {
    if (!profileIdInput.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await searchMatchesAction({
        filters: { profilePublicId: profileIdInput.trim() },
        page: 1,
        limit: 12,
      });
      if (res.success) {
        setResultsData(res.data || []);
        setPagination({
          page: res.page || 1,
          totalPages: res.totalPages || 1,
          totalRecords: res.totalRecords || 0,
        });
      } else {
        setErrorMessage(res.error || "Profile not found. Please verify the ID and try again.");
      }
    } catch {
      setErrorMessage("Unable to search by Profile ID. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const executeRecentlyViewedSearch = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await getRecentlyViewedProfilesAction();
      if (res.success && res.data) {
        setResultsData(res.data);
        setPagination({
          page: 1,
          totalPages: 1,
          totalRecords: res.data.length,
        });
      } else {
        setErrorMessage(res.error || "Unable to load recently viewed profiles.");
      }
    } catch {
      setErrorMessage("Failed to load recently viewed profiles.");
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = (mode: "quick" | "advanced" | "profileId" | "recentlyViewed") => {
    setSearchMode(mode);
    setErrorMessage(null);
    if (mode === "recentlyViewed") {
      executeRecentlyViewedSearch();
    } else if (mode === "profileId") {
      if (profileIdInput.trim()) {
        executeProfileIdSearch();
      }
    }
  };

  const handleResetFilters = () => {
    reset(defaultValues);
    setCustomEducation("");
    setCustomOccupation("");
    setProfileIdInput("");
    setErrorMessage(null);
    executeSearch(defaultValues, 1, sortBy);
  };

  const onSubmit = (data: any) => {
    setMobileFilterOpen(false);
    executeSearch(data, 1, sortBy);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    handleSubmit((data) => executeSearch(data, 1, newSort))();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      if (searchMode === "profileId") {
        return;
      }
      handleSubmit((data) => executeSearch(data, newPage, sortBy))();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSendInterest = async (receiverId: string) => {
    setInterestLoadingId(receiverId);
    try {
      const res = await sendInterestAction(receiverId);
      if (res.success) {
        setResultsData((prev: any) =>
          prev.map((r: any) =>
            r.profile.userId === receiverId ? { ...r, interestSent: true } : r
          )
        );
      }
    } catch {
      // ignore
    } finally {
      setInterestLoadingId(null);
    }
  };

  const handleToggleFavorite = async (targetUserId: string) => {
    try {
      const res = await toggleFavoriteAction(targetUserId);
      if (res.success) {
        setResultsData((prev: any) =>
          prev.map((r: any) =>
            r.profile.userId === targetUserId
              ? { ...r, favorited: !r.favorited }
              : r
          )
        );
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
            <Compass className="w-7 h-7 text-rose-600 shrink-0" /> Match Discovery & Search
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Search verified matrimonial profiles using Quick Search, Advanced Filters, or Profile ID lookup.
          </p>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Label htmlFor="searchSortSelect" className="text-xs font-semibold text-slate-600 shrink-0">Sort By:</Label>
          <select
            id="searchSortSelect"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="h-9 px-3 border border-slate-200 bg-white rounded-xl text-xs text-slate-800 shadow-xs focus:border-rose-500 focus:outline-none"
          >
            <option value="bestMatch">Best Match (Compatibility)</option>
            <option value="recentlyJoined">Recently Joined (Newest)</option>
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
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Mode Tabs & Live Match Count Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1 p-1 rounded-2xl w-fit bg-slate-100 border border-slate-200">
          <button
            onClick={() => handleModeSwitch("quick")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              searchMode === "quick"
                ? "bg-white text-rose-600 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Quick Search
          </button>

          <button
            onClick={() => handleModeSwitch("advanced")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              searchMode === "advanced"
                ? "bg-white text-rose-600 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Advanced Search
          </button>

          <button
            onClick={() => handleModeSwitch("profileId")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              searchMode === "profileId"
                ? "bg-white text-rose-600 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            By Profile ID
          </button>

          <button
            onClick={() => handleModeSwitch("recentlyViewed")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              searchMode === "recentlyViewed"
                ? "bg-white text-rose-600 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Recently Viewed
          </button>
        </div>

        {/* Live Match Count Badge & Mobile Filter Toggle */}
        <div className="flex items-center gap-2">
          {(searchMode === "quick" || searchMode === "advanced") && (
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-600" />
              <span>{mobileFilterOpen ? "Hide Filters" : "Filters"}</span>
            </button>
          )}

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>{pagination.totalRecords} Live Matches</span>
          </div>
        </div>
      </div>

      {/* Profile ID Search Bar */}
      {searchMode === "profileId" && (
        <Card className="border border-slate-200 bg-white shadow-xs rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="e.g. IM12785469 or Profile ID"
                value={profileIdInput}
                onChange={(e) => setProfileIdInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && executeProfileIdSearch()}
                className="pl-9 h-10 font-mono border-slate-200 bg-white text-slate-900 focus-visible:ring-rose-500 rounded-xl text-sm"
                aria-label="Search by Profile ID"
              />
            </div>
            <Button
              onClick={executeProfileIdSearch}
              disabled={loading || !profileIdInput.trim()}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl h-10 px-6 w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Searching…
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Lookup Profile
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Main Grid Layout: Sidebar Filters + Results */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-4 gap-6 ${
          searchMode === "profileId" || searchMode === "recentlyViewed" ? "lg:grid-cols-1" : ""
        }`}
      >
        {/* FILTERS SIDEBAR */}
        {(searchMode === "quick" || searchMode === "advanced") && (
          <div className={`lg:col-span-1 ${mobileFilterOpen ? "block" : "hidden lg:block"}`}>
            <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-2xl sticky top-20">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="text-sm font-bold flex items-center justify-between text-rose-600">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>{searchMode === "quick" ? "Quick Search Filters" : "Advanced Filters"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  {/* QUICK SEARCH FORM CONTROLS */}
                  {searchMode === "quick" && (
                    <div className="space-y-3">
                      {/* Gender (Enforced) */}
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold text-slate-700">Looking For</Label>
                        <select
                          {...register("gender")}
                          disabled
                          className="w-full h-8 px-2 border border-slate-200 bg-slate-100 rounded-lg text-xs text-slate-700 font-semibold cursor-not-allowed focus:outline-none"
                        >
                          {defaultGender === "FEMALE" ? (
                            <option value="FEMALE">Bride (Female)</option>
                          ) : (
                            <option value="MALE">Groom (Male)</option>
                          )}
                        </select>
                      </div>

                      {/* Age Range */}
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold text-slate-700">Age Range</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            placeholder="Min (18)"
                            {...register("minAge")}
                            className="h-8 text-xs border-slate-200 bg-slate-50 text-slate-900 focus-visible:ring-rose-500 rounded-lg"
                          />
                          <Input
                            type="number"
                            placeholder="Max (60)"
                            {...register("maxAge")}
                            className="h-8 text-xs border-slate-200 bg-slate-50 text-slate-900 focus-visible:ring-rose-500 rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Religion */}
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold text-slate-700">Religion</Label>
                        <select
                          {...register("religion")}
                          className="w-full h-8 px-2 border border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500"
                        >
                          <option value="">Any Religion</option>
                          {religions.length > 0
                            ? religions.map((r) => (
                                <option key={r.id} value={r.name}>
                                  {r.name}
                                </option>
                              ))
                            : ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist"].map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                        </select>
                      </div>

                      {/* Mother Tongue */}
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold text-slate-700">Mother Tongue</Label>
                        <select
                          {...register("motherTongue")}
                          className="w-full h-8 px-2 border border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500"
                        >
                          <option value="">Any Mother Tongue</option>
                          {motherTongues.length > 0
                            ? motherTongues.map((m) => (
                                <option key={m.id} value={m.name}>
                                  {m.name}
                                </option>
                              ))
                            : MOTHER_TONGUE_OPTIONS.map((mt) => (
                                <option key={mt} value={mt}>
                                  {mt}
                                </option>
                              ))}
                        </select>
                      </div>

                      {/* City / Location */}
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold text-slate-700">City / Location</Label>
                        <Input
                          placeholder="e.g. Hyderabad, Bangalore"
                          {...register("city")}
                          className="h-8 text-xs border-slate-200 bg-slate-50 text-slate-900 focus-visible:ring-rose-500 rounded-lg"
                        />
                      </div>

                      {/* Quick Toggles */}
                      <div className="space-y-2 pt-1 border-t border-slate-100">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium text-xs">
                          <input
                            type="checkbox"
                            {...register("isVerified")}
                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 accent-rose-600"
                          />
                          <span>Verified Only</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium text-xs">
                          <input
                            type="checkbox"
                            {...register("hasPhoto")}
                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 accent-rose-600"
                          />
                          <span>Must Have Photo</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* ADVANCED SEARCH ACCORDIONS */}
                  {searchMode === "advanced" && (
                    <div className="space-y-3">
                      {/* ACCORDION 1: Basic & Demographic */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                        <button
                          type="button"
                          onClick={() => toggleAccordion("basic")}
                          className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors"
                        >
                          <span>1. Basic & Demographic</span>
                          {openAccordions.basic ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                        {openAccordions.basic && (
                          <div className="p-3 bg-white border-t border-slate-200 space-y-3">
                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">Looking For</Label>
                              <select
                                {...register("gender")}
                                disabled
                                className="w-full h-8 px-2 border border-slate-200 bg-slate-100 rounded-lg text-xs text-slate-700 font-semibold cursor-not-allowed focus:outline-none"
                              >
                                {defaultGender === "FEMALE" ? (
                                  <option value="FEMALE">Bride (Female)</option>
                                ) : (
                                  <option value="MALE">Groom (Male)</option>
                                )}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">Age Range (Yrs)</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  type="number"
                                  placeholder="Min 18"
                                  {...register("minAge")}
                                  className="h-8 text-xs border-slate-200 bg-slate-50 text-slate-900 rounded-lg"
                                />
                                <Input
                                  type="number"
                                  placeholder="Max 60"
                                  {...register("maxAge")}
                                  className="h-8 text-xs border-slate-200 bg-slate-50 text-slate-900 rounded-lg"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">Height Range (cm)</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  type="number"
                                  placeholder="Min 140"
                                  {...register("minHeight")}
                                  className="h-8 text-xs border-slate-200 bg-slate-50 text-slate-900 rounded-lg"
                                />
                                <Input
                                  type="number"
                                  placeholder="Max 210"
                                  {...register("maxHeight")}
                                  className="h-8 text-xs border-slate-200 bg-slate-50 text-slate-900 rounded-lg"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">Weight Range (kg)</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  type="number"
                                  placeholder="Min 40"
                                  {...register("minWeight")}
                                  className="h-8 text-xs border-slate-200 bg-slate-50 text-slate-900 rounded-lg"
                                />
                                <Input
                                  type="number"
                                  placeholder="Max 120"
                                  {...register("maxWeight")}
                                  className="h-8 text-xs border-slate-200 bg-slate-50 text-slate-900 rounded-lg"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">Marital Status</Label>
                              <select
                                {...register("maritalStatus")}
                                className="w-full h-8 px-2 border border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-900 focus:outline-none"
                              >
                                <option value="">Any Marital Status</option>
                                {MARITAL_STATUS_OPTIONS.map((ms) => (
                                  <option key={ms} value={ms}>
                                    {ms}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ACCORDION 2: Religious & Community */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                        <button
                          type="button"
                          onClick={() => toggleAccordion("religious")}
                          className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors"
                        >
                          <span>2. Religious & Community</span>
                          {openAccordions.religious ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                        {openAccordions.religious && (
                          <div className="p-3 bg-white border-t border-slate-200 space-y-3">
                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">Religion</Label>
                              <select
                                {...register("religion")}
                                className="w-full h-8 px-2 border border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-900 focus:outline-none"
                              >
                                <option value="">Any Religion</option>
                                {religions.length > 0
                                  ? religions.map((r) => (
                                      <option key={r.id} value={r.name}>
                                        {r.name}
                                      </option>
                                    ))
                                  : ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist"].map((r) => (
                                      <option key={r} value={r}>
                                        {r}
                                      </option>
                                    ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">Caste</Label>
                              {castes.length > 0 ? (
                                <select
                                  {...register("caste")}
                                  className="w-full h-8 px-2 border border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-900 focus:outline-none"
                                >
                                  <option value="">Any Caste</option>
                                  {castes.map((c) => (
                                    <option key={c.id} value={c.name}>
                                      {c.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <Input
                                  placeholder="Enter caste (e.g. Reddy, Brahmin)"
                                  {...register("caste")}
                                  className="h-8 text-xs border-slate-200 bg-slate-50 text-slate-900 rounded-lg"
                                />
                              )}
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">Sub Caste</Label>
                              {subCastes.length > 0 ? (
                                <select
                                  {...register("subCaste")}
                                  className="w-full h-8 px-2 border border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-900 focus:outline-none"
                                >
                                  <option value="">Any Sub Caste</option>
                                  {subCastes.map((sc) => (
                                    <option key={sc.id} value={sc.name}>
                                      {sc.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <Input
                                  placeholder="Enter sub caste"
                                  {...register("subCaste")}
                                  className="h-8 text-xs border-slate-200 bg-slate-50 text-slate-900 rounded-lg"
                                />
                              )}
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">Gothram</Label>
                              <select
                                {...register("gothram")}
                                className="w-full h-8 px-2 border border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-900 focus:outline-none"
                              >
                                <option value="">Any Gothram</option>
                                {GOTHRAM_OPTIONS.map((g) => (
                                  <option key={g} value={g}>
                                    {g}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">Mother Tongue</Label>
                              <select
                                {...register("motherTongue")}
                                className="w-full h-8 px-2 border border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-900 focus:outline-none"
                              >
                                <option value="">Any Mother Tongue</option>
                                {motherTongues.length > 0
                                  ? motherTongues.map((m) => (
                                      <option key={m.id} value={m.name}>
                                        {m.name}
                                      </option>
                                    ))
                                  : MOTHER_TONGUE_OPTIONS.map((mt) => (
                                      <option key={mt} value={mt}>
                                        {mt}
                                      </option>
                                    ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ACCORDION 3: Education & Career */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                        <button
                          type="button"
                          onClick={() => toggleAccordion("professional")}
                          className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors"
                        >
                          <span>3. Education & Career</span>
                          {openAccordions.professional ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                        {openAccordions.professional && (
                          <div className="p-3 bg-white border-t border-slate-200 space-y-3">
                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">Education Degree</Label>
                              <select
                                {...register("education")}
                                className="w-full h-8 px-2 border border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-900 focus:outline-none"
                              >
                                <option value="">Any Education</option>
                                {EDUCATION_OPTIONS.map((edu) => (
                                  <option key={edu} value={edu}>
                                    {edu}
                                  </option>
                                ))}
                              </select>
                              {selectedEducation === "Others" && (
                                <Input
                                  placeholder="Specify degree (e.g. Data Science)"
                                  value={customEducation}
                                  onChange={(e) => setCustomEducation(e.target.value)}
                                  className="h-8 text-xs border-slate-200 bg-white text-slate-900 mt-1 rounded-lg"
                                />
                              )}
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">Occupation</Label>
                              <select
                                {...register("occupation")}
                                className="w-full h-8 px-2 border border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-900 focus:outline-none"
                              >
                                <option value="">Any Occupation</option>
                                {OCCUPATION_OPTIONS.map((occ) => (
                                  <option key={occ} value={occ}>
                                    {occ}
                                  </option>
                                ))}
                              </select>
                              {selectedOccupation === "Others" && (
                                <Input
                                  placeholder="Specify occupation title"
                                  value={customOccupation}
                                  onChange={(e) => setCustomOccupation(e.target.value)}
                                  className="h-8 text-xs border-slate-200 bg-white text-slate-900 mt-1 rounded-lg"
                                />
                              )}
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">Annual Income Range (₹)</Label>
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  type="number"
                                  placeholder="Min Income"
                                  {...register("minIncome")}
                                  className="h-8 text-xs border-slate-200 bg-slate-50 text-slate-900 rounded-lg"
                                />
                                <Input
                                  type="number"
                                  placeholder="Max Income"
                                  {...register("maxIncome")}
                                  className="h-8 text-xs border-slate-200 bg-slate-50 text-slate-900 rounded-lg"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ACCORDION 4: Location & Residence */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                        <button
                          type="button"
                          onClick={() => toggleAccordion("location")}
                          className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors"
                        >
                          <span>4. Location & Residence</span>
                          {openAccordions.location ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                        {openAccordions.location && (
                          <div className="p-3 bg-white border-t border-slate-200 space-y-3">
                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">Country</Label>
                              <select
                                {...register("country")}
                                className="w-full h-8 px-2 border border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-900 focus:outline-none"
                              >
                                <option value="">Any Country</option>
                                {MAJOR_COUNTRIES.map((ct) => (
                                  <option key={ct} value={ct}>
                                    {ct}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">State</Label>
                              <select
                                {...register("state")}
                                className="w-full h-8 px-2 border border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-900 focus:outline-none"
                              >
                                <option value="">Any State</option>
                                {INDIAN_STATES.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">District</Label>
                              <Input
                                placeholder="e.g. Rangareddy"
                                {...register("district")}
                                className="h-8 text-xs border-slate-200 bg-slate-50 text-slate-900 rounded-lg"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">City</Label>
                              <Input
                                placeholder="e.g. Hyderabad"
                                {...register("city")}
                                className="h-8 text-xs border-slate-200 bg-slate-50 text-slate-900 rounded-lg"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ACCORDION 5: Lifestyle & Habits */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                        <button
                          type="button"
                          onClick={() => toggleAccordion("lifestyle")}
                          className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors"
                        >
                          <span>5. Lifestyle & Diet</span>
                          {openAccordions.lifestyle ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                        {openAccordions.lifestyle && (
                          <div className="p-3 bg-white border-t border-slate-200 space-y-3">
                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">Food / Diet</Label>
                              <select
                                {...register("food")}
                                className="w-full h-8 px-2 border border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-900 focus:outline-none"
                              >
                                <option value="">Any Diet</option>
                                {DIET_OPTIONS.map((d) => (
                                  <option key={d} value={d}>
                                    {d}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">Smoking</Label>
                              <select
                                {...register("smoking")}
                                className="w-full h-8 px-2 border border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-900 focus:outline-none"
                              >
                                <option value="">Any</option>
                                {SMOKING_OPTIONS.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700">Drinking</Label>
                              <select
                                {...register("drinking")}
                                className="w-full h-8 px-2 border border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-900 focus:outline-none"
                              >
                                <option value="">Any</option>
                                {DRINKING_OPTIONS.map((dr) => (
                                  <option key={dr} value={dr}>
                                    {dr}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ACCORDION 6: Verification & Activity */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                        <button
                          type="button"
                          onClick={() => toggleAccordion("activity")}
                          className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors"
                        >
                          <span>6. Verification & Activity</span>
                          {openAccordions.activity ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                        {openAccordions.activity && (
                          <div className="p-3 bg-white border-t border-slate-200 space-y-2.5">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium text-xs">
                              <input
                                type="checkbox"
                                {...register("isVerified")}
                                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 accent-rose-600"
                              />
                              <span>Verified Profiles Only</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium text-xs">
                              <input
                                type="checkbox"
                                {...register("hasPhoto")}
                                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 accent-rose-600"
                              />
                              <span>Must Have Photo</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium text-xs">
                              <input
                                type="checkbox"
                                {...register("recentlyJoined")}
                                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 accent-rose-600"
                              />
                              <span>Recently Joined (30 Days)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium text-xs">
                              <input
                                type="checkbox"
                                {...register("recentlyActive")}
                                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 accent-rose-600"
                              />
                              <span>Recently Active (7 Days)</span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Filter Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs py-2.5 shadow-md shadow-rose-500/20 rounded-xl"
                    >
                      {loading ? (
                        <>
                          <Spinner className="w-4 h-4 mr-2 text-white" />
                          Searching…
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Apply Filters
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetFilters}
                      disabled={loading}
                      className="w-full border-slate-200 text-slate-600 hover:bg-slate-100 text-xs py-2 rounded-xl"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-500" /> Reset Filters
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* RESULTS SECTION */}
        <div
          className={
            searchMode === "profileId" || searchMode === "recentlyViewed"
              ? "lg:col-span-4 space-y-6"
              : "lg:col-span-3 space-y-6"
          }
        >
          {/* Results Summary Bar */}
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>
              Showing {resultsData.length} of {pagination.totalRecords} Profiles Found
            </span>
            {pagination.totalPages > 1 && (
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
            )}
          </div>

          {/* EMPTY RESULTS STATE */}
          {resultsData.length === 0 ? (
            <Card className="border border-slate-200 bg-white p-12 text-center shadow-sm rounded-2xl">
              <div className="h-14 w-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-3">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Matching Profiles Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchMode === "profileId"
                  ? "No active profile matches this Profile ID. Please check the identifier and try again."
                  : searchMode === "recentlyViewed"
                  ? "You have not viewed any profiles recently. Browse matches to build your history."
                  : "Try broadening your search filters, adjusting age/height ranges, or resetting filters to discover more compatible profiles."}
              </p>
              {(searchMode === "quick" || searchMode === "advanced") && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset All Filters
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            /* RESULTS CARD GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                // Safe Age calculation fallback
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
                    <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between h-full group overflow-hidden rounded-2xl">
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
                          disabled={res.interestSent || interestLoadingId === targetUserId}
                          onClick={() => handleSendInterest(targetUserId)}
                          className="w-1/2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-semibold shadow-md shadow-rose-500/20 rounded-xl"
                        >
                          {interestLoadingId === targetUserId ? (
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
          {pagination.totalPages > 1 && searchMode !== "profileId" && (
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
