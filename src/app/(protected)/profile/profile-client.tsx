"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Pencil,
  Sparkles,
  ChevronRight,
  X,
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
import { Spinner } from "@/components/ui/spinner";
import {
  updateProfileAction,
  updatePreferencesAction,
  getProfilePrivacyAction,
  updateProfilePrivacyAction,
  updateUserPhoneAction,
} from "@/lib/actions/profile.actions";
import {
  requestOtpAction,
  verifyOtpAction,
} from "@/lib/actions/verification.actions";
import {
  EDUCATION_OPTIONS,
  OCCUPATION_OPTIONS,
  INCOME_CURRENCIES,
  INCOME_AMOUNTS,
  GOTHRAM_OPTIONS,
  MOTHER_TONGUE_OPTIONS,
  FAMILY_VALUE_OPTIONS,
  FAMILY_TYPE_OPTIONS,
  FAMILY_STATUS_OPTIONS,
  INDIAN_STATES,
  MAJOR_COUNTRIES,
} from "@/lib/constants/options";
import {
  uploadPhoto,
  deletePhoto,
  setPrimaryPhoto,
} from "@/lib/actions/media.actions";

import { getDisplayProfileId } from "@/lib/utils/public-id";

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
  bio?: string;
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
  profileCreatedFor?: string;
  phone?: string;
  photos?: ProfilePhoto[];
  partnerPreference?: PartnerPreference;
  privacy?: any;
  user?: {
    name?: string;
    email?: string;
    phone?: string;
    publicId?: string;
    isActive?: boolean;
    identityVerification?: any;
  };
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

  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<
    "details" | "preferences" | "photos" | "privacy" | "preview"
  >("details");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "preferences") setActiveTab("preferences");
    else if (tabParam === "photos") setActiveTab("photos");
    else if (tabParam === "privacy") setActiveTab("privacy");
  }, [searchParams]);
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

  // Mobile Phone Edit Modal State
  const [editPhoneModalOpen, setEditPhoneModalOpen] = useState(false);
  const [newPhoneInput, setNewPhoneInput] = useState(profile.user?.phone || profile.phone || "");
  const [phoneStepLoading, setPhoneStepLoading] = useState(false);
  const [phoneModalError, setPhoneModalError] = useState<string | null>(null);
  const [phoneModalSuccess, setPhoneModalSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#horoscope" || hash === "#horoscope-section") {
        setActiveTab("details");
        setTimeout(() => {
          document.getElementById("horoscope-section")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      } else if (hash === "#family" || hash === "#family-section") {
        setActiveTab("details");
        setTimeout(() => {
          document.getElementById("family-section")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }
  }, []);

  const handleSavePhone = async () => {
    setPhoneModalError(null);
    setPhoneModalSuccess(null);
    if (!newPhoneInput.trim() || newPhoneInput.trim().length < 8) {
      setPhoneModalError("Please enter a valid mobile number (at least 8 digits).");
      return;
    }
    setPhoneStepLoading(true);
    try {
      const res = await updateUserPhoneAction(newPhoneInput.trim());
      if (res.success) {
        setPhoneModalSuccess("Mobile number updated successfully!");
        setProfile((prev) => ({
          ...prev,
          phone: newPhoneInput.trim(),
          user: { ...prev.user, phone: newPhoneInput.trim() },
        }));
        setTimeout(() => {
          setEditPhoneModalOpen(false);
        }, 1000);
        router.refresh();
      } else {
        setPhoneModalError(res.error || "Failed to update mobile number.");
      }
    } catch (err: any) {
      setPhoneModalError(err.message || "Error updating mobile number.");
    } finally {
      setPhoneStepLoading(false);
    }
  };

  // Master data lists
  const [religions, setReligions] = useState<any[]>([]);
  const [castes, setCastes] = useState<any[]>([]);
  const [subCastes, setSubCastes] = useState<any[]>([]);
  const [gothrams, setGothrams] = useState<any[]>([]);

  // Preferences Inline Editing State
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [rowSaving, setRowSaving] = useState(false);
  const [activePrefSection, setActivePrefSection] = useState<string>("pref-basic");

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

  // Setup Preferences State & Local Form Values
  const [prefValues, setPrefValues] = useState({
    minAge: profile.partnerPreference?.minAge || 18,
    maxAge: profile.partnerPreference?.maxAge || 40,
    minHeight: profile.partnerPreference?.minHeight || 140,
    maxHeight: profile.partnerPreference?.maxHeight || 220,
    maritalStatus: profile.partnerPreference?.maritalStatus || "Never Married",
    religion: profile.partnerPreference?.religion || "",
    motherTongue: profile.partnerPreference?.motherTongue || "",
    education: profile.partnerPreference?.education || "",
    country: profile.partnerPreference?.country || "India",
    bio: profile.partnerPreference?.bio || "",
  });

  const selectedReligion = watchDetails("religion");
  const selectedCaste = watchDetails("caste");
  const selectedSubCaste = watchDetails("subCaste");

  // Fetch Master Data
  useEffect(() => {
    fetch("/api/master-data?type=religions")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) setReligions(res.data);
      })
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
      const relObj = religions.find(
        (r) => r.name === selectedReligion || r.id === selectedReligion,
      );
      const queryId = relObj?.id || selectedReligion;
      fetch(`/api/master-data?type=castes&parentId=${encodeURIComponent(queryId)}`)
        .then((r) => r.json())
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
        (c) => c.name === selectedCaste || c.id === selectedCaste,
      );
      const queryId = casteObj?.id || selectedCaste;
      fetch(
        `/api/master-data?type=subcastes&parentId=${encodeURIComponent(queryId)}`,
      )
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data) setSubCastes(res.data);
        })
        .catch(() => {});
    } else {
      setSubCastes([]);
    }
  }, [selectedCaste, castes]);

  // Fetch Gothrams when SubCaste changes
  useEffect(() => {
    if (selectedSubCaste) {
      const scObj = subCastes.find(
        (sc) => sc.name === selectedSubCaste || sc.id === selectedSubCaste,
      );
      const queryId = scObj?.id || selectedSubCaste;
      fetch(
        `/api/master-data?type=gothrams&parentId=${encodeURIComponent(queryId)}`,
      )
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data) setGothrams(res.data);
        })
        .catch(() => {});
    } else {
      setGothrams([]);
    }
  }, [selectedSubCaste, subCastes]);

  // IntersectionObserver for Sticky Edit Preferences Scroll Spy
  useEffect(() => {
    if (activeTab !== "preferences") return;

    const sections = [
      "pref-basic",
      "pref-religious",
      "pref-professional",
      "pref-location",
      "pref-about-partner",
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActivePrefSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 },
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [activeTab]);

  // Scroll to preference section smoothly
  const scrollToPrefSection = (id: string) => {
    setActivePrefSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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

  const handleSaveInlineRow = async (updatedFields: Partial<typeof prefValues>) => {
    setRowSaving(true);
    setPrefError(null);
    setPrefSuccess(null);

    const merged = { ...prefValues, ...updatedFields };
    try {
      const payload = {
        ...merged,
        minAge: Number(merged.minAge),
        maxAge: Number(merged.maxAge),
        minHeight: Number(merged.minHeight),
        maxHeight: Number(merged.maxHeight),
      };
      const res = await updatePreferencesAction(payload);
      if (res.success) {
        setPrefValues(merged);
        setPrefSuccess("Partner match criteria updated successfully!");
        setProfile((prev) => ({
          ...prev,
          partnerPreference: { ...prev.partnerPreference, ...merged },
        }));
        setEditingRow(null);
        router.refresh();
      } else {
        setPrefError(res.error || "Failed to save criteria update");
      }
    } catch (e: any) {
      setPrefError(e.message || "Failed to save criteria update");
    } finally {
      setRowSaving(false);
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

  // Helper variables for header
  const mainPhoto = profile.photos?.find((p) => p.isMain) || profile.photos?.[0];
  const profileName = profile.user?.name || "Member Profile";
  const profileRelation = profile.profileCreatedFor || "Self";
  const publicId = getDisplayProfileId(profile.user, profile.id);
  const phoneDisplay = profile.user?.phone || profile.phone || "Not set";
  const isPhoneVerified = !!(profile.user?.identityVerification?.status === "VERIFIED" || profile.user?.phone);

  const calculatedAge = profile.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(profile.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
      )
    : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6 text-slate-900">
      {/* Title & Completeness Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Edit Matrimonial Profile
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage identity, preferences, photos, and public biodata presentation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl font-medium shadow-xs">
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

      {/* SECTION 4: RESPONSIVE 3-COLUMN EDIT PROFILE HEADER */}
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-2xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* LEFT COLUMN: Main Avatar Box + Profile ID Directly Below Photo + Add/Edit Photos */}
            <div className="md:col-span-3 flex flex-col items-center justify-center text-center space-y-2.5 border-r-0 md:border-r border-slate-100 pr-0 md:pr-4">
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-rose-200 shadow-md bg-rose-50 flex items-center justify-center">
                {mainPhoto ? (
                  <img
                    src={mainPhoto.url}
                    alt={profileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-14 h-14 text-rose-300" />
                )}
              </div>

              {/* Profile ID directly below photo */}
              <div className="flex items-center justify-center">
                <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Profile ID: {publicId}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("photos")}
                className="text-xs border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl"
              >
                <Camera className="w-3.5 h-3.5 mr-1.5" /> Add / Edit Photos
              </Button>
            </div>

            {/* MIDDLE COLUMN: Name, Relation, Key Stats & Mobile Number */}
            <div className="md:col-span-6 space-y-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-extrabold text-slate-900">{profileName}</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                    Profile Created For: {profileRelation}
                  </span>
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400">Age & Height:</span>{" "}
                  <span className="font-semibold text-slate-800">
                    {calculatedAge ? `${calculatedAge} yrs` : "N/A"}, {profile.height ? `${profile.height} cm` : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Religion/Caste:</span>{" "}
                  <span className="font-semibold text-slate-800">
                    {profile.religion || "N/A"}{profile.caste ? `, ${profile.caste}` : ""}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Location:</span>{" "}
                  <span className="font-semibold text-slate-800">
                    {profile.city || profile.state || profile.country || "India"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Education:</span>{" "}
                  <span className="font-semibold text-slate-800">
                    {profile.education || "Not specified"}
                  </span>
                </div>
              </div>

              {/* Mobile Number & Verification */}
              <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Mobile:</span>
                  <span className="font-semibold text-slate-900">{phoneDisplay}</span>
                  {isPhoneVerified ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> (Verified)
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      (Unverified)
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setEditPhoneModalOpen(true)}
                  className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
                >
                  [Edit Mobile No]
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Profile Preview Button */}
            <div className="md:col-span-3 flex flex-col items-center md:items-end justify-center border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
              <Button
                onClick={() => setActiveTab("preview")}
                className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-md rounded-xl h-10 px-5"
              >
                <Eye className="w-4 h-4 mr-2" /> Profile Preview
              </Button>
            </div>
          </div>
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

      {/* MAIN LAYOUT: TAB CONTENT + SECTION 5 SIDEBAR COMPLETION PROMPTS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Tab View (3 Cols on Desktop) */}
        <div className="lg:col-span-3">
          {/* TAB 1: DETAILS */}
          {activeTab === "details" && (
            <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-rose-600" /> Personal & Cultural Biodata
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
                  <div id="horoscope-section" className="space-y-4">
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
                          <option value="">Select Religion</option>
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
                        <select
                          id="gothram"
                          className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                          {...registerDetails("gothram")}
                        >
                          <option value="">Select Gothram</option>
                          {GOTHRAM_OPTIONS.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="motherTongue" className="text-xs font-semibold text-slate-700">Mother Tongue</Label>
                        <select
                          id="motherTongue"
                          className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                          {...registerDetails("motherTongue")}
                        >
                          <option value="">Select Mother Tongue</option>
                          {MOTHER_TONGUE_OPTIONS.map((mt) => (
                            <option key={mt} value={mt}>{mt}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="horoscope" className="text-xs font-semibold text-slate-700">Horoscope / Rasi & Star</Label>
                        <Input
                          id="horoscope"
                          placeholder="e.g. Mesha / Aries - Bharani Star"
                          className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                          {...registerDetails("horoscope")}
                        />
                      </div>
                    </div>

                    {/* Dosham Text Box (Optional free form text) */}
                    <div className="space-y-1.5 pt-1">
                      <Label htmlFor="doshamDetails" className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>Dosham Details (Optional)</span>
                        <span className="text-[10px] text-slate-400 font-normal">e.g., Sevvai / Kuja Dosham, Rahu-Ketu, None</span>
                      </Label>
                      <Input
                        id="doshamDetails"
                        placeholder="Enter Dosham details if applicable (or leave empty)"
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                        {...registerDetails("smoking")}
                      />
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
                        <select
                          id="education"
                          className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                          {...registerDetails("education")}
                        >
                          <option value="">Select Education Degree</option>
                          {EDUCATION_OPTIONS.map((edu) => (
                            <option key={edu} value={edu}>{edu}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="occupation" className="text-xs font-semibold text-slate-700">Occupation / Job Title</Label>
                        <select
                          id="occupation"
                          className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                          {...registerDetails("occupation")}
                        >
                          <option value="">Select Occupation</option>
                          {OCCUPATION_OPTIONS.map((occ) => (
                            <option key={occ} value={occ}>{occ}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="income" className="text-xs font-semibold text-slate-700">Annual Income (₹)</Label>
                        <Input
                          id="income"
                          type="number"
                          placeholder="1200000"
                          className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                          {...registerDetails("income")}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section D: Location */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider border-b border-slate-100 pb-2">
                      4. Location & Residence
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="city" className="text-xs font-semibold text-slate-700">City</Label>
                        <Input
                          id="city"
                          placeholder="e.g. Hyderabad"
                          className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                          {...registerDetails("city")}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="district" className="text-xs font-semibold text-slate-700">District</Label>
                        <Input
                          id="district"
                          placeholder="e.g. Rangareddy"
                          className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                          {...registerDetails("district")}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="state" className="text-xs font-semibold text-slate-700">State</Label>
                        <select
                          id="state"
                          className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                          {...registerDetails("state")}
                        >
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="country" className="text-xs font-semibold text-slate-700">Country</Label>
                        <select
                          id="country"
                          className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                          {...registerDetails("country")}
                        >
                          {MAJOR_COUNTRIES.map((ct) => (
                            <option key={ct} value={ct}>{ct}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section E: Family Background */}
                  <div id="family-section" className="space-y-4">
                    <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider border-b border-slate-100 pb-2">
                      5. Family Background & Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="familyValues" className="text-xs font-semibold text-slate-700">Family Values</Label>
                        <select
                          id="familyValues"
                          className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                          {...registerDetails("familyValues")}
                        >
                          <option value="">Select Family Values</option>
                          {FAMILY_VALUE_OPTIONS.map((fv) => (
                            <option key={fv} value={fv}>{fv}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="familyType" className="text-xs font-semibold text-slate-700">Family Type</Label>
                        <select
                          id="familyType"
                          className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                          {...registerDetails("drinking")}
                        >
                          <option value="">Select Family Type</option>
                          {FAMILY_TYPE_OPTIONS.map((ft) => (
                            <option key={ft} value={ft}>{ft}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="familyStatus" className="text-xs font-semibold text-slate-700">Family Status</Label>
                        <select
                          id="familyStatus"
                          className="w-full h-9 px-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                          {...registerDetails("foodPreference")}
                        >
                          <option value="">Select Family Status</option>
                          {FAMILY_STATUS_OPTIONS.map((fs) => (
                            <option key={fs} value={fs}>{fs}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="familyDetails" className="text-xs font-semibold text-slate-700">Detailed Family Notes</Label>
                      <Textarea
                        id="familyDetails"
                        placeholder="Father's occupation, mother's background, siblings, hometown..."
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs min-h-[80px] focus-visible:ring-rose-500"
                        {...registerDetails("familyDetails")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="bio" className="text-xs font-semibold text-slate-700">About Myself (Bio)</Label>
                      <Textarea
                        id="bio"
                        placeholder="Describe your values, lifestyle, interests, and partner expectations..."
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs min-h-[100px] focus-visible:ring-rose-500"
                        {...registerDetails("bio")}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-md rounded-xl h-11 px-8"
                    >
                      {isPending ? <Spinner className="w-4 h-4 mr-2" /> : null}
                      Save Profile Details
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: SECTION 6 & 7 — EDIT PREFERENCES (STICKY SIDEBAR & INLINE ROW EDITING) */}
          {activeTab === "preferences" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* STICKY LEFT SIDEBAR NAVIGATION WITH GREEN ACCENT */}
              <div className="md:col-span-1">
                <div className="sticky top-20 bg-white border border-slate-200 rounded-2xl p-3 space-y-1 shadow-xs overflow-x-auto flex md:flex-col gap-1 md:gap-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 px-3 py-1 hidden md:block">
                    Navigation
                  </span>
                  {[
                    { id: "pref-basic", label: "Basic Criteria" },
                    { id: "pref-religious", label: "Religious & Cultural" },
                    { id: "pref-professional", label: "Professional" },
                    { id: "pref-location", label: "Location" },
                    { id: "pref-about-partner", label: "About My Partner" },
                  ].map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => scrollToPrefSection(sec.id)}
                      className={`text-left text-xs px-3.5 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap w-full flex items-center justify-between ${
                        activePrefSection === sec.id
                          ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 font-bold shadow-2xs"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>{sec.label}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activePrefSection === sec.id ? "text-emerald-600 translate-x-0.5" : "text-slate-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: INLINE PREFERENCE ROWS */}
              <div className="md:col-span-3 space-y-6">
                <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-2xl">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-600" /> Partner Match Criteria
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Click the edit pencil icon on any preference row to update inline without losing state.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
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

                    {/* SECTION 1: BASIC CRITERIA */}
                    <div id="pref-basic" className="space-y-3 pt-1">
                      <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                        1. Basic Criteria
                      </h3>

                      {/* Row 1: Age Range */}
                      <div className="p-4 border border-slate-200/90 rounded-2xl hover:border-emerald-300 transition-all bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Preferred Age Range</span>
                            <span className="text-xs text-slate-500">
                              {prefValues.minAge} yrs — {prefValues.maxAge} yrs
                            </span>
                          </div>
                          <button
                            onClick={() => setEditingRow(editingRow === "age" ? null : "age")}
                            aria-label="Edit Age Range"
                            className="p-2 rounded-xl border border-slate-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                        {editingRow === "age" && (
                          <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-[11px] font-semibold text-slate-700">Min Age (yrs)</Label>
                                <Input
                                  type="number"
                                  value={prefValues.minAge}
                                  onChange={(e) => setPrefValues({ ...prefValues, minAge: Number(e.target.value) })}
                                  className="h-9 text-xs border-slate-200 mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-[11px] font-semibold text-slate-700">Max Age (yrs)</Label>
                                <Input
                                  type="number"
                                  value={prefValues.maxAge}
                                  onChange={(e) => setPrefValues({ ...prefValues, maxAge: Number(e.target.value) })}
                                  className="h-9 text-xs border-slate-200 mt-1"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setEditingRow(null)} className="text-xs">Cancel</Button>
                              <Button size="sm" disabled={rowSaving} onClick={() => handleSaveInlineRow({ minAge: prefValues.minAge, maxAge: prefValues.maxAge })} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                                {rowSaving ? "Saving..." : "Save Row"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Row 2: Height Range */}
                      <div className="p-4 border border-slate-200/90 rounded-2xl hover:border-emerald-300 transition-all bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Preferred Height Range</span>
                            <span className="text-xs text-slate-500">
                              {prefValues.minHeight} cm — {prefValues.maxHeight} cm
                            </span>
                          </div>
                          <button
                            onClick={() => setEditingRow(editingRow === "height" ? null : "height")}
                            aria-label="Edit Height Range"
                            className="p-2 rounded-xl border border-slate-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                        {editingRow === "height" && (
                          <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-[11px] font-semibold text-slate-700">Min Height (cm)</Label>
                                <Input
                                  type="number"
                                  value={prefValues.minHeight}
                                  onChange={(e) => setPrefValues({ ...prefValues, minHeight: Number(e.target.value) })}
                                  className="h-9 text-xs border-slate-200 mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-[11px] font-semibold text-slate-700">Max Height (cm)</Label>
                                <Input
                                  type="number"
                                  value={prefValues.maxHeight}
                                  onChange={(e) => setPrefValues({ ...prefValues, maxHeight: Number(e.target.value) })}
                                  className="h-9 text-xs border-slate-200 mt-1"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setEditingRow(null)} className="text-xs">Cancel</Button>
                              <Button size="sm" disabled={rowSaving} onClick={() => handleSaveInlineRow({ minHeight: prefValues.minHeight, maxHeight: prefValues.maxHeight })} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                                {rowSaving ? "Saving..." : "Save Row"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Row 3: Marital Status */}
                      <div className="p-4 border border-slate-200/90 rounded-2xl hover:border-emerald-300 transition-all bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Marital Status Preference</span>
                            <span className="text-xs text-slate-500">{prefValues.maritalStatus}</span>
                          </div>
                          <button
                            onClick={() => setEditingRow(editingRow === "maritalStatus" ? null : "maritalStatus")}
                            aria-label="Edit Marital Status Preference"
                            className="p-2 rounded-xl border border-slate-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                        {editingRow === "maritalStatus" && (
                          <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                            <select
                              value={prefValues.maritalStatus}
                              onChange={(e) => setPrefValues({ ...prefValues, maritalStatus: e.target.value })}
                              className="w-full h-9 px-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50"
                            >
                              <option value="Never Married">Never Married</option>
                              <option value="Divorced">Divorced</option>
                              <option value="Widowed">Widowed</option>
                              <option value="Awaiting Divorce">Awaiting Divorce</option>
                              <option value="Any">Any Marital Status</option>
                            </select>
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setEditingRow(null)} className="text-xs">Cancel</Button>
                              <Button size="sm" disabled={rowSaving} onClick={() => handleSaveInlineRow({ maritalStatus: prefValues.maritalStatus })} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                                {rowSaving ? "Saving..." : "Save Row"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECTION 2: RELIGIOUS & CULTURAL */}
                    <div id="pref-religious" className="space-y-3 pt-2">
                      <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                        2. Religious & Cultural Criteria
                      </h3>

                      {/* Row 4: Religion */}
                      <div className="p-4 border border-slate-200/90 rounded-2xl hover:border-emerald-300 transition-all bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Preferred Religion</span>
                            <span className="text-xs text-slate-500">{prefValues.religion || "Any Religion"}</span>
                          </div>
                          <button
                            onClick={() => setEditingRow(editingRow === "religion" ? null : "religion")}
                            aria-label="Edit Religion Preference"
                            className="p-2 rounded-xl border border-slate-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                        {editingRow === "religion" && (
                          <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                            <select
                              value={prefValues.religion}
                              onChange={(e) => setPrefValues({ ...prefValues, religion: e.target.value })}
                              className="w-full h-9 px-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50"
                            >
                              <option value="">Any Religion</option>
                              <option value="Hindu">Hindu</option>
                              <option value="Muslim">Muslim</option>
                              <option value="Christian">Christian</option>
                              <option value="Sikh">Sikh</option>
                              <option value="Jain">Jain</option>
                              <option value="Buddhist">Buddhist</option>
                            </select>
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setEditingRow(null)} className="text-xs">Cancel</Button>
                              <Button size="sm" disabled={rowSaving} onClick={() => handleSaveInlineRow({ religion: prefValues.religion })} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                                {rowSaving ? "Saving..." : "Save Row"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Row 5: Mother Tongue */}
                      <div className="p-4 border border-slate-200/90 rounded-2xl hover:border-emerald-300 transition-all bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Mother Tongue</span>
                            <span className="text-xs text-slate-500">{prefValues.motherTongue || "Any Language"}</span>
                          </div>
                          <button
                            onClick={() => setEditingRow(editingRow === "motherTongue" ? null : "motherTongue")}
                            aria-label="Edit Mother Tongue Preference"
                            className="p-2 rounded-xl border border-slate-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                        {editingRow === "motherTongue" && (
                          <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                            <select
                              value={prefValues.motherTongue}
                              onChange={(e) => setPrefValues({ ...prefValues, motherTongue: e.target.value })}
                              className="w-full h-9 px-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50"
                            >
                              <option value="">Any Language</option>
                              {MOTHER_TONGUE_OPTIONS.map((mt) => (
                                <option key={mt} value={mt}>{mt}</option>
                              ))}
                            </select>
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setEditingRow(null)} className="text-xs">Cancel</Button>
                              <Button size="sm" disabled={rowSaving} onClick={() => handleSaveInlineRow({ motherTongue: prefValues.motherTongue })} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                                {rowSaving ? "Saving..." : "Save Row"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECTION 3: PROFESSIONAL */}
                    <div id="pref-professional" className="space-y-3 pt-2">
                      <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                        3. Professional Criteria
                      </h3>

                      {/* Row 6: Education */}
                      <div className="p-4 border border-slate-200/90 rounded-2xl hover:border-emerald-300 transition-all bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Education Requirement</span>
                            <span className="text-xs text-slate-500">{prefValues.education || "Any Degree / Education"}</span>
                          </div>
                          <button
                            onClick={() => setEditingRow(editingRow === "education" ? null : "education")}
                            aria-label="Edit Education Preference"
                            className="p-2 rounded-xl border border-slate-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                        {editingRow === "education" && (
                          <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                            <select
                              value={prefValues.education}
                              onChange={(e) => setPrefValues({ ...prefValues, education: e.target.value })}
                              className="w-full h-9 px-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50"
                            >
                              <option value="">Any Degree / Education</option>
                              {EDUCATION_OPTIONS.map((edu) => (
                                <option key={edu} value={edu}>{edu}</option>
                              ))}
                            </select>
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setEditingRow(null)} className="text-xs">Cancel</Button>
                              <Button size="sm" disabled={rowSaving} onClick={() => handleSaveInlineRow({ education: prefValues.education })} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                                {rowSaving ? "Saving..." : "Save Row"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECTION 4: LOCATION */}
                    <div id="pref-location" className="space-y-3 pt-2">
                      <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                        4. Location Criteria
                      </h3>

                      {/* Row 7: Country */}
                      <div className="p-4 border border-slate-200/90 rounded-2xl hover:border-emerald-300 transition-all bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Preferred Country</span>
                            <span className="text-xs text-slate-500">{prefValues.country || "India"}</span>
                          </div>
                          <button
                            onClick={() => setEditingRow(editingRow === "country" ? null : "country")}
                            aria-label="Edit Country Preference"
                            className="p-2 rounded-xl border border-slate-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                        {editingRow === "country" && (
                          <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                            <select
                              value={prefValues.country}
                              onChange={(e) => setPrefValues({ ...prefValues, country: e.target.value })}
                              className="w-full h-9 px-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50"
                            >
                              <option value="">Any Country</option>
                              {MAJOR_COUNTRIES.map((ct) => (
                                <option key={ct} value={ct}>{ct}</option>
                              ))}
                            </select>
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setEditingRow(null)} className="text-xs">Cancel</Button>
                              <Button size="sm" disabled={rowSaving} onClick={() => handleSaveInlineRow({ country: prefValues.country })} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                                {rowSaving ? "Saving..." : "Save Row"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECTION 5: ABOUT MY PARTNER */}
                    <div id="pref-about-partner" className="space-y-3 pt-2">
                      <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                        5. About My Partner (Expectations)
                      </h3>

                      {/* Row 8: Bio / Description */}
                      <div className="p-4 border border-slate-200/90 rounded-2xl hover:border-emerald-300 transition-all bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 pr-4">
                            <span className="text-xs font-bold text-slate-800 block">Partner Description</span>
                            <span className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                              {prefValues.bio || "No specific expectation details provided yet."}
                            </span>
                          </div>
                          <button
                            onClick={() => setEditingRow(editingRow === "bio" ? null : "bio")}
                            aria-label="Edit About Partner"
                            className="p-2 rounded-xl border border-slate-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors shrink-0"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                        {editingRow === "bio" && (
                          <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                            <Textarea
                              value={prefValues.bio}
                              rows={3}
                              placeholder="Describe desired qualities, family values, and lifestyle..."
                              onChange={(e) => setPrefValues({ ...prefValues, bio: e.target.value })}
                              className="text-xs border-slate-200"
                            />
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setEditingRow(null)} className="text-xs">Cancel</Button>
                              <Button size="sm" disabled={rowSaving} onClick={() => handleSaveInlineRow({ bio: prefValues.bio })} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                                {rowSaving ? "Saving..." : "Save Row"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 3: PHOTOS */}
          {activeTab === "photos" && (
            <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-rose-600" /> Photo Gallery Management
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Upload clear photos of yourself. Mark your main photo for biodata display.
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

                {/* Upload Box */}
                <div className="border-2 border-dashed border-rose-200 bg-rose-50/40 rounded-2xl p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Upload New Profile Photo</p>
                    <p className="text-[11px] text-slate-500">Supports JPG, PNG, WEBP formats up to 5MB</p>
                  </div>
                  <div className="flex justify-center">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all">
                      <Camera className="w-4 h-4" />
                      <span>{uploading ? "Uploading..." : "Select Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Photos Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
                  {profile.photos && profile.photos.length > 0 ? (
                    profile.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square shadow-xs"
                      >
                        <img
                          src={photo.url}
                          alt="Profile photo"
                          className="w-full h-full object-cover"
                        />
                        {photo.isMain && (
                          <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                            <Star className="w-3 h-3 fill-white" /> Primary
                          </span>
                        )}
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="p-1.5 bg-red-600/90 text-white rounded-lg hover:bg-red-700 transition-colors"
                              title="Delete photo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {!photo.isMain && (
                            <Button
                              size="sm"
                              onClick={() => handleSetPrimary(photo.id)}
                              className="w-full text-[11px] bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-lg h-7"
                            >
                              Set Main
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full p-8 text-center text-slate-400 text-xs">
                      No photos uploaded yet. Click above to add your first photo.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 4: PRIVACY */}
          {activeTab === "privacy" && (
            <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-500" /> Privacy & Contact Controls
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Control photo visibility, phone access, and financial privacy.
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
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl bg-slate-50/50">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Blur Photos for Non-Members</span>
                      <span className="text-[11px] text-slate-500">Only verified logged-in users can view clear profile photos</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.blurPhotos}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, blurPhotos: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl bg-slate-50/50">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Hide Phone Number</span>
                      <span className="text-[11px] text-slate-500">Requires explicit contact request approval before sharing phone</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.hidePhone}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, hidePhone: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl bg-slate-50/50">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Hide Annual Income</span>
                      <span className="text-[11px] text-slate-500">Keep financial details private from public biodata view</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.hideIncome}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, hideIncome: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl bg-slate-50/50">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Hide Detailed Family Notes</span>
                      <span className="text-[11px] text-slate-500">Hide background notes from casual profile viewers</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.hideFamilyDetails}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, hideFamilyDetails: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={onUpdatePrivacy}
                    disabled={isPending}
                    className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs shadow-md rounded-xl h-11 px-8"
                  >
                    {isPending ? <Spinner className="w-4 h-4 mr-2" /> : null}
                    Save Privacy Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 5: PREVIEW */}
          {activeTab === "preview" && (
            <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-600" /> Public Biodata Preview
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  This is how your profile appears to potential life partners.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="p-6 border border-slate-200 rounded-2xl bg-gradient-to-br from-white to-slate-50/80 space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-rose-200 shadow-md bg-rose-100 flex items-center justify-center shrink-0">
                      {mainPhoto ? (
                        <img src={mainPhoto.url} alt={profileName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-rose-400" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-extrabold text-slate-900">{profileName}</h3>
                      <p className="text-xs text-slate-500">
                        {calculatedAge ? `${calculatedAge} yrs` : "N/A"} • {profile.height ? `${profile.height} cm` : "N/A"} • {profile.maritalStatus || "Never Married"}
                      </p>
                      <p className="text-xs font-semibold text-rose-600">
                        {profile.religion || "N/A"} {profile.caste ? `(${profile.caste})` : ""}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 justify-center sm:justify-start">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {profile.city || profile.state || "India"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-200">
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Education</span>
                      <span className="font-bold text-slate-800">{profile.education || "Not specified"}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Profession</span>
                      <span className="font-bold text-slate-800">{profile.occupation || "Not specified"}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Mother Tongue</span>
                      <span className="font-bold text-slate-800">{profile.motherTongue || "Telugu"}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 font-medium block">Gothram / Horoscope</span>
                      <span className="font-bold text-slate-800">{profile.gothram || profile.horoscope || "Not specified"}</span>
                    </div>
                  </div>

                  {profile.bio && (
                    <div className="pt-2 border-t border-slate-200 space-y-1">
                      <span className="text-xs text-slate-400 font-medium block">About Myself</span>
                      <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                        {profile.bio}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* SECTION 5: RIGHT-SIDE SIDEBAR COMPLETION PROMPTS */}
        <div className="lg:col-span-1 space-y-4">
          {/* Card 1: Add Horoscope */}
          <Card className="border border-slate-200 bg-white shadow-xs rounded-2xl overflow-hidden">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                <Compass className="w-4 h-4" /> Add Horoscope
              </div>
              <p className="text-[11px] text-slate-500">
                Enhance your matrimonial biodata compatibility by adding your horoscope details.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveTab("details");
                  setTimeout(() => {
                    const el = document.getElementById("horoscope-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="w-full text-xs border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold"
              >
                Add Horoscope Now
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: Add Photos Now */}
          <Card className="border border-slate-200 bg-white shadow-xs rounded-2xl overflow-hidden">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                <Camera className="w-4 h-4" /> Add Photos Now
              </div>
              <p className="text-[11px] text-slate-500">
                Profiles with clear photos receive up to 10x more match responses and profile views.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("photos")}
                className="w-full text-xs border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold"
              >
                Upload Photos
              </Button>
            </CardContent>
          </Card>

          {/* Card 3: Happy Marriage / Success Stories */}
          <Card className="border border-pink-200 bg-gradient-to-br from-rose-50 to-pink-50 shadow-xs rounded-2xl overflow-hidden">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                <Heart className="w-4 h-4 fill-rose-600 text-rose-600" /> Success Stories
              </div>
              <p className="text-[11px] text-rose-900/80">
                Read real Andhra & Telangana marriage success stories from InstantMatrimony couples.
              </p>
              <Button
                size="sm"
                onClick={() => router.push("/success-stories")}
                className="w-full text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs"
              >
                Read Success Stories
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* EDIT MOBILE NUMBER MODAL */}
      {editPhoneModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-rose-600" /> Edit Mobile Number
              </h3>
              <button
                onClick={() => {
                  setEditPhoneModalOpen(false);
                  setPhoneModalError(null);
                  setPhoneModalSuccess(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {phoneModalError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{phoneModalError}</span>
              </div>
            )}
            {phoneModalSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{phoneModalSuccess}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Mobile Number</Label>
                <Input
                  value={newPhoneInput}
                  onChange={(e) => setNewPhoneInput(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="text-xs mt-1 border-slate-200 bg-slate-50 text-slate-900 focus-visible:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditPhoneModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePhone}
                  disabled={phoneStepLoading || !newPhoneInput.trim()}
                  className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold h-9 px-4 rounded-xl shadow-xs"
                >
                  {phoneStepLoading ? <Spinner className="w-3.5 h-3.5 mr-1.5" /> : null}
                  {phoneStepLoading ? "Saving..." : "Save Mobile Number"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
