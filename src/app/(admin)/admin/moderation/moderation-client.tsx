"use client";

import React, { useState, useOptimistic, startTransition } from "react";
import { Check, X, Ban, RefreshCw, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import {
  approveProfileAction,
  rejectProfileAction,
  suspendUserAction,
  bulkApproveProfilesAction,
  bulkRejectProfilesAction,
  bulkSuspendUsersAction,
} from "@/lib/actions/admin.actions";
import { DataTable } from "@/components/admin/data-table";
import { AdminCard } from "@/components/admin/design-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileRow {
  id: string;
  userId: string;
  name: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  religion: string;
  caste: string;
  income: number;
  bio: string;
}

interface ModerationClientProps {
  initialProfiles: ProfileRow[];
}

export function ModerationClient({ initialProfiles }: ModerationClientProps) {
  // Setup optimistic updates
  const [profiles, setOptimisticProfiles] = useOptimistic(
    initialProfiles,
    (state, action: { type: "remove" | "remove-multiple"; ids: string[] }) => {
      if (action.type === "remove") {
        return state.filter((p) => p.id !== action.ids[0]);
      } else {
        const set = new Set(action.ids);
        return state.filter((p) => !set.has(p.id));
      }
    }
  );

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [bulkReason, setBulkReason] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Sync selection helper
  const handleSelectionChange = (ids: string[]) => {
    setSelectedRowIds(ids);
  };

  const handleApprove = async (profileId: string) => {
    setLoadingId(profileId);
    setNotification(null);

    // Optimistic Update
    startTransition(() => {
      setOptimisticProfiles({ type: "remove", ids: [profileId] });
    });

    try {
      const res = await approveProfileAction(profileId);
      if (!res.success) {
        throw new Error(res.error || "Failed to approve profile");
      }
      setNotification({ type: "success", message: "Profile approved successfully." });
    } catch (e: any) {
      setNotification({
        type: "error",
        message: e.message || "Failed to approve profile. Reverting state.",
      });
      // Force hard sync to reload state
      window.location.reload();
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (profileId: string, reason: string) => {
    setLoadingId(profileId);
    setNotification(null);

    // Optimistic Update
    startTransition(() => {
      setOptimisticProfiles({ type: "remove", ids: [profileId] });
    });

    try {
      const res = await rejectProfileAction(profileId, reason || "Details incomplete or invalid");
      if (!res.success) {
        throw new Error(res.error || "Failed to reject profile");
      }
      setNotification({ type: "success", message: "Profile rejected successfully." });
    } catch (e: any) {
      setNotification({
        type: "error",
        message: e.message || "Failed to reject profile. Reverting state.",
      });
      window.location.reload();
    } finally {
      setLoadingId(null);
    }
  };

  const handleSuspend = async (userId: string) => {
    setLoadingId(userId);
    setNotification(null);

    try {
      const res = await suspendUserAction(userId, "Moderation compliance check");
      if (!res.success) {
        throw new Error(res.error || "Failed to suspend user");
      }
      setNotification({ type: "success", message: "User suspended successfully." });
    } catch (e: any) {
      setNotification({ type: "error", message: e.message || "Failed to suspend user." });
    } finally {
      setLoadingId(null);
    }
  };

  // Bulk operations
  const handleBulkApprove = async () => {
    if (selectedRowIds.length === 0) return;
    setLoadingId("bulk");
    setNotification(null);

    // Capture IDs and clear selection
    const targetIds = [...selectedRowIds];
    setSelectedRowIds([]);

    // Optimistic Update
    startTransition(() => {
      setOptimisticProfiles({ type: "remove-multiple", ids: targetIds });
    });

    try {
      const res = await bulkApproveProfilesAction(targetIds);
      if (!res.success) {
        throw new Error(res.error || "Failed to perform bulk approval.");
      }
      setNotification({ type: "success", message: `Successfully approved ${targetIds.length} profiles.` });
    } catch (e: any) {
      setNotification({
        type: "error",
        message: e.message || "Bulk approval failed. Reverting changes.",
      });
      window.location.reload();
    } finally {
      setLoadingId(null);
    }
  };

  const handleBulkReject = async () => {
    if (selectedRowIds.length === 0) return;
    const reason = bulkReason.trim() || "Violated terms of service compliance parameters";
    setLoadingId("bulk");
    setNotification(null);

    const targetIds = [...selectedRowIds];
    setSelectedRowIds([]);
    setBulkReason("");

    // Optimistic Update
    startTransition(() => {
      setOptimisticProfiles({ type: "remove-multiple", ids: targetIds });
    });

    try {
      const res = await bulkRejectProfilesAction(targetIds, reason);
      if (!res.success) {
        throw new Error(res.error || "Failed to perform bulk rejection.");
      }
      setNotification({ type: "success", message: `Successfully rejected ${targetIds.length} profiles.` });
    } catch (e: any) {
      setNotification({
        type: "error",
        message: e.message || "Bulk rejection failed. Reverting changes.",
      });
      window.location.reload();
    } finally {
      setLoadingId(null);
    }
  };

  // Define table columns
  const columns = [
    {
      key: "name",
      label: "Name / Contact",
      render: (row: ProfileRow) => (
        <div>
          <div className="font-bold text-foreground select-all">{row.name}</div>
          <div className="text-[10px] text-muted-foreground select-all">{row.email}</div>
        </div>
      ),
    },
    {
      key: "gender",
      label: "Gender / DOB",
      render: (row: ProfileRow) => (
        <div>
          <div className="text-xs text-foreground font-semibold">{row.gender}</div>
          <div className="text-[10px] text-muted-foreground">{row.dateOfBirth}</div>
        </div>
      ),
    },
    {
      key: "religion",
      label: "Background",
      render: (row: ProfileRow) => (
        <div>
          <div className="text-xs text-foreground font-semibold">{row.religion}</div>
          <div className="text-[10px] text-muted-foreground">{row.caste || "N/A"}</div>
        </div>
      ),
    },
    {
      key: "income",
      label: "Annual Income",
      render: (row: ProfileRow) => (
        <span className="text-xs font-mono font-semibold">
          ₹{row.income.toLocaleString()}
        </span>
      ),
    },
    {
      key: "bio",
      label: "Profile Bio Description",
      render: (row: ProfileRow) => (
        <div className="max-w-md select-text">
          <p className="text-[11px] leading-relaxed italic text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/10">
            &ldquo;{row.bio}&rdquo;
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Verification Decisions",
      render: (row: ProfileRow) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-8 text-[11px]"
            onClick={() => handleApprove(row.id)}
            disabled={loadingId !== null}
          >
            <Check className="h-3 w-3 mr-1" /> Approve
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="border-rose-500/20 hover:bg-rose-500/10 text-rose-500 font-bold h-8 text-[11px]"
            onClick={() => {
              const reason = prompt("Enter rejection reason:") || "";
              if (reason.trim()) handleReject(row.id, reason);
            }}
            disabled={loadingId !== null}
          >
            <X className="h-3 w-3 mr-1" /> Reject
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 h-8 px-2"
            onClick={() => {
              if (confirm(`Are you sure you want to suspend user ${row.name}?`)) {
                handleSuspend(row.userId);
              }
            }}
            disabled={loadingId !== null}
            title="Suspend User Account"
          >
            <Ban className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  // Local client filtering
  const filteredProfiles = profiles.filter((p) => {
    if (!globalFilter) return true;
    const term = globalFilter.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      p.bio.toLowerCase().includes(term) ||
      p.religion.toLowerCase().includes(term)
    );
  });

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
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* Bulk Operations Toolbar */}
      {selectedRowIds.length > 0 && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex flex-wrap items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <span className="text-xs font-extrabold text-foreground">
              {selectedRowIds.length} profiles selected for bulk actions
            </span>
          </div>

          <div className="flex items-center gap-3 flex-1 sm:justify-end">
            <Input
              placeholder="Reason for bulk rejection..."
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
              className="max-w-xs h-9 text-xs"
            />
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-9"
              onClick={handleBulkApprove}
              disabled={loadingId !== null}
            >
              Bulk Approve
            </Button>
            <Button
              size="sm"
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold h-9"
              onClick={handleBulkReject}
              disabled={loadingId !== null}
            >
              Bulk Reject
            </Button>
          </div>
        </div>
      )}

      <AdminCard title="Profiles Ledger" subtitle="Review details, backgrounds, and self-reported bios of pending registrations">
        <DataTable
          columns={columns}
          data={filteredProfiles}
          search={{
            value: globalFilter,
            placeholder: "Filter profiles...",
            onChange: (val) => setGlobalFilter(val),
          }}
          selectedIds={selectedRowIds}
          onSelectedIdsChange={handleSelectionChange}
        />
      </AdminCard>
    </div>
  );
}
