"use client";

import React, { useState, useOptimistic, startTransition } from "react";
import { Check, X, ShieldCheck, ShieldAlert, Eye, FileText, User } from "lucide-react";
import {
  bulkApproveVerificationsAction,
  bulkRejectVerificationsAction,
  bulkApprovePhotosAction,
  bulkRejectPhotosAction,
} from "@/lib/actions/admin.actions";
import { approveVerification, rejectVerification, requestReUploadVerification, approvePhoto, rejectPhoto } from "@/lib/actions/media.actions";
import { AdminCard } from "@/components/admin/design-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VerificationItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  documentType: string;
  documentUrl: string;
  selfieUrl: string;
  submittedAt: string;
}

interface PhotoItem {
  id: string;
  profileId: string;
  userName: string;
  url: string;
  isMain: boolean;
  createdAt: string;
}

interface AdminVerificationClientProps {
  verifications: VerificationItem[];
  photos: PhotoItem[];
}

export function AdminVerificationClient({
  verifications: initialVerifications,
  photos: initialPhotos,
}: AdminVerificationClientProps) {
  const [activeTab, setActiveTab] = useState<"verifications" | "photos">("verifications");

  // Optimistic state for verification items
  const [verifications, setOptimisticVerifications] = useOptimistic(
    initialVerifications,
    (state, action: { type: "remove" | "remove-multiple"; ids: string[] }) => {
      const set = new Set(action.ids);
      return state.filter((v) => !set.has(v.id));
    }
  );

  // Optimistic state for photo items
  const [photos, setOptimisticPhotos] = useOptimistic(
    initialPhotos,
    (state, action: { type: "remove" | "remove-multiple"; ids: string[] }) => {
      const set = new Set(action.ids);
      return state.filter((p) => !set.has(p.id));
    }
  );

  const [selectedVerifIds, setSelectedVerifIds] = useState<string[]>([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // ID verifications actions
  const handleApproveVerif = async (id: string) => {
    setLoadingId(id);
    setNotification(null);
    startTransition(() => {
      setOptimisticVerifications({ type: "remove", ids: [id] });
    });

    try {
      const res = await approveVerification(id);
      if (!res.success) throw new Error(res.error || "Failed to approve verification.");
      setNotification({ type: "success", message: "Verification approved." });
    } catch (e: any) {
      setNotification({ type: "error", message: e.message || "Failed. Reverting." });
      window.location.reload();
    } finally {
      setLoadingId(null);
    }
  };

  const handleRejectVerif = async (id: string, reasonText: string) => {
    setLoadingId(id);
    setNotification(null);
    startTransition(() => {
      setOptimisticVerifications({ type: "remove", ids: [id] });
    });

    try {
      const res = await rejectVerification(id, reasonText);
      if (!res.success) throw new Error(res.error || "Failed to reject verification.");
      setNotification({ type: "success", message: "Verification rejected." });
    } catch (e: any) {
      setNotification({ type: "error", message: e.message || "Failed. Reverting." });
      window.location.reload();
    } finally {
      setLoadingId(null);
    }
  };

  const handleRequestReUpload = async (id: string, reasonText: string) => {
    setLoadingId(id);
    setNotification(null);
    startTransition(() => {
      setOptimisticVerifications({ type: "remove", ids: [id] });
    });

    try {
      const res = await requestReUploadVerification(id, reasonText);
      if (!res.success) throw new Error(res.error || "Failed to request re-upload.");
      setNotification({ type: "success", message: "Re-upload request sent." });
    } catch (e: any) {
      setNotification({ type: "error", message: e.message || "Failed. Reverting." });
      window.location.reload();
    } finally {
      setLoadingId(null);
    }
  };

  // Photo actions
  const handleApprovePhoto = async (id: string) => {
    setLoadingId(id);
    setNotification(null);
    startTransition(() => {
      setOptimisticPhotos({ type: "remove", ids: [id] });
    });

    try {
      const res = await approvePhoto(id);
      if (!res.success) throw new Error(res.error || "Failed to approve photo.");
      setNotification({ type: "success", message: "Photo approved." });
    } catch (e: any) {
      setNotification({ type: "error", message: e.message || "Failed. Reverting." });
      window.location.reload();
    } finally {
      setLoadingId(null);
    }
  };

  const handleRejectPhoto = async (id: string, reasonText: string) => {
    setLoadingId(id);
    setNotification(null);
    startTransition(() => {
      setOptimisticPhotos({ type: "remove", ids: [id] });
    });

    try {
      const res = await rejectPhoto(id, reasonText);
      if (!res.success) throw new Error(res.error || "Failed to reject photo.");
      setNotification({ type: "success", message: "Photo rejected." });
    } catch (e: any) {
      setNotification({ type: "error", message: e.message || "Failed. Reverting." });
      window.location.reload();
    } finally {
      setLoadingId(null);
    }
  };

  // Bulk handlers
  const handleBulkApproveVerifs = async () => {
    if (selectedVerifIds.length === 0) return;
    setLoadingId("bulk-verif");
    const targets = [...selectedVerifIds];
    setSelectedVerifIds([]);

    startTransition(() => {
      setOptimisticVerifications({ type: "remove-multiple", ids: targets });
    });

    try {
      const res = await bulkApproveVerificationsAction(targets);
      if (!res.success) throw new Error(res.error || "Bulk approval failed.");
      setNotification({ type: "success", message: `Approved ${targets.length} verifications.` });
    } catch (e: any) {
      setNotification({ type: "error", message: e.message || "Bulk action failed. Reverting." });
      window.location.reload();
    } finally {
      setLoadingId(null);
    }
  };

  const handleBulkRejectVerifs = async () => {
    if (selectedVerifIds.length === 0) return;
    const rText = reason.trim() || "ID verification document details invalid";
    setLoadingId("bulk-verif");
    const targets = [...selectedVerifIds];
    setSelectedVerifIds([]);
    setReason("");

    startTransition(() => {
      setOptimisticVerifications({ type: "remove-multiple", ids: targets });
    });

    try {
      const res = await bulkRejectVerificationsAction(targets, rText);
      if (!res.success) throw new Error(res.error || "Bulk rejection failed.");
      setNotification({ type: "success", message: `Rejected ${targets.length} verifications.` });
    } catch (e: any) {
      setNotification({ type: "error", message: e.message || "Bulk action failed. Reverting." });
      window.location.reload();
    } finally {
      setLoadingId(null);
    }
  };

  const handleBulkApprovePhotos = async () => {
    if (selectedPhotoIds.length === 0) return;
    setLoadingId("bulk-photo");
    const targets = [...selectedPhotoIds];
    setSelectedPhotoIds([]);

    startTransition(() => {
      setOptimisticPhotos({ type: "remove-multiple", ids: targets });
    });

    try {
      const res = await bulkApprovePhotosAction(targets);
      if (!res.success) throw new Error(res.error || "Bulk approval failed.");
      setNotification({ type: "success", message: `Approved ${targets.length} photos.` });
    } catch (e: any) {
      setNotification({ type: "error", message: e.message || "Bulk action failed. Reverting." });
      window.location.reload();
    } finally {
      setLoadingId(null);
    }
  };

  const handleBulkRejectPhotos = async () => {
    if (selectedPhotoIds.length === 0) return;
    const rText = reason.trim() || "Uploaded photo violates profile imagery guidelines";
    setLoadingId("bulk-photo");
    const targets = [...selectedPhotoIds];
    setSelectedPhotoIds([]);
    setReason("");

    startTransition(() => {
      setOptimisticPhotos({ type: "remove-multiple", ids: targets });
    });

    try {
      const res = await bulkRejectPhotosAction(targets, rText);
      if (!res.success) throw new Error(res.error || "Bulk rejection failed.");
      setNotification({ type: "success", message: `Rejected ${targets.length} photos.` });
    } catch (e: any) {
      setNotification({ type: "error", message: e.message || "Bulk action failed. Reverting." });
      window.location.reload();
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              : "bg-rose-500/10 border-rose-500/20 text-rose-500"
          }`}
          role="alert"
        >
          {notification.type === "success" ? (
            <ShieldCheck className="h-5 w-5 flex-shrink-0" />
          ) : (
            <ShieldAlert className="h-5 w-5 flex-shrink-0" />
          )}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-border/40 gap-6">
        <button
          onClick={() => setActiveTab("verifications")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "verifications"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          ID Verifications ({verifications.length})
        </button>
        <button
          onClick={() => setActiveTab("photos")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "photos"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Pending Photos ({photos.length})
        </button>
      </div>

      {/* VERIFICATIONS VIEW */}
      {activeTab === "verifications" && (
        <div className="space-y-6">
          {/* Bulk verif bar */}
          {selectedVerifIds.length > 0 && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex flex-wrap items-center justify-between gap-4 animate-fade-in">
              <span className="text-xs font-extrabold">{selectedVerifIds.length} verifications selected</span>
              <div className="flex items-center gap-3 flex-1 sm:justify-end">
                <Input
                  placeholder="Rejection reason..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="max-w-xs h-9 text-xs"
                />
                <Button size="sm" onClick={handleBulkApproveVerifs} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  Bulk Approve
                </Button>
                <Button size="sm" onClick={handleBulkRejectVerifs} className="bg-rose-600 hover:bg-rose-500 text-white">
                  Bulk Reject
                </Button>
              </div>
            </div>
          )}

          {verifications.length === 0 ? (
            <AdminCard className="text-center py-12 text-muted-foreground text-xs font-semibold">
              No government ID verifications awaiting review.
            </AdminCard>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {verifications.map((verif) => (
                <AdminCard key={verif.id}>
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Info */}
                    <div className="md:w-1/3 space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedVerifIds.includes(verif.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedVerifIds((prev) => [...prev, verif.id]);
                            else setSelectedVerifIds((prev) => prev.filter((id) => id !== verif.id));
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <div>
                          <h3 className="text-sm font-bold text-foreground flex items-center gap-1">
                            <User className="h-4 w-4 text-primary" /> {verif.userName}
                          </h3>
                          <p className="text-[10px] text-muted-foreground">{verif.userEmail}</p>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-muted-foreground space-y-1 bg-muted/20 p-3 rounded-lg border border-border/10">
                        <p>Document: <span className="text-foreground uppercase">{verif.documentType}</span></p>
                        <p>Submitted: <span className="text-foreground">{new Date(verif.submittedAt).toLocaleDateString()}</span></p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveVerif(verif.id)}
                          disabled={loadingId !== null}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const r = prompt("Reason for rejection:") || "";
                            if (r.trim()) handleRejectVerif(verif.id, r);
                          }}
                          disabled={loadingId !== null}
                          variant="outline"
                          className="text-rose-500 border-rose-500/20 hover:bg-rose-500/10"
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const r = prompt("Describe document issue for re-upload:") || "";
                            if (r.trim()) handleRequestReUpload(verif.id, r);
                          }}
                          disabled={loadingId !== null}
                          variant="ghost"
                          className="text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                        >
                          Re-upload
                        </Button>
                      </div>
                    </div>

                    {/* Side-by-Side Images */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                          <FileText className="h-3 w-3" /> ID Document Copy
                        </span>
                        <div className="relative aspect-[4/3] bg-muted/40 border border-border/40 rounded-xl overflow-hidden group flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={verif.documentUrl} alt="Government Document" className="max-h-full max-w-full object-contain" />
                          <a
                            href={verif.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-xs font-bold text-primary gap-1"
                          >
                            <Eye className="h-4 w-4" /> View Full Resolution
                          </a>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                          <User className="h-3 w-3" /> Selfie Photo
                        </span>
                        <div className="relative aspect-[4/3] bg-muted/40 border border-border/40 rounded-xl overflow-hidden group flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={verif.selfieUrl} alt="Selfie Verification" className="max-h-full max-w-full object-contain" />
                          <a
                            href={verif.selfieUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-xs font-bold text-primary gap-1"
                          >
                            <Eye className="h-4 w-4" /> View Full Resolution
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </AdminCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PHOTOS VIEW */}
      {activeTab === "photos" && (
        <div className="space-y-6">
          {/* Bulk photo bar */}
          {selectedPhotoIds.length > 0 && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex flex-wrap items-center justify-between gap-4 animate-fade-in">
              <span className="text-xs font-extrabold">{selectedPhotoIds.length} photos selected</span>
              <div className="flex items-center gap-3 flex-1 sm:justify-end">
                <input
                  type="text"
                  placeholder="Rejection reason..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="max-w-xs h-9 text-xs px-3 bg-background border border-border rounded-lg"
                />
                <Button size="sm" onClick={handleBulkApprovePhotos} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  Bulk Approve
                </Button>
                <Button size="sm" onClick={handleBulkRejectPhotos} className="bg-rose-600 hover:bg-rose-500 text-white">
                  Bulk Reject
                </Button>
              </div>
            </div>
          )}

          {photos.length === 0 ? (
            <AdminCard className="text-center py-12 text-muted-foreground text-xs font-semibold">
              No profile images awaiting review.
            </AdminCard>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group bg-card border border-border/40 rounded-xl overflow-hidden p-2 flex flex-col justify-between hover:shadow-md transition-all duration-250 select-text">
                  {/* Thumbnail */}
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="Profile Media" className="max-h-full max-w-full object-contain" />
                    
                    <input
                      type="checkbox"
                      checked={selectedPhotoIds.includes(photo.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedPhotoIds((prev) => [...prev, photo.id]);
                        else setSelectedPhotoIds((prev) => prev.filter((id) => id !== photo.id));
                      }}
                      className="absolute top-2 left-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary shadow-sm"
                    />

                    {photo.isMain && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-primary/80 backdrop-blur-sm text-[8px] font-bold text-white uppercase tracking-wider">
                        Primary
                      </span>
                    )}
                  </div>

                  {/* Metadata & Actions */}
                  <div className="pt-3 space-y-2">
                    <div>
                      <p className="text-xs font-bold text-foreground truncate">{photo.userName}</p>
                      <p className="text-[9px] text-muted-foreground">{new Date(photo.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleApprovePhoto(photo.id)}
                        disabled={loadingId !== null}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1"
                        aria-label={`Approve photo for ${photo.userName}`}
                      >
                        <Check className="h-3 w-3" /> Approve
                      </button>
                      <button
                        onClick={() => {
                          const r = prompt("Reason for image rejection:") || "";
                          if (r.trim()) handleRejectPhoto(photo.id, r);
                        }}
                        disabled={loadingId !== null}
                        className="py-1.5 px-2 border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 rounded text-[10px] font-bold flex items-center justify-center"
                        aria-label={`Reject photo for ${photo.userName}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
