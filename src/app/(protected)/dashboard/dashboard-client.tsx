"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageSquare,
  Sparkles,
  UserCheck,
  Zap,
  ChevronRight,
  Bell,
  Clock,
  Compass,
  Settings,
  UserPlus,
  HelpCircle,
  X,
  CheckCheck,
  AlertCircle,
} from "lucide-react";
import { resubmitProfileAction } from "@/lib/actions/profile.actions";
import { formatDate } from "@/lib/utils/format";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  sendInterestAction,
  acceptInterestAction,
} from "@/lib/actions/interest.actions";
import { NotificationBell } from "@/components/notification-bell";
import { RecentActivityFeed } from "@/components/recent-activity-feed";
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from "@/lib/actions/notification.actions";

export function DashboardClient({
  profile,
  membership,
  receivedInterests: initialReceived,
  sentInterests: initialSent = [],
  suggestions: initialSuggestions = [],
  conversations: initialConversations = [],
  notifications: initialNotifications = [],
}: any) {
  const router = useRouter();
  const [received, setReceived] = useState<any[]>(
    Array.isArray(initialReceived) ? initialReceived : initialReceived?.data || [],
  );
  const [suggestions, setSuggestions] = useState<any[]>(
    Array.isArray(initialSuggestions)
      ? initialSuggestions
      : initialSuggestions?.data || [],
  );
  const [sentInterests] = useState<any[]>(
    Array.isArray(initialSent) ? initialSent : initialSent?.data || [],
  );
  const [conversations] = useState<any[]>(
    Array.isArray(initialConversations)
      ? initialConversations
      : initialConversations?.data || [],
  );
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [tourStep, setTourStep] = useState<number>(0); // 0 = inactive, 1 = welcome, 2 = suggestions, 3 = subscription
  const [notifications, setNotifications] = useState<any[]>(
    Array.isArray(initialNotifications)
      ? initialNotifications
      : initialNotifications?.notifications || initialNotifications?.data || [],
  );

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const handleMarkNotifRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    await markNotificationAsReadAction(id);
  };

  const handleMarkAllNotifRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsAsReadAction();
  };

  const handleSendInterest = async (receiverId: string) => {
    if (!receiverId) return;
    setProcessingId(receiverId);
    try {
      const res = await sendInterestAction(receiverId);
      if (res.success) {
        setSuggestions((prev: any) =>
          prev.map((s: any) =>
            (s?.profile?.userId === receiverId || s?.userId === receiverId)
              ? { ...s, interestSent: true }
              : s,
          ),
        );
      }
    } catch {
      // ignore
    } finally {
      setProcessingId(null);
    }
  };

  const handleAcceptInterest = async (interestId: string) => {
    if (!interestId) return;
    setProcessingId(interestId);
    try {
      const res = await acceptInterestAction(interestId);
      if (res.success) {
        setReceived((prev: any) =>
          prev.filter((i: any) => i.id !== interestId),
        );
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setProcessingId(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 120 },
    },
  };

  return (
    <div
      className="container mx-auto px-4 py-8 space-y-8 relative"
      role="main"
      aria-label="Member Dashboard"
    >
      {/* Onboarding Tour Modal */}
      <AnimatePresence>
        {tourStep > 0 && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
              role="dialog"
              aria-modal="true"
              aria-labelledby="tour-title"
            >
              <button
                onClick={() => setTourStep(0)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                aria-label="Close Tour"
              >
                <X className="w-5 h-5" />
              </button>

              {tourStep === 1 && (
                <div className="space-y-4">
                  <div className="p-3 bg-rose-50 text-rose-600 w-fit rounded-lg">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h2
                    id="tour-title"
                    className="text-xl font-bold text-slate-900"
                  >
                    Welcome to InstantMatrimony Tour!
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Let's walk you through the key matching controls of your
                    matrimonial dashboard in just 3 quick steps.
                  </p>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="ghost"
                      onClick={() => setTourStep(0)}
                      size="sm"
                      className="text-slate-600 hover:text-slate-900"
                    >
                      Skip
                    </Button>
                    <Button
                      onClick={() => setTourStep(2)}
                      size="sm"
                      className="bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {tourStep === 2 && (
                <div className="space-y-4">
                  <div className="p-3 bg-pink-50 text-pink-600 w-fit rounded-lg">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h2
                    id="tour-title"
                    className="text-xl font-bold text-slate-900"
                  >
                    Intelligent Match Suggestions
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    In the center panel, our matching algorithm scores compatibility
                    and lists your top suggestions. Connect instantly!
                  </p>
                  <div className="flex justify-between items-center pt-2">
                    <Button
                      variant="ghost"
                      onClick={() => setTourStep(1)}
                      size="sm"
                      className="text-slate-600 hover:text-slate-900"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setTourStep(3)}
                      size="sm"
                      className="bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {tourStep === 3 && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 text-amber-600 w-fit rounded-lg">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h2
                    id="tour-title"
                    className="text-xl font-bold text-slate-900"
                  >
                    Unlock Full Access
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Upgrade your membership to access verified contact numbers, direct
                    messages, and priority visibility.
                  </p>
                  <div className="flex justify-between items-center pt-2">
                    <Button
                      variant="ghost"
                      onClick={() => setTourStep(2)}
                      size="sm"
                      className="text-slate-600 hover:text-slate-900"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setTourStep(0)}
                      size="sm"
                      className="bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700 shadow-md shadow-rose-500/20"
                    >
                      Finish Tour
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Status Alert Banners */}
      {profile?.status === "PENDING" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900">Profile Under Admin Review</h3>
              <p className="text-xs text-amber-700">
                Your profile details have been submitted and are currently being reviewed by our moderation team. Platform browsing and matching will activate once approved.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 border border-amber-300 text-amber-800 shrink-0">
            PENDING APPROVAL
          </span>
        </motion.div>
      )}

      {profile?.status === "REJECTED" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl bg-red-50 border border-red-200 text-red-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-red-700 font-bold">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Profile Requires Edits & Resubmission</span>
            </div>
            <p className="text-xs text-red-800">
              <strong className="text-red-900">Rejection Reason:</strong> {profile?.rejectionReason || "Please update your profile information and photos according to platform guidelines."}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center rounded-md text-xs font-semibold px-3 py-1.5 border border-red-300 bg-white text-red-700 hover:bg-red-50 transition-colors shadow-sm"
            >
              Edit Profile
            </Link>
            <Button
              size="sm"
              onClick={async () => {
                const res = await resubmitProfileAction();
                if (res.success) {
                  router.refresh();
                }
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
            >
              Resubmit Profile
            </Button>
          </div>
        </motion.div>
      )}

      {profile?.status === "SUSPENDED" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-center gap-3 shadow-sm"
        >
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
          <div>
            <h3 className="font-bold text-red-900">Account Suspended</h3>
            <p className="text-xs text-red-700">
              Your profile has been suspended by system administration. Matchmaking features are disabled. Please contact support.
            </p>
          </div>
        </motion.div>
      )}

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-rose-50 border border-rose-200 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm"
      >
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
            <Sparkles className="w-3.5 h-3.5" /> Premium Telugu Matrimony
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Namaste,{" "}
            <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              {profile.name || "User"}
            </span>
          </h1>
          <p className="text-slate-600 max-w-xl text-sm leading-relaxed">
            Welcome to your premium dashboard. Complete your profile, explore
            verified Telugu matches, and connect with prospective life partners.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell
            initialNotifications={notifications}
            initialUnreadCount={unreadCount}
          />
          <Button
            onClick={() => setTourStep(1)}
            variant="outline"
            size="sm"
            aria-label="Start interactive onboarding tour"
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold gap-1.5 shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-rose-600" /> Start Tour
          </Button>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-r from-rose-200/20 to-transparent blur-2xl pointer-events-none" />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left/Middle Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats Grid */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            role="region"
            aria-label="Statistics Summary"
          >
            {[
              {
                label: "Received Interests",
                value: received.length,
                icon: Heart,
                color: "text-rose-600 bg-rose-50",
                href: "/interests",
              },
              {
                label: "Sent Interests",
                value: sentInterests.length,
                icon: UserPlus,
                color: "text-blue-600 bg-blue-50",
                href: "/interests",
              },
              {
                label: "Active Chats",
                value: conversations.length,
                icon: MessageSquare,
                color: "text-pink-600 bg-pink-50",
                href: "/messages",
              },
              {
                label: "Profile Status",
                value: profile.status,
                icon: UserCheck,
                color: "text-emerald-600 bg-emerald-50",
                href: "/profile",
              },
            ].map((stat, idx) => (
              <motion.div key={idx} variants={cardVariants}>
                <Link href={stat.href}>
                  <Card className="border border-slate-200 bg-white hover:border-rose-300 hover:shadow-md transition-all cursor-pointer shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                      <div className={`p-2.5 rounded-xl ${stat.color}`}>
                        <stat.icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {stat.label}
                      </span>
                      <span className="text-xl font-bold text-slate-900" aria-live="polite">
                        {stat.value}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Suggested Matches */}
          <motion.div
            variants={cardVariants}
            role="region"
            aria-label="Suggested Matches Section"
          >
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Suggested Matches
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Handpicked profiles compatible with your preferences
                  </CardDescription>
                </div>
                <Link
                  href="/search"
                  className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center"
                  aria-label="Explore all compatible matches"
                >
                  Explore All <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {suggestions.length === 0 ? (
                  <div className="py-8 text-center space-y-3">
                    <p className="text-slate-500 text-sm">
                      No suggestions found. Try adjusting preferences.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3" role="list">
                    {suggestions.map((s: any, idx: number) => {
                      const suggProfile = s?.profile || s;
                      const suggId = suggProfile?.id || s?.id || `sugg-${idx}`;
                      const suggUserId = suggProfile?.userId || s?.userId || "";
                      const suggName = suggProfile?.name || s?.name || "Premium Member";
                      const suggAge = suggProfile?.age ?? s?.age ?? "N/A";
                      const suggCity = suggProfile?.city || s?.city || "N/A";
                      const suggState = suggProfile?.state || s?.state || "N/A";
                      const matchScore = s?.compatibility?.score || s?.rankingScore || s?.score || 85;

                      return (
                        <div
                          key={suggId}
                          role="listitem"
                          className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-200/80 rounded-xl bg-slate-50/50 hover:bg-rose-50/30 transition-all gap-4 shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center font-bold text-rose-600 text-base shadow-sm">
                              {suggName.charAt(0) || "U"}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900">
                                <Link
                                  href={`/profile/${suggUserId}`}
                                  className="hover:text-rose-600 transition-colors"
                                >
                                  {suggName}
                                </Link>
                              </h4>
                              <p className="text-xs text-slate-500">
                                {suggAge} yrs • {suggCity},{" "}
                                {suggState}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                                {matchScore}% Match
                              </span>
                            </div>
                            <Button
                              disabled={
                                s?.interestSent ||
                                !suggUserId ||
                                processingId === suggUserId
                              }
                              onClick={() => handleSendInterest(suggUserId)}
                              size="sm"
                              aria-busy={processingId === suggUserId}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-medium min-w-[80px] shadow-sm"
                            >
                              {s?.interestSent ? "Sent" : "Connect"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity Feed */}
          <motion.div
            variants={cardVariants}
            role="region"
            aria-label="Recent Activity Feed"
          >
            <RecentActivityFeed
              conversations={conversations}
              receivedInterests={received}
              sentInterests={sentInterests}
              notifications={notifications}
            />
          </motion.div>

          {/* Pending / Received Interests */}
          <motion.div
            variants={cardVariants}
            role="region"
            aria-label="Received Interest Requests"
          >
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-xl font-bold text-slate-900">
                  Received Interest Requests
                </CardTitle>
                <CardDescription className="text-slate-500">
                  Members interested in connecting with you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {received.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-6">
                    No new interest requests received.
                  </p>
                ) : (
                  <div className="space-y-3" role="list">
                    {received.map((r: any, idx: number) => {
                      const senderName = r?.sender?.name || "Member";
                      const senderReligion = r?.sender?.profile?.religion || "N/A";
                      const senderLanguage = r?.sender?.profile?.motherTongue || "N/A";
                      const intId = r?.id || `rec-${idx}`;
                      const senderId = r?.senderId || "";

                      return (
                        <div
                          key={intId}
                          role="listitem"
                          className="flex items-center justify-between p-4 border border-slate-200/80 rounded-xl bg-slate-50/50 hover:bg-rose-50/30 transition-all shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center font-bold text-rose-600">
                              {senderName.charAt(0) || "S"}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900">
                                <Link
                                  href={`/profile/${senderId}`}
                                  className="hover:text-rose-600 transition-colors"
                                >
                                  {senderName}
                                </Link>
                              </h4>
                              <p className="text-xs text-slate-500">
                                {senderReligion} • {senderLanguage}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={processingId === intId}
                              className="border-slate-300 hover:bg-slate-100 text-slate-700 shadow-sm"
                            >
                              Ignore
                            </Button>
                            <Button
                              size="sm"
                              disabled={processingId === intId}
                              onClick={() => handleAcceptInterest(intId)}
                              className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-sm"
                            >
                              Accept
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-8">
          {/* Profile Completion Card */}
          <motion.div
            variants={cardVariants}
            role="region"
            aria-label="Profile Strength details"
          >
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-slate-900">
                  Profile Strength
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Completion Percent</span>
                  <span className="text-rose-600 font-bold">
                    {profile?.completionPercent || 0}%
                  </span>
                </div>
                <Progress
                  value={profile?.completionPercent || 0}
                  className="h-2 bg-slate-100"
                  aria-label="Profile completeness progression"
                />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Profiles with 100% completion receive 5x more interests. Add
                  education, income details and upload photos.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Membership Plan Card */}
          <motion.div
            variants={cardVariants}
            role="region"
            aria-label="Membership Status Details"
          >
            <Card className="border border-rose-200 bg-gradient-to-b from-rose-50/40 to-white shadow-sm">
              <CardHeader className="pb-2 flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Membership Status
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Your subscription tier and benefits
                  </CardDescription>
                </div>
                <Zap
                  className="w-5 h-5 text-rose-600 animate-pulse"
                  aria-hidden="true"
                />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Plan Tier</span>
                  <span className="text-sm font-bold text-rose-600 uppercase">
                    {membership?.plan?.name || "Free Trial"}
                  </span>
                </div>
                {membership ? (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Days Remaining</span>
                    <span className="font-semibold text-slate-900">
                      {membership?.endDate && !isNaN(new Date(membership.endDate).getTime())
                        ? Math.max(0, Math.ceil((new Date(membership.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                        : 0}{" "}
                      Days
                    </span>
                  </div>
                ) : (
                  <Link href="/dashboard/billing" className="block w-full mt-2">
                    <Button
                      size="sm"
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                    >
                      Upgrade to Premium
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions Panel */}
          <motion.div
            variants={cardVariants}
            role="region"
            aria-label="Quick Navigation Controls"
          >
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg font-bold text-slate-900">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 pt-3">
                {[
                  { name: "Search Matches", icon: Compass, href: "/search" },
                  { name: "Chat Box", icon: MessageSquare, href: "/messages" },
                  { name: "Preferences", icon: Settings, href: "/onboarding" },
                  {
                    name: "Verification & Photos",
                    icon: UserCheck,
                    href: "/dashboard/verification",
                  },
                ].map((action, idx) => (
                  <Link
                    key={idx}
                    href={action.href}
                    className="border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 rounded-xl flex flex-col items-center p-4 h-auto gap-2 justify-center transition-all bg-white shadow-xs focus-visible:ring-2 focus-visible:ring-rose-500 group"
                    aria-label={`Navigate to ${action.name}`}
                  >
                    <action.icon
                      className="w-5 h-5 text-rose-600 group-hover:scale-110 transition-transform"
                      aria-hidden="true"
                    />
                    <span className="text-xs text-slate-700 font-medium text-center">
                      {action.name}
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications Card */}
          <motion.div
            variants={cardVariants}
            role="region"
            aria-label="System Notifications Panel"
          >
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Notifications
                  </CardTitle>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllNotifRead}
                      className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium"
                      aria-label="Mark all notifications as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all
                    </button>
                  )}
                  <Bell className="w-4 h-4 text-rose-600" aria-hidden="true" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-3">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-2">
                    No new notifications.
                  </p>
                ) : (
                  <div className="space-y-2" role="list">
                    {notifications.slice(0, 5).map((n: any) => {
                      const isUnread = !n.read;
                      return (
                        <button
                          key={n.id}
                          onClick={() => isUnread && handleMarkNotifRead(n.id)}
                          role="listitem"
                          className={`w-full text-left text-xs space-y-1 rounded-lg p-2.5 transition-colors ${
                            isUnread
                              ? "bg-rose-50/80 hover:bg-rose-100/80 border border-rose-200"
                              : "hover:bg-slate-50 border border-transparent"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-start gap-2 min-w-0">
                              <span
                                className={`mt-1 inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                                  isUnread
                                    ? "bg-rose-600 animate-pulse"
                                    : "bg-slate-300"
                                }`}
                              />
                              <span
                                className={`font-semibold truncate ${
                                  isUnread ? "text-slate-900 font-bold" : "text-slate-600"
                                }`}
                              >
                                {n.title}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5 shrink-0">
                              <Clock className="w-3 h-3" aria-hidden="true" />{" "}
                              {formatDate(n.createdAt)}
                            </span>
                          </div>
                          <p
                            className={`pl-3.5 ${isUnread ? "text-slate-700" : "text-slate-500"}`}
                          >
                            {n.message}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
