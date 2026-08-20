"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  MessageSquare,
  MapPin,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Lock,
  CheckCircle,
  Phone,
  Mail,
  Unlock,
  Shield,
  Briefcase,
  Users,
  Compass,
  FileText,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getAiMatchExplanationAction } from "@/lib/actions/profile.actions";
import {
  sendInterestAction,
  acceptInterestAction,
  declineInterestAction,
} from "@/lib/actions/interest.actions";
import { sendMessageAction } from "@/lib/actions/chat.actions";
import { unlockContactAction } from "@/lib/actions/contact-unlock.actions";
import { getDisplayProfileId } from "@/lib/utils/public-id";

export function ProfileDetailClient({
  profile,
  initialSentInterest,
  initialReceivedInterest,
  conversationId,
  isUnlocked = false,
  isAdmin = false,
}: {
  profile: any;
  initialSentInterest: any;
  initialReceivedInterest: any;
  conversationId: string | null;
  isUnlocked?: boolean;
  isAdmin?: boolean;
}) {
  const router = useRouter();

  // Slide photo index
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const photos = profile.photos || [];

  // Connection & Interest Statuses
  const [sentInterest, setSentInterest] = useState(initialSentInterest);
  const [receivedInterest, setReceivedInterest] = useState(initialReceivedInterest);
  const [interestLoading, setInterestLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Unlock state
  const [unlockedState, setUnlockedState] = useState<boolean>(isUnlocked);
  const [unlockLoading, setUnlockLoading] = useState(false);

  const handleUnlockContact = async () => {
    setUnlockLoading(true);
    try {
      const res = await unlockContactAction(profile.userId);
      if (res.success) {
        setUnlockedState(true);
        router.refresh();
      } else {
        alert(
          res.error ||
            "Could not unlock contact. Active membership and verified profile status required."
        );
      }
    } catch {
      alert("Failed to process contact unlock.");
    } finally {
      setUnlockLoading(false);
    }
  };

  // Chat message initiation dialog state
  const [chatMessage, setChatMessage] = useState(
    "Hello! I reviewed your profile and felt we share excellent matrimonial compatibility. I would love to connect!"
  );
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  // AI match score states
  const [compatibility, setCompatibility] = useState<any>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [loadingAi, setLoadingAi] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);

  // Fetch AI Matchmaker compatibility on load
  useEffect(() => {
    async function fetchAiInsights() {
      setLoadingAi(true);
      setAiError(null);
      try {
        const res = await getAiMatchExplanationAction(profile.userId);
        if (res.success) {
          setCompatibility(res.compatibility);
          setAiExplanation(res.explanation || null);
          setIsPremium(res.isPremium ?? false);
        } else {
          setAiError(res.error || "Failed to load AI compatibility metadata");
        }
      } catch {
        setAiError("Could not retrieve AI Matchmaker scores.");
      } finally {
        setLoadingAi(false);
      }
    }
    fetchAiInsights();
  }, [profile.userId]);

  const handleSendInterest = () => {
    if (interestLoading || isPending) return;
    setInterestLoading(true);
    startTransition(async () => {
      try {
        const res = await sendInterestAction(profile.userId);
        if (res.success) {
          setSentInterest(res.interest);
          router.refresh();
        }
      } catch {
        // ignore
      } finally {
        setInterestLoading(false);
      }
    });
  };

  const handleAcceptInterest = () => {
    if (!receivedInterest || interestLoading || isPending) return;
    setInterestLoading(true);
    startTransition(async () => {
      try {
        const res = await acceptInterestAction(receivedInterest.id);
        if (res.success) {
          setReceivedInterest((prev: any) => ({ ...prev, status: "ACCEPTED" }));
          router.refresh();
        }
      } catch {
        // ignore
      } finally {
        setInterestLoading(false);
      }
    });
  };

  const handleDeclineInterest = () => {
    if (!receivedInterest || interestLoading || isPending) return;
    setInterestLoading(true);
    startTransition(async () => {
      try {
        const res = await declineInterestAction(receivedInterest.id);
        if (res.success) {
          setReceivedInterest((prev: any) => ({ ...prev, status: "DECLINED" }));
          router.refresh();
        }
      } catch {
        // ignore
      } finally {
        setInterestLoading(false);
      }
    });
  };

  const handleInitiateChat = async () => {
    if (!chatMessage.trim()) return;
    setIsSendingMessage(true);
    try {
      const res = await sendMessageAction(profile.userId || profile.id, chatMessage);
      if (res.success) {
        setShowChatModal(false);
        router.push(`/messages/${profile.userId || profile.id}`);
      } else {
        alert(res.error || "Could not send message. You must have a mutual connection and active membership.");
      }
    } catch {
      alert("An unexpected error occurred while sending the message.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Age helper
  const age = profile.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(profile.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : "N/A";

  const isMutual =
    (sentInterest?.status === "ACCEPTED") ||
    (receivedInterest?.status === "ACCEPTED");

  const shouldBlur =
    profile.privacy?.blurPhotos && !isUnlocked && !isAdmin && !isMutual;

  const hideIncome = profile.privacy?.hideIncome && !isUnlocked && !isAdmin;
  const hideFamily = profile.privacy?.hideFamilyDetails && !isUnlocked && !isAdmin;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 text-slate-900">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer font-medium"
      >
        <ChevronLeft className="w-4 h-4" /> Back to matches
      </button>

      {/* Main split profile card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Photos & Primary Action buttons */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden relative shadow-sm aspect-[3/4]">
            {photos.length > 0 ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photos[activePhotoIndex]?.url}
                  alt={`Profile picture of ${profile.user?.name || "Member"}`}
                  className={`h-full w-full object-cover transition-all ${
                    shouldBlur ? "blur-xl scale-110" : ""
                  }`}
                />
                {shouldBlur && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 text-center">
                    <div className="p-4 bg-white/95 rounded-xl border border-slate-200 text-slate-800 flex flex-col items-center gap-2 max-w-xs shadow-2xl">
                      <Lock className="w-8 h-8 text-rose-600" />
                      <h4 className="font-bold text-sm text-slate-900">Photos Blurred by Member</h4>
                      <p className="text-xs text-slate-500">
                        This member has set their photos to private. Photos unlock automatically after interest acceptance or contact unlock.
                      </p>
                    </div>
                  </div>
                )}
                {photos.length > 1 && !shouldBlur && (
                  <>
                    <button
                      onClick={() =>
                        setActivePhotoIndex((prev) =>
                          prev > 0 ? prev - 1 : photos.length - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center hover:bg-white text-slate-800 shadow-md transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setActivePhotoIndex((prev) =>
                          prev < photos.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center hover:bg-white text-slate-800 shadow-md transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    {/* Index Indicator dot grid */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                      {photos.map((_: any, idx: number) => (
                        <div
                          key={idx}
                          className={`h-1.5 rounded-full transition-all ${
                            idx === activePhotoIndex ? "bg-rose-600 w-3" : "bg-slate-300 w-1.5"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="h-full w-full bg-slate-100 flex items-center justify-center flex-col text-slate-400 gap-2">
                <Lock className="w-12 h-12" />
                <span className="text-xs font-medium">No photos uploaded</span>
              </div>
            )}
          </div>

          {/* Profile ID directly below photo */}
          <div className="flex items-center justify-center -mt-2">
            <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 shadow-xs">
              Profile ID: {getDisplayProfileId(profile.user, profile.userId || profile.id)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {/* Interest state machine buttons */}
            {receivedInterest && receivedInterest.status === "PENDING" ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleAcceptInterest}
                  disabled={interestLoading}
                  className="flex-grow bg-emerald-600 hover:bg-emerald-700 font-semibold text-xs text-white shadow-sm"
                >
                  Accept Interest
                </Button>
                <Button
                  onClick={handleDeclineInterest}
                  disabled={interestLoading}
                  variant="outline"
                  className="flex-grow border-red-200 text-red-700 hover:bg-red-50 text-xs"
                >
                  Decline
                </Button>
              </div>
            ) : receivedInterest && receivedInterest.status === "ACCEPTED" ? (
              <Button disabled className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                Mutual Connection Accepted
              </Button>
            ) : sentInterest ? (
              <Button disabled className="w-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                <Heart className="w-4 h-4 mr-2 fill-rose-600" />
                Interest Sent ({sentInterest.status})
              </Button>
            ) : (
              <Button
                onClick={handleSendInterest}
                disabled={interestLoading}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-semibold py-5 text-xs rounded-xl shadow-md shadow-rose-500/20"
              >
                <Heart className="w-4 h-4 mr-2" />
                {interestLoading ? "Sending request..." : "Send Interest"}
              </Button>
            )}

            {/* Chat button */}
            <Button
              onClick={() => {
                if (conversationId) {
                  router.push(`/messages/${profile.userId || profile.id}`);
                } else {
                  setShowChatModal(true);
                }
              }}
              variant="outline"
              className="w-full border-slate-200 hover:bg-slate-50 hover:text-slate-900 text-slate-700 py-5 text-xs rounded-xl gap-2 font-medium bg-white shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-rose-600" />
              {conversationId ? "Go to Chat" : "Direct Message"}
            </Button>

            {/* Contact Unlock Card */}
            <Card className="border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-rose-600" /> Verified Contact Information
              </h4>
              {unlockedState ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-xs text-emerald-900">
                  <div className="flex items-center gap-2 font-mono font-bold text-emerald-800">
                    <Phone className="w-3.5 h-3.5" /> {profile.user?.phone || "Not Provided"}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 font-mono text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {profile.user?.email}
                  </div>
                  <span className="inline-block text-[10px] text-emerald-700 font-semibold pt-1">
                    ✓ Contact permanently unlocked
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-500">
                    Unlock contact details using your monthly membership quota.
                  </p>
                  <Button
                    onClick={handleUnlockContact}
                    disabled={unlockLoading}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold shadow-xs"
                  >
                    {unlockLoading ? (
                      <Spinner className="w-4 h-4 mr-1" />
                    ) : (
                      <Unlock className="w-4 h-4 mr-1 text-rose-600" />
                    )}{" "}
                    Unlock Contact Details
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Right Column: Bio details, AI Matchmaker insights, and full attributes */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main header block */}
          <div className="flex justify-between items-start gap-4 border-b border-slate-200 pb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                {profile.user?.name || "Matrimony Member"}
                {profile.status === "APPROVED" && (
                  <CheckCircle
                    className="w-5 h-5 text-emerald-600 fill-emerald-100 shrink-0"
                    aria-label="Verified Member"
                  />
                )}
              </h2>
              <p className="text-slate-500 text-xs mt-1 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {profile.city ? `${profile.city}, ${profile.district ? `${profile.district}, ` : ""}${profile.state || ""}, ${profile.country || "India"}` : "Location not specified"}
              </p>
            </div>

            {/* Compatibility Badge */}
            {loadingAi ? (
              <div className="h-14 w-14 rounded-full border-2 border-slate-200 border-t-rose-600 animate-spin" />
            ) : compatibility ? (
              <div className="flex items-center gap-2.5">
                <div className="relative h-14 w-14 flex items-center justify-center rounded-full bg-rose-50 border border-rose-200 shadow-xs">
                  <span className="text-sm font-extrabold text-rose-700">
                    {compatibility.score}%
                  </span>
                  <div className="absolute inset-0 rounded-full border-2 border-rose-300/40" />
                  <div className="absolute inset-0 rounded-full border-2 border-rose-600 border-t-transparent border-r-transparent animate-pulse" />
                </div>
                <div className="text-[11px] font-semibold text-slate-600">
                  <span>Match Affinity</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* AI Matchmaker explanation insight panel */}
          <Card className="border border-rose-200 bg-rose-50/40 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-3 text-rose-500/10 pointer-events-none">
              <Sparkles className="w-20 h-20" />
            </div>
            <CardContent className="p-5 space-y-2.5">
              <h3 className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                AI Matchmaker Compatibility Analysis
              </h3>

              {loadingAi ? (
                <p className="text-slate-500 text-xs animate-pulse">
                  Analyzing cultural affinity, horoscope criteria, and lifestyle match...
                </p>
              ) : aiError ? (
                <div className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{aiError}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    {aiExplanation}
                  </p>

                  {!isPremium && (
                    <div className="pt-1">
                      <Button
                        size="sm"
                        onClick={() => router.push("/dashboard/billing")}
                        className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-xs font-bold px-3 py-1 h-auto rounded-lg text-white shadow-xs"
                      >
                        Upgrade to View Deep Insights
                      </Button>
                    </div>
                  )}

                  {compatibility?.matchedFields?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {compatibility.matchedFields.map((field: string) => (
                        <span
                          key={field}
                          className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-medium"
                        >
                          ✓ Match: {field}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* About Bio */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600">About Me</h3>
            <p className="text-slate-700 text-xs leading-relaxed italic p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              &ldquo;{profile.bio || "This user has not written a biographical overview yet."}&rdquo;
            </p>
          </div>

          {/* Matrimonial Biodata Detailed Attributes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* 1. Basic & Personal Details */}
            <div className="space-y-3 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <h4 className="font-bold text-slate-900 border-l-2 border-rose-600 pl-2">
                Basic & Personal Details
              </h4>
              <ul className="space-y-2">
                <li className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Gender:</span>
                  <span className="text-slate-800 font-medium">{profile.gender === "FEMALE" ? "Bride (Female)" : "Groom (Male)"}</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Age:</span>
                  <span className="text-slate-800 font-medium">{age} yrs</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Height:</span>
                  <span className="text-slate-800 font-medium">{profile.height ? `${profile.height} cm` : "Not specified"}</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Weight:</span>
                  <span className="text-slate-800 font-medium">{profile.weight ? `${profile.weight} kg` : "Not specified"}</span>
                </li>
                <li className="flex justify-between pb-1">
                  <span className="text-slate-500">Marital Status:</span>
                  <span className="text-slate-800 font-medium">{profile.maritalStatus || "Never Married"}</span>
                </li>
              </ul>
            </div>

            {/* 2. Cultural & Horoscope Background */}
            <div className="space-y-3 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <h4 className="font-bold text-slate-900 border-l-2 border-rose-600 pl-2">
                Religion, Caste & Horoscope
              </h4>
              <ul className="space-y-2">
                <li className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Religion:</span>
                  <span className="text-slate-800 font-medium">{profile.religion || "Not specified"}</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Caste:</span>
                  <span className="text-slate-800 font-medium">{profile.caste || "Open / All"}</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Sub-Caste:</span>
                  <span className="text-slate-800 font-medium">{profile.subCaste || "N/A"}</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Gothram:</span>
                  <span className="text-slate-800 font-medium">{profile.gothram || "Not specified"}</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Mother Tongue:</span>
                  <span className="text-slate-800 font-medium">{profile.motherTongue || "Telugu"}</span>
                </li>
                <li className="flex justify-between pb-1">
                  <span className="text-slate-500">Horoscope / Rashi:</span>
                  <span className="text-slate-800 font-medium">{profile.horoscope || "Not specified"}</span>
                </li>
              </ul>
            </div>

            {/* 3. Education & Profession */}
            <div className="space-y-3 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <h4 className="font-bold text-slate-900 border-l-2 border-rose-600 pl-2">
                Education & Career
              </h4>
              <ul className="space-y-2">
                <li className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Highest Education:</span>
                  <span className="text-slate-800 font-medium">{profile.education || "Not specified"}</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Occupation:</span>
                  <span className="text-slate-800 font-medium">{profile.occupation || "Not specified"}</span>
                </li>
                <li className="flex justify-between pb-1">
                  <span className="text-slate-500">Annual Income:</span>
                  {hideIncome ? (
                    <span className="text-slate-400 italic">Confidential</span>
                  ) : (
                    <span className="text-rose-600 font-bold">
                      {profile.income ? `₹${profile.income} Lakhs / Year` : "Not disclosed"}
                    </span>
                  )}
                </li>
              </ul>
            </div>

            {/* 4. Family & Lifestyle */}
            <div className="space-y-3 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <h4 className="font-bold text-slate-900 border-l-2 border-rose-600 pl-2">
                Family & Lifestyle Habits
              </h4>
              <ul className="space-y-2">
                <li className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Family Values:</span>
                  <span className="text-slate-800 font-medium">{profile.familyValues || "Moderate"}</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Dietary Habits:</span>
                  <span className="text-slate-800 font-medium">{profile.foodPreference || "Vegetarian"}</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Smoking:</span>
                  <span className="text-slate-800 font-medium">{profile.smoking === "NO" ? "Non-smoker" : profile.smoking || "No"}</span>
                </li>
                <li className="flex justify-between pb-1">
                  <span className="text-slate-500">Drinking:</span>
                  <span className="text-slate-800 font-medium">{profile.drinking === "NO" ? "Teetotaler" : profile.drinking || "No"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Family Details Background (if provided and not hidden) */}
          {profile.familyDetails && !hideFamily && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600">
                Family Background & Native Heritage
              </h3>
              <p className="text-slate-700 text-xs leading-relaxed p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                {profile.familyDetails}
              </p>
            </div>
          )}

          {/* Partner Match Preferences Summary Card */}
          {profile.partnerPreference && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600">
                Ideal Partner Criteria Desired by Member
              </h3>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Desired Age:</span>
                  <span className="text-slate-800 font-medium">
                    {profile.partnerPreference.minAge || 18} - {profile.partnerPreference.maxAge || 40} yrs
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Desired Height:</span>
                  <span className="text-slate-800 font-medium">
                    {profile.partnerPreference.minHeight || 140} - {profile.partnerPreference.maxHeight || 220} cm
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Marital Status:</span>
                  <span className="text-slate-800 font-medium">
                    {profile.partnerPreference.maritalStatus || "Never Married"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Religion:</span>
                  <span className="text-slate-800 font-medium">
                    {profile.partnerPreference.religion || "Any"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat message modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Send Personalized Message</h3>
            <p className="text-slate-500 text-xs">
              Direct communication is unlocked with active membership. Introduce yourself to start the conversation:
            </p>
            <textarea
              className="w-full h-24 p-3 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-900 resize-none focus:bg-white focus:outline-none focus:border-rose-500"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => setShowChatModal(false)}
                className="text-xs hover:bg-slate-100 text-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInitiateChat}
                disabled={isSendingMessage}
                className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-xs font-semibold px-4 text-white shadow-md shadow-rose-500/20"
              >
                {isSendingMessage ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
