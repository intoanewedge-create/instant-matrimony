"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  approveProfileAction,
  rejectProfileAction,
  suspendProfileAction,
  restoreProfileAction,
} from "@/lib/actions/profile.actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  CheckCircle,
  XCircle,
  AlertOctagon,
  RotateCcw,
  Eye,
  X,
} from "lucide-react";

export function AdminProfileTable({
  profiles,
  currentFilter,
}: {
  profiles: any[];
  currentFilter: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleApprove = (profileId: string) => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await approveProfileAction(profileId);
      if (res.success) {
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to approve profile");
      }
    });
  };

  const handleOpenRejectModal = (profileId: string) => {
    setSelectedProfileId(profileId);
    setRejectionReason("");
    setErrorMsg(null);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedProfileId || !rejectionReason.trim()) {
      setErrorMsg("Please enter a rejection reason");
      return;
    }
    setErrorMsg(null);
    startTransition(async () => {
      const res = await rejectProfileAction(selectedProfileId, rejectionReason);
      if (res.success) {
        setRejectModalOpen(false);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to reject profile");
      }
    });
  };

  const handleSuspend = (profileId: string) => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await suspendProfileAction(profileId);
      if (res.success) {
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to suspend profile");
      }
    });
  };

  const handleRestore = (profileId: string) => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await restoreProfileAction(profileId);
      if (res.success) {
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to restore profile");
      }
    });
  };

  return (
    <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
        <h2 className="text-lg font-semibold text-slate-100">
          Showing Profiles ({currentFilter})
        </h2>
        {errorMsg && (
          <span className="text-xs text-red-400 font-medium bg-red-950/40 px-3 py-1 rounded-md border border-red-900">
            {errorMsg}
          </span>
        )}
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-3">Member</th>
              <th className="px-6 py-3">Demographics</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Photos</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No profiles found matching the current filter.
                </td>
              </tr>
            ) : (
              profiles.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-200">{p.user?.name || "Unnamed"}</div>
                    <div className="text-xs text-slate-400">{p.user?.email}</div>
                    <div className="text-xs text-slate-500">{p.user?.phone || "No phone"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-300">
                      {p.gender || "N/A"}, {p.religion || "N/A"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {p.caste || "No Caste"} {p.subCaste ? `(${p.subCaste})` : ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-300">
                    {p.city ? `${p.city}, ${p.state || ""}` : "Not specified"}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-300">
                    {p.photos?.length || 0} Photos
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        p.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : p.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : p.status === "REJECTED"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/profiles/${p.id}`}
                        className="inline-flex items-center justify-center rounded-md text-xs font-medium px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Link>

                      {p.status !== "APPROVED" && p.status !== "SUSPENDED" && (
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleApprove(p.id)}
                          className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                      )}

                      {p.status !== "REJECTED" && p.status !== "SUSPENDED" && (
                        <Button
                          size="sm"
                          disabled={isPending}
                          variant="outline"
                          onClick={() => handleOpenRejectModal(p.id)}
                          className="h-8 border-red-800 text-red-400 hover:bg-red-950/50"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      )}

                      {p.status !== "SUSPENDED" ? (
                        <Button
                          size="sm"
                          disabled={isPending}
                          variant="ghost"
                          onClick={() => handleSuspend(p.id)}
                          className="h-8 text-purple-400 hover:bg-purple-950/40"
                        >
                          <AlertOctagon className="w-3.5 h-3.5 mr-1" /> Suspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={isPending}
                          variant="outline"
                          onClick={() => handleRestore(p.id)}
                          className="h-8 border-purple-800 text-purple-300 hover:bg-purple-950/50"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Restore
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>

      {/* Reject Reason Dialog Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" /> Reject Profile
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Please enter the explicit rejection reason. This will be displayed on the user's dashboard and emailed to them.
            </p>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="e.g. Profile photos are unclear. Please upload clear face photo."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="border-slate-800 bg-slate-950/60 text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setRejectModalOpen(false)}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                disabled={isPending || !rejectionReason.trim()}
                onClick={handleConfirmReject}
                size="sm"
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                {isPending ? <Spinner className="w-4 h-4 mr-1" /> : null} Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
