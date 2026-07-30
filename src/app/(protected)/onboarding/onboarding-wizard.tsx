"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { saveStepAction } from "@/lib/actions/onboarding.actions";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function OnboardingWizard({ initialProfile }: { initialProfile: any }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(2); // Start at Step 2 since step 1 accounts is already completed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialProfile?.user?.name || "",
      phone: initialProfile?.user?.phone || "",
      gender: initialProfile?.gender || "",
      dateOfBirth: initialProfile?.dateOfBirth ? new Date(initialProfile.dateOfBirth).toISOString().split("T")[0] : "",
      height: initialProfile?.height || "",
      maritalStatus: initialProfile?.maritalStatus || "",
      religion: initialProfile?.religion || "",
      caste: initialProfile?.caste || "",
      motherTongue: initialProfile?.motherTongue || "",
      education: initialProfile?.education || "",
      occupation: initialProfile?.occupation || "",
      income: initialProfile?.income || "",
      city: initialProfile?.city || "",
      state: initialProfile?.state || "",
      country: initialProfile?.country || "",
      bio: initialProfile?.bio || "",
      minAge: initialProfile?.partnerPreference?.minAge || "",
      maxAge: initialProfile?.partnerPreference?.maxAge || "",
      minHeight: initialProfile?.partnerPreference?.minHeight || "",
      maxHeight: initialProfile?.partnerPreference?.maxHeight || "",
      partnerMaritalStatus: initialProfile?.partnerPreference?.maritalStatus || "",
      partnerReligion: initialProfile?.partnerPreference?.religion || "",
      partnerMotherTongue: initialProfile?.partnerPreference?.motherTongue || "",
      partnerEducation: initialProfile?.partnerPreference?.education || "",
      partnerCountry: initialProfile?.partnerPreference?.country || "",
      submitForReview: false,
    },
  });

  const nextStep = async (stepData: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await saveStepAction(currentStep, stepData);
      if (!res.success) {
        setError(res.error || "Failed to save step");
      } else {
        if (currentStep < 8) {
          setCurrentStep(currentStep + 1);
        } else {
          // Submit for review
          const submitRes = await saveStepAction(8, { submitForReview: true });
          if (submitRes.success) {
            router.push("/dashboard");
            router.refresh();
          } else {
            setError(submitRes.error || "Failed to submit profile");
          }
        }
      }
    } catch (e: any) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Form submit handles current step validation and auto-save
  const onSubmit = (data: any) => {
    // Collect step specific data
    let stepData: any = {};
    if (currentStep === 2) {
      stepData = {
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        height: Number(data.height),
        maritalStatus: data.maritalStatus,
      };
    } else if (currentStep === 3) {
      stepData = { religion: data.religion, caste: data.caste, motherTongue: data.motherTongue };
    } else if (currentStep === 4) {
      stepData = { education: data.education, occupation: data.occupation, income: Number(data.income) };
    } else if (currentStep === 5) {
      stepData = { city: data.city, state: data.state, country: data.country };
    } else if (currentStep === 6) {
      stepData = { bio: data.bio };
    } else if (currentStep === 7) {
      // Preferences mapping (Save to preferences occurs inside ProfileService)
      stepData = {
        minAge: Number(data.minAge) || undefined,
        maxAge: Number(data.maxAge) || undefined,
        minHeight: Number(data.minHeight) || undefined,
        maxHeight: Number(data.maxHeight) || undefined,
        maritalStatus: data.partnerMaritalStatus,
        religion: data.partnerReligion,
        motherTongue: data.partnerMotherTongue,
        education: data.partnerEducation,
        country: data.partnerCountry,
      };
      // We pass the preferences update as partner preference changes
      nextStep(stepData);
      return;
    } else if (currentStep === 8) {
      stepData = { submitForReview: true };
    }

    nextStep(stepData);
  };

  const progressPercent = ((currentStep - 1) / 7) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-16 flex-grow flex flex-col justify-center">
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center text-sm text-slate-400">
          <span>Step {currentStep} of 8</span>
          <span>{Math.round(progressPercent)}% Complete</span>
        </div>
        <Progress value={progressPercent} className="h-2 bg-slate-800" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
              <CardHeader>
                {currentStep === 2 && (
                  <>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">Basic Demographics</CardTitle>
                    <CardDescription>Tell us about yourself to establish matching eligibility</CardDescription>
                  </>
                )}
                {currentStep === 3 && (
                  <>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">Cultural Background</CardTitle>
                    <CardDescription>Specify religion, mother tongue, and family details</CardDescription>
                  </>
                )}
                {currentStep === 4 && (
                  <>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">Education & Career</CardTitle>
                    <CardDescription>Add qualifications and professional stats</CardDescription>
                  </>
                )}
                {currentStep === 5 && (
                  <>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">Location Details</CardTitle>
                    <CardDescription>Where are you currently residing?</CardDescription>
                  </>
                )}
                {currentStep === 6 && (
                  <>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">About Me</CardTitle>
                    <CardDescription>Write a brief summary detailing who you are and what you seek</CardDescription>
                  </>
                )}
                {currentStep === 7 && (
                  <>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">Partner Preferences</CardTitle>
                    <CardDescription>Outline the values you desire in an ideal match</CardDescription>
                  </>
                )}
                {currentStep === 8 && (
                  <>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">Photos & Submission</CardTitle>
                    <CardDescription>Confirm your photos and submit for moderator review</CardDescription>
                  </>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Step 2 Inputs */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        className="w-full h-10 px-3 border border-slate-800 bg-slate-950/50 rounded-md text-white focus:border-rose-500 focus:ring-rose-500"
                        {...register("gender")}
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                      {errors.gender && <p className="text-xs text-red-400">{errors.gender.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        className="border-slate-800 bg-slate-950/50 text-white"
                        {...register("dateOfBirth")}
                      />
                      {errors.dateOfBirth && <p className="text-xs text-red-400">{errors.dateOfBirth.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="height">Height (in cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="e.g. 175"
                        className="border-slate-800 bg-slate-950/50 text-white"
                        {...register("height")}
                      />
                      {errors.height && <p className="text-xs text-red-400">{errors.height.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus">Marital Status</Label>
                      <select
                        id="maritalStatus"
                        className="w-full h-10 px-3 border border-slate-800 bg-slate-950/50 rounded-md text-white focus:border-rose-500"
                        {...register("maritalStatus")}
                      >
                        <option value="">Select Marital Status</option>
                        <option value="Never Married">Never Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Awaiting Divorce">Awaiting Divorce</option>
                      </select>
                      {errors.maritalStatus && <p className="text-xs text-red-400">{errors.maritalStatus.message as string}</p>}
                    </div>
                  </div>
                )}

                {/* Step 3 Inputs */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="religion">Religion</Label>
                      <select
                        id="religion"
                        className="w-full h-10 px-3 border border-slate-800 bg-slate-950/50 rounded-md text-white focus:border-rose-500"
                        {...register("religion")}
                      >
                        <option value="">Select Religion</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Muslim">Muslim</option>
                        <option value="Christian">Christian</option>
                        <option value="Sikh">Sikh</option>
                        <option value="Buddhist">Buddhist</option>
                        <option value="Jain">Jain</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.religion && <p className="text-xs text-red-400">{errors.religion.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="caste">Caste / Sub-Caste (Optional)</Label>
                      <Input
                        id="caste"
                        type="text"
                        placeholder="e.g. Brahmin, Patel, etc."
                        className="border-slate-800 bg-slate-950/50 text-white"
                        {...register("caste")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="motherTongue">Mother Tongue</Label>
                      <Input
                        id="motherTongue"
                        type="text"
                        placeholder="e.g. Hindi, Telugu, Marathi"
                        className="border-slate-800 bg-slate-950/50 text-white"
                        {...register("motherTongue")}
                      />
                      {errors.motherTongue && <p className="text-xs text-red-400">{errors.motherTongue.message as string}</p>}
                    </div>
                  </div>
                )}

                {/* Step 4 Inputs */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="education">Highest Education</Label>
                      <Input
                        id="education"
                        type="text"
                        placeholder="e.g. B.Tech Computer Science, MBA"
                        className="border-slate-800 bg-slate-950/50 text-white"
                        {...register("education")}
                      />
                      {errors.education && <p className="text-xs text-red-400">{errors.education.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        type="text"
                        placeholder="e.g. Software Engineer, Financial Analyst"
                        className="border-slate-800 bg-slate-950/50 text-white"
                        {...register("occupation")}
                      />
                      {errors.occupation && <p className="text-xs text-red-400">{errors.occupation.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="income">Annual Income (in Lakhs INR)</Label>
                      <Input
                        id="income"
                        type="number"
                        placeholder="e.g. 12"
                        className="border-slate-800 bg-slate-950/50 text-white"
                        {...register("income")}
                      />
                      {errors.income && <p className="text-xs text-red-400">{errors.income.message as string}</p>}
                    </div>
                  </div>
                )}

                {/* Step 5 Inputs */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="e.g. Mumbai"
                        className="border-slate-800 bg-slate-950/50 text-white"
                        {...register("city")}
                      />
                      {errors.city && <p className="text-xs text-red-400">{errors.city.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        type="text"
                        placeholder="e.g. Maharashtra"
                        className="border-slate-800 bg-slate-950/50 text-white"
                        {...register("state")}
                      />
                      {errors.state && <p className="text-xs text-red-400">{errors.state.message as string}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        type="text"
                        placeholder="e.g. India"
                        className="border-slate-800 bg-slate-950/50 text-white"
                        {...register("country")}
                      />
                      {errors.country && <p className="text-xs text-red-400">{errors.country.message as string}</p>}
                    </div>
                  </div>
                )}

                {/* Step 6 Inputs */}
                {currentStep === 6 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bio">About Me</Label>
                      <Textarea
                        id="bio"
                        placeholder="Describe your personality, hobbies, family background, and what qualities you seek in your future life partner."
                        className="border-slate-800 bg-slate-950/50 text-white h-32 focus:border-rose-500"
                        {...register("bio")}
                      />
                      {errors.bio && <p className="text-xs text-red-400">{errors.bio.message as string}</p>}
                    </div>
                  </div>
                )}

                {/* Step 7 Inputs */}
                {currentStep === 7 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minAge">Min Partner Age</Label>
                        <Input
                          id="minAge"
                          type="number"
                          placeholder="18"
                          className="border-slate-800 bg-slate-950/50 text-white"
                          {...register("minAge")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxAge">Max Partner Age</Label>
                        <Input
                          id="maxAge"
                          type="number"
                          placeholder="35"
                          className="border-slate-800 bg-slate-950/50 text-white"
                          {...register("maxAge")}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minHeight">Min Partner Height (cm)</Label>
                        <Input
                          id="minHeight"
                          type="number"
                          placeholder="150"
                          className="border-slate-800 bg-slate-950/50 text-white"
                          {...register("minHeight")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxHeight">Max Partner Height (cm)</Label>
                        <Input
                          id="maxHeight"
                          type="number"
                          placeholder="190"
                          className="border-slate-800 bg-slate-950/50 text-white"
                          {...register("maxHeight")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="partnerReligion">Preferred Religion</Label>
                      <Input
                        id="partnerReligion"
                        type="text"
                        placeholder="e.g. Hindu, Muslim, Any"
                        className="border-slate-800 bg-slate-950/50 text-white"
                        {...register("partnerReligion")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="partnerMotherTongue">Preferred Mother Tongue</Label>
                      <Input
                        id="partnerMotherTongue"
                        type="text"
                        placeholder="e.g. Hindi, Any"
                        className="border-slate-800 bg-slate-950/50 text-white"
                        {...register("partnerMotherTongue")}
                      />
                    </div>
                  </div>
                )}

                {/* Step 8 Inputs */}
                {currentStep === 8 && (
                  <div className="space-y-6 text-center py-6">
                    <div className="flex justify-center">
                      <CheckCircle2 className="w-16 h-16 text-rose-500 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Your Profile is Ready for Submission</h3>
                      <p className="text-sm text-slate-400 max-w-sm mx-auto">
                        Once submitted, our moderation team will verify your details within 24 hours. You can proceed to check out matches and pricing plans while waiting.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t border-slate-800 pt-6 mt-4">
                {currentStep > 2 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    Back
                  </Button>
                ) : (
                  <div />
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-rose-600/30"
                >
                  {loading ? <Spinner className="w-5 h-5 mr-2" /> : null}
                  {currentStep === 8 ? "Submit Profile" : "Continue"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
