"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { User, Heart, Camera, Check, AlertCircle, Trash2, Star, Upload, Sparkles, MapPin, Eye } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction, updatePreferencesAction } from "@/lib/actions/profile.actions";
import { uploadPhoto, deletePhoto, setPrimaryPhoto } from "@/lib/actions/media.actions";

export function ProfileClient({ initialProfile }: { initialProfile: any }) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState<"details" | "preferences" | "photos" | "preview">("details");
  const [isPending, startTransition] = useTransition();

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
  const { register: registerDetails, handleSubmit: handleSubmitDetails } = useForm({
    defaultValues: {
      gender: profile.gender || "MALE",
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split("T")[0] : "",
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
    },
  });

  // Setup Preferences Form
  const { register: registerPref, handleSubmit: handleSubmitPref } = useForm({
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

  const onUpdateDetails = async (data: any) => {
    setDetailsSuccess(null);
    setDetailsError(null);
    startTransition(async () => {
      // Cast numerical fields appropriately
      const payload = {
        ...data,
        height: Number(data.height),
        income: Number(data.income),
      };
      const res = await updateProfileAction(payload);
      if (res.success && res.profile) {
        setDetailsSuccess("Profile details updated successfully!");
        setProfile((prev: any) => ({ ...prev, ...res.profile }));
        router.refresh();
      } else {
        setDetailsError(res.error || "Failed to update profile details");
      }
    });
  };

  const onUpdatePref = async (data: any) => {
    setPrefSuccess(null);
    setPrefError(null);
    startTransition(async () => {
      const payload = {
        ...data,
        minAge: Number(data.minAge),
        maxAge: Number(data.maxAge),
        minHeight: Number(data.minHeight),
        maxHeight: Number(data.maxHeight),
      };
      const res = await updatePreferencesAction(payload);
      if (res.success) {
        setPrefSuccess("Partner preferences updated successfully!");
        // Refresh preferences in state
        setProfile((prev: any) => ({
          ...prev,
          partnerPreference: { ...prev.partnerPreference, ...payload },
        }));
        router.refresh();
      } else {
        setPrefError(res.error || "Failed to update preferences");
      }
    });
  };

  // Upload Photo action
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
        setPhotoSuccess("Photo uploaded successfully! Refreshing gallery...");
        router.refresh();
        // Reload page data
        setTimeout(() => window.location.reload(), 1500);
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
        setProfile((prev: any) => ({
          ...prev,
          photos: prev.photos.filter((p: any) => p.id !== photoId),
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
        setProfile((prev: any) => ({
          ...prev,
          photos: prev.photos.map((p: any) => ({ ...p, isMain: p.id === photoId })),
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
            Complete details to boost compatibility scores and discover matches in your caste & community.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-lg font-medium">
            Profile Completion: <span className="text-rose-400 font-bold">{profile.completionPercent}%</span>
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
            profile.status === "APPROVED" 
              ? "bg-green-500/10 text-green-400 border-green-500/20" 
              : profile.status === "PENDING"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-slate-500/10 text-slate-400 border-slate-500/20"
          }`}>
            {profile.status}
          </span>
        </div>
      </div>

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
        {activeTab === "details" && (
          <Card className="border border-slate-800 bg-slate-900/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <User className="w-5 h-5 text-rose-500" /> Edit Personal Information
              </CardTitle>
              <CardDescription className="text-slate-400">
                Update your details below. Note: Changing critical information like religion, caste, or date of birth will trigger profile re-moderation.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitDetails(onUpdateDetails)} className="space-y-6">
                
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
                  {/* Row 1 */}
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

                  {/* Row 2 */}
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

                  {/* Row 3 */}
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

                  {/* Row 4 */}
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
                    placeholder="Tell prospective matches about your personality, hobbies, family values, and what you are looking for in a partner..."
                    className="border-slate-800 bg-slate-950/60 min-h-24 resize-none"
                    {...registerDetails("bio")}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isPending} className="bg-rose-600 hover:bg-rose-500 font-semibold px-8 py-2">
                    {isPending ? "Saving..." : "Save Details"}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === "preferences" && (
          <Card className="border border-slate-800 bg-slate-900/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" /> Edit Partner Match Criteria
              </CardTitle>
              <CardDescription className="text-slate-400">
                Define details of your ideal partner. Our AI engine uses these to compute real-time compatibility scores.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitPref(onUpdatePref)} className="space-y-6">

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

                  {/* Criteria 2 */}
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
                    <Label htmlFor="languagePref">Preferred Mother Tongue</Label>
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
                      id="languagePref"
                      placeholder="e.g. Graduate"
                      className="border-slate-800 bg-slate-950/60"
                      {...registerPref("education")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="countryPref">Preferred Country</Label>
                    <Input
                      id="countryPref"
                      placeholder="e.g. India"
                      className="border-slate-800 bg-slate-950/60"
                      {...registerPref("country")}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isPending} className="bg-rose-600 hover:bg-rose-500 font-semibold px-8 py-2">
                    {isPending ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === "photos" && (
          <Card className="border border-slate-800 bg-slate-900/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Camera className="w-5 h-5 text-rose-500" /> Photo & Verification Gallery
              </CardTitle>
              <CardDescription className="text-slate-400">
                Upload up to 5 photos. High-resolution photos receive 3x higher connect requests.
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

              {/* Upload Button Box */}
              <div className="border-2 border-dashed border-slate-800 hover:border-rose-500/50 rounded-2xl p-8 text-center bg-slate-950/40 transition-colors relative">
                <input
                  type="file"
                  id="photo-upload-input"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploading || (profile.photos || []).length >= 5}
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-500">
                    <Upload className="w-5 h-5 animate-bounce" />
                  </div>
                  <p className="font-semibold text-sm">Click to upload new photo</p>
                  <p className="text-slate-500 text-xs">JPEG, PNG or WEBP up to 5MB (Max 5 photos)</p>
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold">
                      <Sparkles className="w-5 h-5 animate-spin" />
                      Processing & verifying image safety...
                    </div>
                  </div>
                )}
              </div>

              {/* Photos List */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {(profile.photos || []).map((photo: any) => (
                  <div key={photo.id} className="group relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden aspect-[3/4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt="Uploaded profile view"
                      className="h-full w-full object-cover"
                    />

                    {/* Badge Overlay */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {photo.isMain && (
                        <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold shadow-md flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-white" /> Primary
                        </span>
                      )}
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                        photo.isApproved 
                          ? "bg-green-600/90 text-white" 
                          : "bg-amber-600/90 text-white"
                      }`}>
                        {photo.isApproved ? "Approved" : "Pending review"}
                      </span>
                    </div>

                    {/* Hover Actions Panel */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                      {!photo.isMain && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSetPrimary(photo.id)}
                          className="h-8 text-[10px] text-white hover:bg-slate-900 border border-slate-800 px-2"
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {(!profile.photos || profile.photos.length === 0) && (
                  <div className="col-span-full py-10 text-center text-xs text-slate-500">
                    No photos uploaded. Please upload a photo to start matching.
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        )}

        {activeTab === "preview" && (
          <Card className="border border-slate-800 bg-slate-900/30 backdrop-blur-md p-6 flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-80 shrink-0">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden relative shadow-2xl aspect-[3/4]">
                {profile.photos?.find((p: any) => p.isMain)?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photos.find((p: any) => p.isMain).url}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-slate-900 flex items-center justify-center flex-col text-slate-500 gap-2">
                    <Camera className="w-12 h-12" />
                    <span className="text-xs">No Profile Picture</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-xl font-bold text-slate-100 flex items-center gap-1.5">
                    {profile.user?.name || "Matrimony Member"}
                  </h3>
                  <p className="text-slate-300 text-xs mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> {profile.city || "Not set"}, {profile.state || "Not set"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-grow space-y-6 text-sm">
              <h2 className="text-2xl font-bold text-slate-200">Bio / Description</h2>
              <p className="text-slate-400 italic leading-relaxed">
                &ldquo;{profile.bio || "No bio description written yet. Update your details to describe yourself."}&rdquo;
              </p>

              <hr className="border-slate-800" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 uppercase tracking-wider font-semibold">Basic Details</span>
                  <ul className="mt-2 space-y-1.5">
                    <li><span className="text-slate-400">Gender:</span> {profile.gender}</li>
                    <li><span className="text-slate-400">Age:</span> {profile.dateOfBirth ? `${new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()} yrs` : "N/A"}</li>
                    <li><span className="text-slate-400">Height:</span> {profile.height} cm</li>
                    <li><span className="text-slate-400">Marital Status:</span> {profile.maritalStatus}</li>
                  </ul>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider font-semibold">Community & Profession</span>
                  <ul className="mt-2 space-y-1.5">
                    <li><span className="text-slate-400">Religion:</span> {profile.religion}</li>
                    <li><span className="text-slate-400">Caste:</span> {profile.caste || "N/A"}</li>
                    <li><span className="text-slate-400">Mother Tongue:</span> {profile.motherTongue}</li>
                    <li><span className="text-slate-400">Education:</span> {profile.education || "N/A"}</li>
                    <li><span className="text-slate-400">Occupation:</span> {profile.occupation || "N/A"}</li>
                    <li><span className="text-slate-400">Annual Income:</span> ₹{profile.income} Lakhs</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

    </div>
  );
}
