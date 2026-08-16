"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertCircle, CheckCheck } from "lucide-react";
import Link from "next/link";

import { ProfileSidebarCard } from "@/components/dashboard/profile-sidebar-card";
import { UpgradeCard } from "@/components/dashboard/upgrade-card";
import { QuickActionsSidebar } from "@/components/dashboard/quick-actions-sidebar";
import { ProfileCompletionWidget } from "@/components/dashboard/profile-completion-widget";
import { RecommendationsSection } from "@/components/dashboard/recommendations-section";
import { RecentActivityFeed } from "@/components/recent-activity-feed";
import { Button } from "@/components/ui/button";
import { resubmitProfileAction } from "@/lib/actions/profile.actions";
import { acceptInterestAction } from "@/lib/actions/interest.actions";
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from "@/lib/actions/notification.actions";
import { formatDate } from "@/lib/utils/format";

export function DashboardClient({
  profile,
  membership,
  receivedInterests: initialReceived,
  sentInterests: initialSent = [],
  suggestions: initialSuggestions = [],
  conversations: initialConversations = [],
  notifications: initialNotifications = [],
  publicId,
  currentUserId,
}: any) {
  const router = useRouter();

  const [received, setReceived] = useState<any[]>(
    Array.isArray(initialReceived)
      ? initialReceived
      : initialReceived?.data || [],
  );
  const [suggestions] = useState<any[]>(
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
  const [notifications, setNotifications] = useState<any[]>(
    Array.isArray(initialNotifications)
      ? initialNotifications
      : initialNotifications?.notifications || initialNotifications?.data || [],
  );
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"regular" | "vip">("regular");

  const isPremium = !!membership;
  const planName = membership?.plan?.name || "Free Member";
  const daysRemaining =
    membership?.endDate && !isNaN(new Date(membership.endDate).getTime())
      ? Math.max(
          0,
          Math.ceil(
            (new Date(membership.endDate).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : undefined;
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  // Profile completion checks
  const photos: any[] = profile?.photos || [];
  const hasPhotos = photos.length > 0;
  const hasHoroscope = !!profile?.horoscope;
  const hasFamilyDetails = !!profile?.familyDetails;

  // Avatar photo
  const mainPhoto =
    photos.find((p: any) => p.isMain)?.url || photos[0]?.url || null;

  /**
   * Interest rows are derived from the REAL Interest records (received + sent).
   * Direction is computed from senderId / receiverId vs the logged-in user id, and the
   * Accept button is shown ONLY for incoming PENDING interests.
   */
  const interestRows = [...received, ...sentInterests]
    .filter((i: any) => i && i.id)
    .filter((i: any) => i.status === "PENDING" || i.status === "ACCEPTED")
    .reduce((acc: any[], item: any) => {
      if (!acc.some((existing) => existing.id === item.id)) acc.push(item);
      return acc;
    }, [])
    .map((item: any) => {
      const isOutgoing = item.senderId === currentUserId;
      const other = isOutgoing ? item.receiver : item.sender;
      const otherProfile = other?.profile || {};
      const otherPhotos: any[] = otherProfile?.photos || [];
      return {
        id: item.id,
        status: item.status,
        direction: isOutgoing ? "outgoing" : "incoming",
        canAccept: !isOutgoing && item.status === "PENDING",
        userId: other?.id || (isOutgoing ? item.receiverId : item.senderId),
        name: other?.name || "Member",
        photoUrl:
          otherPhotos.find((p: any) => p.isMain)?.url ||
          otherPhotos[0]?.url ||
          null,
      };
    });

  const handleAcceptInterest = async (interestId: string) => {
    if (processingId) return; // prevent duplicate clicks
    setProcessingId(interestId);
    try {
      const res = await acceptInterestAction(interestId);
      if (res.success) {
        // Keep the profile visible, only flip the status so the Accept button disappears.
        setReceived((prev) =>
          prev.map((i: any) =>
            i.id === interestId ? { ...i, status: "ACCEPTED" } : i,
          ),
        );
        // Re-read the authoritative status from the database.
        router.refresh();
      }
    } catch {
      /* ignore */
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    await markNotificationAsReadAction(id);
    router.refresh();
  };

  const handleMarkAllNotifRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsAsReadAction();
    router.refresh();
  };

  return (
    <div className="space-y-4" style={{ color: "#111827" }}>
      {/* ── STATUS BANNERS (full width, above columns) ── */}
      <AnimatePresence>
        {profile?.status === "PENDING" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border"
            style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}
            role="alert"
          >
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-lg shrink-0"
                style={{ backgroundColor: "#FEF3C7" }}
              >
                <Clock className="w-5 h-5" style={{ color: "#B45309" }} />
              </div>
              <div>
                <h3 className="font-bold text-sm" style={{ color: "#92400E" }}>
                  Profile Under Admin Review
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "#B45309" }}>
                  Your profile details have been submitted and are currently
                  being reviewed by our moderation team. Platform browsing and
                  matching will activate once approved.
                </p>
              </div>
            </div>
            <span
              className="shrink-0 px-3 py-1 rounded-full text-xs font-bold border"
              style={{
                backgroundColor: "#FEF3C7",
                color: "#92400E",
                borderColor: "#FDE68A",
              }}
            >
              PENDING APPROVAL
            </span>
          </motion.div>
        )}

        {profile?.status === "REJECTED" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl border"
            style={{ backgroundColor: "#FFF5F5", borderColor: "#FCA5A5" }}
            role="alert"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className="w-5 h-5 shrink-0 mt-0.5"
                style={{ color: "#DC2626" }}
              />
              <div>
                <p className="font-bold text-sm" style={{ color: "#991B1B" }}>
                  Profile Requires Edits & Resubmission
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#DC2626" }}>
                  <strong>Reason:</strong>{" "}
                  {profile?.rejectionReason ||
                    "Please update your profile according to guidelines."}
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                href="/onboarding"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
                style={{ borderColor: "#FCA5A5", color: "#DC2626" }}
              >
                Edit Profile
              </Link>
              <Button
                size="sm"
                onClick={async () => {
                  const r = await resubmitProfileAction();
                  if (r.success) router.refresh();
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-xs"
              >
                Resubmit
              </Button>
            </div>
          </motion.div>
        )}

        {profile?.status === "SUSPENDED" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-2xl border"
            style={{ backgroundColor: "#FFF5F5", borderColor: "#FCA5A5" }}
            role="alert"
          >
            <AlertCircle
              className="w-6 h-6 shrink-0"
              style={{ color: "#DC2626" }}
            />
            <div>
              <h3 className="font-bold text-sm" style={{ color: "#991B1B" }}>
                Account Suspended
              </h3>
              <p className="text-xs" style={{ color: "#DC2626" }}>
                Your profile has been suspended. Please contact support.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* ── LEFT SIDEBAR ── */}
        <aside className="space-y-4" aria-label="Profile sidebar">
          <ProfileSidebarCard
            name={profile?.name || "User"}
            publicId={publicId}
            membershipLabel={planName}
            isPremium={isPremium}
            photoUrl={mainPhoto}
            completionPercent={profile?.completionPercent || 0}
          />
          <UpgradeCard
            isPremium={isPremium}
            planName={planName}
            daysRemaining={daysRemaining}
          />
          <QuickActionsSidebar />

          {/* Interests Received (real Interest records, both directions) */}
          {interestRows.length > 0 && (
            <div
              className="rounded-2xl border shadow-sm overflow-hidden"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
              role="region"
              aria-label="Interest requests"
              data-testid="interests-received-panel"
            >
              <div
                className="px-4 py-3 border-b flex items-center justify-between"
                style={{ borderColor: "#F3F4F6" }}
              >
                <h3 className="text-sm font-bold" style={{ color: "#111827" }}>
                  Interests Received
                </h3>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#FFF1F2", color: "#E11D48" }}
                  data-testid="interests-received-count"
                >
                  {interestRows.length}
                </span>
              </div>
              <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
                {interestRows.slice(0, 5).map((r: any) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-2"
                    data-testid={`interest-row-${r.id}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {r.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.photoUrl}
                          alt={r.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border"
                          style={{ borderColor: "#E5E7EB" }}
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{
                            background:
                              "linear-gradient(135deg, #E11D48, #F43F5E)",
                          }}
                        >
                          {r.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/profile/${r.userId}`}
                          className="text-xs font-semibold truncate hover:text-rose-600 block"
                          style={{ color: "#111827" }}
                          data-testid={`interest-profile-link-${r.id}`}
                        >
                          {r.name}
                        </Link>
                        <span
                          className="text-[10px] font-semibold"
                          style={{ color: "#9CA3AF" }}
                        >
                          {r.direction === "incoming" ? "Received" : "Sent"} ·{" "}
                          {r.status}
                        </span>
                      </div>
                    </div>
                    {r.canAccept ? (
                      <Button
                        size="sm"
                        disabled={processingId === r.id}
                        onClick={() => handleAcceptInterest(r.id)}
                        className="text-xs h-7 px-2.5 shrink-0 font-semibold shadow-xs"
                        style={{
                          background:
                            "linear-gradient(135deg, #E11D48, #F43F5E)",
                          color: "white",
                        }}
                        data-testid={`accept-interest-btn-${r.id}`}
                      >
                        {processingId === r.id ? "Accepting..." : "Accept"}
                      </Button>
                    ) : (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border"
                        style={
                          r.status === "ACCEPTED"
                            ? {
                                backgroundColor: "#E6F4EA",
                                color: "#00A76F",
                                borderColor: "#A7F3D0",
                              }
                            : {
                                backgroundColor: "#FEF3C7",
                                color: "#92400E",
                                borderColor: "#FDE68A",
                              }
                        }
                        data-testid={`interest-status-${r.id}`}
                      >
                        {r.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {interestRows.length > 5 && (
                <div className="px-4 pb-3">
                  <Link
                    href="/interests"
                    className="text-xs font-semibold"
                    style={{ color: "#E11D48" }}
                  >
                    View all {interestRows.length} interests →
                  </Link>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* ── RIGHT MAIN CONTENT ── */}
        <main className="space-y-5" aria-label="Dashboard content">
          {/* View Selector */}
          <div className="flex justify-center">
            <div
              className="inline-flex rounded-full p-1 border"
              style={{ backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" }}
              role="tablist"
              aria-label="Dashboard view selector"
            >
              {(["regular", "vip"] as const).map((view) => (
                <button
                  key={view}
                  role="tab"
                  aria-selected={activeView === view}
                  onClick={() => {
                    if (view === "vip") {
                      if (isPremium) {
                        router.push("/dashboard/concierge");
                      } else {
                        router.push("/memberships");
                      }
                      return;
                    }
                    setActiveView(view);
                  }}
                  className="px-5 py-1.5 rounded-full text-sm font-semibold transition-all"
                  style={
                    activeView === view
                      ? {
                          backgroundColor: "#FFFFFF",
                          color: "#E11D48",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        }
                      : { color: "#6B7280" }
                  }
                >
                  {view === "regular" ? "Regular" : "VIP Concierge"}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Completion Widget */}
          <ProfileCompletionWidget
            completionPercent={profile?.completionPercent || 0}
            hasPhotos={hasPhotos}
            hasHoroscope={hasHoroscope}
            hasFamilyDetails={hasFamilyDetails}
          />

          {/* Daily Recommendations */}
          <RecommendationsSection suggestions={suggestions} />

          {/* Recent Activity */}
          <div
            className="rounded-2xl border shadow-sm overflow-hidden"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
            role="region"
            aria-label="Recent activity"
          >
            <div
              className="px-5 py-4 border-b"
              style={{ borderColor: "#F3F4F6" }}
            >
              <h2 className="text-base font-bold" style={{ color: "#111827" }}>
                Recent Activity
              </h2>
            </div>
            <div className="p-4">
              <RecentActivityFeed
                conversations={conversations}
                receivedInterests={received}
                sentInterests={sentInterests}
                notifications={notifications}
              />
            </div>
          </div>

          {/* Notifications panel */}
          {notifications.length > 0 && (
            <div
              className="rounded-2xl border shadow-sm overflow-hidden"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
              role="region"
              aria-label="Notifications"
            >
              <div
                className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: "#F3F4F6" }}
              >
                <div className="flex items-center gap-2">
                  <h2
                    className="text-base font-bold"
                    style={{ color: "#111827" }}
                  >
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#FFF1F2", color: "#E11D48" }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllNotifRead}
                    className="text-xs font-semibold flex items-center gap-1"
                    style={{ color: "#E11D48" }}
                    aria-label="Mark all notifications as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {notifications.slice(0, 5).map((n: any) => (
                  <button
                    key={n.id}
                    onClick={() => !n.read && handleMarkNotifRead(n.id)}
                    className="w-full text-left p-3 rounded-xl text-xs transition-colors"
                    style={
                      !n.read
                        ? {
                            backgroundColor: "#FFF1F2",
                            border: "1px solid #FECDD3",
                          }
                        : {
                            backgroundColor: "#F9FAFB",
                            border: "1px solid #F3F4F6",
                          }
                    }
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span
                        className="font-semibold"
                        style={{ color: n.read ? "#6B7280" : "#111827" }}
                      >
                        {n.title}
                      </span>
                      <span
                        className="text-xs shrink-0"
                        style={{ color: "#9CA3AF" }}
                      >
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                    <p
                      className="mt-0.5"
                      style={{ color: n.read ? "#9CA3AF" : "#374151" }}
                    >
                      {n.message}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
