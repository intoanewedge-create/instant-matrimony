"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  User,
  Heart,
  Camera,
  Check,
  AlertCircle,
  Trash2,
  Star,
  Upload,
  Eye,
  CircleCheck,
  Circle,
  Shield,
  Briefcase,
  MapPin,
  Users,
  Compass,
  FileText,
  Lock,
} from "lucide-react";
import type { CompletionBreakdown } from "@/lib/services/completion.service";
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
import { Textarea } from "@/components/ui/textarea";
import {
  updateProfileAction,
  updatePreferencesAction,
  getProfilePrivacyAction,
  updateProfilePrivacyAction,
} from "@/lib/actions/profile.actions";
import {
  uploadPhoto,
  deletePhoto,
  setPrimaryPhoto,
} from "@/lib/actions/media.actions";

interface ProfilePhoto {
  id: string;
  url: string;
  isMain: boolean;
}

interface PartnerPreference {
  minAge?: number;
  maxAge?: number;
  minHeight?: number;
  maxHeight?: number;
  maritalStatus?: string;
  religion?: string;
  motherTongue?: string;
  education?: string;
  country?: string;
}

interface UserProfile {
  id: string;
  gender?: string;
  dateOfBirth?: string;
  religion?: string;
  motherTongue?: string;
  caste?: string;
  subCaste?: string;
  gothram?: string;
  height?: number;
  weight?: number;
  maritalStatus?: string;
  education?: string;
  occupation?: string;
  income?: number;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  bio?: string;
  familyValues?: string;
  familyDetails?: string;
  horoscope?: string;
  smoking?: string;
  drinking?: string;
  foodPreference?: string;
  status?: string;
  completionPercent?: number;
  photos?: ProfilePhoto[];
  partnerPreference?: PartnerPreference;
  privacy?: any;
}

export function ProfileClient({
  initialProfile,
  initialCompletion,
}: {
  initialProfile: UserProfile;
  initialCompletion?: CompletionBreakdown;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  const completion: CompletionBreakdown = initialCompletion || {
    percent: profile.completionPercent || 0,
    sections: [],
    missingSections: [],
  };

  const [activeTab, setActiveTab] = useState<
    "details" | "preferences" | "photos" | "privacy" | "preview"
  >("details");
  const [isPending, setIsPending] = useState(false);

  // Photo uploading states
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccess, setPhotoSuccess] = useState<string | null>(null);

  // Profile forms feedback
  const [detailsSuccess, setDetailsSuccess] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [prefSuccess, setPrefSuccess] = useState<string | null>(null);
  const [prefError, setPrefError] = useState<string | null>(null);

  const [privacySuccess, setPrivacySuccess] = useState<string | null>(null);
  const [privacyError, setPrivacyError] = useState<string | null>(null);
  const [privacySettings, setPrivacySettings] = useState({
    blurPhotos: false,
    hidePhone: false,
    hideIncome: false,
    hideFamilyDetails: false,
  });

  // Master data lists
  const [religions, setReligions] = useState<any[]>([]);
  const [castes, setCastes] = useState<any[]>([]);
  const [subCastes, setSubCastes] = useState<any[]>([]);
  const [gothrams, setGothrams] = useState<any[]>([]);

  // Setup Details Form
  const {
    register: registerDetails,
    handleSubmit: handleSubmitDetails,
    watch: watchDetails,
    reset: resetDetails,
  } = useForm({
    defaultValues: {
      gender: profile.gender || "MALE",
      dateOfBirth: profile.dateOfBirth
        ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
        : "",
      religion: profile.religion || "",
      motherTongue: profile.motherTongue || "",
      caste: profile.caste || "",
      subCaste: profile.subCaste || "",
      gothram: profile.gothram || "",
      height: profile.height || 160,
      weight: profile.weight || 65,
      maritalStatus: profile.maritalStatus || "Never Married",
      education: profile.education || "",
      occupation: profile.occupation || "",
      income: profile.income || 0,
      city: profile.city || "",
      district: profile.district || "",
      state: profile.state || "",
      country: profile.country || "India",
      bio: profile.bio || "",
      familyValues: profile.familyValues || "",
      familyDetails: profile.familyDetails || "",
      horoscope: profile.horoscope || "",
      smoking: profile.smoking || "",
      drinking: profile.drinking || "",
      foodPreference: profile.foodPreference || "",
    },
  });

  // Setup Preferences Form
  const {
    register: registerPref,
    handleSubmit: handleSubmitPref,
    reset: resetPref,
  } = useForm({
    defaultValues: {
      minAge: profile.partnerPreference?.minAge || 18,
      maxAge: profile.partnerPreference?.maxAge || 40,
      minHeight: profile.partnerPreference?.minHeight || 140,
      maxHeight: profile.partnerPreference?.maxHeight || 220,
      maritalStatus: profile.partnerPreference?.maritalStatus || "Never Married",
      religion: profile.partnerPreference?.religion || "",
      motherTongue: profile.partnerPreference?.motherTongue || "",
      education: profile.partnerPreference?.education || "",
      country: profile.partnerPreference?.country || "India",
    },
  });

  const selectedReligion = watchDetails("religion");
  const selectedCaste = watchDetails("caste");
  const selectedSubCaste = watchDetails("subCaste");

  // Fetch Master Data
  useEffect(() => {
    fetch("/api/master-data?type=religions")
      .then((r) => r.json())
      .then((res) => { if (res.success && res.data) setReligions(res.data); })
      .catch(() => {});

    getProfilePrivacyAction().then((res) => {
      if (res.success && res.privacy) {
        setPrivacySettings({
          blurPhotos: !!res.privacy.blurPhotos,
          hidePhone: !!res.privacy.hidePhone,
          hideIncome: !!res.privacy.hideIncome,
          hideFamilyDetails: !!res.privacy.hideFamilyDetails,
        });
      }
    });
  }, []);

  // Fetch Castes when Religion changes
  useEffect(() => {
    if (selectedReligion) {
      const relObj = religions.find((r) => r.name === selectedReligion || r.id === selectedReligion);
      const queryId = relObj?.id || selectedReligion;
      fetch(`/api/master-data?type=castes&parentId=${encodeURIComponent(queryId)}`)
        .then((r) => r.json())
        .then((res) => { if (res.success && res.data) setCastes(res.data); })
        .catch(() => {});
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
        .then((r) => r.json())
        .then((res) => { if (res.success && res.data) setSubCastes(res.data); })
        .catch(() => {});
    } else {
      setSubCastes([]);
    }
  }, [selectedCaste, castes]);

  // Fetch Gothrams when SubCaste changes
  useEffect(() => {
    if (selectedSubCaste) {
      const scObj = subCastes.find((sc) => sc.name === selectedSubCaste || sc.id === selectedSubCaste);
      const queryId = scObj?.id || selectedSubCaste;
      fetch(`/api/master-data?type=gothrams&parentId=${encodeURIComponent(queryId)}`)
        .then((r) => r.json())
        .then((res) => { if (res.success && res.data) setGothrams(res.data); })
        .catch(() => {});
    } else {
      setGothrams([]);
    }
  }, [selectedSubCaste, subCastes]);

  // Sync state & forms if props update from Server Components
  useEffect(() => {
    setProfile(initialProfile);
    resetDetails({
      gender: initialProfile.gender || "MALE",
      dateOfBirth: initialProfile.dateOfBirth
        ? new Date(initialProfile.dateOfBirth).toISOString().split("T")[0]
        : "",
      religion: initialProfile.religion || "",
      motherTongue: initialProfile.motherTongue || "",
      caste: initialProfile.caste || "",
      subCaste: initialProfile.subCaste || "",
      gothram: initialProfile.gothram || "",
      height: initialProfile.height || 160,
      weight: initialProfile.weight || 65,
      maritalStatus: initialProfile.maritalStatus || "Never Married",
      education: initialProfile.education || "",
      occupation: initialProfile.occupation || "",
      income: initialProfile.income || 0,
      city: initialProfile.city || "",
      district: initialProfile.district || "",
      state: initialProfile.state || "",
      country: initialProfile.country || "India",
      bio: initialProfile.bio || "",
      familyValues: initialProfile.familyValues || "",
      familyDetails: initialProfile.familyDetails || "",
      horoscope: initialProfile.horoscope || "",
      smoking: initialProfile.smoking || "",
      drinking: initialProfile.drinking || "",
      foodPreference: initialProfile.foodPreference || "",
    });
    resetPref({
      minAge: initialProfile.partnerPreference?.minAge || 18,
      maxAge: initialProfile.partnerPreference?.maxAge || 40,
      minHeight: initialProfile.partnerPreference?.minHeight || 140,
      maxHeight: initialProfile.partnerPreference?.maxHeight || 220,
      maritalStatus: initialProfile.partnerPreference?.maritalStatus || "Never Married",
      religion: initialProfile.partnerPreference?.religion || "",
      motherTongue: initialProfile.partnerPreference?.motherTongue || "",
      education: initialProfile.partnerPreference?.education || "",
      country: initialProfile.partnerPreference?.country || "India",
    });
  }, [initialProfile, resetDetails, resetPref]);

  const onUpdateDetails = async (data: Record<string, any>) => {
    setDetailsSuccess(null);
    setDetailsError(null);
    setIsPending(true);
    try {
      const payload = {
        ...data,
        height: data.height ? Number(data.height) : undefined,
        weight: data.weight ? Number(data.weight) : undefined,
        income: data.income ? Number(data.income) : undefined,
      };
      const res = await updateProfileAction(payload);
      if (res.success && res.profile) {
        setDetailsSuccess("Matrimonial profile details saved successfully!");
        setProfile((prev) => ({ ...prev, ...(res.profile as any) }));
        router.refresh();
      } else {
        setDetailsError(res.error || "Failed to update profile details");
      }
    } catch (e: any) {
      setDetailsError(e.message || "Failed to update profile details");
    } finally {
      setIsPending(false);
    }
  };

  const onUpdatePref = async (data: Record<string, any>) => {
    setPrefSuccess(null);
    setPrefError(null);
    setIsPending(true);
    try {
      const payload = {
        ...data,
        minAge: data.minAge ? Number(data.minAge) : undefined,
        maxAge: data.maxAge ? Number(data.maxAge) : undefined,
        minHeight: data.minHeight ? Number(data.minHeight) : undefined,
        maxHeight: data.maxHeight ? Number(data.maxHeight) : undefined,
      };
      const res = await updatePreferencesAction(payload);
      if (res.success) {
        setPrefSuccess("Partner match criteria updated successfully!");
        setProfile((prev) => ({
          ...prev,
          partnerPreference: { ...prev.partnerPreference, ...payload },
        }));
        router.refresh();
      } else {
        setPrefError(res.error || "Failed to update preferences");
      }
    } catch (e: any) {
      setPrefError(e.message || "Failed to update preferences");
    } finally {
      setIsPending(false);
    }
  };

  const onUpdatePrivacy = async () => {
    setPrivacySuccess(null);
    setPrivacyError(null);
    setIsPending(true);
    try {
      const res = await updateProfilePrivacyAction(privacySettings);
      if (res.success) {
        setPrivacySuccess("Privacy settings saved successfully!");
        router.refresh();
      } else {
        setPrivacyError(res.error || "Failed to update privacy settings");
      }
    } catch (e: any) {
      setPrivacyError(e.message || "Failed to update privacy settings");
    } finally {
      setIsPending(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setPhotoError(null);
    setPhotoSuccess(null);

    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const res = await uploadPhoto(formData);
      if (res.success) {
        setPhotoSuccess("Photo uploaded successfully!");
        if (res.photo) {
          setProfile((prev) => ({
            ...prev,
            photos: [...(prev.photos || []), res.photo as ProfilePhoto],
          }));
        }
        router.refresh();
      } else {
        setPhotoError(res.error || "Failed to upload photo");
      }
    } catch (err: any) {
      setPhotoError(err.message || "An error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    setPhotoError(null);
    setPhotoSuccess(null);

    try {
      const res = await deletePhoto(photoId);
      if (res.success) {
        setPhotoSuccess("Photo deleted successfully!");
        setProfile((prev) => ({
          ...prev,
          photos: (prev.photos || []).filter((p) => p.id !== photoId),
        }));
        router.refresh();
      } else {
        setPhotoError(res.error || "Failed to delete photo");
      }
    } catch (err: any) {
      setPhotoError(err.message || "An error occurred");
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    setPhotoError(null);
    setPhotoSuccess(null);

    try {
      const res = await setPrimaryPhoto(photoId);
      if (res.success) {
        setPhotoSuccess("Primary profile photo updated!");
        setProfile((prev) => ({
          ...prev,
          photos: (prev.photos || []).map((p) => ({
            ...p,
            isMain: p.id === photoId,
          })),
        }));
        router.refresh();
      } else {
        setPhotoError(res.error || "Failed to set primary photo");
      }
    } catch (err: any) {
      setPhotoError(err.message || "An error occurred");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 text-slate-900">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            My Matrimonial Profile
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your personal bio, cultural background, partner preferences, and photo privacy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-medium shadow-xs">
            Completeness: <span className="text-rose-600 font-bold">{completion.percent}%</span>
          </span>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
              profile.status === "APPROVED"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : profile.status === "PENDING"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {profile.status || "DRAFT"}
          </span>
        </div>
      </div>

      {/* Profile Completion Meter */}
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardContent className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-700">Profile Completion Status</span>
            <span className="text-sm font-extrabold text-rose-600">{completion.percent}%</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-pink-600 transition-all duration-300"
              style={{ width: `${completion.percent}%` }}
            />
          </div>

          {completion.sections.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {completion.sections.map((section) => (
                <div
                  key={section.key}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                    section.completed
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {section.completed ? (
                    <CircleCheck className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Circle className="w-3 h-3 text-slate-400" />
                  )}
                  {section.name}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("details")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-xs transition-all whitespace-nowrap ${
            activeTab === "details"
              ? "border-rose-600 text-rose-600 bg-rose-50/60 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <User className="w-4 h-4" /> Personal & Cultural
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-xs transition-all whitespace-nowrap ${
            activeTab === "preferences"
              ? "border-rose-600 text-rose-600 bg-rose-50/60 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <Heart className="w-4 h-4 text-rose-600" /> Partner Match Criteria
        </button>
        <button
          onClick={() => setActiveTab("photos")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-xs transition-all whitespace-nowrap ${
            activeTab === "photos"
              ? "border-rose-600 text-rose-600 bg-rose-50/60 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <Camera className="w-4 h-4 text-rose-600" /> Photo Gallery
        </button>
        <button
          onClick={() => setActiveTab("privacy")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-xs transition-all whitespace-nowrap ${
            activeTab === "privacy"
              ? "border-rose-600 text-rose-600 bg-rose-50/60 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <Shield className="w-4 h-4 text-amber-500" /> Privacy & Visibility
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-xs transition-all whitespace-nowrap ${
            activeTab === "preview"
              ? "border-rose-600 text-rose-600 bg-rose-50/60 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <Eye className="w-4 h-4 text-emerald-600" /> Public Biodata Preview
        </button>
      </div>

      {/* Tabs Content */}
      <div className="mt-4">
        {/* TAB 1: DETAILS */}
        {activeTab === "details" && (
          <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-rose-600" /> Comprehensive Matrimonial Details
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Update your identity, cultural background, education, and lifestyle.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitDetails(onUpdateDetails)} className="space-y-8">
                {detailsSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{detailsSuccess}</span>
                  </div>
                )}
                {detailsError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-800 text-xs">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="font-medium">{detailsError}</span>
                  </div>
                )}

                {/* Section A: Demographics */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider border-b border-slate-100 pb-2">
                    1. Basic Demographics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="gender" className="text-xs font-semibold text-slate-700">Gender</Label>
                      <select
                        id="gender"
                        className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                        {...registerDetails("gender")}
                      >
                        <option value="MALE">Male (Groom)</option>
                        <option value="FEMALE">Female (Bride)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="dateOfBirth" className="text-xs font-semibold text-slate-700">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                        {...registerDetails("dateOfBirth")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="height" className="text-xs font-semibold text-slate-700">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="170"
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                        {...registerDetails("height")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="weight" className="text-xs font-semibold text-slate-700">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="65"
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                        {...registerDetails("weight")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="maritalStatus" className="text-xs font-semibold text-slate-700">Marital Status</Label>
                      <select
                        id="maritalStatus"
                        className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                        {...registerDetails("maritalStatus")}
                      >
                        <option value="Never Married">Never Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Awaiting Divorce">Awaiting Divorce</option>
                        <option value="Annulled">Annulled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section B: Cultural & Horoscope */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider border-b border-slate-100 pb-2">
                    2. Religion, Caste & Horoscope
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="religion" className="text-xs font-semibold text-slate-700">Religion</Label>
                      <select
                        id="religion"
                        className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                        {...registerDetails("religion")}
                      >
                        <option value="">Select</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Muslim">Muslim</option>
                        <option value="Christian">Christian</option>
                        <option value="Sikh">Sikh</option>
                        <option value="Jain">Jain</option>
                        <option value="Buddhist">Buddhist</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="caste" className="text-xs font-semibold text-slate-700">Caste</Label>
                      {castes.length > 0 ? (
                        <select
                          id="caste"
                          className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                          {...registerDetails("caste")}
                        >
                          <option value="">Select Caste</option>
                          {castes.map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          id="caste"
                          placeholder="e.g. Reddy, Kamma, Brahmin"
                          className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                          {...registerDetails("caste")}
                        />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="subCaste" className="text-xs font-semibold text-slate-700">Sub Caste</Label>
                      {subCastes.length > 0 ? (
                        <select
                          id="subCaste"
                          className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                          {...registerDetails("subCaste")}
                        >
                          <option value="">Select Sub Caste</option>
                          {subCastes.map((sc) => (
                            <option key={sc.id} value={sc.name}>{sc.name}</option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          id="subCaste"
                          placeholder="e.g. Motati, Pedakanti"
                          className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                          {...registerDetails("subCaste")}
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="gothram" className="text-xs font-semibold text-slate-700">Gothram</Label>
                      <Input
                        id="gothram"
                        placeholder="e.g. Kasyapa, Bharadwaja"
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                        {...registerDetails("gothram")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="motherTongue" className="text-xs font-semibold text-slate-700">Mother Tongue</Label>
                      <select
                        id="motherTongue"
                        className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                        {...registerDetails("motherTongue")}
                      >
                        <option value="Telugu">Telugu</option>
                        <option value="Tamil">Tamil</option>
                        <option value="Kannada">Kannada</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Marathi">Marathi</option>
                        <option value="Malayalam">Malayalam</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="horoscope" className="text-xs font-semibold text-slate-700">Horoscope / Rashi</Label>
                      <Input
                        id="horoscope"
                        placeholder="e.g. Mesha (Aries) / Krittika"
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                        {...registerDetails("horoscope")}
                      />
                    </div>
                  </div>
                </div>

                {/* Section C: Education & Career */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider border-b border-slate-100 pb-2">
                    3. Education & Profession
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="education" className="text-xs font-semibold text-slate-700">Education Degree</Label>
                      <Input
                        id="education"
                        placeholder="e.g. B.Tech Computer Science"
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                        {...registerDetails("education")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="occupation" className="text-xs font-semibold text-slate-700">Occupation</Label>
                      <Input
                        id="occupation"
                        placeholder="e.g. Software Engineer / Lead"
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                        {...registerDetails("occupation")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="income" className="text-xs font-semibold text-slate-700">Annual Income (Lakhs INR)</Label>
                      <Input
                        id="income"
                        type="number"
                        placeholder="18"
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                        {...registerDetails("income")}
                      />
                    </div>
                  </div>
                </div>

                {/* Section D: Location */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider border-b border-slate-100 pb-2">
                    4. Location Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="country" className="text-xs font-semibold text-slate-700">Country</Label>
                      <Input
                        id="country"
                        placeholder="India"
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                        {...registerDetails("country")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="state" className="text-xs font-semibold text-slate-700">State</Label>
                      <Input
                        id="state"
                        placeholder="Andhra Pradesh"
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                        {...registerDetails("state")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="district" className="text-xs font-semibold text-slate-700">District</Label>
                      <Input
                        id="district"
                        placeholder="Visakhapatnam"
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                        {...registerDetails("district")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-xs font-semibold text-slate-700">City</Label>
                      <Input
                        id="city"
                        placeholder="Vijayawada"
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                        {...registerDetails("city")}
                      />
                    </div>
                  </div>
                </div>

                {/* Section E: Family & Lifestyle */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider border-b border-slate-100 pb-2">
                    5. Family & Lifestyle
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="familyValues" className="text-xs font-semibold text-slate-700">Family Values</Label>
                      <select
                        id="familyValues"
                        className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                        {...registerDetails("familyValues")}
                      >
                        <option value="">Select</option>
                        <option value="Traditional">Traditional</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Liberal">Liberal</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="foodPreference" className="text-xs font-semibold text-slate-700">Diet / Food</Label>
                      <select
                        id="foodPreference"
                        className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                        {...registerDetails("foodPreference")}
                      >
                        <option value="">Select</option>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Non-Vegetarian">Non-Vegetarian</option>
                        <option value="Eggetarian">Eggetarian</option>
                        <option value="Jain">Jain</option>
                        <option value="Vegan">Vegan</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="smoking" className="text-xs font-semibold text-slate-700">Smoking</Label>
                      <select
                        id="smoking"
                        className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                        {...registerDetails("smoking")}
                      >
                        <option value="">Select</option>
                        <option value="NO">No</option>
                        <option value="OCCASIONAL">Occasional</option>
                        <option value="YES">Yes</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="drinking" className="text-xs font-semibold text-slate-700">Drinking</Label>
                      <select
                        id="drinking"
                        className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                        {...registerDetails("drinking")}
                      >
                        <option value="">Select</option>
                        <option value="NO">No</option>
                        <option value="OCCASIONAL">Occasional</option>
                        <option value="YES">Yes</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="familyDetails" className="text-xs font-semibold text-slate-700">Family Background & Parents Details</Label>
                    <Textarea
                      id="familyDetails"
                      placeholder="Parents background, siblings, native place..."
                      className="border-slate-200 bg-slate-50 text-slate-900 text-xs min-h-20 resize-none focus-visible:ring-rose-500"
                      {...registerDetails("familyDetails")}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bio" className="text-xs font-semibold text-slate-700">About Me (Bio Overview)</Label>
                    <Textarea
                      id="bio"
                      placeholder="Share your interests, aspirations, and what makes you unique..."
                      className="border-slate-200 bg-slate-50 text-slate-900 text-xs min-h-24 resize-none focus-visible:ring-rose-500"
                      {...registerDetails("bio")}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 font-semibold px-8 py-2 text-white text-xs shadow-md shadow-rose-500/20"
                  >
                    {isPending ? "Saving..." : "Save Matrimonial Details"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* TAB 2: PREFERENCES */}
        {activeTab === "preferences" && (
          <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600" /> Desired Partner Criteria
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Define the criteria you seek in a life partner. These are used by our AI Matchmaker.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitPref(onUpdatePref)} className="space-y-6">
                {prefSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{prefSuccess}</span>
                  </div>
                )}
                {prefError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-800 text-xs">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="font-medium">{prefError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Age Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="minAge" className="text-xs font-semibold text-slate-700">Min Partner Age</Label>
                      <Input
                        id="minAge"
                        type="number"
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                        {...registerPref("minAge")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="maxAge" className="text-xs font-semibold text-slate-700">Max Partner Age</Label>
                      <Input
                        id="maxAge"
                        type="number"
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                        {...registerPref("maxAge")}
                      />
                    </div>
                  </div>

                  {/* Height Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="minHeight" className="text-xs font-semibold text-slate-700">Min Height (cm)</Label>
                      <Input
                        id="minHeight"
                        type="number"
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                        {...registerPref("minHeight")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="maxHeight" className="text-xs font-semibold text-slate-700">Max Height (cm)</Label>
                      <Input
                        id="maxHeight"
                        type="number"
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                        {...registerPref("maxHeight")}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="maritalStatusPref" className="text-xs font-semibold text-slate-700">Marital Status</Label>
                    <select
                      id="maritalStatusPref"
                      className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                      {...registerPref("maritalStatus")}
                    >
                      <option value="Never Married">Never Married</option>
                      <option value="Any">Any Status</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="religionPref" className="text-xs font-semibold text-slate-700">Preferred Religion</Label>
                    <Input
                      id="religionPref"
                      placeholder="e.g. Hindu, Any"
                      className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                      {...registerPref("religion")}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="languagePref" className="text-xs font-semibold text-slate-700">Preferred Mother Tongue</Label>
                    <Input
                      id="languagePref"
                      placeholder="e.g. Telugu, Any"
                      className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                      {...registerPref("motherTongue")}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="educationPref" className="text-xs font-semibold text-slate-700">Preferred Education</Label>
                    <Input
                      id="educationPref"
                      placeholder="e.g. Graduate, B.Tech, Master"
                      className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                      {...registerPref("education")}
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="countryPref" className="text-xs font-semibold text-slate-700">Preferred Country</Label>
                    <Input
                      id="countryPref"
                      placeholder="e.g. India, USA, Any"
                      className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                      {...registerPref("country")}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 font-semibold px-8 py-2 text-white text-xs shadow-md shadow-rose-500/20"
                  >
                    {isPending ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* TAB 3: PHOTOS */}
        {activeTab === "photos" && (
          <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-rose-600" /> Photo Gallery Management
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Upload up to 4 high-resolution photos.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {photoSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{photoSuccess}</span>
                </div>
              )}
              {photoError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-800 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="font-medium">{photoError}</span>
                </div>
              )}

              <div className="border-2 border-dashed border-slate-300 hover:border-rose-400 bg-rose-50/20 hover:bg-rose-50/40 rounded-xl p-6 text-center transition-colors">
                <Input
                  type="file"
                  id="photoInput"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <label htmlFor="photoInput" className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-800 text-xs font-bold">Click to upload a new photo</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">PNG, JPG or WEBP (Max 3MB)</p>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(profile.photos || []).map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[3/4] shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="Profile Photo" className="w-full h-full object-cover" />
                    {photo.isMain && (
                      <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                        <Star className="w-3 h-3 fill-current" /> Primary
                      </span>
                    )}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!photo.isMain && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSetPrimary(photo.id)}
                          className="h-7 text-[11px] bg-white hover:bg-slate-100 text-slate-900 px-2 font-semibold shadow-xs"
                        >
                          Make Primary
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="h-7 w-7 bg-red-600 text-white border-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 4: PRIVACY & VISIBILITY */}
        {activeTab === "privacy" && (
          <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" /> Privacy & Contact Visibility Controls
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                You have full control over who sees your photos, phone number, and financial metadata.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {privacySuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{privacySuccess}</span>
                </div>
              )}
              {privacyError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-800 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="font-medium">{privacyError}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Photo Blur Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-rose-600" /> Blur Profile Photos
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      When enabled, your photos appear blurred to public discovery. Photos unlock only after you accept an interest request.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.blurPhotos}
                    onChange={(e) => setPrivacySettings((p) => ({ ...p, blurPhotos: e.target.checked }))}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                </div>

                {/* Hide Phone Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-500" /> Strict Phone Masking
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Phone numbers are never shown publicly and require verified quota unlock even after mutual connection.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.hidePhone}
                    onChange={(e) => setPrivacySettings((p) => ({ ...p, hidePhone: e.target.checked }))}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                </div>

                {/* Hide Income Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900">Hide Exact Annual Income</h4>
                    <p className="text-[11px] text-slate-500">
                      Hides your specific salary figure and displays only education & profession.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.hideIncome}
                    onChange={(e) => setPrivacySettings((p) => ({ ...p, hideIncome: e.target.checked }))}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button
                  onClick={onUpdatePrivacy}
                  disabled={isPending}
                  className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 font-semibold px-6 py-2 text-white text-xs shadow-md shadow-rose-500/20"
                >
                  {isPending ? "Saving..." : "Save Privacy Preferences"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 5: PREVIEW */}
        {activeTab === "preview" && (
          <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" /> Public Biodata Preview
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                This is how verified prospective matches will see your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-36 h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-sm">
                  {profile.photos?.find((p) => p.isMain)?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.photos.find((p) => p.isMain)?.url}
                      alt="Primary"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 flex-col gap-2">
                      <User className="w-10 h-10" />
                      <span className="text-[10px] font-medium">No Photo</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 flex-grow">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {profile.gender === "FEMALE" ? "Matrimonial Bride" : "Matrimonial Groom"}
                    </h2>
                    <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {profile.city ? `${profile.city}, ${profile.state || ""}, ${profile.country || "India"}` : "Location not specified"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {profile.religion && (
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200 font-medium">
                        {profile.religion} {profile.caste ? `• ${profile.caste}` : ""}
                      </span>
                    )}
                    {profile.motherTongue && (
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200 font-medium">
                        {profile.motherTongue}
                      </span>
                    )}
                    {profile.occupation && (
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200 font-medium">
                        {profile.occupation}
                      </span>
                    )}
                    {profile.education && (
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200 font-medium">
                        {profile.education}
                      </span>
                    )}
                    {profile.income ? (
                      <span className="bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-md border border-rose-200 font-semibold">
                        ₹{profile.income} Lakhs / Yr
                      </span>
                    ) : null}
                  </div>

                  {profile.bio && (
                    <p className="text-slate-600 text-xs leading-relaxed italic pt-2 border-t border-slate-100">
                      &ldquo;{profile.bio}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
