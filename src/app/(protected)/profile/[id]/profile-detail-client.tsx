"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageSquare, MapPin, Sparkles, AlertCircle, ChevronLeft, ChevronRight, Lock, CheckCircle, Phone, Mail, Unlock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getAiMatchExplanationAction } from "@/lib/actions/profile.actions";
import { sendInterestAction, acceptInterestAction, declineInterestAction } from "@/lib/actions/interest.actions";
import { sendMessageAction } from "@/lib/actions/chat.actions";
import { unlockContactAction } from "@/lib/actions/contact-unlock.actions";

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
        alert(res.error || "Could not unlock contact. Active membership and accepted interest are required.");
      }
    } catch {
      alert("Failed to process contact unlock.");
    } finally {
      setUnlockLoading(false);
    }
  };

  // Chat message initiation dialog state
  const [chatMessage, setChatMessage] = useState("Hello! I reviewed your profile and felt we share excellent compatibility. I would love to connect!");
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

  const handleSendInterest = async () => {
    setInterestLoading(true);
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
  };

  const handleAcceptInterest = async () => {
    if (!receivedInterest) return;
    setInterestLoading(true);
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
  };

  const handleDeclineInterest = async () => {
    if (!receivedInterest) return;
    setInterestLoading(true);
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
  };

  const handleInitiateChat = async () => {
    if (!chatMessage.trim()) return;
    setIsSendingMessage(true);
    try {
      const res = await sendMessageAction(profile.userId, chatMessage);
      if (res.success) {
        setShowChatModal(false);
        router.push("/messages");
      }
    } catch {
      // ignore
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Age helper
  const age = profile.dateOfBirth
    ? new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()
    : "N/A";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      
      {/* Back Button */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to matches
      </button>

      {/* Main split profile card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Photos & Primary Action buttons */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden relative shadow-xl aspect-[3/4]">
            {(() => {
              const shouldBlur = profile.privacy?.blurPhotos && !isUnlocked && !isAdmin;
              return photos.length > 0 ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photos[activePhotoIndex]?.url}
                    alt={`Profile picture of ${profile.user?.name}`}
                    className={`h-full w-full object-cover transition-all ${shouldBlur ? "blur-xl scale-110" : ""}`}
                  />
                  {shouldBlur && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6 text-center">
                      <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-slate-200 flex flex-col items-center gap-2 max-w-xs shadow-2xl">
                        <Lock className="w-8 h-8 text-rose-500" />
                        <h4 className="font-bold text-sm">Photos Blurred by Member</h4>
                        <p className="text-xs text-slate-400">
                          This member has set their photos to private. Photos become permanently visible after an interest is accepted and contact unlocked.
                        </p>
                      </div>
                    </div>
                  )}
                  {photos.length > 1 && !shouldBlur && (
                    <>
                      <button
                        onClick={() => setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-slate-950/60 flex items-center justify-center hover:bg-slate-900 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => setActivePhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-slate-950/60 flex items-center justify-center hover:bg-slate-900 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                      {/* Index Indicator dot grid */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                        {photos.map((_: any, idx: number) => (
                          <div
                            key={idx}
                            className={`h-1.5 w-1.5 rounded-full transition-all ${idx === activePhotoIndex ? "bg-rose-500 w-3" : "bg-slate-400"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="h-full w-full bg-slate-900 flex items-center justify-center flex-col text-slate-500 gap-2">
                  <Lock className="w-12 h-12" />
                  <span className="text-xs">Photos restricted or empty</span>
                </div>
              );
            })()}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {/* Interest state machine buttons */}
            {receivedInterest && receivedInterest.status === "PENDING" ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleAcceptInterest}
                  disabled={interestLoading}
                  className="flex-grow bg-emerald-600 hover:bg-emerald-500 font-semibold"
                >
                  Accept Interest
                </Button>
                <Button
                  onClick={handleDeclineInterest}
                  disabled={interestLoading}
                  variant="outline"
                  className="flex-grow border-red-900/30 text-red-400 hover:bg-red-950/20"
                >
                  Decline
                </Button>
              </div>
            ) : receivedInterest && receivedInterest.status === "ACCEPTED" ? (
              <Button disabled className="w-full bg-slate-800 text-slate-500">
                Mutual Connection Approved
              </Button>
            ) : sentInterest ? (
              <Button disabled className="w-full bg-rose-950/20 border border-rose-900/30 text-rose-400">
                <Heart className="w-4 h-4 mr-2 fill-rose-400" />
                Interest Sent ({sentInterest.status})
              </Button>
            ) : (
              <Button
                onClick={handleSendInterest}
                disabled={interestLoading}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold py-6 text-sm rounded-xl shadow-lg shadow-rose-600/10"
              >
                <Heart className="w-5 h-5 mr-2" />
                {interestLoading ? "Sending request..." : "Connect Now"}
              </Button>
            )}

            {/* Chat button */}
            <Button
              onClick={() => {
                if (conversationId) {
                  router.push("/messages");
                } else {
                  setShowChatModal(true);
                }
              }}
              variant="outline"
              className="w-full border-slate-800 hover:bg-slate-900 hover:text-white text-slate-300 py-6 text-sm rounded-xl gap-2"
            >
              <MessageSquare className="w-5 h-5 text-rose-500" />
              {conversationId ? "Go to Chat" : "Send Premium Message"}
            </Button>

            {/* Contact Unlock Card */}
            <Card className="border border-slate-800 bg-slate-950/60 p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-rose-500" /> Verified Contact Information
              </h4>
              {unlockedState ? (
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl space-y-1.5 text-xs text-emerald-300">
                  <div className="flex items-center gap-2 font-mono font-bold">
                    <Phone className="w-3.5 h-3.5" /> {profile.user?.phone || "+91 98765 43210"}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> {profile.user?.email}
                  </div>
                  <span className="inline-block text-[10px] text-emerald-400 font-semibold pt-1">
                    ✓ Contact permanently unlocked
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-400">
                    Unlock to view direct phone number and family contact details.
                  </p>
                  <Button
                    onClick={handleUnlockContact}
                    disabled={unlockLoading}
                    className="w-full bg-slate-900 hover:bg-slate-850 text-rose-400 border border-rose-500/30 text-xs font-semibold"
                  >
                    {unlockLoading ? <Spinner className="w-4 h-4 mr-1" /> : <Unlock className="w-4 h-4 mr-1 text-rose-500" />} Unlock Contact
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Right Column: Bio details, AI Matchmaker insights, and full attributes */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main header block */}
          <div className="flex justify-between items-start gap-4 border-b border-slate-900 pb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
                {profile.user?.name || "Matrimony Member"}
                {profile.status === "APPROVED" && (
                  <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-400/10 shrink-0" aria-label="Verified Member" />
                )}
              </h2>
              <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-rose-500" /> {profile.city}, {profile.state}, {profile.country}
              </p>
            </div>

            {/* Compatibility Wheel */}
            {loadingAi ? (
              <div className="h-16 w-16 rounded-full border-2 border-slate-800 border-t-rose-500 animate-spin" />
            ) : compatibility ? (
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800">
                  <span className="text-base font-extrabold text-rose-400">{compatibility.score}%</span>
                  <div className="absolute inset-0 rounded-full border-2 border-rose-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-rose-500 border-t-transparent border-r-transparent animate-pulse" />
                </div>
                <span className="text-xs font-semibold text-slate-400">Match score</span>
              </div>
            ) : null}
          </div>

          {/* AI Matchmaker explanation insight panel */}
          <Card className="border border-rose-950/30 bg-rose-950/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-rose-500/10"><Sparkles className="w-20 h-20" /></div>
            <CardContent className="p-6 space-y-3">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                AI Matchmaker Insights
              </h3>

              {loadingAi ? (
                <p className="text-slate-400 text-xs animate-pulse">Calculating semantic match affinity and parsing preferences...</p>
              ) : aiError ? (
                <div className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{aiError}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed italic">{aiExplanation}</p>
                  
                  {/* Upgrade block if user is not premium */}
                  {!isPremium && (
                    <div className="pt-2">
                      <Button
                        size="sm"
                        onClick={() => router.push("/dashboard/billing")}
                        className="bg-rose-600 hover:bg-rose-500 text-xs font-bold px-4 py-1.5 h-auto rounded-lg"
                      >
                        Upgrade to Premium
                      </Button>
                    </div>
                  )}

                  {compatibility?.matchedFields?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {compatibility.matchedFields.map((field: string) => (
                        <span key={field} className="text-[10px] bg-green-950/40 text-green-400 border border-green-900/50 px-2 py-0.5 rounded-full">
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
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">About Me</h3>
            <p className="text-slate-300 leading-relaxed italic">
              &ldquo;{profile.bio || "This user has not written a biographical description yet."}&ldquo;
            </p>
          </div>

          <hr className="border-slate-900" />

          {/* Detailed Attributes Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            {/* Basic details */}
            <div className="space-y-4">
              <h4 className="font-bold text-rose-400/90 border-l-2 border-rose-500 pl-2">Basic & Personal Info</h4>
              <ul className="space-y-3 text-xs">
                <li className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">Gender</span>
                  <span className="text-slate-300 font-medium">{profile.gender}</span>
                </li>
                <li className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">Age</span>
                  <span className="text-slate-300 font-medium">{age} yrs</span>
                </li>
                <li className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">Height</span>
                  <span className="text-slate-300 font-medium">{profile.height} cm</span>
                </li>
                <li className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">Marital Status</span>
                  <span className="text-slate-300 font-medium">{profile.maritalStatus}</span>
                </li>
              </ul>
            </div>

            {/* Religious & Location info */}
            <div className="space-y-4">
              <h4 className="font-bold text-rose-400/90 border-l-2 border-rose-500 pl-2">Community & Origin</h4>
              <ul className="space-y-3 text-xs">
                <li className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">Religion</span>
                  <span className="text-slate-300 font-medium">{profile.religion}</span>
                </li>
                <li className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">Caste / Subcaste</span>
                  <span className="text-slate-300 font-medium">{profile.caste || "N/A"}</span>
                </li>
                <li className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">Mother Tongue</span>
                  <span className="text-slate-300 font-medium">{profile.motherTongue}</span>
                </li>
                <li className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">State / Country</span>
                  <span className="text-slate-300 font-medium">{profile.state}, {profile.country}</span>
                </li>
              </ul>
            </div>

            {/* Education & Profession */}
            <div className="space-y-4">
              <h4 className="font-bold text-rose-400/90 border-l-2 border-rose-500 pl-2">Education & Profession</h4>
              <ul className="space-y-3 text-xs">
                <li className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">Education</span>
                  <span className="text-slate-300 font-medium">{profile.education || "N/A"}</span>
                </li>
                <li className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">Occupation</span>
                  <span className="text-slate-300 font-medium">{profile.occupation || "N/A"}</span>
                </li>
                <li className="flex justify-between border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500">Annual Income</span>
                  <span className="text-slate-300 font-semibold text-rose-400">₹{profile.income} Lakhs / Year</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

      </div>

      {/* Chat message dialog box modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold">Initiate Connection message</h3>
            <p className="text-slate-400 text-xs">Compose your connection request greeting below:</p>
            <textarea
              className="w-full h-24 p-3 border border-slate-800 bg-slate-950 rounded-xl text-xs text-slate-200 resize-none focus:border-rose-500"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => setShowChatModal(false)}
                className="text-xs hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInitiateChat}
                disabled={isSendingMessage}
                className="bg-rose-600 hover:bg-rose-500 text-xs font-semibold px-4"
              >
                {isSendingMessage ? "Sending..." : "Send & Connect"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
