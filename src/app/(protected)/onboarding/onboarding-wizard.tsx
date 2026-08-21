"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { saveStepAction } from "@/lib/actions/onboarding.actions";
import { uploadPhoto, deletePhoto, setPrimaryPhoto } from "@/lib/actions/media.actions";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  User,
  Heart,
  Briefcase,
  MapPin,
  Users,
  Compass,
  FileText,
  Camera,
  ShieldCheck,
  Trash2,
  Star,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import {
  GOTHRAM_OPTIONS,
  RASHI_OPTIONS,
  NAKSHATRA_OPTIONS,
  PARTNER_RELIGION_OPTIONS,
  PARTNER_MOTHER_TONGUE_OPTIONS,
  PARTNER_EDUCATION_OPTIONS,
  PARTNER_COUNTRY_OPTIONS,
} from "@/lib/constants/options";

interface StepMeta {
  number: number;
  title: string;
  shortTitle: string;
  icon: any;
  description: string;
}

const STEPS: StepMeta[] = [
  { number: 1, title: "Basic Identity", shortTitle: "Identity", icon: User, description: "Your basic contact & account identification" },
  { number: 2, title: "Personal Demographics", shortTitle: "Demographics", icon: Compass, description: "Age, height, weight and marital status" },
  { number: 3, title: "Cultural & Horoscope", shortTitle: "Cultural", icon: Heart, description: "Religion, caste, gothram, mother tongue & horoscope" },
  { number: 4, title: "Education & Career", shortTitle: "Career", icon: Briefcase, description: "Qualifications, occupation and annual income" },
  { number: 5, title: "Location Details", shortTitle: "Location", icon: MapPin, description: "Country, state, district and city of residence" },
  { number: 6, title: "Family & Lifestyle", shortTitle: "Family & Life", icon: Users, description: "Family values, diet, habits and family background" },
  { number: 7, title: "About Me", shortTitle: "About Me", icon: FileText, description: "Personal overview and expectations" },
  { number: 8, title: "Partner Preferences", shortTitle: "Preferences", icon: Heart, description: "Desired criteria in an ideal life partner" },
  { number: 9, title: "Photos & Gallery", shortTitle: "Photos", icon: Camera, description: "Upload up to 4 high-quality profile photos" },
  { number: 10, title: "Review & Submit", shortTitle: "Submit", icon: ShieldCheck, description: "Preview your matrimonial profile and submit for review" },
];

export function OnboardingWizard({ initialProfile }: { initialProfile: any }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Photos State
  const [photos, setPhotos] = useState<any[]>(initialProfile?.photos || []);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Master Data State
  const [religions, setReligions] = useState<any[]>([]);
  const [castes, setCastes] = useState<any[]>([]);
  const [subCastes, setSubCastes] = useState<any[]>([]);
  const [gothrams, setGothrams] = useState<any[]>([]);
  const [motherTongues, setMotherTongues] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [occupations, setOccupations] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  // Custom Dropdown Option States
  const [casteOther, setCasteOther] = useState("");
  const [subCasteOther, setSubCasteOther] = useState("");
  const [educationOther, setEducationOther] = useState("");
  const [occupationOther, setOccupationOther] = useState("");
  const [districtOther, setDistrictOther] = useState("");
  const [cityOther, setCityOther] = useState("");

  // Parse Initial Family Details
  let initialFamily: any = {};
  try {
    if (initialProfile?.familyDetails) {
      initialFamily = typeof initialProfile.familyDetails === "string" 
        ? JSON.parse(initialProfile.familyDetails) 
        : initialProfile.familyDetails;
    }
  } catch {
    initialFamily = { aboutFamily: initialProfile?.familyDetails };
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialProfile?.user?.name || "",
      phone: initialProfile?.user?.phone || "",
      gender: initialProfile?.gender || "",
      dateOfBirth: initialProfile?.dateOfBirth ? new Date(initialProfile.dateOfBirth).toISOString().split("T")[0] : "",
      height: initialProfile?.height || "",
      weight: initialProfile?.weight || "",
      maritalStatus: initialProfile?.maritalStatus || "",
      religion: initialProfile?.religion || "",
      caste: initialProfile?.caste || "",
      subCaste: initialProfile?.subCaste || "",
      gothram: initialProfile?.gothram || "",
      motherTongue: initialProfile?.motherTongue || "",
      motherTongueOther: "",
      rashi: "",
      star: "",
      horoscope: initialProfile?.horoscope || "",
      education: initialProfile?.education || "",
      occupation: initialProfile?.occupation || "",
      income: initialProfile?.income || "",
      country: initialProfile?.country || "India",
      state: initialProfile?.state || "",
      district: initialProfile?.district || "",
      city: initialProfile?.city || "",
      // Family Details Reference Fields
      familyValues: initialProfile?.familyValues || initialFamily.familyValues || "Moderate",
      familyType: initialFamily.familyType || "Nuclear Family",
      familyStatus: initialFamily.familyStatus || "Middle Class",
      fatherOccupation: initialFamily.fatherOccupation || "",
      motherOccupation: initialFamily.motherOccupation || "",
      brothersCount: initialFamily.brothersCount || "0",
      brothersMarried: initialFamily.brothersMarried || "0",
      sistersCount: initialFamily.sistersCount || "0",
      sistersMarried: initialFamily.sistersMarried || "0",
      familyLocationType: initialFamily.familyLocationType || "same",
      aboutFamily: initialFamily.aboutFamily || (typeof initialProfile?.familyDetails === "string" && !initialProfile.familyDetails.startsWith("{") ? initialProfile.familyDetails : ""),
      // Lifestyle Fields
      foodPreference: initialProfile?.foodPreference || "Vegetarian",
      smoking: initialProfile?.smoking || "NO",
      drinking: initialProfile?.drinking || "NO",
      bio: initialProfile?.bio || "",
      // Partner Preferences
      minAge: initialProfile?.partnerPreference?.minAge || 21,
      maxAge: initialProfile?.partnerPreference?.maxAge || 35,
      minHeight: initialProfile?.partnerPreference?.minHeight || 150,
      maxHeight: initialProfile?.partnerPreference?.maxHeight || 190,
      partnerMaritalStatus: initialProfile?.partnerPreference?.maritalStatus || "Never Married",
      partnerReligion: initialProfile?.partnerPreference?.religion || "",
      partnerMotherTongue: initialProfile?.partnerPreference?.motherTongue || "",
      partnerEducation: initialProfile?.partnerPreference?.education || "",
      partnerCountry: initialProfile?.partnerPreference?.country || "India",
    },
  });

  const selectedReligion = watch("religion");
  const selectedCaste = watch("caste");
  const selectedSubCaste = watch("subCaste");
  const selectedCountry = watch("country");
  const selectedState = watch("state");
  const selectedDistrict = watch("district");
  const dobValue = watch("dateOfBirth");

  // Calculate live age
  const calculatedAge = dobValue
    ? Math.floor((new Date().getTime() - new Date(dobValue).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  // Fetch initial Master Data
  useEffect(() => {
    fetch("/api/master-data?type=religions")
      .then((r) => r.json())
      .then((res) => { if (res.success && res.data) setReligions(res.data); })
      .catch(() => {});

    fetch("/api/master-data?type=mothertongues")
      .then((r) => r.json())
      .then((res) => { if (res.success && res.data) setMotherTongues(res.data); })
      .catch(() => {});

    fetch("/api/master-data?type=educations")
      .then((r) => r.json())
      .then((res) => { if (res.success && res.data) setEducations(res.data); })
      .catch(() => {});

    fetch("/api/master-data?type=occupations")
      .then((r) => r.json())
      .then((res) => { if (res.success && res.data) setOccupations(res.data); })
      .catch(() => {});

    fetch("/api/master-data?type=countries")
      .then((r) => r.json())
      .then((res) => { if (res.success && res.data) setCountries(res.data); })
      .catch(() => {});
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

  // Fetch States when Country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryObj = countries.find((c) => c.name === selectedCountry || c.id === selectedCountry);
      const queryId = countryObj?.id || selectedCountry;
      fetch(`/api/master-data?type=states&parentId=${encodeURIComponent(queryId)}`)
        .then((r) => r.json())
        .then((res) => { if (res.success && res.data) setStates(res.data); })
        .catch(() => {});
    } else {
      setStates([]);
    }
  }, [selectedCountry, countries]);

  // Fetch Districts when State changes
  useEffect(() => {
    if (selectedState) {
      const stateObj = states.find((s) => s.name === selectedState || s.id === selectedState);
      const queryId = stateObj?.name || stateObj?.id || selectedState;
      fetch(`/api/master-data?type=districts&parentId=${encodeURIComponent(queryId)}`)
        .then((r) => r.json())
        .then((res) => { 
          if (res.success && res.data) {
            setDistricts(res.data);
          } else {
            setDistricts([]);
          }
        })
        .catch(() => setDistricts([]));
    } else {
      setDistricts([]);
      setCities([]);
    }
  }, [selectedState, states]);

  // Fetch Cities when District changes
  useEffect(() => {
    if (selectedDistrict) {
      const distObj = districts.find((d) => d.name === selectedDistrict || d.id === selectedDistrict);
      const queryId = distObj?.name || distObj?.id || selectedDistrict;
      fetch(`/api/master-data?type=cities&parentId=${encodeURIComponent(queryId)}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data) {
            setCities(res.data);
          } else {
            setCities([]);
          }
        })
        .catch(() => setCities([]));
    } else {
      setCities([]);
    }
  }, [selectedDistrict, districts]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (photos.length >= 4) {
      setPhotoError("Maximum 4 profile photos allowed.");
      return;
    }

    const file = files[0];
    // File validation
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("File size exceeds maximum 5MB limit.");
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setPhotoError("Only JPG, PNG, and WEBP images are supported.");
      return;
    }

    setUploadingPhoto(true);
    setPhotoError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadPhoto(formData);
      if (res.success && res.photo) {
        setPhotos((prev) => [...prev, res.photo]);
      } else {
        setPhotoError(res.error || "Failed to upload photo to Supabase storage.");
      }
    } catch {
      setPhotoError("Network error while uploading photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    setPhotoError(null);
    try {
      const res = await deletePhoto(photoId);
      if (res.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      } else {
        setPhotoError(res.error || "Failed to delete photo.");
      }
    } catch {
      setPhotoError("Failed to delete photo.");
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      const res = await setPrimaryPhoto(photoId);
      if (res.success) {
        setPhotos((prev) => prev.map((p) => ({ ...p, isMain: p.id === photoId })));
      }
    } catch {
      // ignore
    }
  };

  const nextStep = async (stepData: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await saveStepAction(currentStep, stepData);
      if (!res.success) {
        setError(res.error || "Failed to save step");
      } else {
        if (currentStep < 10) {
          setCurrentStep(currentStep + 1);
        } else {
          // Final Step: Submit for Review
          const submitRes = await saveStepAction(10, { submitForReview: true });
          if (submitRes.success) {
            router.push("/dashboard");
            router.refresh();
          } else {
            setError(submitRes.error || "Failed to submit profile for review");
          }
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: any) => {
    let stepData: any = {};
    if (currentStep === 1) {
      stepData = { name: data.name, phone: data.phone || undefined };
    } else if (currentStep === 2) {
      stepData = {
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        height: Number(data.height),
        weight: data.weight ? Number(data.weight) : undefined,
        maritalStatus: data.maritalStatus,
      };
    } else if (currentStep === 3) {
      const horoscopeCombined = [
        data.rashi ? `Rashi: ${data.rashi}` : "",
        data.star ? `Star: ${data.star}` : "",
      ].filter(Boolean).join(" · ") || data.horoscope || undefined;

      stepData = {
        religion: data.religion,
        caste: data.caste === "Other" && casteOther.trim() ? casteOther.trim() : data.caste || undefined,
        subCaste: data.subCaste === "Other" && subCasteOther.trim() ? subCasteOther.trim() : data.subCaste || undefined,
        gothram: data.gothram || undefined,
        motherTongue: data.motherTongue === "Other" ? data.motherTongueOther : data.motherTongue,
        horoscope: horoscopeCombined,
      };
    } else if (currentStep === 4) {
      stepData = {
        education: data.education === "Other" && educationOther.trim() ? educationOther.trim() : data.education,
        occupation: data.occupation === "Other" && occupationOther.trim() ? occupationOther.trim() : data.occupation,
        income: Number(data.income) || 0,
      };
    } else if (currentStep === 5) {
      stepData = {
        country: data.country,
        state: data.state,
        district: data.district === "Other" && districtOther.trim() ? districtOther.trim() : data.district || undefined,
        city: data.city === "Other" && cityOther.trim() ? cityOther.trim() : data.city,
      };
    } else if (currentStep === 6) {
      const familyPayload = {
        familyValue: data.familyValues,
        familyType: data.familyType,
        familyStatus: data.familyStatus,
        fatherOccupation: data.fatherOccupation,
        motherOccupation: data.motherOccupation,
        brothersCount: data.brothersCount,
        brothersMarried: data.brothersMarried,
        sistersCount: data.sistersCount,
        sistersMarried: data.sistersMarried,
        familyLocationType: data.familyLocationType,
        aboutFamily: data.aboutFamily,
      };

      stepData = {
        familyDetails: JSON.stringify(familyPayload),
        familyValues: data.familyValues || undefined,
        foodPreference: data.foodPreference || undefined,
        smoking: data.smoking || undefined,
        drinking: data.drinking || undefined,
      };
    } else if (currentStep === 7) {
      stepData = {
        bio: data.bio,
      };
    } else if (currentStep === 8) {
      stepData = {
        minAge: Number(data.minAge) || 21,
        maxAge: Number(data.maxAge) || 35,
        minHeight: Number(data.minHeight) || 150,
        maxHeight: Number(data.maxHeight) || 190,
        maritalStatus: data.partnerMaritalStatus || undefined,
        religion: data.partnerReligion || undefined,
        motherTongue: data.partnerMotherTongue || undefined,
        education: data.partnerEducation || undefined,
        country: data.partnerCountry || undefined,
      };
    } else if (currentStep === 9) {
      stepData = { photosAcknowledged: true };
    } else if (currentStep === 10) {
      stepData = { submitForReview: true };
    }

    nextStep(stepData);
  };

  const progressPercent = Math.round(((currentStep - 1) / 9) * 100);
  const currentStepMeta = STEPS[currentStep - 1];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 flex-grow flex flex-col justify-center">
      {/* Header Stepper Navigation */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
          <span className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
              Step {currentStep} of 10
            </span>
            <span className="font-semibold text-slate-800">{currentStepMeta.title}</span>
          </span>
          <span className="text-rose-600 font-bold">{progressPercent}% Completed</span>
        </div>

        <Progress value={progressPercent} className="h-2 bg-slate-200" />

        {/* Mini Step Icons Scroller */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 pt-1 border-b border-slate-200/80 scrollbar-none">
          {STEPS.map((s) => {
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;
            return (
              <button
                key={s.number}
                type="button"
                onClick={() => {
                  if (s.number < currentStep) setCurrentStep(s.number);
                }}
                disabled={s.number > currentStep}
                className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[10px] transition-all min-w-[58px] ${
                  isCurrent
                    ? "text-rose-700 font-bold bg-rose-50 border border-rose-200 shadow-sm"
                    : isCompleted
                      ? "text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                      : "text-slate-400 cursor-not-allowed opacity-60"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isCurrent
                      ? "bg-rose-600 text-white shadow-sm"
                      : isCompleted
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isCompleted ? "✓" : s.number}
                </div>
                <span className="truncate max-w-[54px]">{s.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="border border-slate-200/90 bg-white shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600">
                    <currentStepMeta.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">
                      {currentStepMeta.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      {currentStepMeta.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 pt-6">
                {error && (
                  <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* STEP 1: Basic Identity */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-medium text-xs">Profile Created For <span className="text-rose-600">*</span></Label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {["Self", "Son", "Daughter", "Brother", "Sister", "Relative / Friend"].map((rel) => {
                          const isSelected = rel === "Self";
                          return (
                            <button
                              key={rel}
                              type="button"
                              className={`px-2.5 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                                isSelected
                                  ? "bg-rose-50 border-rose-300 text-rose-700 shadow-sm"
                                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {rel}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-slate-500">Select who you are registering this matrimonial profile for.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-700 font-medium text-xs">Full Name <span className="text-rose-600">*</span></Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="e.g. Chaitanya Varma"
                        className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 rounded-xl text-sm"
                        {...register("name", { required: "Full name is required" })}
                      />
                      {errors.name && <p className="text-xs text-red-600">{errors.name.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-700 font-medium text-xs">Mobile Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="e.g. +919876543210"
                        className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 rounded-xl text-sm"
                        {...register("phone")}
                      />
                      <p className="text-[11px] text-slate-500">
                        Kept strictly confidential and masked. Unlocked only with verified mutual interest and quota.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 2: Personal Demographics */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-slate-700 font-medium text-xs">Gender <span className="text-rose-600">*</span></Label>
                      <select
                        id="gender"
                        className="w-full h-10 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:border-rose-500 text-sm"
                        {...register("gender", { required: "Gender is required" })}
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male (Groom)</option>
                        <option value="FEMALE">Female (Bride)</option>
                      </select>
                      {errors.gender && <p className="text-xs text-red-600">{errors.gender.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="dateOfBirth" className="text-slate-700 font-medium text-xs">Date of Birth <span className="text-rose-600">*</span></Label>
                        {calculatedAge !== null && (
                          <span className="text-xs text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            Age: {calculatedAge} Years
                          </span>
                        )}
                      </div>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 rounded-xl text-sm"
                        {...register("dateOfBirth", { required: "Date of birth is required" })}
                      />
                      {errors.dateOfBirth && <p className="text-xs text-red-600">{errors.dateOfBirth.message as string}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="height" className="text-slate-700 font-medium text-xs">Height (cm) <span className="text-rose-600">*</span></Label>
                        <Input
                          id="height"
                          type="number"
                          placeholder="e.g. 175"
                          className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 rounded-xl text-sm"
                          {...register("height", { required: "Height is required" })}
                        />
                        {errors.height && <p className="text-xs text-red-600">{errors.height.message as string}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight" className="text-slate-700 font-medium text-xs">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          placeholder="e.g. 70"
                          className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 rounded-xl text-sm"
                          {...register("weight")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus" className="text-slate-700 font-medium text-xs">Marital Status <span className="text-rose-600">*</span></Label>
                      <select
                        id="maritalStatus"
                        className="w-full h-10 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:border-rose-500 text-sm"
                        {...register("maritalStatus", { required: "Marital status is required" })}
                      >
                        <option value="">Select Status</option>
                        <option value="Never Married">Never Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Awaiting Divorce">Awaiting Divorce</option>
                        <option value="Annulled">Annulled</option>
                      </select>
                      {errors.maritalStatus && <p className="text-xs text-red-600">{errors.maritalStatus.message as string}</p>}
                    </div>
                  </div>
                )}

                {/* STEP 3: Cultural & Horoscope Information */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="religion" className="text-slate-700 font-medium text-xs">Religion <span className="text-rose-600">*</span></Label>
                      <select
                        id="religion"
                        className="w-full h-10 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:border-rose-500 text-sm"
                        {...register("religion", { required: "Religion is required" })}
                      >
                        <option value="">Select Religion</option>
                        {religions.length > 0
                          ? religions.map((r) => (
                              <option key={r.id} value={r.name}>
                                {r.name}
                              </option>
                            ))
                          : (
                            <>
                              <option value="Hindu">Hindu</option>
                              <option value="Muslim">Muslim</option>
                              <option value="Christian">Christian</option>
                              <option value="Sikh">Sikh</option>
                              <option value="Jain">Jain</option>
                              <option value="Buddhist">Buddhist</option>
                            </>
                          )}
                      </select>
                      {errors.religion && <p className="text-xs text-red-600">{errors.religion.message as string}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="caste" className="text-slate-700 font-medium text-xs">Caste</Label>
                        <select
                          id="caste"
                          className="w-full h-10 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:border-rose-500 text-sm"
                          {...register("caste")}
                        >
                          <option value="">Select Caste</option>
                          {castes.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                          <option value="Other">Other (Please specify)</option>
                        </select>
                        {watch("caste") === "Other" && (
                          <Input
                            type="text"
                            placeholder="Please specify your caste"
                            value={casteOther}
                            onChange={(e) => setCasteOther(e.target.value)}
                            className="mt-2 border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 rounded-xl text-sm"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subCaste" className="text-slate-700 font-medium text-xs">Sub Caste</Label>
                        <select
                          id="subCaste"
                          className="w-full h-10 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:border-rose-500 text-sm"
                          {...register("subCaste")}
                        >
                          <option value="">Select Sub Caste</option>
                          {subCastes.map((sc) => (
                            <option key={sc.id} value={sc.name}>
                              {sc.name}
                            </option>
                          ))}
                          <option value="Other">Other (Please specify)</option>
                        </select>
                        {watch("subCaste") === "Other" && (
                          <Input
                            type="text"
                            placeholder="Please specify your sub caste"
                            value={subCasteOther}
                            onChange={(e) => setSubCasteOther(e.target.value)}
                            className="mt-2 border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 rounded-xl text-sm"
                          />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gothram" className="text-slate-700 font-medium text-xs">Gothram</Label>
                        <select
                          id="gothram"
                          className="w-full h-10 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:border-rose-500 text-sm"
                          {...register("gothram")}
                        >
                          <option value="">Select Gothram</option>
                          {GOTHRAM_OPTIONS.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="motherTongue" className="text-slate-700 font-medium text-xs">Mother Tongue <span className="text-rose-600">*</span></Label>
                        <select
                          id="motherTongue"
                          className="w-full h-10 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:border-rose-500 text-sm"
                          {...register("motherTongue", { required: "Mother tongue is required" })}
                          onChange={(e) => {
                            register("motherTongue").onChange(e);
                          }}
                        >
                          <option value="">Select Mother Tongue</option>
                          {motherTongues.length > 0
                            ? motherTongues.map((m) => (
                                <option key={m.id} value={m.name}>
                                  {m.name}
                                </option>
                              ))
                            : (
                              <>
                                <option value="Telugu">Telugu</option>
                                <option value="Tamil">Tamil</option>
                                <option value="Kannada">Kannada</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Marathi">Marathi</option>
                                <option value="Malayalam">Malayalam</option>
                                <option value="Bengali">Bengali</option>
                                <option value="Gujarati">Gujarati</option>
                              </>
                            )}
                          <option value="Other">Other (Please specify)</option>
                        </select>
                        {watch("motherTongue") === "Other" && (
                           <Input
                             type="text"
                             placeholder="Please specify your mother tongue"
                             className="mt-2 border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 rounded-xl text-sm"
                             {...register("motherTongueOther", { required: "Please specify your mother tongue" })}
                           />
                        )}
                        {errors.motherTongue && <p className="text-xs text-red-600">{errors.motherTongue.message as string}</p>}
                        {errors.motherTongueOther && <p className="text-xs text-red-600">{errors.motherTongueOther.message as string}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rashi" className="text-slate-700 font-medium text-xs">Rashi / Moon Sign</Label>
                        <select
                          id="rashi"
                          className="w-full h-10 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:border-rose-500 text-sm"
                          {...register("rashi")}
                        >
                          <option value="">Select Rashi</option>
                          {RASHI_OPTIONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="star" className="text-slate-700 font-medium text-xs">Star / Nakshatra</Label>
                        <select
                          id="star"
                          className="w-full h-10 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:border-rose-500 text-sm"
                          {...register("star")}
                        >
                          <option value="">Select Star / Nakshatra</option>
                          {NAKSHATRA_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Education & Profession */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="education" className="text-slate-700 font-medium text-xs">Highest Education <span className="text-rose-600">*</span></Label>
                      <select
                        id="education"
                        className="w-full h-10 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:border-rose-500 text-sm"
                        {...register("education", { required: "Education is required" })}
                      >
                        <option value="">Select Education</option>
                        {educations.length > 0
                          ? educations.map((e) => (
                              <option key={e.id} value={e.name}>
                                {e.name}
                              </option>
                            ))
                          : (
                            <>
                              <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                              <option value="M.Tech / M.E.">M.Tech / M.E.</option>
                              <option value="MS / M.Sc">MS / M.Sc</option>
                              <option value="MBA / PGDM">MBA / PGDM</option>
                              <option value="MBBS / MD / MS">MBBS / MD / MS</option>
                              <option value="B.Com / M.Com">B.Com / M.Com</option>
                              <option value="CA / ICWA / CS">CA / ICWA / CS</option>
                              <option value="Ph.D. / Doctorate">Ph.D. / Doctorate</option>
                              <option value="Bachelor Degree (Others)">Bachelor Degree (Others)</option>
                              <option value="Master Degree (Others)">Master Degree (Others)</option>
                            </>
                          )}
                        <option value="Other">Other (Please specify)</option>
                      </select>
                      {watch("education") === "Other" && (
                        <Input
                          type="text"
                          placeholder="Please specify your education degree"
                          value={educationOther}
                          onChange={(e) => setEducationOther(e.target.value)}
                          className="mt-2 border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 rounded-xl text-sm"
                        />
                      )}
                      {errors.education && <p className="text-xs text-red-600">{errors.education.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="occupation" className="text-slate-700 font-medium text-xs">Occupation / Profession <span className="text-rose-600">*</span></Label>
                      <select
                        id="occupation"
                        className="w-full h-10 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:border-rose-500 text-sm"
                        {...register("occupation", { required: "Occupation is required" })}
                      >
                        <option value="">Select Occupation</option>
                        {occupations.length > 0
                          ? occupations.map((o) => (
                              <option key={o.id} value={o.name}>
                                {o.name}
                              </option>
                            ))
                          : (
                            <>
                              <option value="Software Engineer / Developer">Software Engineer / Tech Lead</option>
                              <option value="Product Manager / Architect">Product Manager / Architect</option>
                              <option value="Doctor / Healthcare Specialist">Doctor / Healthcare Specialist</option>
                              <option value="Civil Services / Govt Officer">Civil Services / Govt Officer</option>
                              <option value="Business Owner / Entrepreneur">Business Owner / Entrepreneur</option>
                              <option value="Chartered Accountant / Finance">Chartered Accountant / Finance</option>
                              <option value="Banking Professional">Banking Professional</option>
                              <option value="Professor / Academician">Professor / Academician</option>
                              <option value="Lawyer / Legal Professional">Lawyer / Legal Professional</option>
                            </>
                          )}
                        <option value="Other">Other (Please specify)</option>
                      </select>
                      {watch("occupation") === "Other" && (
                        <Input
                          type="text"
                          placeholder="Please specify your occupation"
                          value={occupationOther}
                          onChange={(e) => setOccupationOther(e.target.value)}
                          className="mt-2 border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 rounded-xl text-sm"
                        />
                      )}
                      {errors.occupation && <p className="text-xs text-red-600">{errors.occupation.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="income" className="text-slate-700 font-medium text-xs">Annual Income (in Lakhs INR) <span className="text-rose-600">*</span></Label>
                      <Input
                        id="income"
                        type="number"
                        placeholder="e.g. 18"
                        className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 rounded-xl text-sm"
                        {...register("income", { required: "Annual income is required" })}
                      />
                      {errors.income && <p className="text-xs text-red-600">{errors.income.message as string}</p>}
                    </div>
                  </div>
                )}

                {/* STEP 5: Location Details */}
                {currentStep === 5 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-slate-700 font-medium text-xs">Country <span className="text-rose-600">*</span></Label>
                        <select
                          id="country"
                          className="w-full h-10 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:border-rose-500 text-sm"
                          {...register("country", { required: "Country is required" })}
                        >
                          <option value="India">India</option>
                          <option value="USA">United States (USA)</option>
                          <option value="UK">United Kingdom (UK)</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                          <option value="UAE">United Arab Emirates (UAE)</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Germany">Germany</option>
                        </select>
                        {errors.country && <p className="text-xs text-red-600">{errors.country.message as string}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-slate-700 font-medium text-xs">State <span className="text-rose-600">*</span></Label>
                        {states.length > 0 ? (
                          <select
                            id="state"
                            className="w-full h-10 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:border-rose-500 text-sm"
                            {...register("state", { required: "State is required" })}
                          >
                            <option value="">Select State</option>
                            {states.map((s) => (
                              <option key={s.id} value={s.name}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            id="state"
                            type="text"
                            placeholder="e.g. Andhra Pradesh, Telangana, Karnataka"
                            className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 rounded-xl text-sm"
                            {...register("state", { required: "State is required" })}
                          />
                        )}
                        {errors.state && <p className="text-xs text-red-600">{errors.state.message as string}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="district" className="text-slate-700 font-medium text-xs">District <span className="text-rose-600">*</span></Label>
                        <select
                          id="district"
                          className="w-full h-10 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:border-rose-500 text-sm font-medium"
                          {...register("district", { required: "District is required" })}
                        >
                          <option value="">- Select District -</option>
                          {districts.map((d) => (
                            <option key={d.id} value={d.name}>
                              {d.name}
                            </option>
                          ))}
                          <option value="Other">Other (Please specify)</option>
                        </select>
                        {watch("district") === "Other" && (
                          <Input
                            type="text"
                            placeholder="Please specify your district"
                            value={districtOther}
                            onChange={(e) => setDistrictOther(e.target.value)}
                            className="mt-2 border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 rounded-xl text-sm"
                          />
                        )}
                        {errors.district && <p className="text-xs text-red-600">{errors.district.message as string}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-slate-700 font-medium text-xs">City / Town <span className="text-rose-600">*</span></Label>
                        <select
                          id="city"
                          className="w-full h-10 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:border-rose-500 text-sm font-medium"
                          {...register("city", { required: "City is required" })}
                        >
                          <option value="">- Select City / Town -</option>
                          {cities.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                          <option value="Other">Other (Please specify)</option>
                        </select>
                        {watch("city") === "Other" && (
                          <Input
                            type="text"
                            placeholder="Please specify your city / town"
                            value={cityOther}
                            onChange={(e) => setCityOther(e.target.value)}
                            className="mt-2 border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 rounded-xl text-sm"
                          />
                        )}
                        {errors.city && <p className="text-xs text-red-600">{errors.city.message as string}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: Family Details (Reference UI Layout) */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    {/* Family Details Card Box */}
                    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="text-base font-bold text-slate-900">Family Details</h3>
                        <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                          Step 6 of 10
                        </span>
                      </div>

                      {/* Family Value Radio Group */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center text-xs">
                        <Label className="md:col-span-3 text-slate-700 font-semibold">
                          Family Value <span className="text-rose-600">*</span>
                        </Label>
                        <div className="md:col-span-9 flex flex-wrap gap-4 text-xs">
                          {["Orthodox", "Traditional", "Moderate", "Liberal"].map((val) => (
                            <label key={val} className="flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-slate-900">
                              <input
                                type="radio"
                                value={val}
                                className="w-3.5 h-3.5 text-rose-600 accent-rose-600"
                                {...register("familyValues", { required: "Family value is required" })}
                              />
                              <span>{val}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Family Type Radio Group */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center text-xs">
                        <Label className="md:col-span-3 text-slate-700 font-semibold">
                          Family Type <span className="text-rose-600">*</span>
                        </Label>
                        <div className="md:col-span-9 flex flex-wrap gap-4 text-xs">
                          {["Joint Family", "Nuclear Family", "Others"].map((val) => (
                            <label key={val} className="flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-slate-900">
                              <input
                                type="radio"
                                value={val}
                                className="w-3.5 h-3.5 text-rose-600 accent-rose-600"
                                {...register("familyType", { required: "Family type is required" })}
                              />
                              <span>{val}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Family Status Radio Group */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center text-xs">
                        <Label className="md:col-span-3 text-slate-700 font-semibold">
                          Family Status <span className="text-rose-600">*</span>
                        </Label>
                        <div className="md:col-span-9 flex flex-wrap gap-4 text-xs">
                          {["Middle Class", "Upper Middle Class", "High class", "Rich/Affluent"].map((val) => (
                            <label key={val} className="flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-slate-900">
                              <input
                                type="radio"
                                value={val}
                                className="w-3.5 h-3.5 text-rose-600 accent-rose-600"
                                {...register("familyStatus", { required: "Family status is required" })}
                              />
                              <span>{val}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Father's & Mother's Occupation */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="fatherOccupation" className="text-slate-700 font-medium text-xs">
                            Father&apos;s Occupation
                          </Label>
                          <select
                            id="fatherOccupation"
                            className="w-full h-9 px-3 border border-slate-300 bg-white rounded-lg text-slate-800 focus:border-rose-500 text-xs"
                            {...register("fatherOccupation")}
                          >
                            <option value="">- Select -</option>
                            <option value="Business">Business / Self-Employed</option>
                            <option value="Employed">Employed / Private Sector</option>
                            <option value="Govt Service">Government / Civil Services</option>
                            <option value="Professional">Doctor / Lawyer / Professional</option>
                            <option value="Retired">Retired</option>
                            <option value="Passed away">Passed away</option>
                            <option value="Not Employed">Not Employed</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="motherOccupation" className="text-slate-700 font-medium text-xs">
                            Mother&apos;s Occupation
                          </Label>
                          <select
                            id="motherOccupation"
                            className="w-full h-9 px-3 border border-slate-300 bg-white rounded-lg text-slate-800 focus:border-rose-500 text-xs"
                            {...register("motherOccupation")}
                          >
                            <option value="">- Select -</option>
                            <option value="Homemaker">Homemaker</option>
                            <option value="Employed">Employed / Private Sector</option>
                            <option value="Govt Service">Government / Civil Services</option>
                            <option value="Business">Business / Self-Employed</option>
                            <option value="Professional">Doctor / Teacher / Professional</option>
                            <option value="Retired">Retired</option>
                            <option value="Passed away">Passed away</option>
                          </select>
                        </div>
                      </div>

                      {/* Siblings Count Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                        <div className="space-y-1.5">
                          <Label className="text-slate-700 font-medium text-xs">No. of Brothers</Label>
                          <select
                            className="w-full h-9 px-2 border border-slate-300 bg-white rounded-lg text-slate-800 text-xs focus:border-rose-500"
                            {...register("brothersCount")}
                          >
                            <option value="0">- Select -</option>
                            <option value="0">None</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4+">4+</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-slate-700 font-medium text-xs">Brothers Married</Label>
                          <select
                            className="w-full h-9 px-2 border border-slate-300 bg-white rounded-lg text-slate-800 text-xs focus:border-rose-500"
                            {...register("brothersMarried")}
                          >
                            <option value="0">- Select -</option>
                            <option value="0">None</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4+">4+</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-slate-700 font-medium text-xs">No. of Sisters</Label>
                          <select
                            className="w-full h-9 px-2 border border-slate-300 bg-white rounded-lg text-slate-800 text-xs focus:border-rose-500"
                            {...register("sistersCount")}
                          >
                            <option value="0">- Select -</option>
                            <option value="0">None</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4+">4+</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-slate-700 font-medium text-xs">Sisters Married</Label>
                          <select
                            className="w-full h-9 px-2 border border-slate-300 bg-white rounded-lg text-slate-800 text-xs focus:border-rose-500"
                            {...register("sistersMarried")}
                          >
                            <option value="0">- Select -</option>
                            <option value="0">None</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4+">4+</option>
                          </select>
                        </div>
                      </div>

                      {/* Family Location */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center text-xs pt-2">
                        <Label className="md:col-span-3 text-slate-700 font-semibold">Family Location</Label>
                        <div className="md:col-span-9 flex flex-wrap gap-4 text-xs">
                          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                            <input
                              type="radio"
                              value="same"
                              className="w-3.5 h-3.5 text-rose-600 accent-rose-600"
                              {...register("familyLocationType")}
                            />
                            <span>Same as my Location</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                            <input
                              type="radio"
                              value="different"
                              className="w-3.5 h-3.5 text-rose-600 accent-rose-600"
                              {...register("familyLocationType")}
                            />
                            <span>Different Location</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* About My Family Section */}
                    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="text-sm font-bold text-slate-900">About My Family</h4>
                      </div>
                      <Textarea
                        id="aboutFamily"
                        placeholder="Write a few lines about your family origin, values, parents, and background..."
                        className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 rounded-xl text-xs leading-relaxed h-24"
                        {...register("aboutFamily")}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 7: About Me */}
                {currentStep === 7 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-slate-700 font-medium text-xs">About Me (Bio Description) <span className="text-rose-600">*</span></Label>
                      <Textarea
                        id="bio"
                        placeholder="Describe your personality, passions, career aspirations, interests, hobbies, and the kind of partner you are looking to build a life with..."
                        className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 rounded-xl text-xs leading-relaxed h-36"
                        {...register("bio", { required: "Bio must be at least 10 characters", minLength: { value: 10, message: "Bio must be at least 10 characters" } })}
                      />
                      {errors.bio && <p className="text-xs text-red-600">{errors.bio.message as string}</p>}
                      <p className="text-[11px] text-slate-500">
                        Tip: Profiles with comprehensive descriptions receive 4x more interest responses and faster match connections.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 8: Partner Preferences */}
                {currentStep === 8 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minAge" className="text-slate-700 font-medium text-xs">Min Partner Age</Label>
                        <Input
                          id="minAge"
                          type="number"
                          placeholder="21"
                          className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 rounded-xl text-sm"
                          {...register("minAge")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxAge" className="text-slate-700 font-medium text-xs">Max Partner Age</Label>
                        <Input
                          id="maxAge"
                          type="number"
                          placeholder="35"
                          className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 rounded-xl text-sm"
                          {...register("maxAge")}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minHeight" className="text-slate-700 font-medium text-xs">Min Height (cm)</Label>
                        <Input
                          id="minHeight"
                          type="number"
                          placeholder="150"
                          className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 rounded-xl text-sm"
                          {...register("minHeight")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxHeight" className="text-slate-700 font-medium text-xs">Max Height (cm)</Label>
                        <Input
                          id="maxHeight"
                          type="number"
                          placeholder="190"
                          className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 rounded-xl text-sm"
                          {...register("maxHeight")}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="partnerReligion" className="text-slate-700 font-medium text-xs">Preferred Religion</Label>
                        <select
                          id="partnerReligion"
                          className="w-full h-10 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:border-rose-500 text-sm"
                          {...register("partnerReligion")}
                        >
                          {PARTNER_RELIGION_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="partnerMotherTongue" className="text-slate-700 font-medium text-xs">Preferred Mother Tongue</Label>
                        <select
                          id="partnerMotherTongue"
                          className="w-full h-10 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:border-rose-500 text-sm"
                          {...register("partnerMotherTongue")}
                        >
                          {PARTNER_MOTHER_TONGUE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="partnerEducation" className="text-slate-700 font-medium text-xs">Preferred Education</Label>
                        <select
                          id="partnerEducation"
                          className="w-full h-10 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:border-rose-500 text-sm"
                          {...register("partnerEducation")}
                        >
                          {PARTNER_EDUCATION_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="partnerCountry" className="text-slate-700 font-medium text-xs">Preferred Country</Label>
                        <select
                          id="partnerCountry"
                          className="w-full h-10 px-3 border border-slate-300 bg-white rounded-xl text-slate-900 focus:border-rose-500 text-sm"
                          {...register("partnerCountry")}
                        >
                          {PARTNER_COUNTRY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 9: Photo Upload & Gallery */}
                {currentStep === 9 && (
                  <div className="space-y-6">
                    {photoError && (
                      <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{photoError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {photos.map((photo, idx) => (
                        <div
                          key={photo.id || idx}
                          className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-md"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.url}
                            alt="Profile Photo"
                            className="w-full h-full object-cover"
                          />
                          {photo.isMain && (
                            <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                              Primary
                            </span>
                          )}
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {!photo.isMain && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimary(photo.id)}
                                title="Set as Main Profile Picture"
                                className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(photo.id)}
                              title="Delete Photo"
                              className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {photos.length < 4 && (
                        <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-300 hover:border-rose-400 bg-slate-50/80 hover:bg-rose-50/20 flex flex-col items-center justify-center cursor-pointer p-4 text-center transition-colors">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handlePhotoUpload}
                            disabled={uploadingPhoto}
                            className="hidden"
                          />
                          {uploadingPhoto ? (
                            <Spinner className="w-6 h-6 text-rose-600" />
                          ) : (
                            <>
                              <Camera className="w-8 h-8 text-rose-500 mb-2" />
                              <span className="text-xs font-semibold text-slate-700">Add Photo</span>
                              <span className="text-[10px] text-slate-500 mt-1">JPG, PNG, WEBP (Max 3MB)</span>
                            </>
                          )}
                        </label>
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-800">Privacy Notice:</p>
                      <p className="text-[11px]">
                        You can enable &ldquo;Blur Photos&rdquo; at any time in Settings. Photos are strictly moderated before public discovery.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 10: Complete Matrimonial Biodata Preview & Submission */}
                {currentStep === 10 && (
                  <div className="space-y-6">
                    <div className="text-center space-y-2 py-2">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center mx-auto text-white shadow-md shadow-rose-500/20">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Matrimonial Biodata Preview</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Review your complete matrimonial biodata before submission. You can click &ldquo;Edit&rdquo; on any section to adjust your details.
                      </p>
                    </div>

                    {/* Photo & Identity Banner */}
                    <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-rose-300 bg-slate-100 shrink-0">
                        {photos.length > 0 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={photos.find((p) => p.isMain)?.url || photos[0]?.url}
                            alt="Main Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 text-center sm:text-left flex-grow">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <h4 className="text-base font-bold text-slate-900">{watch("name") || "Your Name"}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Pending Submission
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {calculatedAge ? `${calculatedAge} Yrs` : ""}{watch("height") ? `, ${watch("height")} cm` : ""} • {watch("maritalStatus") || "Never Married"} • {watch("city") ? `${watch("city")}, ` : ""}{watch("state")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(9)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-rose-700 hover:bg-rose-50 border border-rose-200 shadow-sm shrink-0"
                      >
                        Edit Photos
                      </button>
                    </div>

                    {/* Section 1: Personal & Cultural */}
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="font-bold text-rose-600 text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5" /> 1. Personal & Cultural Details
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline font-semibold"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div><span className="text-slate-500">Gender:</span> <span className="text-slate-800 font-medium">{watch("gender") || "—"}</span></div>
                        <div><span className="text-slate-500">DOB:</span> <span className="text-slate-800 font-medium">{watch("dateOfBirth") || "—"}</span></div>
                        <div><span className="text-slate-500">Marital Status:</span> <span className="text-slate-800 font-medium">{watch("maritalStatus") || "—"}</span></div>
                        <div><span className="text-slate-500">Religion:</span> <span className="text-slate-800 font-medium">{watch("religion") || "—"}</span></div>
                        <div><span className="text-slate-500">Caste:</span> <span className="text-slate-800 font-medium">{watch("caste") || "—"}</span></div>
                        <div><span className="text-slate-500">Sub-caste:</span> <span className="text-slate-800 font-medium">{watch("subCaste") || "—"}</span></div>
                        <div><span className="text-slate-500">Gothram:</span> <span className="text-slate-800 font-medium">{watch("gothram") || "—"}</span></div>
                        <div><span className="text-slate-500">Mother Tongue:</span> <span className="text-slate-800 font-medium">{watch("motherTongue") || "—"}</span></div>
                        <div><span className="text-slate-500">Rashi / Horoscope:</span> <span className="text-slate-800 font-medium">{watch("horoscope") || "—"}</span></div>
                      </div>
                    </div>

                    {/* Section 2: Education, Career & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <span className="font-bold text-rose-600 text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" /> 2. Education & Career
                          </span>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(4)}
                            className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline font-semibold"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="space-y-2">
                          <p><span className="text-slate-500">Qualification:</span> <span className="text-slate-800 font-medium">{watch("education") || "—"}</span></p>
                          <p><span className="text-slate-500">Occupation:</span> <span className="text-slate-800 font-medium">{watch("occupation") || "—"}</span></p>
                          <p><span className="text-slate-500">Annual Income:</span> <span className="text-slate-800 font-medium">₹{watch("income") || "0"} Lakhs / Year</span></p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <span className="font-bold text-rose-600 text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> 3. Location & Residence
                          </span>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(5)}
                            className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline font-semibold"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="space-y-2">
                          <p><span className="text-slate-500">Country:</span> <span className="text-slate-800 font-medium">{watch("country") || "India"}</span></p>
                          <p><span className="text-slate-500">State & District:</span> <span className="text-slate-800 font-medium">{watch("state") || "—"} {watch("district") ? `(${watch("district")})` : ""}</span></p>
                          <p><span className="text-slate-500">City / Town:</span> <span className="text-slate-800 font-medium">{watch("city") || "—"}</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Family & Lifestyle */}
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="font-bold text-rose-600 text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" /> 4. Family & Lifestyle
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(6)}
                          className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline font-semibold"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div><span className="text-slate-500">Family Values:</span> <span className="text-slate-800 font-medium">{watch("familyValues") || "—"}</span></div>
                        <div><span className="text-slate-500">Family Type:</span> <span className="text-slate-800 font-medium">{watch("familyType") || "—"}</span></div>
                        <div><span className="text-slate-500">Family Status:</span> <span className="text-slate-800 font-medium">{watch("familyStatus") || "—"}</span></div>
                        <div><span className="text-slate-500">Diet Preference:</span> <span className="text-slate-800 font-medium">{watch("foodPreference") || "—"}</span></div>
                        <div><span className="text-slate-500">Father&apos;s Occ:</span> <span className="text-slate-800 font-medium">{watch("fatherOccupation") || "—"}</span></div>
                        <div><span className="text-slate-500">Mother&apos;s Occ:</span> <span className="text-slate-800 font-medium">{watch("motherOccupation") || "—"}</span></div>
                        <div><span className="text-slate-500">Brothers:</span> <span className="text-slate-800 font-medium">{watch("brothersCount") || "0"} ({watch("brothersMarried") || "0"} m)</span></div>
                        <div><span className="text-slate-500">Sisters:</span> <span className="text-slate-800 font-medium">{watch("sistersCount") || "0"} ({watch("sistersMarried") || "0"} m)</span></div>
                      </div>
                      {watch("aboutFamily") && (
                        <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">About My Family:</span>
                          {watch("aboutFamily")}
                        </p>
                      )}
                    </div>

                    {/* Section 4: About Me */}
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="font-bold text-rose-600 text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" /> 5. About Me & Expectations
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(7)}
                          className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline font-semibold"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200">
                        &ldquo;{watch("bio") || "No bio description provided."}&rdquo;
                      </p>
                    </div>

                    {/* Section 5: Partner Preferences */}
                    <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="font-bold text-rose-600 text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-pink-500" /> 6. Partner Preferences Criteria
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(8)}
                          className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline font-semibold"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div><span className="text-slate-500">Age:</span> <span className="text-slate-800 font-medium">{watch("minAge")} - {watch("maxAge")} Yrs</span></div>
                        <div><span className="text-slate-500">Height:</span> <span className="text-slate-800 font-medium">{watch("minHeight")} - {watch("maxHeight")} cm</span></div>
                        <div><span className="text-slate-500">Religion:</span> <span className="text-slate-800 font-medium">{watch("partnerReligion") || "Any"}</span></div>
                        <div><span className="text-slate-500">Mother Tongue:</span> <span className="text-slate-800 font-medium">{watch("partnerMotherTongue") || "Any"}</span></div>
                        <div><span className="text-slate-500">Education:</span> <span className="text-slate-800 font-medium">{watch("partnerEducation") || "Any"}</span></div>
                        <div><span className="text-slate-500">Country:</span> <span className="text-slate-800 font-medium">{watch("partnerCountry") || "Any"}</span></div>
                      </div>
                    </div>

                    {/* Moderation Workflow Information Banner */}
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-semibold text-rose-900">InstantMatrimony Moderation Policy:</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          By clicking &ldquo;Submit Profile for Review&rdquo;, your profile will be sent to the Admin Moderation Queue. Our team will verify the details and activate your account for matchmaking.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between border-t border-slate-100 pt-5 mt-2 bg-slate-50/50">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs flex items-center gap-1.5 rounded-xl"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                ) : (
                  <div />
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 rounded-xl px-5 h-10"
                >
                  {loading ? <Spinner className="w-4 h-4 mr-1" /> : null}
                  {currentStep === 10 ? "Submit Profile for Review" : "Continue"}
                  {currentStep < 10 && <ChevronRight className="w-4 h-4" />}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
