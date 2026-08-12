"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  approveProfileAction,
  rejectProfileAction,
  suspendProfileAction,
  restoreProfileAction,
  deleteProfileAction,
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
  Search,
  AlertTriangle,
  Trash2,
  ShieldAlert,
} from "lucide-react";

export function AdminProfileTable({
  profiles,
  currentFilter,
  initialSearch = "",
}: {
  profiles: any[];
  currentFilter: string;
  initialSearch?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState<any | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (currentFilter && currentFilter !== "ALL") params.set("status", currentFilter);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    router.push(`/admin/profiles?${params.toString()}`);
  };

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

  const handleOpenDeleteModal = (profile: any) => {
    setDeletingProfile(profile);
    setDeleteReason("");
    setErrorMsg(null);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingProfile) return;
    setErrorMsg(null);
    startTransition(async () => {
      const res = await deleteProfileAction(deletingProfile.id, deleteReason.trim() || undefined);
      if (res.success) {
        setDeleteModalOpen(false);
        setDeletingProfile(null);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to delete profile");
      }
    });
  };

  return (
    <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100">
            {currentFilter === "ALL" ? "All Platform Profiles" : `${currentFilter} Profiles`}
          </h2>
          <p className="text-xs text-slate-400">
            Showing {profiles.length} member profiles.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by name, email, phone, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-950/60 border-slate-800 text-xs text-white"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" className="h-9">
            Search
          </Button>
        </form>
      </CardHeader>

      {errorMsg && (
        <div className="mx-6 mt-4 p-3 bg-red-950/30 border border-red-900/50 text-red-400 text-xs rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/50 text-xs uppercase font-medium text-slate-400 border-b border-slate-800/80">
            <tr>
              <th className="px-6 py-3">Member Details</th>
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
                <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                  No profiles found matching the current search or status criteria.
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
                          : p.status === "DRAFT"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          : p.status === "DELETED"
                          ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      }`}
                    >
                      {p.status}
                    </span>
                    {p.status === "REJECTED" && p.rejectionReason && (
                      <p className="text-[11px] text-red-400/80 mt-1 max-w-[200px] truncate" title={p.rejectionReason}>
                        Reason: {p.rejectionReason}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/profiles/${p.id}`}
                        className="inline-flex items-center justify-center rounded-md text-xs font-medium px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Link>

                      {p.status !== "APPROVED" && p.status !== "SUSPENDED" && p.status !== "DELETED" && (
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleApprove(p.id)}
                          className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                      )}

                      {p.status !== "REJECTED" && p.status !== "SUSPENDED" && p.status !== "DELETED" && (
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

                      {p.status !== "SUSPENDED" && p.status !== "DELETED" ? (
                        <Button
                          size="sm"
                          disabled={isPending}
                          variant="ghost"
                          onClick={() => handleSuspend(p.id)}
                          className="h-8 text-purple-400 hover:bg-purple-950/40"
                        >
                          <AlertOctagon className="w-3.5 h-3.5 mr-1" /> Suspend
                        </Button>
                      ) : p.status === "SUSPENDED" ? (
                        <Button
                          size="sm"
                          disabled={isPending}
                          variant="outline"
                          onClick={() => handleRestore(p.id)}
                          className="h-8 border-purple-800 text-purple-300 hover:bg-purple-950/50"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Restore
                        </Button>
                      ) : null}

                      {p.status !== "DELETED" && (
                        <Button
                          size="sm"
                          disabled={isPending}
                          variant="ghost"
                          onClick={() => handleOpenDeleteModal(p)}
                          title="Soft-delete profile & account"
                          className="h-8 text-slate-400 hover:text-red-400 hover:bg-red-950/30 p-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                disabled={isPending || !rejectionReason.trim()}
                onClick={handleConfirmReject}
                size="sm"
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                {isPending ? <Spinner className="w-4 h-4 mr-2" /> : null}
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Profile Confirmation Modal */}
      {deleteModalOpen && deletingProfile && (
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
                <span className="font-semibold text-slate-200">{deletingProfile.user?.name || "Unnamed"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono text-slate-300">{deletingProfile.user?.email || "No email"}</span>
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
                onClick={() => { setDeleteModalOpen(false); setDeletingProfile(null); }}
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
    </Card>
  );
}
