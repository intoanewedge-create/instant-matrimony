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
    <Card className="border border-slate-200/90 bg-white shadow-sm rounded-2xl">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-rose-600">
          <ShieldCheck className="w-5 h-5" /> Moderation Decision
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {errorMsg && (
          <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
            {errorMsg}
          </div>
        )}

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Current Status:</span>
            <span className="font-bold text-slate-800">{profile.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Completion:</span>
            <span className="font-bold text-rose-600">{profile.completionPercent}%</span>
          </div>
          {profile.rejectionReason && (
            <div className="pt-2 border-t border-slate-200 text-red-600">
              <strong>Rejection Reason:</strong> {profile.rejectionReason}
            </div>
          )}
        </div>

        <div className="space-y-2">
          {profile.status !== "APPROVED" && profile.status !== "SUSPENDED" && profile.status !== "DELETED" && (
            <Button
              disabled={isPending}
              onClick={handleApprove}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm"
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
              className="w-full border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
            >
              <XCircle className="w-4 h-4 mr-2" /> Reject Profile
            </Button>
          )}

          {profile.status !== "SUSPENDED" && profile.status !== "DELETED" ? (
            <Button
              disabled={isPending}
              variant="ghost"
              onClick={handleSuspend}
              className="w-full text-purple-600 hover:bg-purple-50 rounded-xl"
            >
              <AlertOctagon className="w-4 h-4 mr-2" /> Suspend Profile
            </Button>
          ) : profile.status === "SUSPENDED" ? (
            <Button
              disabled={isPending}
              variant="outline"
              onClick={handleRestore}
              className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Restore Profile
            </Button>
          ) : null}

          {profile.status !== "DELETED" && (
            <Button
              disabled={isPending}
              variant="ghost"
              onClick={() => { setDeleteReason(""); setDeleteModalOpen(true); }}
              className="w-full text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-xl"
            >
              <Trash2 className="w-4 h-4 mr-2 text-red-500" /> Soft-Delete Profile & Account
            </Button>
          )}
        </div>

        {/* Reject Modal */}
        {rejectModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" /> Reject Profile
                </h3>
                <button onClick={() => setRejectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Please enter the explicit rejection reason.
              </p>
              <Input
                type="text"
                placeholder="e.g. Photo blur is too high. Upload clear photo."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="border-slate-200 bg-white text-slate-900"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setRejectModalOpen(false)} size="sm" className="text-slate-600 hover:text-slate-900">
                  Cancel
                </Button>
                <Button
                  disabled={isPending || !rejectionReason.trim()}
                  onClick={handleConfirmReject}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Soft-Delete Profile</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Admin Security Action</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Member:</span>
                  <span className="font-semibold text-slate-900">{profile.user?.publicId || `IM${profile.userId?.slice(0, 8)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Profile ID:</span>
                  <span className="font-mono text-slate-700">{profile.id}</span>
                </div>
              </div>

              <p className="text-xs text-red-700 leading-relaxed bg-red-50 p-3 rounded-xl border border-red-200">
                ⚠️ <strong>Warning:</strong> Soft-deleting will mark this profile status as DELETED, deactivate the user login account, record an audit event, and immediately exclude them from all discovery, search, and recommendation feeds.
              </p>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Deletion Reason / Audit Note</label>
                <Input
                  placeholder="e.g. Inappropriate content / User request / Test account cleanup"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="border-slate-200 bg-white text-slate-900 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="ghost"
                  onClick={() => setDeleteModalOpen(false)}
                  size="sm"
                  className="text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isPending}
                  onClick={handleConfirmDelete}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
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
