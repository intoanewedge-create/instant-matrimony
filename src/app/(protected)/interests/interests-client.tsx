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
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  Clock,
  Send,
  Inbox,
  Filter,
} from "lucide-react";

export function InterestsClient({
  receivedInterests: initialReceived,
  sentInterests: initialSent,
}: {
  receivedInterests: any[];
  sentInterests: any[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [received, setReceived] = useState(initialReceived || []);
  const [sent, setSent] = useState(initialSent || []);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAccept = async (interestId: string) => {
    setLoadingId(interestId);
    try {
      const res = await acceptInterestAction(interestId);
      if (res.success) {
        setReceived((prev) =>
          prev.map((i) => (i.id === interestId ? { ...i, status: "ACCEPTED" } : i))
        );
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setLoadingId(null);
    }
  };

  const handleDecline = async (interestId: string) => {
    setLoadingId(interestId);
    try {
      const res = await declineInterestAction(interestId);
      if (res.success) {
        setReceived((prev) =>
          prev.map((i) => (i.id === interestId ? { ...i, status: "DECLINED" } : i))
        );
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setLoadingId(null);
    }
  };

  const handleWithdraw = async (interestId: string) => {
    setLoadingId(interestId);
    try {
      const res = await withdrawInterestAction(interestId);
      if (res.success) {
        setSent((prev) =>
          prev.map((i) => (i.id === interestId ? { ...i, status: "WITHDRAWN" } : i))
        );
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setLoadingId(null);
    }
  };

  const currentList = activeTab === "received" ? received : sent;
  const filteredList = currentList.filter((item) => {
    if (statusFilter === "ALL") return true;
    return item.status === statusFilter;
  });

  const pendingReceivedCount = received.filter((i) => i.status === "PENDING").length;

  return (
    <div className="container mx-auto px-4 max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" /> Interest Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your incoming match requests and sent interest proposals.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1.5 gap-1 shrink-0">
          <button
            onClick={() => setActiveTab("received")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "received"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Inbox className="w-4 h-4" /> Received ({received.length})
            {pendingReceivedCount > 0 && (
              <span className="ml-1 bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold">
                {pendingReceivedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "sent"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Send className="w-4 h-4" /> Sent ({sent.length})
          </button>
        </div>
      </div>

      {/* Status Filter Sub-bar */}
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="w-4 h-4 text-rose-400" /> Filter Status:
        </div>
        <div className="flex gap-2">
          {["ALL", "PENDING", "ACCEPTED", "DECLINED", "WITHDRAWN"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                statusFilter === status
                  ? "bg-slate-800 text-rose-400 border border-rose-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* List Feed */}
      {filteredList.length === 0 ? (
        <Card className="border border-slate-800 bg-slate-900/60 p-12 text-center">
          <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">
            No {activeTab} interests in this category
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Discover compatible profiles in search to initiate interest proposals.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredList.map((item) => {
              const member = activeTab === "received" ? item.sender : item.receiver;
              const profile = member?.profile || {};
              const photoUrl = profile.photos?.[0]?.url || "/placeholder-avatar.png";

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between h-full profile-card">
                    <div>
                      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(item.createdAt)}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "ACCEPTED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : item.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : item.status === "DECLINED" || item.status === "REJECTED"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="p-5 flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-700 shrink-0 bg-slate-950">
                          <img
                            src={photoUrl}
                            alt={member?.name || "Member"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1 overflow-hidden">
                          <h3 className="font-bold text-slate-100 text-base truncate">
                            {member?.name || "Anonymous Member"}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {profile.religion || "N/A"} • {profile.caste || "General"}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {profile.education || "N/A"} • {profile.occupation || "N/A"}
                          </p>
                          <p className="text-xs text-rose-400 font-medium truncate">
                            {profile.city ? `${profile.city}, ${profile.state || ""}` : "India"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer Action Buttons */}
                    <div className="p-4 pt-0 space-y-2 border-t border-slate-800/40 mt-2 pt-3">
                      {activeTab === "received" && item.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={loadingId === item.id}
                            onClick={() => handleAccept(item.id)}
                            className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                          >
                            {loadingId === item.id ? <Spinner className="w-3.5 h-3.5 mr-1" /> : <CheckCircle className="w-3.5 h-3.5 mr-1" />} Accept
                          </Button>
                          <Button
                            size="sm"
                            disabled={loadingId === item.id}
                            variant="outline"
                            onClick={() => handleDecline(item.id)}
                            className="w-1/2 border-red-900/40 text-red-400 hover:bg-red-950/40 text-xs font-semibold"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                          </Button>
                        </div>
                      )}

                      {activeTab === "received" && item.status === "ACCEPTED" && (
                        <Link
                          href="/messages"
                          className="inline-flex items-center justify-center w-full py-1.5 rounded-md text-xs font-semibold bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-md"
                        >
                          Start Chatting
                        </Link>
                      )}

                      {activeTab === "sent" && item.status === "PENDING" && (
                        <Button
                          size="sm"
                          disabled={loadingId === item.id}
                          variant="outline"
                          onClick={() => handleWithdraw(item.id)}
                          className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                        >
                          {loadingId === item.id ? <Spinner className="w-3.5 h-3.5 mr-1" /> : <RotateCcw className="w-3.5 h-3.5 mr-1" />} Withdraw Request
                        </Button>
                      )}

                      <Link
                        href={`/profile/${member?.id}`}
                        className="inline-flex items-center justify-center w-full py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Full Profile
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
