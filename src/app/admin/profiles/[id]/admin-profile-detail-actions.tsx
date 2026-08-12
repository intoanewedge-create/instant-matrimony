"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveProfileAction,
  rejectProfileAction,
  suspendProfileAction,
  restoreProfileAction,
  deleteProfileAction,
} from "@/lib/actions/profile.actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertOctagon,
  RotateCcw,
  X,
  Trash2,
  ShieldAlert,
} from "lucide-react";

export function AdminProfileDetailActions({ profile }: { profile: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleApprove = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await approveProfileAction(profile.id);
      if (res.success) {
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to approve profile");
      }
    });
  };

  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) {
      setErrorMsg("Please enter a rejection reason");
      return;
    }
    setErrorMsg(null);
    startTransition(async () => {
      const res = await rejectProfileAction(profile.id, rejectionReason);
      if (res.success) {
        setRejectModalOpen(false);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to reject profile");
      }
    });
  };

  const handleSuspend = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await suspendProfileAction(profile.id);
      if (res.success) {
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to suspend profile");
      }
    });
  };

  const handleRestore = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await restoreProfileAction(profile.id);
      if (res.success) {
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to restore profile");
      }
    });
  };

  const handleConfirmDelete = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await deleteProfileAction(profile.id, deleteReason.trim() || undefined);
      if (res.success) {
        setDeleteModalOpen(false);
        router.push("/admin/profiles");
      } else {
        setErrorMsg(res.error || "Failed to delete profile");
      }
    });
  };

  return (
    <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
      <CardHeader className="border-b border-slate-800 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-rose-400">
          <ShieldCheck className="w-5 h-5" /> Moderation Decision
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {errorMsg && (
          <div className="p-3 text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg">
            {errorMsg}
          </div>
        )}

        <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Current Status:</span>
            <span className="font-bold text-slate-200">{profile.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Completion:</span>
            <span className="font-bold text-rose-400">{profile.completionPercent}%</span>
          </div>
          {profile.rejectionReason && (
            <div className="pt-2 border-t border-slate-800 text-red-300">
              <strong>Rejection Reason:</strong> {profile.rejectionReason}
            </div>
          )}
        </div>

        <div className="space-y-2">
          {profile.status !== "APPROVED" && profile.status !== "SUSPENDED" && profile.status !== "DELETED" && (
            <Button
              disabled={isPending}
              onClick={handleApprove}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              {isPending ? <Spinner className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Approve Profile
            </Button>
          )}

          {profile.status !== "REJECTED" && profile.status !== "SUSPENDED" && profile.status !== "DELETED" && (
            <Button
              disabled={isPending}
              variant="outline"
              onClick={() => { setRejectionReason(""); setRejectModalOpen(true); }}
              className="w-full border-red-800 text-red-400 hover:bg-red-950/50"
            >
              <XCircle className="w-4 h-4 mr-2" /> Reject Profile
            </Button>
          )}

          {profile.status !== "SUSPENDED" && profile.status !== "DELETED" ? (
            <Button
              disabled={isPending}
              variant="ghost"
              onClick={handleSuspend}
              className="w-full text-purple-400 hover:bg-purple-950/40"
            >
              <AlertOctagon className="w-4 h-4 mr-2" /> Suspend Profile
            </Button>
          ) : profile.status === "SUSPENDED" ? (
            <Button
              disabled={isPending}
              variant="outline"
              onClick={handleRestore}
              className="w-full border-purple-800 text-purple-300 hover:bg-purple-950/50"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Restore Profile
            </Button>
          ) : null}

          {profile.status !== "DELETED" && (
            <Button
              disabled={isPending}
              variant="ghost"
              onClick={() => { setDeleteReason(""); setDeleteModalOpen(true); }}
              className="w-full text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-slate-800/80 hover:border-red-900/50"
            >
              <Trash2 className="w-4 h-4 mr-2 text-red-500" /> Soft-Delete Profile & Account
            </Button>
          )}
        </div>

        {/* Reject Modal */}
        {rejectModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" /> Reject Profile
                </h3>
                <button onClick={() => setRejectModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Please enter the explicit rejection reason.
              </p>
              <Input
                type="text"
                placeholder="e.g. Photo blur is too high. Upload clear photo."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="border-slate-800 bg-slate-950/60 text-white"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setRejectModalOpen(false)} size="sm">
                  Cancel
                </Button>
                <Button
                  disabled={isPending || !rejectionReason.trim()}
                  onClick={handleConfirmReject}
                  size="sm"
                  className="bg-red-600 hover:bg-red-500 text-white"
                >
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-red-950/60 text-red-400 border border-red-900/50">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Soft-Delete Profile</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Admin Security Action</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Member:</span>
                  <span className="font-semibold text-slate-200">{profile.user?.name || "Unnamed"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Profile ID:</span>
                  <span className="font-mono text-slate-300">{profile.id}</span>
                </div>
              </div>

              <p className="text-xs text-red-400/90 leading-relaxed bg-red-950/20 p-3 rounded-lg border border-red-900/30">
                ⚠️ <strong>Warning:</strong> Soft-deleting will mark this profile status as DELETED, deactivate the user login account, record an audit event, and immediately exclude them from all discovery, search, and recommendation feeds.
              </p>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Deletion Reason / Audit Note</label>
                <Input
                  placeholder="e.g. Inappropriate content / User request / Test account cleanup"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="border-slate-800 bg-slate-950/60 text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  variant="ghost"
                  onClick={() => setDeleteModalOpen(false)}
                  size="sm"
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isPending}
                  onClick={handleConfirmDelete}
                  size="sm"
                  className="bg-red-600 hover:bg-red-500 text-white"
                >
                  {isPending ? <Spinner className="w-4 h-4 mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Confirm Soft Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
