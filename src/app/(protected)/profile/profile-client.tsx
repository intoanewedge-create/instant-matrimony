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
  height?: number;
  maritalStatus?: string;
  education?: string;
  occupation?: string;
  income?: number;
  city?: string;
  state?: string;
  country?: string;
  bio?: string;
  familyValues?: string;
  horoscope?: string;
  smoking?: string;
  drinking?: string;
  foodPreference?: string;
  status?: string;
  completionPercent?: number;
  photos?: ProfilePhoto[];
  partnerPreference?: PartnerPreference;
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
    "details" | "preferences" | "photos" | "preview"
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

  // Setup Details Form
  const {
    register: registerDetails,
    handleSubmit: handleSubmitDetails,
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
      height: profile.height || 160,
      maritalStatus: profile.maritalStatus || "SINGLE",
      education: profile.education || "",
      occupation: profile.occupation || "",
      income: profile.income || 0,
      city: profile.city || "",
      state: profile.state || "",
      country: profile.country || "India",
      bio: profile.bio || "",
      familyValues: profile.familyValues || "",
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
      maritalStatus: profile.partnerPreference?.maritalStatus || "SINGLE",
      religion: profile.partnerPreference?.religion || "",
      motherTongue: profile.partnerPreference?.motherTongue || "",
      education: profile.partnerPreference?.education || "",
      country: profile.partnerPreference?.country || "India",
    },
  });

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
      height: initialProfile.height || 160,
      maritalStatus: initialProfile.maritalStatus || "SINGLE",
      education: initialProfile.education || "",
      occupation: initialProfile.occupation || "",
      income: initialProfile.income || 0,
      city: initialProfile.city || "",
      state: initialProfile.state || "",
      country: initialProfile.country || "India",
      bio: initialProfile.bio || "",
      familyValues: initialProfile.familyValues || "",
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
      maritalStatus:
        initialProfile.partnerPreference?.maritalStatus || "SINGLE",
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
        height: Number(data.height),
        income: Number(data.income),
      };
      const res = await updateProfileAction(payload);
      if (res.success && res.profile) {
        setDetailsSuccess("Profile details updated successfully!");
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
        setPrefSuccess("Partner preferences updated successfully!");
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
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
            My Profile & Matches Workspace
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Complete details to boost compatibility scores and discover matches
            in your caste & community.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-lg font-medium">
            Profile Completion:{" "}
            <span className="text-rose-400 font-bold">
              {completion.percent}%
            </span>
          </span>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
              profile.status === "APPROVED"
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : profile.status === "PENDING"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-slate-500/10 text-slate-400 border-slate-500/20"
            }`}
          >
            {profile.status || "DRAFT"}
          </span>
        </div>
      </div>

      {/* Completion Card */}
      <Card className="border border-slate-800 bg-slate-900/30 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-100">
            Profile Completion
          </CardTitle>
          <CardDescription className="text-slate-400">
            Complete your profile to improve match visibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Completion</span>
            <span className="text-lg font-bold text-rose-400">
              {completion.percent}%
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-300"
              style={{ width: `${completion.percent}%` }}
            />
          </div>

          {completion.sections.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {completion.sections.map((section) => (
                <div
                  key={section.key}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border ${
                    section.completed
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {section.completed ? (
                    <CircleCheck className="w-3.5 h-3.5" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" />
                  )}
                  {section.name}
                </div>
              ))}
            </div>
          )}

          {completion.missingSections.length > 0 && (
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Missing:</span>{" "}
              {completion.missingSections.join(", ")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("details")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "details"
              ? "border-rose-500 text-rose-400 bg-rose-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <User className="w-4 h-4" /> Personal & Bio Details
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "preferences"
              ? "border-rose-500 text-rose-400 bg-rose-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" /> Partner Preferences
        </button>
        <button
          onClick={() => setActiveTab("photos")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "photos"
              ? "border-rose-500 text-rose-400 bg-rose-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <Camera className="w-4 h-4" /> Photo Gallery
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "preview"
              ? "border-rose-500 text-rose-400 bg-rose-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <Eye className="w-4 h-4 text-emerald-400" /> Preview Profile
        </button>
      </div>

      {/* Tabs Content */}
      <div className="mt-4">
        {/* TAB 1: DETAILS */}
        {activeTab === "details" && (
          <Card className="border border-slate-800 bg-slate-900/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <User className="w-5 h-5 text-rose-500" /> Edit Personal
                Information
              </CardTitle>
              <CardDescription className="text-slate-400">
                Update your details below. Note: Changing critical information
                like religion, caste, or date of birth will trigger profile
                re-moderation.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form
                onSubmit={handleSubmitDetails(onUpdateDetails)}
                className="space-y-6"
              >
                {detailsSuccess && (
                  <div className="p-4 rounded-xl bg-green-950/30 border border-green-800/30 flex items-center gap-3 text-green-400 text-sm">
                    <Check className="w-5 h-5 shrink-0" />
                    <span>{detailsSuccess}</span>
                  </div>
                )}
                {detailsError && (
                  <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/30 flex items-center gap-3 text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{detailsError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Basic Metadata */}
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      className="w-full h-10 px-3 border border-slate-800 bg-slate-950/60 rounded-lg text-white focus:border-rose-500 text-sm"
                      {...registerDetails("gender")}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      className="border-slate-800 bg-slate-950/60"
                      {...registerDetails("dateOfBirth")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="e.g. 170"
                      className="border-slate-800 bg-slate-950/60"
                      {...registerDetails("height")}
                    />
                  </div>

                  {/* Marital & Background */}
                  <div className="space-y-2">
                    <Label htmlFor="maritalStatus">Marital Status</Label>
                    <select
                      id="maritalStatus"
                      className="w-full h-10 px-3 border border-slate-800 bg-slate-950/60 rounded-lg text-white focus:border-rose-500 text-sm"
                      {...registerDetails("maritalStatus")}
                    >
                      <option value="SINGLE">Never Married</option>
                      <option value="DIVORCED">Divorced</option>
                      <option value="WIDOWED">Widowed</option>
                      <option value="SEPARATED">Separated</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="religion">Religion</Label>
                    <Input
                      id="religion"
                      placeholder="e.g. Hindu, Christian"
                      className="border-slate-800 bg-slate-950/60"
                      {...registerDetails("religion")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="caste">Caste / Subcaste</Label>
                    <Input
                      id="caste"
                      placeholder="e.g. Brahmin, Reddy"
                      className="border-slate-800 bg-slate-950/60"
                      {...registerDetails("caste")}
                    />
                  </div>

                  {/* Education & Career */}
                  <div className="space-y-2">
                    <Label htmlFor="motherTongue">Mother Tongue</Label>
                    <Input
                      id="motherTongue"
                      placeholder="e.g. Telugu, Tamil"
                      className="border-slate-800 bg-slate-950/60"
                      {...registerDetails("motherTongue")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education">Education Level</Label>
                    <Input
                      id="education"
                      placeholder="e.g. B.Tech Computer Science, MBA"
                      className="border-slate-800 bg-slate-950/60"
                      {...registerDetails("education")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      placeholder="e.g. Software Engineer, Doctor"
                      className="border-slate-800 bg-slate-950/60"
                      {...registerDetails("occupation")}
                    />
                  </div>

                  {/* Location & Finance */}
                  <div className="space-y-2">
                    <Label htmlFor="income">Annual Income (Lakhs INR)</Label>
                    <Input
                      id="income"
                      type="number"
                      placeholder="e.g. 12"
                      className="border-slate-800 bg-slate-950/60"
                      {...registerDetails("income")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="e.g. Hyderabad"
                      className="border-slate-800 bg-slate-950/60"
                      {...registerDetails("city")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="e.g. Telangana"
                      className="border-slate-800 bg-slate-950/60"
                      {...registerDetails("state")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      placeholder="e.g. India"
                      className="border-slate-800 bg-slate-950/60"
                      {...registerDetails("country")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">About Me (Bio)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell prospective matches about your personality, hobbies, family values..."
                    className="border-slate-800 bg-slate-950/60 min-h-24 resize-none"
                    {...registerDetails("bio")}
                  />
                </div>

                {/* Family & Lifestyle Section */}
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold text-slate-200">
                    Family & Lifestyle
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="familyValues">Family Values</Label>
                      <Input
                        id="familyValues"
                        placeholder="e.g. Traditional, Modern"
                        className="border-slate-800 bg-slate-950/60"
                        {...registerDetails("familyValues")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="horoscope">Horoscope / Rashi</Label>
                      <Input
                        id="horoscope"
                        placeholder="e.g. Aries"
                        className="border-slate-800 bg-slate-950/60"
                        {...registerDetails("horoscope")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smoking">Smoking</Label>
                      <select
                        id="smoking"
                        className="w-full h-10 px-3 rounded-lg border border-slate-800 bg-slate-950/60 text-white focus:border-rose-500 text-sm"
                        {...registerDetails("smoking")}
                      >
                        <option value="">Select</option>
                        <option value="NO">No</option>
                        <option value="YES">Yes</option>
                        <option value="OCCASIONAL">Occasional</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="drinking">Drinking</Label>
                      <select
                        id="drinking"
                        className="w-full h-10 px-3 rounded-lg border border-slate-800 bg-slate-950/60 text-white focus:border-rose-500 text-sm"
                        {...registerDetails("drinking")}
                      >
                        <option value="">Select</option>
                        <option value="NO">No</option>
                        <option value="YES">Yes</option>
                        <option value="OCCASIONAL">Occasional</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="foodPreference">Food Preference</Label>
                      <select
                        id="foodPreference"
                        className="w-full h-10 px-3 rounded-lg border border-slate-800 bg-slate-950/60 text-white focus:border-rose-500 text-sm"
                        {...registerDetails("foodPreference")}
                      >
                        <option value="">Select</option>
                        <option value="VEGETARIAN">Vegetarian</option>
                        <option value="NON_VEGETARIAN">Non Vegetarian</option>
                        <option value="VEGAN">Vegan</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-rose-600 hover:bg-rose-500 font-semibold px-8 py-2 text-white"
                  >
                    {isPending ? "Saving..." : "Save Details"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* TAB 2: PREFERENCES */}
        {activeTab === "preferences" && (
          <Card className="border border-slate-800 bg-slate-900/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" /> Edit Partner Match
                Criteria
              </CardTitle>
              <CardDescription className="text-slate-400">
                Define details of your ideal partner. Our algorithm uses these
                to compute compatibility scores.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form
                onSubmit={handleSubmitPref(onUpdatePref)}
                className="space-y-6"
              >
                {prefSuccess && (
                  <div className="p-4 rounded-xl bg-green-950/30 border border-green-800/30 flex items-center gap-3 text-green-400 text-sm">
                    <Check className="w-5 h-5 shrink-0" />
                    <span>{prefSuccess}</span>
                  </div>
                )}
                {prefError && (
                  <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/30 flex items-center gap-3 text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{prefError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Age Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minAge">Min Partner Age</Label>
                      <Input
                        id="minAge"
                        type="number"
                        className="border-slate-800 bg-slate-950/60"
                        {...registerPref("minAge")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxAge">Max Partner Age</Label>
                      <Input
                        id="maxAge"
                        type="number"
                        className="border-slate-800 bg-slate-950/60"
                        {...registerPref("maxAge")}
                      />
                    </div>
                  </div>

                  {/* Height Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minHeight">Min Height (cm)</Label>
                      <Input
                        id="minHeight"
                        type="number"
                        className="border-slate-800 bg-slate-950/60"
                        {...registerPref("minHeight")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxHeight">Max Height (cm)</Label>
                      <Input
                        id="maxHeight"
                        type="number"
                        className="border-slate-800 bg-slate-950/60"
                        {...registerPref("maxHeight")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maritalStatusPref">Marital Status</Label>
                    <select
                      id="maritalStatusPref"
                      className="w-full h-10 px-3 border border-slate-800 bg-slate-950/60 rounded-lg text-white focus:border-rose-500 text-sm"
                      {...registerPref("maritalStatus")}
                    >
                      <option value="SINGLE">Never Married</option>
                      <option value="ANY">Any Status</option>
                      <option value="DIVORCED">Divorced</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="religionPref">Partner Religion</Label>
                    <Input
                      id="religionPref"
                      placeholder="e.g. Hindu"
                      className="border-slate-800 bg-slate-950/60"
                      {...registerPref("religion")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="languagePref">
                      Preferred Mother Tongue
                    </Label>
                    <Input
                      id="languagePref"
                      placeholder="e.g. Telugu"
                      className="border-slate-800 bg-slate-950/60"
                      {...registerPref("motherTongue")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="educationPref">Preferred Education</Label>
                    <Input
                      id="educationPref"
                      placeholder="e.g. Graduate"
                      className="border-slate-800 bg-slate-950/60"
                      {...registerPref("education")}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="countryPref">Preferred Country</Label>
                    <Input
                      id="countryPref"
                      placeholder="e.g. India"
                      className="border-slate-800 bg-slate-950/60"
                      {...registerPref("country")}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-rose-600 hover:bg-rose-500 font-semibold px-8 py-2 text-white"
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
          <Card className="border border-slate-800 bg-slate-900/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Camera className="w-5 h-5 text-rose-500" /> Photo Gallery
              </CardTitle>
              <CardDescription className="text-slate-400">
                Upload up to 5 photos. Profiles with photos get up to 3x more
                connect requests.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {photoSuccess && (
                <div className="p-4 rounded-xl bg-green-950/30 border border-green-800/30 flex items-center gap-3 text-green-400 text-sm">
                  <Check className="w-5 h-5 shrink-0" />
                  <span>{photoSuccess}</span>
                </div>
              )}
              {photoError && (
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/30 flex items-center gap-3 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{photoError}</span>
                </div>
              )}

              {/* Photo Upload Area */}
              <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/40 rounded-xl p-8 text-center transition-colors">
                <Input
                  type="file"
                  id="photoInput"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <label
                  htmlFor="photoInput"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-200 font-medium">
                      Click to upload a profile photo
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      PNG, JPG or WEBP (Max 5MB)
                    </p>
                  </div>
                </label>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {(profile.photos || []).map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-square"
                  >
                    <img
                      src={photo.url}
                      alt="Profile Media"
                      className="w-full h-full object-cover"
                    />
                    {photo.isMain && (
                      <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> Primary
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!photo.isMain && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSetPrimary(photo.id)}
                          className="h-8 text-xs bg-slate-800 hover:bg-slate-700 text-slate-100"
                        >
                          Make Primary
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="h-8 w-8 bg-red-600/80 text-white border-red-500 hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 4: PREVIEW */}
        {activeTab === "preview" && (
          <Card className="border border-slate-800 bg-slate-900/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-400" /> Public Profile
                Preview
              </CardTitle>
              <CardDescription className="text-slate-400">
                This is how prospective matches will view your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                  {profile.photos?.find((p) => p.isMain)?.url ? (
                    <img
                      src={profile.photos.find((p) => p.isMain)?.url}
                      alt="Primary"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-100">
                      {profile.gender === "FEMALE"
                        ? "Bride Profile"
                        : "Groom Profile"}
                    </h2>
                    <p className="text-slate-400 text-sm">
                      {profile.city
                        ? `${profile.city}, ${profile.state}`
                        : "Location not specified"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {profile.religion && (
                      <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md">
                        {profile.religion}{" "}
                        {profile.caste ? `• ${profile.caste}` : ""}
                      </span>
                    )}
                    {profile.occupation && (
                      <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md">
                        {profile.occupation}
                      </span>
                    )}
                    {profile.education && (
                      <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md">
                        {profile.education}
                      </span>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="text-slate-300 text-sm leading-relaxed pt-2">
                      {profile.bio}
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
