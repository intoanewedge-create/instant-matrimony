"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  acceptInterestAction,
  declineInterestAction,
  withdrawInterestAction,
} from "@/lib/actions/interest.actions";
import { formatDate } from "@/lib/utils/format";
import {
  Heart,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  Clock,
  Search,
  Filter,
  BellRing,
  Inbox,
  Send,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { getDisplayProfileId } from "@/lib/utils/public-id";

interface InterestsClientProps {
  receivedInterests: any[];
  sentInterests: any[];
}

export function InterestsClient({
  receivedInterests: initialReceived,
  sentInterests: initialSent,
}: InterestsClientProps) {
  const router = useRouter();
  const [activeDirection, setActiveDirection] = useState<"received" | "sent">(
    "received",
  );
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [received, setReceived] = useState(initialReceived || []);
  const [sent, setSent] = useState(initialSent || []);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAccept = async (interestId: string) => {
    if (loadingId !== null) {
      return;
    }

    setLoadingId(interestId);
    setActionError(null);

    try {
      const res = await acceptInterestAction(interestId);

      if (res.success) {
        setReceived((prev) =>
          prev.map((i) =>
            i.id === interestId ? { ...i, status: "ACCEPTED" } : i,
          ),
        );
        router.refresh();
      } else {
        setActionError(
          res.error || "Unable to accept this interest. Please try again.",
        );
      }
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to accept this interest. Please try again.",
      );
    } finally {
      setLoadingId(null);
    }
  };

  const handleDecline = async (interestId: string) => {
    if (loadingId !== null) {
      return;
    }

    setLoadingId(interestId);
    setActionError(null);

    try {
      const res = await declineInterestAction(interestId);

      if (res.success) {
        setReceived((prev) =>
          prev.map((i) =>
            i.id === interestId ? { ...i, status: "DECLINED" } : i,
          ),
        );
        router.refresh();
      } else {
        setActionError(
          res.error || "Unable to decline this interest. Please try again.",
        );
      }
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to decline this interest. Please try again.",
      );
    } finally {
      setLoadingId(null);
    }
  };

  const handleWithdraw = async (interestId: string) => {
    if (loadingId !== null) {
      return;
    }

    setLoadingId(interestId);
    setActionError(null);

    try {
      const res = await withdrawInterestAction(interestId);

      if (res.success) {
        setSent((prev) =>
          prev.map((i) =>
            i.id === interestId ? { ...i, status: "WITHDRAWN" } : i,
          ),
        );
        router.refresh();
      } else {
        setActionError(
          res.error || "Unable to withdraw this interest. Please try again.",
        );
      }
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to withdraw this interest. Please try again.",
      );
    } finally {
      setLoadingId(null);
    }
  };

  const currentList = activeDirection === "received" ? received : sent;

  const filteredList = currentList.filter((item) => {
    if (statusFilter !== "ALL" && item.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const member =
        activeDirection === "received" ? item.sender : item.receiver;
      const name = member?.name?.toLowerCase() || "";
      const pubId = member?.publicId?.toLowerCase() || "";

      return name.includes(q) || pubId.includes(q);
    }

    return true;
  });

  const sidebarReceivedCounts = {
    ALL: received.length,
    PENDING: received.filter((i) => i.status === "PENDING").length,
    ACCEPTED: received.filter((i) => i.status === "ACCEPTED").length,
    DECLINED: received.filter(
      (i) => i.status === "DECLINED" || i.status === "REJECTED",
    ).length,
  };

  const sidebarSentCounts = {
    ALL: sent.length,
    PENDING: sent.filter((i) => i.status === "PENDING").length,
    ACCEPTED: sent.filter((i) => i.status === "ACCEPTED").length,
    DECLINED: sent.filter(
      (i) => i.status === "DECLINED" || i.status === "REJECTED",
    ).length,
  };

  return (
    <div className="space-y-6" style={{ color: "#1F2937" }}>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <aside className="space-y-4" aria-label="Interest navigation sidebar">
          <div
            className="rounded-2xl border shadow-xs overflow-hidden"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
          >
            <div
              className="p-4 border-b space-y-2"
              style={{ borderColor: "#F3F4F6" }}
            >
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gray-400">
                <Inbox className="w-4 h-4 text-emerald-600" />
                <span>Interests Received</span>
              </div>

              <div className="space-y-1">
                {[
                  { id: "ALL", label: "All", count: sidebarReceivedCounts.ALL },
                  {
                    id: "PENDING",
                    label: "Pending",
                    count: sidebarReceivedCounts.PENDING,
                  },
                  {
                    id: "ACCEPTED",
                    label: "Accepted / Replied",
                    count: sidebarReceivedCounts.ACCEPTED,
                  },
                  {
                    id: "DECLINED",
                    label: "Declined",
                    count: sidebarReceivedCounts.DECLINED,
                  },
                ].map((cat) => {
                  const active =
                    activeDirection === "received" && statusFilter === cat.id;

                  return (
                    <button
                      key={`rec-${cat.id}`}
                      onClick={() => {
                        setActiveDirection("received");
                        setStatusFilter(cat.id);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={
                        active
                          ? {
                              backgroundColor: "#E6F4EA",
                              color: "#00A76F",
                              fontWeight: "700",
                            }
                          : {
                              backgroundColor: "transparent",
                              color: "#374151",
                            }
                      }
                    >
                      <span>{cat.label}</span>
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={
                          active
                            ? { backgroundColor: "#00A76F", color: "#FFFFFF" }
                            : { backgroundColor: "#F3F4F6", color: "#6B7280" }
                        }
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-gray-400">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>Interests Sent</span>
              </div>

              <div className="space-y-1">
                {[
                  { id: "ALL", label: "All", count: sidebarSentCounts.ALL },
                  {
                    id: "PENDING",
                    label: "Pending",
                    count: sidebarSentCounts.PENDING,
                  },
                  {
                    id: "ACCEPTED",
                    label: "Accepted / Replied",
                    count: sidebarSentCounts.ACCEPTED,
                  },
                  {
                    id: "DECLINED",
                    label: "Declined",
                    count: sidebarSentCounts.DECLINED,
                  },
                ].map((cat) => {
                  const active =
                    activeDirection === "sent" && statusFilter === cat.id;

                  return (
                    <button
                      key={`sent-${cat.id}`}
                      onClick={() => {
                        setActiveDirection("sent");
                        setStatusFilter(cat.id);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={
                        active
                          ? {
                              backgroundColor: "#E6F4EA",
                              color: "#00A76F",
                              fontWeight: "700",
                            }
                          : {
                              backgroundColor: "transparent",
                              color: "#374151",
                            }
                      }
                    >
                      <span>{cat.label}</span>
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={
                          active
                            ? { backgroundColor: "#00A76F", color: "#FFFFFF" }
                            : { backgroundColor: "#F3F4F6", color: "#6B7280" }
                        }
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <main className="space-y-4" aria-label="Interest details main view">
          <div
            className="p-4 rounded-2xl border shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                {activeDirection === "received" ? "Received Requests" : "Sent Requests"}
              </span>
            </div>

            {/* Search input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search in Interests (Name, Profile ID)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 border rounded-xl text-xs bg-white text-gray-900 focus:outline-none focus:border-emerald-500"
                style={{ borderColor: "#E5E7EB" }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 capitalize">
                {statusFilter.toLowerCase()} {activeDirection} interests
              </h2>

              <p className="text-xs text-gray-500">
                {activeDirection === "received"
                  ? "Interests from members awaiting your response"
                  : "Interests sent by you to prospective matches"}
              </p>
            </div>
          </div>

          {actionError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
            >
              {actionError}
            </div>
          )}

          {filteredList.length === 0 ? (
            <div
              className="p-12 text-center rounded-2xl border bg-white shadow-xs space-y-3"
              style={{ borderColor: "#E5E7EB" }}
            >
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                <BellRing className="w-8 h-8 animate-pulse" />
              </div>

              <h3 className="text-base font-bold text-gray-900">
                No {statusFilter !== "ALL" ? statusFilter.toLowerCase() : ""}{" "}
                {activeDirection} interests so far
              </h3>

              <p className="text-xs text-gray-500 max-w-md mx-auto">
                {activeDirection === "received"
                  ? "When other members express interest in your profile, they will appear here."
                  : "Browse profiles in search and send interests to initiate match conversations."}
              </p>

              <Link
                href="/matches"
                className="inline-block text-xs font-bold px-4 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
              >
                Browse Matches
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredList.map((item) => {
                const member =
                  activeDirection === "received" ? item.sender : item.receiver;
                const profile = member?.profile || {};
                const photos: any[] = profile.photos || [];
                const mainPhoto = photos.find((ph: any) => ph.isMain)?.url || photos[0]?.url;
                const publicId = getDisplayProfileId(member, member?.id);

                const isAccepting = loadingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border bg-white shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                    style={{ borderColor: "#E5E7EB" }}
                  >
                    <div
                      className="px-4 py-2.5 bg-gray-50 border-b flex items-center justify-between text-xs"
                      style={{ borderColor: "#F3F4F6" }}
                    >
                      <span className="text-gray-500 flex items-center gap-1 font-medium text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {formatDate(item.createdAt)}
                      </span>

                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase"
                        style={
                          item.status === "ACCEPTED"
                            ? {
                                backgroundColor: "#E6F4EA",
                                color: "#00A76F",
                                borderColor: "#A7F3D0",
                              }
                            : item.status === "PENDING"
                              ? {
                                  backgroundColor: "#FEF3C7",
                                  color: "#92400E",
                                  borderColor: "#FDE68A",
                                }
                              : {
                                  backgroundColor: "#F3F4F6",
                                  color: "#6B7280",
                                  borderColor: "#E5E7EB",
                                }
                        }
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="p-4 flex gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
                        {mainPhoto ? (
                          <img
                            src={mainPhoto}
                            alt={member?.name || "Member"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-emerald-50 text-emerald-600">
                            {(member?.name || "M").charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        {publicId && (
                          <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Profile ID: {publicId}
                          </span>
                        )}
                        <h3 className="font-bold text-gray-900 text-sm truncate">
                          {member?.name || "Anonymous Member"}
                        </h3>
                        <p className="text-xs text-gray-600 truncate">
                          {profile.religion || "N/A"} •{" "}
                          {profile.caste || "General"}
                        </p>

                        <p className="text-xs text-gray-600 truncate">
                          {profile.education || "Graduate"} •{" "}
                          {profile.occupation || "Professional"}
                        </p>
                      </div>
                    </div>

                    <div
                      className="px-4 py-3 bg-gray-50 border-t space-y-2"
                      style={{ borderColor: "#F3F4F6" }}
                    >
                      {activeDirection === "received" &&
                        item.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button
                              disabled={loadingId !== null}
                              onClick={() => handleAccept(item.id)}
                              className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center justify-center gap-1 shadow-xs disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {isAccepting ? "Accepting..." : "Accept"}
                            </button>

                            <button
                              disabled={loadingId !== null}
                              onClick={() => handleDecline(item.id)}
                              className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-all flex items-center justify-center gap-1 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Decline
                            </button>
                          </div>
                        )}

                      {activeDirection === "received" &&
                        item.status === "ACCEPTED" && (
                          <Link
                            href="/messages"
                            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Start
                            Chatting
                          </Link>
                        )}

                      {activeDirection === "sent" &&
                        item.status === "PENDING" && (
                          <button
                            disabled={loadingId !== null}
                            onClick={() => handleWithdraw(item.id)}
                            className="w-full py-1.5 rounded-xl text-xs font-semibold text-gray-700 border border-gray-200 hover:bg-gray-100 transition-all flex items-center justify-center gap-1 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Withdraw
                            Interest
                          </button>
                        )}

                      <Link
                        href={`/profile/${member?.id}`}
                        className="flex items-center justify-center gap-1 w-full py-1 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-400" /> View
                        Profile
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
